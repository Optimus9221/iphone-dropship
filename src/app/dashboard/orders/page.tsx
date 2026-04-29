"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  trackingNumber: string | null;
  imei: string | null;
  createdAt: string;
  deliveredAt: string | null;
  paymentInstructions: { network: string; address: string } | null;
  items: Array<{ productName: string; productSlug: string; quantity: number; price: number }>;
};

const STATUS_KEYS: Record<string, string> = {
  NEW: "status_NEW",
  AWAITING_PAYMENT: "status_AWAITING_PAYMENT",
  PAID: "status_PAID",
  PROCESSING: "status_PROCESSING",
  SHIPPED: "status_SHIPPED",
  DELIVERED: "status_DELIVERED",
  CANCELLED: "status_CANCELLED",
  REFUNDED: "status_REFUNDED",
};

export default function OrdersPage() {
  const { t } = useI18n();
  const { status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then(setOrders)
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
        <h1 className="mt-4 text-2xl font-bold text-white">{t("myOrders")}</h1>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
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
      <h1 className="mt-4 text-2xl font-bold text-white">{t("myOrders")}</h1>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-16 backdrop-blur-md"
        >
          <Package className="h-16 w-16 text-slate-500" />
          <p className="mt-4 text-slate-400">{t("noOrders")}</p>
          <Link
            href="/catalog"
            className="mt-4 text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            {t("backToCatalog")}
          </Link>
        </motion.div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">
                    {t("orderNumber")} #{order.orderNumber}
                  </p>
                  <p className="text-sm text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()} · ${order.total}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <span key={item.productSlug} className="text-sm text-slate-500">
                        {item.productName} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  {order.trackingNumber && (
                    <p className="mt-2 text-sm text-emerald-400">
                      {t("orderTracking")}:{" "}
                      <a
                        href={`https://novaposhta.ua/tracking/?cargo_number=${order.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {order.trackingNumber}
                      </a>
                    </p>
                  )}
                  {order.imei && (
                    <p className="mt-1 text-sm text-slate-500">
                      IMEI: {order.imei}
                    </p>
                  )}
                  {order.status === "AWAITING_PAYMENT" && order.paymentInstructions && (
                    <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4">
                      <p className="text-sm font-semibold text-amber-100">{t("paymentCryptoTitle")}</p>
                      {!order.paymentInstructions.address && !order.paymentInstructions.network ? (
                        <p className="mt-2 text-sm text-amber-200/90">{t("paymentCryptoMissing")}</p>
                      ) : (
                        <dl className="mt-3 space-y-2 text-sm">
                          <div>
                            <dt className="text-slate-500">{t("paymentCryptoNetwork")}</dt>
                            <dd className="font-medium text-white">{order.paymentInstructions.network || "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">{t("paymentCryptoAddress")}</dt>
                            <dd className="break-all font-mono text-xs text-emerald-300">{order.paymentInstructions.address || "—"}</dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  )}
                </div>
                <span
                  className={`inline-flex self-start rounded-full px-3 py-1 text-sm font-medium ${
                    order.status === "DELIVERED"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : order.status === "AWAITING_PAYMENT"
                        ? "bg-amber-500/20 text-amber-200"
                        : order.status === "CANCELLED" || order.status === "REFUNDED"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-white/10 text-slate-300"
                  }`}
                >
                  {t(STATUS_KEYS[order.status] as "status_NEW") ?? order.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
