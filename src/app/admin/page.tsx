"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

type Stats = {
  usersCount: number;
  productsCount: number;
  ordersCount: number;
  revenue: number;
};

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({ usersCount: 0, productsCount: 0, ordersCount: 0, revenue: 0 }));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("adminDashboard")}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("adminStatsUsers")}</p>
          <p className="text-2xl font-bold">{stats?.usersCount ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("adminStatsProducts")}</p>
          <p className="text-2xl font-bold">{stats?.productsCount ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("adminStatsOrders")}</p>
          <p className="text-2xl font-bold">{stats?.ordersCount ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("adminStatsRevenue")}</p>
          <p className="text-2xl font-bold">${stats?.revenue ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}
