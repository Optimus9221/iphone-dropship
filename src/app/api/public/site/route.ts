import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const KEYS = ["whatsapp_phone", "telegram_link"] as const;
const DEFAULT_TELEGRAM = "https://t.me/SVSB777";

/** Public site settings — no auth required */
export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: [...KEYS] } },
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json({
      whatsapp_phone: map.whatsapp_phone ?? "",
      telegram_link: map.telegram_link ?? DEFAULT_TELEGRAM,
    });
  } catch {
    return NextResponse.json({
      whatsapp_phone: "",
      telegram_link: DEFAULT_TELEGRAM,
    });
  }
}
