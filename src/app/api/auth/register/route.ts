import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { issueEmailVerificationCode } from "@/lib/email-verification";
import type { Locale } from "@/lib/i18n/translations";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Password must contain letters and numbers"),
  name: z.string().min(1, "Name is required"),
  referralCode: z.string().optional(),
  locale: z.enum(["en", "ru", "uk"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { password, name, referralCode, locale } = parsed.data;

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json({ ok: true });
    }

    let referredById: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      referredById = referrer?.id ?? null;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name.trim(),
        phone: null,
        referredById,
        emailVerified: false,
      },
    });

    const skipVerification =
      process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY;

    if (skipVerification) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      return NextResponse.json({ ok: true, readyToLogin: true });
    }

    const issued = await issueEmailVerificationCode(user.id, email, locale as Locale | undefined);
    if (!issued.ok && issued.error === "EMAIL_FAILED") {
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
