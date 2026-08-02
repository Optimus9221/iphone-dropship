"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

type NavBadges = {
  orders: number;
  callbacks: number;
  reviews: number;
  payouts: number;
};

const EMPTY_BADGES: NavBadges = { orders: 0, callbacks: 0, reviews: 0, payouts: 0 };
const POLL_MS = 30_000;

function formatBadge(count: number): string {
  if (count <= 0) return "";
  if (count > 99) return "99+";
  return String(count);
}

function NavBadge({ count, testId }: { count: number; testId: string }) {
  const label = formatBadge(count);
  if (!label) return null;
  return (
    <span
      data-testid={testId}
      className="absolute -right-3 -top-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white dark:ring-zinc-950"
      aria-label={label}
    >
      {label}
    </span>
  );
}

export function AdminNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [badges, setBadges] = useState<NavBadges>(EMPTY_BADGES);

  const loadBadges = useCallback(() => {
    fetch("/api/admin/nav-badges", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return EMPTY_BADGES;
        return (await r.json()) as NavBadges;
      })
      .then((data) =>
        setBadges({
          orders: Number(data.orders) || 0,
          callbacks: Number(data.callbacks) || 0,
          reviews: Number(data.reviews) || 0,
          payouts: Number(data.payouts) || 0,
        })
      )
      .catch(() => setBadges(EMPTY_BADGES));
  }, []);

  useEffect(() => {
    loadBadges();
    const id = setInterval(loadBadges, POLL_MS);
    const onFocus = () => loadBadges();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadBadges, pathname]);

  const links: Array<{
    href: string;
    testId: string;
    label: string;
    badge?: number;
  }> = [
    { href: "/admin", testId: "pf-admin-nav-dashboard", label: t("adminDashboard") },
    { href: "/admin/products", testId: "pf-admin-nav-products", label: t("adminProducts") },
    {
      href: "/admin/orders",
      testId: "pf-admin-nav-orders",
      label: t("adminOrders"),
      badge: badges.orders,
    },
    { href: "/admin/users", testId: "pf-admin-nav-users", label: t("adminUsers") },
    {
      href: "/admin/callback-requests",
      testId: "pf-admin-nav-callback-requests",
      label: t("adminCallbackRequests"),
      badge: badges.callbacks,
    },
    {
      href: "/admin/reviews",
      testId: "pf-admin-nav-reviews",
      label: t("adminReviews"),
      badge: badges.reviews,
    },
    {
      href: "/admin/payouts",
      testId: "pf-admin-nav-payouts",
      label: t("adminPayouts"),
      badge: badges.payouts,
    },
    { href: "/admin/settings", testId: "pf-admin-nav-settings", label: t("adminSettings") },
  ];

  return (
    <nav className="mb-8 flex flex-wrap gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
      {links.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            data-testid={link.testId}
            className={`relative inline-flex items-center pr-1 font-medium hover:underline ${
              isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {link.label}
            <NavBadge count={link.badge ?? 0} testId={`${link.testId}-badge`} />
          </Link>
        );
      })}
    </nav>
  );
}
