"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteLogo } from "@/components/site-logo";
import { motion, AnimatePresence } from "framer-motion";

const navLinkClass = (isActive: boolean) =>
  `text-sm font-medium ${
    isActive
      ? "font-semibold text-emerald-400"
      : "text-zinc-400 hover:text-zinc-100"
  }`;

export function Header() {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <LanguageSwitcher variant="headerDark" />
      <Link
        href="/catalog"
        className={navLinkClass(pathname === "/catalog" || pathname.startsWith("/product"))}
        onClick={() => setMobileOpen(false)}
      >
        {t("catalog")}
      </Link>
      {status === "loading" ? (
        <span className="text-sm text-zinc-500">...</span>
      ) : session ? (
        <>
          {(session.user as { role?: string })?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={navLinkClass(pathname.startsWith("/admin"))}
              onClick={() => setMobileOpen(false)}
            >
              {t("adminPanel")}
            </Link>
          )}
          <Link
            href="/dashboard"
            className={navLinkClass(pathname.startsWith("/dashboard"))}
            onClick={() => setMobileOpen(false)}
          >
            {t("dashboard")}
          </Link>
          <button
            type="button"
            onClick={() => { signOut(); setMobileOpen(false); }}
            className="text-sm font-medium text-zinc-400 hover:text-white"
          >
            {t("logout")}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className={navLinkClass(pathname === "/login")}
            onClick={() => setMobileOpen(false)}
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100"
            onClick={() => setMobileOpen(false)}
          >
            {t("signUp")}
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/95 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label={t("siteName")}
        >
          <SiteLogo homeActive={pathname === "/"} forDarkHeader />
        </Link>

        <nav className="hidden items-center gap-4 sm:flex sm:gap-6">
          {navLinks}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex rounded-lg p-2 text-zinc-300 hover:bg-white/10 hover:text-white sm:hidden"
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
            className="flex flex-col gap-4 border-t border-white/10 bg-zinc-950 px-4 py-4 sm:hidden"
          >
            {navLinks}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
