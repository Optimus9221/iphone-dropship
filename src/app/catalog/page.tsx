"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { PhoneBackground } from "@/components/phone-background";
import { ProductCardSkeleton } from "@/components/ui/skeleton";

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
};

export default function CatalogPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <PhoneBackground patternId="phones-catalog" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 h-9 w-48 animate-pulse rounded bg-white/10" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-catalog" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-2xl font-bold text-white"
        >
          {t("catalogTitle")}
        </motion.h1>

        {products.length === 0 ? (
          <p className="text-slate-400">{t("noProducts")}</p>
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
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:scale-[1.02] hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-white/5">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Smartphone className="h-16 w-16 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{p.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{p.color} • {p.storage}</p>
                    <p className="mt-2 text-lg font-bold text-white">${p.price}</p>
                    <p className="text-sm text-emerald-400">
                      +${Math.round(p.price * 0.05)} {t("cashback")}
                    </p>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <Link
                    href={`/checkout?product=${p.id}`}
                    className="block w-full rounded-xl bg-emerald-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-400"
                  >
                    {t("buyNow")}
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
