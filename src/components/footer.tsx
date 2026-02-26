"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { CallbackFormTrigger } from "./callback-form";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 px-4 py-8 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400">
            {t("footerPrivacy")}
          </Link>
          <span className="text-zinc-400 dark:text-zinc-500">|</span>
          <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400">
            {t("footerTerms")}
          </Link>
          <span className="text-zinc-400 dark:text-zinc-500">|</span>
          <CallbackFormTrigger />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">© {new Date().getFullYear()} iPhone Store</p>
      </div>
    </footer>
  );
}
