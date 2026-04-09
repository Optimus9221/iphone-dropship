import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      return NextResponse.json({ message: "ok" });
    }
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    const locale = (body.locale as string) || "en";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail({ to: email, resetLink, locale });
    return NextResponse.json({ message: "ok" });
  } catch (e) {
    console.error("forgot-password error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
