import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFreeIphoneClaimUiState, canStartCashAlternative } from "@/lib/free-iphone-reward";
import { sendFreeIphoneCashWalletVerificationEmail } from "@/lib/email";

const bodySchema = z.object({
  walletAddress: z.string().trim().min(10).max(256),
  walletNetwork: z.string().trim().min(2).max(80),
});

const CODE_EXPIRY_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function localeFromRequest(req: Request): "en" | "ru" | "uk" {
  const raw = req.headers.get("accept-language")?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (raw.startsWith("uk")) return "uk";
  if (raw.startsWith("ru")) return "ru";
  return "en";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const state = await getFreeIphoneClaimUiState(userId);
  if (!canStartCashAlternative(state)) {
    return NextResponse.json({ error: "not_eligible", errorCode: "not_eligible" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });
  if (!user?.email || !user.emailVerified) {
    return NextResponse.json({ error: "email_required", errorCode: "email_required" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  const { walletAddress, walletNetwork } = parsed.data;

  const existing = await prisma.freeIphoneCashWalletVerification.findUnique({ where: { userId } });
  if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ error: "cooldown", errorCode: "cooldown" }, { status: 429 });
  }

  const code = generateSixDigitCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);
  const locale = localeFromRequest(req);

  await prisma.freeIphoneCashWalletVerification.deleteMany({ where: { userId } });
  await prisma.freeIphoneCashWalletVerification.create({
    data: {
      userId,
      codeHash,
      expiresAt,
      pendingWalletAddress: walletAddress,
      pendingWalletNetwork: walletNetwork,
    },
  });

  const sent = await sendFreeIphoneCashWalletVerificationEmail({
    to: user.email,
    code,
    locale,
  });
  if (!sent && process.env.NODE_ENV !== "production") {
    console.info(`[dev] Free iPhone cash wallet code for ${user.email}: ${code}`);
  }
  if (!sent && process.env.NODE_ENV === "production") {
    await prisma.freeIphoneCashWalletVerification.deleteMany({ where: { userId } });
    return NextResponse.json({ error: "email_failed", errorCode: "email_failed" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
