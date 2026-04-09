import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, code } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
    }

    const token = await prisma.emailVerificationToken.findUnique({
      where: { userId: user.id },
    });
    if (!token || token.expiresAt < new Date()) {
      return NextResponse.json({ error: "CODE_EXPIRED" }, { status: 400 });
    }

    const match = await bcrypt.compare(code, token.codeHash);
    if (!match) {
      return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
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
    return NextResponse.json({ error: "VERIFY_FAILED" }, { status: 500 });
  }
}
