import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { isSuspiciousSignupEmail } from "@/lib/email-abuse";
import { getPublicSiteUrl } from "@/lib/public-url";
import { checkAuthEmailRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-client";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const email = parsed.data.email.trim().toLowerCase();

    if (isSuspiciousSignupEmail(email)) {
      return NextResponse.json({ message: "ok" });
    }

    const ip = getClientIp(req);
    const limited = await checkAuthEmailRateLimit(ip, email);
    if (!limited.allowed) {
      return NextResponse.json({ message: "ok" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !user.emailVerified) {
      return NextResponse.json({ message: "ok" });
    }
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    const locale = (body.locale as string) || "en";
    const baseUrl = getPublicSiteUrl(req);
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail({ to: email, resetLink, locale });
    return NextResponse.json({ message: "ok" });
  } catch (e) {
    console.error("forgot-password error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
