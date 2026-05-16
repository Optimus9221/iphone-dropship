import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFreeIphoneClaimUiState, canStartCashAlternative } from "@/lib/free-iphone-reward";
import { sendAdminFreeIphoneCashPayoutWalletSaved } from "@/lib/email";
import { Prisma } from "@prisma/client";
import { getFreeIphoneCashPayoutAmount } from "@/lib/payout";

const bodySchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Invalid code"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

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

  const pending = await prisma.freeIphoneCashWalletVerification.findUnique({ where: { userId } });
  if (!pending || pending.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "no_pending_or_expired", errorCode: "expired" }, { status: 400 });
  }

  const ok = await bcrypt.compare(parsed.data.code, pending.codeHash);
  if (!ok) {
    return NextResponse.json({ error: "invalid_code", errorCode: "invalid_code" }, { status: 400 });
  }

  const state = await getFreeIphoneClaimUiState(userId);
  if (!canStartCashAlternative(state)) {
    await prisma.freeIphoneCashWalletVerification.deleteMany({ where: { userId } });
    return NextResponse.json({ error: "not_eligible", errorCode: "not_eligible" }, { status: 400 });
  }

  const now = new Date();
  const payoutAmount = await getFreeIphoneCashPayoutAmount();
  await prisma.freeIphoneRewardElection.upsert({
    where: { userId },
    create: {
      userId,
      cashWalletAddress: pending.pendingWalletAddress,
      cashWalletNetwork: pending.pendingWalletNetwork,
      cashWalletSavedAt: now,
      cashPayoutStatus: "PENDING",
      cashPayoutAmount: new Prisma.Decimal(payoutAmount),
    },
    update: {
      cashWalletAddress: pending.pendingWalletAddress,
      cashWalletNetwork: pending.pendingWalletNetwork,
      cashWalletSavedAt: now,
      cashPayoutStatus: "PENDING",
      cashPayoutAmount: new Prisma.Decimal(payoutAmount),
      cashPayoutProcessedAt: null,
      cashPayoutRejectReason: null,
    },
  });

  await prisma.freeIphoneCashWalletVerification.deleteMany({ where: { userId } });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  await sendAdminFreeIphoneCashPayoutWalletSaved({
    userId,
    userEmail: user?.email ?? null,
    userName: user?.name ?? null,
    walletAddress: pending.pendingWalletAddress,
    walletNetwork: pending.pendingWalletNetwork,
  });

  return NextResponse.json({ ok: true });
}
