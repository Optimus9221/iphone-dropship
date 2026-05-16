"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";

type CashbackPayout = {
  id: string;
  email: string | null;
  name: string | null;
  amount: number;
  status: string;
  walletAddress: string;
  walletNetwork: string;
};

type FreeIphoneCash = {
  userId: string;
  email: string | null;
  name: string | null;
  walletAddress: string | null;
  walletNetwork: string | null;
  status: string;
  amount: number | null;
};

export default function AdminPayoutsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const [tab, setTab] = useState<"cashback" | "freeIphone">("cashback");
  const [cashback, setCashback] = useState<CashbackPayout[]>([]);
  const [freeIphone, setFreeIphone] = useState<FreeIphoneCash[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/payouts").then((r) => r.json()),
      fetch("/api/admin/free-iphone/cash-payouts").then((r) => r.json()),
    ])
      .then(([cb, fi]) => {
        setCashback(Array.isArray(cb) ? cb : []);
        setFreeIphone(Array.isArray(fi) ? fi : []);
      })
      .catch(() => {
        setCashback([]);
        setFreeIphone([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateCashback = async (id: string, status: "PROCESSING" | "COMPLETED" | "REJECTED") => {
    let rejectReason: string | undefined;
    if (status === "REJECTED") {
      const reason = window.prompt(t("adminPayoutRejectReasonPrompt"));
      if (reason === null) return;
      rejectReason = reason;
    }
    setBusy(id);
    const res = await fetch("/api/admin/payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, rejectReason }),
    });
    setBusy(null);
    if (res.ok) {
      toast(t("adminSettingsSaved"));
      load();
    }
  };

  const updateFreeIphone = async (userId: string, status: "PROCESSING" | "COMPLETED" | "REJECTED") => {
    let rejectReason: string | undefined;
    if (status === "REJECTED") {
      const reason = window.prompt(t("adminPayoutRejectReasonPrompt"));
      if (reason === null) return;
      rejectReason = reason;
    }
    setBusy(userId);
    const res = await fetch("/api/admin/free-iphone/cash-payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status, rejectReason }),
    });
    setBusy(null);
    if (res.ok) {
      toast(t("adminSettingsSaved"));
      load();
    }
  };

  const renderActions = (
    id: string,
    status: string,
    onUpdate: (id: string, s: "PROCESSING" | "COMPLETED" | "REJECTED") => void
  ) => (
      <div className="flex flex-wrap gap-1">
        {status === "PENDING" && (
          <button
            type="button"
            disabled={busy === id}
            onClick={() => onUpdate(id, "PROCESSING")}
            className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600"
          >
            {t("adminPayoutMarkProcessing")}
          </button>
        )}
        {(status === "PENDING" || status === "PROCESSING") && (
          <>
            <button
              type="button"
              disabled={busy === id}
              onClick={() => onUpdate(id, "COMPLETED")}
              className="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
            >
              {t("adminPayoutMarkCompleted")}
            </button>
            <button
              type="button"
              disabled={busy === id}
              onClick={() => onUpdate(id, "REJECTED")}
              className="rounded bg-red-600/90 px-2 py-1 text-xs text-white"
            >
              {t("adminPayoutMarkRejected")}
            </button>
          </>
        )}
      </div>
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">{t("adminPayouts")}</h1>
        <div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  const pendingCashback = cashback.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length;
  const pendingFree = freeIphone.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length;

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("adminPayouts")}</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t("adminPayoutsDesc")}</p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("cashback")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "cashback"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {t("adminPayoutsCashback")} ({pendingCashback})
        </button>
        <button
          type="button"
          onClick={() => setTab("freeIphone")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "freeIphone"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {t("adminPayoutsFreeIphone")} ({pendingFree})
        </button>
      </div>

      {tab === "cashback" ? (
        cashback.length === 0 ? (
          <p className="mt-8 text-zinc-500">{t("adminPayoutsEmpty")}</p>
        ) : (
          <PayoutTable
            rows={cashback.map((p) => ({
              key: p.id,
              name: p.name,
              email: p.email,
              amount: `$${p.amount.toFixed(2)}`,
              wallet: p.walletAddress,
              network: p.walletNetwork,
              status: p.status,
              actions: renderActions(p.id, p.status, updateCashback),
            }))}
            t={t}
          />
        )
      ) : freeIphone.length === 0 ? (
        <p className="mt-8 text-zinc-500">{t("adminPayoutsEmpty")}</p>
      ) : (
        <PayoutTable
          rows={freeIphone.map((p) => ({
            key: p.userId,
            name: p.name,
            email: p.email,
            amount: p.amount != null ? `$${p.amount.toFixed(2)}` : "—",
            wallet: p.walletAddress ?? "—",
            network: p.walletNetwork ?? "",
            status: p.status,
            actions: renderActions(p.userId, p.status, updateFreeIphone),
          }))}
          t={t}
        />
      )}
    </div>
  );
}

function PayoutTable({
  rows,
  t,
}: {
  rows: Array<{
    key: string;
    name: string | null;
    email: string | null;
    amount: string;
    wallet: string;
    network: string;
    status: string;
    actions: ReactNode;
  }>;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <th className="px-3 py-2 text-left">{t("adminUserEmail")}</th>
            <th className="px-3 py-2 text-left">{t("adminPayoutAmount")}</th>
            <th className="px-3 py-2 text-left">{t("freeiPhoneWalletLabel")}</th>
            <th className="px-3 py-2 text-left">{t("orderStatus")}</th>
            <th className="px-3 py-2 text-left">{t("adminActions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="px-3 py-2">
                <p>{r.name ?? r.email ?? "—"}</p>
                <p className="text-xs text-zinc-500">{r.email}</p>
              </td>
              <td className="px-3 py-2">{r.amount}</td>
              <td className="max-w-xs px-3 py-2">
                <p className="truncate font-mono text-xs" title={r.wallet}>
                  {r.wallet}
                </p>
                <p className="text-xs text-zinc-500">{r.network}</p>
              </td>
              <td className="px-3 py-2">
                <StatusCell status={r.status} t={t} />
              </td>
              <td className="px-3 py-2">{r.actions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusCell({ status, t }: { status: string; t: ReturnType<typeof useI18n>["t"] }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
    PROCESSING: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
    COMPLETED: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    REJECTED: "bg-red-500/20 text-red-700 dark:text-red-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? ""}`}>
      {t(`payoutStatus_${status}` as "payoutStatus_PENDING") ?? status}
    </span>
  );
}

