"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { PhoneBackground } from "@/components/phone-background";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-404" />
      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <p className="text-8xl font-bold text-white/20">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">{t("notFoundTitle")}</h1>
        <p className="mt-2 max-w-md text-slate-400">{t("notFoundDesc")}</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
        >
          <Home className="h-5 w-5" />
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
