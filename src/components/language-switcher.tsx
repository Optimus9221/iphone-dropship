"use client";

import { useI18n } from "@/lib/i18n/context";
import { locales, localeNames, type Locale } from "@/lib/i18n/translations";

type Variant = "header" | "hero";

export function LanguageSwitcher({ variant = "header" }: { variant?: Variant }) {
  const { locale, setLocale } = useI18n();

  const isHero = variant === "hero";

  return (
    <div
      className={`flex items-center gap-1 rounded-full p-1 ${
        isHero
          ? "border border-white/20 bg-white/5 backdrop-blur-sm"
          : "border border-zinc-200 bg-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-800/80"
      }`}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l as Locale)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            locale === l
              ? isHero
                ? "bg-white text-slate-900"
                : "bg-white text-slate-900 shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
              : isHero
                ? "text-slate-300 hover:bg-white/10 hover:text-white"
                : "text-zinc-600 hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
          title={localeNames[l as Locale]}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
