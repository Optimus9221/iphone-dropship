"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LoadingButton } from "@/components/ui/loading-button";

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

type PayoutInfo = {
  available: number;
  minWithdrawal: number;
  hasActivePayout: boolean;
  requests: Array<{
    id: string;
    amount: number;
    status: string;
    walletAddress: string;
    walletNetwork: string;
    rejectReason: string | null;
    createdAt: string;
  }>;
};

const TYPE_KEYS: Record<string, string> = {
  OWN_PURCHASE: "cashbackType_OWN_PURCHASE",
  REFERRAL_PURCHASE: "cashbackType_REFERRAL_PURCHASE",
  BONUS_10_REFERRALS: "cashbackType_BONUS_10_REFERRALS",
  BONUS_15_REFERRALS: "cashbackType_BONUS_15_REFERRALS",
  BONUS_20_REFERRALS: "cashbackType_BONUS_20_REFERRALS",
  ADJUSTMENT: "cashbackType_ADJUSTMENT",
};

const STATUS_KEYS: Record<string, string> = {
  PENDING: "cashbackStatus_PENDING",
  AVAILABLE: "cashbackStatus_AVAILABLE",
  PAID_OUT: "cashbackStatus_PAID_OUT",
};

export default function CashbackPage() {
  const { t } = useI18n();
  const { status } = useSession();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletNetwork, setWalletNetwork] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const load = useCallback(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    Promise.all([
      fetch("/api/dashboard/cashback").then((r) => r.json()),
      fetch("/api/dashboard/payouts").then((r) => r.json()),
    ])
      .then(([hist, payouts]) => {
        setEntries(Array.isArray(hist) ? hist : []);
        setPayoutInfo(payouts?.available != null ? payouts : null);
      })
      .catch(() => {
        setEntries([]);
        setPayoutInfo(null);
      })
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleWithdraw = async () => {
    setWithdrawError("");
    setWithdrawing(true);
    try {
      const res = await fetch("/api/dashboard/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          walletNetwork: walletNetwork.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errorCode === "email_required") {
          setWithdrawError(t("cashbackWithdrawEmailRequired"));
        } else if (data.errorCode === "below_minimum") {
          setWithdrawError(
            t("cashbackWithdrawBelowMin").replace("${min}", String(payoutInfo?.minWithdrawal ?? 10))
          );
        } else if (data.errorCode === "active_payout_exists") {
          setWithdrawError(t("cashbackWithdrawActive"));
        } else {
          setWithdrawError(t("freeiPhoneGenericError"));
        }
        return;
      }
      setWalletAddress("");
      setWalletNetwork("");
      load();
    } catch {
      setWithdrawError(t("freeiPhoneGenericError"));
    } finally {
      setWithdrawing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" data-testid="pf-cashback-back-link" className="text-sm text-slate-400 hover:text-white hover:underline">
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
        <Link href="/login" data-testid="pf-cashback-login-link" className="mt-4 inline-block font-medium text-emerald-400 hover:underline">
          {t("signIn")}
        </Link>
      </div>
    );
  }

  const min = payoutInfo?.minWithdrawal ?? 10;
  const available = payoutInfo?.available ?? 0;
  const canWithdraw =
    available >= min && !payoutInfo?.hasActivePayout && walletAddress.trim().length >= 10 && walletNetwork.trim().length >= 2;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/dashboard" data-testid="pf-cashback-back-link" className="text-sm text-slate-400 hover:text-white hover:underline">
        {t("backToDashboard")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{t("cashbackHistory")}</h1>

      {payoutInfo && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <h2 className="font-semibold text-white">{t("cashbackWithdrawTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("cashbackWithdrawDesc").replace("${min}", String(min))}
          </p>
          <p className="mt-2 text-sm text-slate-500">{t("cashbackSpendHint", { min })}</p>
          <Link href="/catalog" data-testid="pf-cashback-catalog-link" className="mt-2 inline-block text-sm text-emerald-400 hover:underline">
            {t("catalog")}
          </Link>
          <p className="mt-3 text-lg font-medium text-emerald-300">
            ${available.toFixed(2)} {t("cashbackStatus_AVAILABLE").toLowerCase()}
          </p>

          {payoutInfo.hasActivePayout ? (
            <p className="mt-3 text-sm text-amber-200/90">{t("cashbackWithdrawActive")}</p>
          ) : available < min ? (
            <p className="mt-3 text-sm text-slate-500">
              {t("cashbackWithdrawBelowMin").replace("${min}", String(min))}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-slate-400">{t("cashbackWalletLabel")}</label>
              <input
                data-testid="pf-cashback-wallet-input"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
                autoComplete="off"
              />
              <label className="block text-sm text-slate-400">{t("cashbackNetworkLabel")}</label>
              <input
                data-testid="pf-cashback-network-input"
                value={walletNetwork}
                onChange={(e) => setWalletNetwork(e.target.value)}
                placeholder="USDT TRC20"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
              />
              {withdrawError && <p className="text-sm text-red-300">{withdrawError}</p>}
              <LoadingButton
                type="button"
                data-testid="pf-cashback-withdraw-button"
                loading={withdrawing}
                disabled={!canWithdraw || withdrawing}
                onClick={handleWithdraw}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
              >
                {t("cashbackWithdrawSubmit")}
              </LoadingButton>
            </div>
          )}

          {payoutInfo.requests.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-sm font-medium text-slate-300">{t("adminPayouts")}</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-400">
                {payoutInfo.requests.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    ${r.amount.toFixed(2)} · {t(`payoutStatus_${r.status}` as "payoutStatus_PENDING")} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-16 backdrop-blur-md"
        >
          <Coins className="h-16 w-16 text-slate-500" />
          <p className="mt-4 text-slate-400">{t("noCashback")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("cashbackHoldHint")}</p>
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
                    <>
                      {" · "}
                      {t("cashbackPendingDetail", {
                        date: new Date(e.availableAt).toLocaleDateString(),
                      })}
                    </>
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
