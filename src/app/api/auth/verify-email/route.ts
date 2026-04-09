import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { lockMinutesForWrongAttemptCount } from "@/lib/verify-email-lock";

const schema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

const fail = (status: number) => NextResponse.json({ ok: false }, { status });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return fail(400);
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { code } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.emailVerified) {
      return fail(400);
    }

    const token = await prisma.emailVerificationToken.findUnique({
      where: { userId: user.id },
    });
    if (!token || token.expiresAt < new Date()) {
      return fail(400);
    }

    if (token.lockedUntil && token.lockedUntil > new Date()) {
      return fail(429);
    }

    const match = await bcrypt.compare(code, token.codeHash);
    if (!match) {
      const wrong = token.wrongAttempts + 1;
      const lockMinutes = lockMinutesForWrongAttemptCount(wrong);
      const lockedUntil =
        lockMinutes > 0 ? new Date(Date.now() + lockMinutes * 60 * 1000) : token.lockedUntil;

      await prisma.emailVerificationToken.update({
        where: { userId: user.id },
        data: {
          wrongAttempts: wrong,
          lockedUntil,
        },
      });

      return fail(lockMinutes > 0 ? 429 : 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("verify-email:", e);
    return fail(500);
  }
}
