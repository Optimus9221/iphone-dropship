import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { locales } from "@/lib/i18n/translations";

const schema = z.object({
  locale: z.enum(["en", "ru", "uk", "he"]),
});

/** Persist preferred email/UI language for the signed-in user. */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !(locales as readonly string[]).includes(parsed.data.locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { locale: parsed.data.locale },
  });

  return NextResponse.json({ ok: true, locale: parsed.data.locale });
}
