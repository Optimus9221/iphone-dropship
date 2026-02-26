"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type Referral = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  purchaseCount: number;
  totalSpent: number;
  isActive: boolean;
};

type Data = {
  total: number;
  active: number;
  inactive: number;
  referrals: Referral[];
};

export default function ReferralsPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard/referrals")
        .then((r) => r.json())
        .then(setData)
        .catch(() => null)
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white hover:underline">
          {t("backToDashboard")}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">{t("myReferrals")}</h1>
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white/5" />
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

  const referrals = data?.referrals ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white hover:underline">
        {t("backToDashboard")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{t("myReferrals")}</h1>
      <p className="mt-1 text-slate-400">
        {data?.total ?? 0} {t("totalReferrals")} · {data?.active ?? 0} {t("active")}
      </p>

      {referrals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-16 backdrop-blur-md"
        >
          <Users className="h-16 w-16 text-slate-500" />
          <p className="mt-4 text-slate-400">{t("noReferrals")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("referralLinkDesc")}</p>
        </motion.div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">{t("referralName")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">{t("referralEmail")}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">{t("referralJoined")}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">{t("referralPurchases")}</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">{t("referralSpent")}</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-400">{t("orderStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-4 py-3 text-white">{r.name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{r.email}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">{r.purchaseCount}</td>
                    <td className="px-4 py-3 text-right text-slate-300">${r.totalSpent}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                          r.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {r.isActive ? t("active") : t("inactive")}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
