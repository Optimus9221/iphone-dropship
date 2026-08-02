import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/translations";

export function normalizeEmailLocale(locale?: string | null): Locale {
  if (locale && (locales as readonly string[]).includes(locale)) {
    return locale as Locale;
  }
  return "uk";
}

/** Preferred email language from the user record (falls back to uk). */
export async function getUserEmailLocale(userId: string): Promise<Locale> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  });
  return normalizeEmailLocale(user?.locale);
}
