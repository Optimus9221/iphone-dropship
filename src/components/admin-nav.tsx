"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

export function AdminNav() {
  const { t } = useI18n();
  const pathname = usePathname();

  const links = [
    { href: "/admin", testId: "pf-admin-nav-dashboard", label: t("adminDashboard") },
    { href: "/admin/products", testId: "pf-admin-nav-products", label: t("adminProducts") },
    { href: "/admin/orders", testId: "pf-admin-nav-orders", label: t("adminOrders") },
    { href: "/admin/users", testId: "pf-admin-nav-users", label: t("adminUsers") },
    { href: "/admin/callback-requests", testId: "pf-admin-nav-callback-requests", label: t("adminCallbackRequests") },
    { href: "/admin/reviews", testId: "pf-admin-nav-reviews", label: t("adminReviews") },
    { href: "/admin/payouts", testId: "pf-admin-nav-payouts", label: t("adminPayouts") },
    { href: "/admin/settings", testId: "pf-admin-nav-settings", label: t("adminSettings") },
  ];

  return (
    <nav className="mb-8 flex flex-wrap gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            data-testid={link.testId}
            className={`font-medium hover:underline ${
              isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
