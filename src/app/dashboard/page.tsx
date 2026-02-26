"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";
import { DashboardStatsSkeleton } from "@/components/ui/skeleton";
import { Gift } from "lucide-react";

const FREE_IPHONE_REQUIRED = 20;

type Stats = {
  totalReferrals: number;
  activeReferrals: number;
  availableCashback: number;
  totalEarned: number;
  referralUrl: string;
  qualifiedForFreeiPhone?: number;
  lastFreeiPhoneAt?: string | null;
};

export default function DashboardPage() {
  const { t } = useI18n();
  const toast = useToast();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/dashboard/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <DashboardStatsSkeleton />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-slate-400">{t("pleaseSignIn")}</p>
        <Link href="/login" className="mt-4 inline-block font-medium text-emerald-400 hover:text-emerald-300 hover:underline">
          {t("signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">{t("dashboard")}</h1>
      <p className="mt-1 text-slate-400">{t("welcome")} {session.user?.email}</p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5">
          <p className="text-sm text-slate-500">{t("availableCashback")}</p>
          <p className="mt-1 text-2xl font-bold text-white">${stats?.availableCashback ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">{t("availableAfter14")}</p>
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

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-emerald-400" />
            <h2 className="font-semibold text-white">{t("freeiPhoneProgress")}</h2>
          </div>
          {(stats.qualifiedForFreeiPhone ?? 0) >= FREE_IPHONE_REQUIRED && !stats.lastFreeiPhoneAt ? (
            <p className="mt-2 font-medium text-emerald-400">{t("freeiPhoneReady")}</p>
          ) : (stats.qualifiedForFreeiPhone ?? 0) >= FREE_IPHONE_REQUIRED && stats.lastFreeiPhoneAt ? (
            (() => {
              const last = new Date(stats.lastFreeiPhoneAt);
              const nextEligible = new Date(last.getTime() + 365 * 24 * 60 * 60 * 1000);
              const monthsLeft = Math.max(1, Math.ceil((nextEligible.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)));
              return <p className="mt-2 text-slate-400">{t("freeiPhoneNextIn", { months: monthsLeft })}</p>;
            })()
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-400">
                {t("freeiPhoneProgressDesc", {
                  current: stats?.qualifiedForFreeiPhone ?? 0,
                  total: FREE_IPHONE_REQUIRED,
                })}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((stats.qualifiedForFreeiPhone ?? 0) / FREE_IPHONE_REQUIRED) * 100)}%`,
                  }}
                />
              </div>
            </>
          )}
        </motion.div>
      )}

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
              value={stats.referralUrl}
              className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
            />
            <button
              type="button"
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
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          {t("viewReferrals")}
        </Link>
        <Link
          href="/dashboard/cashback"
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          {t("cashbackHistory")}
        </Link>
        <Link
          href="/dashboard/orders"
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          {t("myOrders")}
        </Link>
        <Link
          href="/dashboard/settings"
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
        >
          {t("dashboardSettings")}
        </Link>
      </motion.div>
    </div>
  );
}
