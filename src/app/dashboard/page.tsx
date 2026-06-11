"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";
import { DashboardStatsSkeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Wallet } from "lucide-react";

const REFERRAL_MILESTONE = 20;

type Stats = {
  totalReferrals: number;
  activeReferrals: number;
  availableCashback: number;
  minWithdrawal?: number;
  totalEarned: number;
  referralUrl: string;
  qualifiedForFreeiPhone?: number;
};

export default function DashboardPage() {
  const { t } = useI18n();
  const toast = useToast();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadStats = useCallback(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    setStatsLoading(true);
    setStatsError(null);
    fetch("/api/dashboard/stats", { credentials: "include" })
      .then(async (r) => {
        let data: unknown = {};
        try {
          data = await r.json();
        } catch {
          data = {};
        }
        const body = data as Stats & { error?: string };
        if (!r.ok) {
          setStats(null);
          setStatsError(body.error ?? `HTTP ${r.status}`);
          return;
        }
        setStats(body);
      })
      .catch((err: unknown) => {
        setStats(null);
        setStatsError(err instanceof Error ? err.message : "Network error");
      })
      .finally(() => {
        setStatsLoading(false);
      });
  }, [session, status]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (status === "loading") {
    return (
      <motion.div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <DashboardStatsSkeleton />
      </motion.div>
    );
  }

  if (status !== "authenticated") {
    return (
      <motion.div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-slate-400">{t("pleaseSignIn")}</p>
        <Link href="/login" data-testid="pf-dashboard-login-link" className="mt-4 inline-block font-medium text-emerald-400 hover:text-emerald-300 hover:underline">
          {t("signIn")}
        </Link>
      </motion.div>
    );
  }

  const qualified = stats?.qualifiedForFreeiPhone ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">{t("dashboard")}</h1>
      <p className="mt-1 text-slate-400">{t("welcome")} {session.user?.name?.trim() || session.user?.email}</p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5">
          <p className="text-sm text-slate-500">{t("availableCashback")}</p>
          <p className="mt-1 text-2xl font-bold text-white">${(stats?.availableCashback ?? 0).toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-500">{t("availableCashbackWithdrawHint")}</p>
          <Link
            href="/dashboard/cashback"
            data-testid="pf-dashboard-cashback-card-link"
            className="mt-3 inline-block text-sm font-medium text-emerald-400 hover:underline"
          >
            {t("cashbackWithdrawLink")} →
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5">
          <p className="text-sm text-slate-500">{t("totalEarned")}</p>
          <p className="mt-1 text-2xl font-bold text-white">${stats?.totalEarned ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5">
          <p className="text-sm text-slate-500">{t("totalReferrals")}</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats?.totalReferrals ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5">
          <p className="text-sm text-slate-500">{t("activeReferrals")}</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats?.activeReferrals ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">{t("purchasedLast90")}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-md"
      >
        <h2 className="font-semibold text-white">{t("cashbackUseBalanceTitle")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("cashbackUseBalanceDesc")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/catalog"
            data-testid="pf-dashboard-catalog-link"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            <ShoppingBag className="h-4 w-4" />
            {t("catalog")}
          </Link>
          <Link
            href="/dashboard/cashback"
            data-testid="pf-dashboard-withdraw-link"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-600/30"
          >
            <Wallet className="h-4 w-4" />
            {t("cashbackWithdrawLink")}
          </Link>
        </div>

        {!statsError && (
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-sm font-medium text-white">{t("referralProgressTitle")}</p>
            {statsLoading && !stats ? (
              <p className="mt-2 text-sm text-slate-400">{t("referralProgressLoading")}</p>
            ) : (
              <>
                <p className="mt-1 text-sm text-slate-400">
                  {t("referralProgressDesc", { current: qualified, total: REFERRAL_MILESTONE })}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (qualified / REFERRAL_MILESTONE) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">{t("referralProgressHint")}</p>
              </>
            )}
          </div>
        )}

        {statsError && (
          <div className="mt-4">
            <p className="text-sm text-amber-200/90">{t("dashboardStatsLoadError")}</p>
            <button
              type="button"
              data-testid="pf-dashboard-stats-retry"
              onClick={() => loadStats()}
              className="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              {t("dashboardStatsRetry")}
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <h2 className="font-semibold text-white">{t("yourReferralLink")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("referralLinkDesc")}</p>
        {stats?.referralUrl && (
          <div className="mt-4 flex gap-2">
            <input
              readOnly
              data-testid="pf-dashboard-referral-url"
              value={stats.referralUrl}
              className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
            />
            <button
              type="button"
              data-testid="pf-dashboard-referral-copy"
              onClick={() => {
                navigator.clipboard.writeText(stats.referralUrl);
                toast(t("linkCopied"));
              }}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              {t("copy")}
            </button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 flex flex-wrap gap-4"
      >
        <Link
          href="/dashboard/referrals"
          data-testid="pf-dashboard-nav-referrals"
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          {t("viewReferrals")}
        </Link>
        <Link
          href="/dashboard/cashback"
          data-testid="pf-dashboard-nav-cashback"
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          {t("cashbackHistory")}
        </Link>
        <Link
          href="/dashboard/orders"
          data-testid="pf-dashboard-nav-orders"
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          {t("myOrders")}
        </Link>
        <Link
          href="/dashboard/settings"
          data-testid="pf-dashboard-nav-settings"
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          {t("dashboardSettings")}
        </Link>
      </motion.div>
    </div>
  );
}
