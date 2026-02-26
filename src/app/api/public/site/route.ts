import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const KEYS = ["whatsapp_phone", "telegram_link", "privacy_policy", "terms_of_service"] as const;

/** Public site settings — no auth required */
export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: [...KEYS] } },
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json({
      whatsapp_phone: map.whatsapp_phone ?? "+380501234567",
      telegram_link: map.telegram_link ?? "https://t.me/iphone_store_ua",
      privacy_policy: map.privacy_policy ?? "",
      terms_of_service: map.terms_of_service ?? "",
    });
  } catch {
    return NextResponse.json({
      whatsapp_phone: "+380501234567",
      telegram_link: "https://t.me/iphone_store_ua",
      privacy_policy: "",
      terms_of_service: "",
    });
  }
}
