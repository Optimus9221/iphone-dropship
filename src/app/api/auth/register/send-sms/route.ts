import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { normalizePhoneDigits } from "@/lib/phone";
import { sendRegistrationSms } from "@/lib/sms";

const schema = z.object({
  phone: z.string().min(5),
  locale: z.enum(["en", "ru", "uk"]).optional(),
});

const COOLDOWN_MS = 60 * 1000;

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

    const existingUser = await prisma.user.findUnique({ where: { phone: normalized } });
    if (existingUser) {
      return NextResponse.json({ error: "PHONE_EXISTS" }, { status: 400 });
    }

    const prev = await prisma.phoneRegistrationToken.findUnique({ where: { phone: normalized } });
    if (prev && Date.now() - prev.createdAt.getTime() < COOLDOWN_MS) {
      return NextResponse.json({ error: "COOLDOWN" }, { status: 429 });
    }

    await prisma.phoneRegistrationToken.deleteMany({ where: { phone: normalized } });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.phoneRegistrationToken.create({
      data: {
        phone: normalized,
        codeHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const sent = await sendRegistrationSms(normalized, code, parsed.data.locale);
    if (!sent) {
      await prisma.phoneRegistrationToken.deleteMany({ where: { phone: normalized } });
      return NextResponse.json({ error: "SMS_FAILED" }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("send-sms:", e);
    return NextResponse.json({ error: "SMS_FAILED" }, { status: 500 });
  }
}
