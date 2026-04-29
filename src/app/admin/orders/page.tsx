"use client";

import { Fragment, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  trackingNumber: string | null;
  imei: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  shippingEmail: string;
  comment: string | null;
  paymentWalletAddress: string | null;
  paymentNetwork: string | null;
  paymentProofUrl: string | null;
  paymentProofSubmittedAt: string | null;
  user: { email: string | null; name: string | null; phone: string | null };
  items: Array<{ productName: string; quantity: number; price: number }>;
};

const STATUS_OPTIONS = [
  "NEW",
  "AWAITING_PAYMENT",
  "PAYMENT_VERIFICATION_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const STATUS_KEYS: Record<string, string> = {
  NEW: "status_NEW",
  AWAITING_PAYMENT: "status_AWAITING_PAYMENT",
  PAYMENT_VERIFICATION_PENDING: "status_PAYMENT_VERIFICATION_PENDING",
  PAID: "status_PAID",
  PROCESSING: "status_PROCESSING",
  SHIPPED: "status_SHIPPED",
  DELIVERED: "status_DELIVERED",
  CANCELLED: "status_CANCELLED",
  REFUNDED: "status_REFUNDED",
};

function statusBadgeClasses(status: string): string {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "AWAITING_PAYMENT":
      return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100";
    case "PAYMENT_VERIFICATION_PENDING":
      return "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100";
    case "CANCELLED":
    case "REFUNDED":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
  }
}

function AdminOrderStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const key = STATUS_KEYS[status];
  const label = key ? t(key as "status_NEW") : status;
  return (
    <span
      className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClasses(status)}`}
      title={status}
    >
      {label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editing, setEditing] = useState<
    Record<string, {
      status: string;
      trackingNumber: string;
      imei: string;
      paymentWalletAddress: string;
      paymentNetwork: string;
    }>
  >({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => [])
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (orderId: string) => {
    const ed = editing[orderId];
    if (!ed) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: ed.status,
          trackingNumber: ed.trackingNumber || undefined,
          imei: ed.imei || undefined,
          paymentWalletAddress: ed.paymentWalletAddress.trim() || undefined,
          paymentNetwork: ed.paymentNetwork.trim() || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: updated.status,
                  trackingNumber: updated.trackingNumber ?? o.trackingNumber,
                  imei: updated.imei ?? o.imei,
                  paymentWalletAddress: updated.paymentWalletAddress ?? o.paymentWalletAddress,
                  paymentNetwork: updated.paymentNetwork ?? o.paymentNetwork,
                  paymentProofUrl:
                    updated.paymentProofUrl !== undefined ? updated.paymentProofUrl : o.paymentProofUrl,
                  paymentProofSubmittedAt:
                    updated.paymentProofSubmittedAt != null
                      ? new Date(updated.paymentProofSubmittedAt).toISOString()
                      : null,
                  deliveredAt: updated.deliveredAt ? new Date(updated.deliveredAt).toISOString() : o.deliveredAt,
                }
              : o
          )
        );
        setEditing((e) => {
          const next = { ...e };
          delete next[orderId];
          return next;
        });
      }
    } finally {
      setUpdating(null);
    }
  };

  const setEdit = (
    orderId: string,
    field: "status" | "trackingNumber" | "imei" | "paymentWalletAddress" | "paymentNetwork",
    value: string
  ) => {
    const order = orders.find((o) => o.id === orderId);
    setEditing((prev) => ({
      ...prev,
      [orderId]: {
        status: prev[orderId]?.status ?? order?.status ?? "NEW",
        trackingNumber: prev[orderId]?.trackingNumber ?? order?.trackingNumber ?? "",
        imei: prev[orderId]?.imei ?? order?.imei ?? "",
        paymentWalletAddress: prev[orderId]?.paymentWalletAddress ?? order?.paymentWalletAddress ?? "",
        paymentNetwork: prev[orderId]?.paymentNetwork ?? order?.paymentNetwork ?? "",
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="mt-8 h-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("adminOrders")}</h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        {orders.length} {t("adminOrdersCount")}
      </p>
      <p className="mt-3 max-w-4xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {t("adminOrdersPaymentFlowHint")}
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-zinc-500">{t("adminNoOrders")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminOrder")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminCustomer")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminItems")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminTotal")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("orderStatus")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminTracking")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminIMEI")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminActions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const ed = editing[o.id] ?? {
                  status: o.status,
                  trackingNumber: o.trackingNumber ?? "",
                  imei: o.imei ?? "",
                  paymentWalletAddress: o.paymentWalletAddress ?? "",
                  paymentNetwork: o.paymentNetwork ?? "",
                };
                const hasChanges =
                  ed.status !== o.status ||
                  (ed.trackingNumber || "") !== (o.trackingNumber ?? "") ||
                  (ed.imei || "") !== (o.imei ?? "") ||
                  (ed.paymentWalletAddress || "") !== (o.paymentWalletAddress ?? "") ||
                  (ed.paymentNetwork || "") !== (o.paymentNetwork ?? "");
                return (
                  <Fragment key={o.id}>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                          className="font-medium hover:underline"
                        >
                          #{o.orderNumber} {expandedOrder === o.id ? "▼" : "▶"}
                        </button>
                        <p className="text-xs text-zinc-500">{new Date(o.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{o.user.name ?? o.user.email ?? o.user.phone ?? "—"}</p>
                        <p className="text-xs text-zinc-500">{o.shippingEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {o.items.map((i) => `${i.productName} × ${i.quantity}`).join(", ")}
                      </td>
                      <td className="px-4 py-3 font-medium">${o.total}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex max-w-[min(100%,18rem)] flex-col gap-2">
                          <AdminOrderStatusBadge status={ed.status} />
                          <select
                            value={ed.status}
                            onChange={(e) => setEdit(o.id, "status", e.target.value)}
                            className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                          >
                            {(STATUS_OPTIONS as readonly string[]).includes(ed.status) ? null : (
                              <option value={ed.status}>{ed.status}</option>
                            )}
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {t(STATUS_KEYS[s] as "status_NEW")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={ed.trackingNumber}
                          onChange={(e) => setEdit(o.id, "trackingNumber", e.target.value)}
                          placeholder="Tracking #"
                          className="w-32 rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                        />
                        {o.trackingNumber && (
                          <a
                            href={`https://novaposhta.ua/tracking/?cargo_number=${o.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 text-xs text-emerald-600 hover:underline"
                          >
                            Track
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={ed.imei}
                          onChange={(e) => setEdit(o.id, "imei", e.target.value)}
                          placeholder="IMEI"
                          className="w-28 rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {hasChanges && (
                          <button
                            type="button"
                            onClick={() => handleUpdate(o.id)}
                            disabled={updating === o.id}
                            className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                          >
                            {updating === o.id ? "..." : t("adminSave")}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedOrder === o.id && (
                      <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="grid gap-2 text-sm sm:grid-cols-2">
                            <p><span className="text-zinc-500">{t("shippingName")}:</span> {o.shippingName}</p>
                            <p><span className="text-zinc-500">{t("shippingAddress")}:</span> {o.shippingAddress}</p>
                            <p><span className="text-zinc-500">{t("shippingPhone")}:</span> {o.shippingPhone}</p>
                            {o.comment && (
                              <p className="sm:col-span-2"><span className="text-zinc-500">{t("comment")}:</span> {o.comment}</p>
                            )}
                            <div className="sm:col-span-2 mt-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("adminCryptoSection")}</p>
                              <p className="mt-2 text-xs text-zinc-500">{t("adminCryptoHint")}</p>
                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                <label className="block">
                                  <span className="text-xs text-zinc-500">{t("adminCryptoWallet")}</span>
                                  <input
                                    type="text"
                                    value={ed.paymentWalletAddress}
                                    onChange={(e) => setEdit(o.id, "paymentWalletAddress", e.target.value)}
                                    className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm font-mono dark:border-zinc-600 dark:bg-zinc-900"
                                    placeholder="TXyz..."
                                    autoComplete="off"
                                  />
                                </label>
                                <label className="block">
                                  <span className="text-xs text-zinc-500">{t("adminCryptoNetwork")}</span>
                                  <input
                                    type="text"
                                    value={ed.paymentNetwork}
                                    onChange={(e) => setEdit(o.id, "paymentNetwork", e.target.value)}
                                    className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                                    placeholder="USDT TRC20"
                                    autoComplete="off"
                                  />
                                </label>
                              </div>
                            </div>
                            {o.paymentProofUrl && (
                              <div className="sm:col-span-2 mt-4 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/80">
                                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("adminPaymentProof")}</p>
                                <p className="mt-1 text-xs text-zinc-500">{t("adminPaymentProofHint")}</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={o.paymentProofUrl}
                                  alt=""
                                  className="mt-3 max-h-96 max-w-full rounded-md border border-zinc-200 dark:border-zinc-600"
                                />
                                {o.paymentProofSubmittedAt && (
                                  <p className="mt-2 text-xs text-zinc-500">
                                    {new Date(o.paymentProofSubmittedAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
