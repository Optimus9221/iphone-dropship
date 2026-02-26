"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <LanguageSwitcher />
      <Link
        href="/catalog"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        onClick={() => setMobileOpen(false)}
      >
        {t("catalog")}
      </Link>
      {status === "loading" ? (
        <span className="text-sm text-zinc-400">...</span>
      ) : session ? (
        <>
          {(session.user as { role?: string })?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => setMobileOpen(false)}
            >
              {t("adminPanel")}
            </Link>
          )}
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            onClick={() => setMobileOpen(false)}
          >
            {t("dashboard")}
          </Link>
          <button
            onClick={() => { signOut(); setMobileOpen(false); }}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t("logout")}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            onClick={() => setMobileOpen(false)}
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            onClick={() => setMobileOpen(false)}
          >
            {t("signUp")}
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-tight shrink-0">
          {t("siteName")}
        </Link>

        <nav className="hidden items-center gap-4 sm:flex sm:gap-6">
          {navLinks}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex rounded-lg p-2 sm:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-4 border-t border-zinc-200/80 bg-white/95 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden"
          >
            {navLinks}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
