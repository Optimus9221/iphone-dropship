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
  user: { email: string; name: string | null };
  items: Array<{ productName: string; quantity: number; price: number }>;
};

const STATUS_OPTIONS = ["NEW", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;

const STATUS_KEYS: Record<string, string> = {
  NEW: "status_NEW",
  PAID: "status_PAID",
  PROCESSING: "status_PROCESSING",
  SHIPPED: "status_SHIPPED",
  DELIVERED: "status_DELIVERED",
  CANCELLED: "status_CANCELLED",
  REFUNDED: "status_REFUNDED",
};

export default function AdminOrdersPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, { status: string; trackingNumber: string; imei: string }>>({});
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

  const setEdit = (orderId: string, field: "status" | "trackingNumber" | "imei", value: string) => {
    const order = orders.find((o) => o.id === orderId);
    setEditing((prev) => ({
      ...prev,
      [orderId]: {
        status: prev[orderId]?.status ?? order?.status ?? "NEW",
        trackingNumber: prev[orderId]?.trackingNumber ?? order?.trackingNumber ?? "",
        imei: prev[orderId]?.imei ?? order?.imei ?? "",
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
                };
                const hasChanges =
                  ed.status !== o.status ||
                  (ed.trackingNumber || "") !== (o.trackingNumber ?? "") ||
                  (ed.imei || "") !== (o.imei ?? "");
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
                        <p>{o.user.name ?? o.user.email}</p>
                        <p className="text-xs text-zinc-500">{o.shippingEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {o.items.map((i) => `${i.productName} × ${i.quantity}`).join(", ")}
                      </td>
                      <td className="px-4 py-3 font-medium">${o.total}</td>
                      <td className="px-4 py-3">
                        <select
                          value={ed.status}
                          onChange={(e) => setEdit(o.id, "status", e.target.value)}
                          className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {t(STATUS_KEYS[s] as "status_NEW")}
                            </option>
                          ))}
                        </select>
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
