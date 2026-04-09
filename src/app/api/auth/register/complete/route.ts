import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { normalizePhoneDigits } from "@/lib/phone";

const schema = z.object({
  phone: z.string().min(5),
  code: z.string().regex(/^\d{6}$/),
  name: z.string().min(1),
  password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Password must contain letters and numbers"),
  referralCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION_ERROR", details: parsed.error.flatten() }, { status: 400 });
    }

    const normalized = normalizePhoneDigits(parsed.data.phone);
    if (!normalized) {
      return NextResponse.json({ error: "INVALID_PHONE" }, { status: 400 });
    }

    const token = await prisma.phoneRegistrationToken.findUnique({
      where: { phone: normalized },
    });
    if (!token || token.expiresAt < new Date()) {
      return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
    }

    const ok = await bcrypt.compare(parsed.data.code, token.codeHash);
    if (!ok) {
      return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone: normalized } });
    if (existingUser) {
      await prisma.phoneRegistrationToken.deleteMany({ where: { phone: normalized } });
      return NextResponse.json({ error: "PHONE_EXISTS" }, { status: 400 });
    }

    let referredById: string | null = null;
    if (parsed.data.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: parsed.data.referralCode },
      });
      referredById = referrer?.id ?? null;
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      await tx.phoneRegistrationToken.deleteMany({ where: { phone: normalized } });
      return tx.user.create({
        data: {
          email: null,
          passwordHash,
          name: parsed.data.name.trim(),
          phone: normalized,
          phoneVerified: true,
          emailVerified: false,
          referredById,
        },
      });
    });

    return NextResponse.json({
      id: user.id,
      phone: user.phone,
      name: user.name,
    });
  } catch (e) {
    console.error("register complete:", e);
    return NextResponse.json({ error: "REGISTRATION_FAILED" }, { status: 500 });
  }
}
