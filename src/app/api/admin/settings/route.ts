import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") throw new Error("Forbidden");
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [
          "min_withdrawal",
          "cashback_hold_days",
          "whatsapp_phone",
          "telegram_link",
          "privacy_policy",
          "terms_of_service",
        ],
      },
    },
  });

  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  return NextResponse.json({
    min_withdrawal: map.min_withdrawal ?? "10",
    cashback_hold_days: map.cashback_hold_days ?? "14",
    whatsapp_phone: map.whatsapp_phone ?? "+380501234567",
    telegram_link: map.telegram_link ?? "https://t.me/iphone_store_ua",
    privacy_policy: map.privacy_policy ?? "",
    terms_of_service: map.terms_of_service ?? "",
  });
}

const updateSchema = z.object({
  min_withdrawal: z.string().regex(/^\d+$/).optional(),
  cashback_hold_days: z.string().regex(/^\d+$/).optional(),
  whatsapp_phone: z.string().optional(),
  telegram_link: z.string().optional(),
  privacy_policy: z.string().optional(),
  terms_of_service: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
