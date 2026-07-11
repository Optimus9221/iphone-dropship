"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { ProductPrice } from "@/components/product-price";
import { PhoneBackground } from "@/components/phone-background";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { displayCashbackAmount, DEFAULT_OWN_CASHBACK_PERCENT } from "@/lib/cashback-display";

type Product = {
  id: string;
  name: string;
  slug: string;
  model: string;
  storage: string;
  color: string;
  price: number;
  images: string[];
  stock: number;
  cashbackPercent: number;
};

const selectClass =
  "rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";

export default function CatalogPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    models: string[];
    storages: string[];
    colors: string[];
  }>({ models: [], storages: [], colors: [] });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("");
  const [color, setColor] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const timer = setTimeout(() => setQDebounced(q.trim()), 250);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((list: Product[]) => {
        setFilterOptions({
          models: [...new Set(list.map((p) => p.model))].sort(),
          storages: [...new Set(list.map((p) => p.storage))].sort(),
          colors: [...new Set(list.map((p) => p.color))].sort(),
        });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (qDebounced) params.set("q", qDebounced);
    if (model) params.set("model", model);
    if (storage) params.set("storage", storage);
    if (color) params.set("color", color);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    fetch(`/api/products${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [qDebounced, model, storage, color, sort]);

  const hasFilters = Boolean(qDebounced || model || storage || color || sort !== "newest");

  const clearFilters = useCallback(() => {
    setQ("");
    setQDebounced("");
    setModel("");
    setStorage("");
    setColor("");
    setSort("newest");
  }, []);

  const resultsLabel = useMemo(
    () => t("catalogResults", { count: products.length }),
    [products.length, t]
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-catalog" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-2xl font-bold text-white"
        >
          {t("catalogTitle")}
        </motion.h1>

        <div className="mb-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <input
            type="search"
            data-testid="pf-catalog-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("catalogSearch")}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs text-slate-400">
              {t("catalogFilterModel")}
              <select
                data-testid="pf-catalog-filter-model"
                className={`mt-1 w-full ${selectClass}`}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="">{t("catalogFilterAll")}</option>
                {filterOptions.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-slate-400">
              {t("catalogFilterStorage")}
              <select
                data-testid="pf-catalog-filter-storage"
                className={`mt-1 w-full ${selectClass}`}
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
              >
                <option value="">{t("catalogFilterAll")}</option>
                {filterOptions.storages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-slate-400">
              {t("catalogFilterColor")}
              <select
                data-testid="pf-catalog-filter-color"
                className={`mt-1 w-full ${selectClass}`}
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                <option value="">{t("catalogFilterAll")}</option>
                {filterOptions.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-slate-400">
              {t("catalogSort")}
              <select
                data-testid="pf-catalog-sort"
                className={`mt-1 w-full ${selectClass}`}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">{t("catalogSortNewest")}</option>
                <option value="price_asc">{t("catalogSortPriceAsc")}</option>
                <option value="price_desc">{t("catalogSortPriceDesc")}</option>
              </select>
            </label>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
            <span data-testid="pf-catalog-results-count">{resultsLabel}</span>
            {hasFilters && (
              <button
                type="button"
                data-testid="pf-catalog-clear-filters"
                onClick={clearFilters}
                className="text-emerald-400 hover:underline"
              >
                {t("catalogClearFilters")}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-slate-400" data-testid="pf-catalog-no-match">
            {hasFilters ? t("catalogNoMatch") : t("noProducts")}
          </p>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
          >
            {products.map((p) => (
              <motion.div
                key={p.id}
                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:scale-[1.02] hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <Link
                  href={`/product/${p.slug}`}
                  data-testid={`pf-catalog-product-link-${p.slug}`}
                  className="block min-h-0 flex-1"
                >
                  <div className="relative aspect-square overflow-hidden bg-transparent p-4">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Smartphone className="h-16 w-16 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{p.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {p.color} • {p.storage}
                    </p>
                    <ProductPrice
                      price={p.price}
                      className="mt-2 text-lg font-bold text-white"
                      uahClassName="text-sm font-normal text-slate-400"
                    />
                    <p className="text-sm text-emerald-400">
                      +${displayCashbackAmount(p.price, p.cashbackPercent ?? DEFAULT_OWN_CASHBACK_PERCENT)} {t("cashback")}
                    </p>
                  </div>
                </Link>
                <div className="mt-auto flex flex-col justify-end px-4 pb-4">
                  <Link
                    href={`/checkout?product=${p.id}`}
                    data-testid={`pf-catalog-buy-link-${p.slug}`}
                    className={`flex min-h-[42px] w-full items-center justify-center rounded-xl py-2.5 text-center text-sm font-semibold text-white transition ${
                      p.stock === 0
                        ? "bg-amber-500 hover:bg-amber-400"
                        : "bg-emerald-500 hover:bg-emerald-400"
                    }`}
                  >
                    {p.stock === 0 ? t("orderNow") : t("buyNow")}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
