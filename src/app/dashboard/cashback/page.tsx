"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type Entry = {
  id: string;
  amount: number;
  type: string;
  status: string;
  orderId: string | null;
  referralId: string | null;
  availableAt: string;
  createdAt: string;
};

const TYPE_KEYS: Record<string, string> = {
  OWN_PURCHASE: "cashbackType_OWN_PURCHASE",
  REFERRAL_PURCHASE: "cashbackType_REFERRAL_PURCHASE",
  BONUS_10_REFERRALS: "cashbackType_BONUS_10_REFERRALS",
  BONUS_15_REFERRALS: "cashbackType_BONUS_15_REFERRALS",
  BONUS_20_REFERRALS: "cashbackType_BONUS_20_REFERRALS",
};

const STATUS_KEYS: Record<string, string> = {
  PENDING: "cashbackStatus_PENDING",
  AVAILABLE: "cashbackStatus_AVAILABLE",
  PAID_OUT: "cashbackStatus_PAID_OUT",
};

export default function CashbackPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard/cashback")
        .then((r) => r.json())
        .then(setEntries)
        .catch(() => [])
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white hover:underline">
          {t("backToDashboard")}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">{t("cashbackHistory")}</h1>
        <div className="mt-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6 lg:px-8">
        <p className="text-slate-400">{t("pleaseSignIn")}</p>
        <Link href="/login" className="mt-4 inline-block font-medium text-emerald-400 hover:underline">
          {t("signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white hover:underline">
        {t("backToDashboard")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{t("cashbackHistory")}</h1>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-16 backdrop-blur-md"
        >
          <Coins className="h-16 w-16 text-slate-500" />
          <p className="mt-4 text-slate-400">{t("noCashback")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("availableAfter14")}</p>
        </motion.div>
      ) : (
        <div className="mt-8 space-y-3">
          {entries.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
            >
              <div>
                <p className="font-medium text-white">
                  +${e.amount.toFixed(2)} · {t(TYPE_KEYS[e.type] as "cashbackType_OWN_PURCHASE") ?? e.type}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(e.createdAt).toLocaleDateString()}
                  {e.status === "PENDING" && e.availableAt && (
                    <> · {t("cashbackStatus_PENDING")} until {new Date(e.availableAt).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  e.status === "AVAILABLE"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : e.status === "PAID_OUT"
                      ? "bg-slate-500/20 text-slate-400"
                      : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {t(STATUS_KEYS[e.status] as "cashbackStatus_PENDING") ?? e.status}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
