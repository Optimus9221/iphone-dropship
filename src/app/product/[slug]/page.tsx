"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Smartphone } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { getProductContent } from "@/lib/i18n/product-content";
import { productDescriptions } from "@/lib/i18n/product-descriptions";
import { PhoneBackground } from "@/components/phone-background";
import { ProductSpecs } from "@/components/product-specs";
import { ProductPageSkeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  name: string;
  slug: string;
  model: string;
  storage: string;
  color: string;
  description: string | null;
  specs: Record<string, string> | null;
  price: number;
  images: string[];
  stock: number;
};

export default function ProductPage() {
  const { t, locale } = useI18n();
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((list: Product[]) => list.find((p) => p.slug === slug) ?? null)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <PhoneBackground patternId="phones-product" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <ProductPageSkeleton />
        </div>
      </div>
    );
  }

  const cashback = Math.round(product.price * 0.05);
  const images: (string | null)[] = product.images.length > 0 ? product.images : [null];
  const content = getProductContent(locale, product.slug, product.storage);
  const fallbackDesc = productDescriptions[locale]?.[product.slug] ?? product.description;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-product" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white">{t("home")}</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/catalog" className="hover:text-white">{t("catalog")}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{product.name}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid gap-10 md:grid-cols-2"
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="aspect-square overflow-hidden">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-white/5">
                  <Smartphone className="h-24 w-24 text-white/30" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === i ? "border-emerald-400" : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    {img ? (
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/5">
                        <Smartphone className="h-6 w-6 text-white/30" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
            <p className="mt-2 text-slate-400">
              {product.model} • {product.storage} • {product.color}
            </p>
            <p className="mt-4 text-3xl font-bold text-white">${product.price}</p>
            <p className="mt-1 text-emerald-400">
              +${cashback} {t("cashbackOnPurchase")}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {t("warrantyDelivery")}
            </p>

            <Link
              href={`/checkout?product=${product.id}`}
              className="mt-6 block w-full rounded-full bg-white py-4 text-center font-semibold text-slate-900 shadow-lg shadow-indigo-500/20 transition hover:bg-slate-100 hover:shadow-indigo-500/30"
            >
              {t("buyNow")}
            </Link>

            {product.stock < 5 && product.stock > 0 && (
              <p className="mt-2 text-center text-sm text-amber-400">{t("onlyLeft", { count: product.stock })}</p>
            )}
            {product.stock === 0 && (
              <p className="mt-2 text-center text-sm text-red-400">{t("outOfStock")}</p>
            )}

            {content?.intro ? (
              <div className="mt-6 space-y-4 text-slate-400 prose prose-invert max-w-none">
                <div className="whitespace-pre-line text-sm leading-relaxed">{content.intro}</div>
              </div>
            ) : (
              fallbackDesc && (
                <div className="mt-6 space-y-4 text-slate-400 prose prose-invert max-w-none">
                  <div className="whitespace-pre-line text-sm leading-relaxed">{fallbackDesc}</div>
                </div>
              )
            )}

            {product.specs && !content && (
              <dl className="mt-6 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                {Object.entries(product.specs).map(([k, v]) => {
                  const specKey = `spec_${k}` as "spec_display" | "spec_processor" | "spec_camera" | "spec_battery";
                  const label = ["display", "processor", "camera", "battery"].includes(k)
                    ? t(specKey)
                    : k.charAt(0).toUpperCase() + k.slice(1);
                  return (
                    <div key={k} className="flex justify-between text-sm">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="text-white">{v}</dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>
        </motion.div>

        {content?.specs && content.specs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <ProductSpecs content={content} />
          </motion.div>
        )}

        {content?.note && (
          <p className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/90">
            {content.note}
          </p>
        )}
      </div>
    </div>
  );
}
