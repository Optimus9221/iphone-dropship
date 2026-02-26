"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Gift, ChevronDown, ChevronUp } from "lucide-react";

type Candidate = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  referralCode: string;
  qualifiedReferralsCount: number;
};

type QualifiedReferral = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  firstPurchaseDeliveredAt: string | null;
  orderCount: number;
  orders: Array<{ orderNumber: string; total: number; deliveredAt: string }>;
};

type UserDetail = {
  user: { id: string; email: string; name: string | null; phone: string | null; referralCode: string };
  qualifiedReferralsCount: number;
  qualifiedReferrals: QualifiedReferral[];
  alreadyReceived: boolean;
};

type Product = { id: string; name: string; slug: string; stock: number };

export default function AdminFreeiPhonePage() {
  const { t } = useI18n();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([
      fetch("/api/admin/free-iphone").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
    ])
      .then(([cands, prods]) => {
        setCandidates(cands);
        const inStock = prods.filter((p: Product) => p.stock > 0);
        setProducts(inStock);
        if (inStock.length > 0) setSelectedProductId((prev) => prev || inStock[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = (userId: string) => {
    if (expanded === userId) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(userId);
    setDetail(null);
    setError("");
    setDetailLoading(true);
    fetch(`/api/admin/free-iphone/${userId}`)
      .then((r) => r.json())
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  const handleGrant = async (userId: string) => {
    if (!selectedProductId) {
      setError("Select a product");
      return;
    }
    setGranting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/free-iphone/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId: selectedProductId }),
      });
      const data = await res.json();
      if (res.ok) {
        setExpanded(null);
        setDetail(null);
        load();
      } else {
        setError(data.error ?? "Failed");
      }
    } catch {
      setError("Failed");
    } finally {
      setGranting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">{t("adminFreeiPhone")}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {t("adminFreeiPhoneQualifiedRefs")} ≥ 20. {t("adminFreeiPhoneReferralsList")}.
        </p>
        <div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("adminFreeiPhone")}</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {t("adminFreeiPhoneQualifiedRefs")} ≥ 20. {t("adminFreeiPhoneReferralsList")}.
      </p>

      {candidates.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
          <Gift className="h-16 w-16 text-zinc-400" />
          <p className="mt-4 font-medium text-zinc-600 dark:text-zinc-400">{t("adminFreeiPhoneNoCandidates")}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-2">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <button
                type="button"
                onClick={() => openDetail(c.id)}
                className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {c.qualifiedReferralsCount} {t("adminFreeiPhoneQualifiedRefs")}
                  </span>
                  <div>
                    <p className="font-medium">{c.name ?? c.email}</p>
                    <p className="text-sm text-zinc-500">{c.email}</p>
                  </div>
                </div>
                {expanded === c.id ? (
                  <ChevronUp className="h-5 w-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-zinc-400" />
                )}
              </button>

              {expanded === c.id && (
                <div className="border-t border-zinc-200 bg-zinc-50/80 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                  {detailLoading ? (
                    <div className="h-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  ) : detail?.alreadyReceived ? (
                    <p className="rounded-lg bg-amber-500/20 px-4 py-2 text-amber-700 dark:text-amber-400">
                      {t("adminFreeiPhoneAlreadyReceived")}
                    </p>
                  ) : detail ? (
                    <>
                      <h3 className="mb-3 font-medium">{t("adminFreeiPhoneReferralsList")}</h3>
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50">
                              <th className="px-3 py-2 text-left">{t("adminUserEmail")}</th>
                              <th className="px-3 py-2 text-left">{t("adminUserName")}</th>
                              <th className="px-3 py-2 text-left">Delivered</th>
                              <th className="px-3 py-2 text-left">Orders</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.qualifiedReferrals.map((r) => (
                              <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800">
                                <td className="px-3 py-2">{r.email}</td>
                                <td className="px-3 py-2">{r.name ?? "—"}</td>
                                <td className="px-3 py-2">
                                  {r.firstPurchaseDeliveredAt
                                    ? new Date(r.firstPurchaseDeliveredAt).toLocaleDateString()
                                    : "—"}
                                </td>
                                <td className="px-3 py-2">{r.orderCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div>
                          <label className="block text-sm font-medium">{t("adminFreeiPhoneSelectProduct")}</label>
                          <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (stock: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          disabled={granting || products.length === 0}
                          onClick={() => handleGrant(c.id)}
                          className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {granting ? "..." : t("adminFreeiPhoneGrant")}
                        </button>
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
