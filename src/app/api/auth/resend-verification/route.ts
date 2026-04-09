import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { issueEmailVerificationCode } from "@/lib/email-verification";
import type { Locale } from "@/lib/i18n/translations";

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(["en", "ru", "uk"]).optional(),
});

/** Generic success to avoid email enumeration */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: true });
    }

    const { email, locale } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified || !user.email) {
      return NextResponse.json({ ok: true });
    }

    const issued = await issueEmailVerificationCode(user.id, user.email, locale as Locale | undefined);
    if (!issued.ok && issued.error === "COOLDOWN") {
      return NextResponse.json({ error: "COOLDOWN" }, { status: 429 });
    }
    if (!issued.ok && issued.error === "EMAIL_FAILED") {
      return NextResponse.json({ error: "EMAIL_SEND_FAILED" }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("resend-verification:", e);
    return NextResponse.json({ ok: true });
  }
}
