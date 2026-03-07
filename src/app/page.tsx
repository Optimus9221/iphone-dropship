"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Users,
  Shield,
  ShoppingBag,
  UserPlus,
  ShoppingCart,
  Coins,
  Package,
  CreditCard,
  Smartphone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";
import { PhoneBackground } from "@/components/phone-background";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

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

type Review = {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
  userName: string;
};

const FAQ_ITEMS = [
  { q: "faq1Q" as const, a: "faq1A" as const },
  { q: "faq2Q" as const, a: "faq2A" as const },
  { q: "faq3Q" as const, a: "faq3A" as const },
  { q: "faq4Q" as const, a: "faq4A" as const },
];

export default function Home() {
  const { t } = useI18n();
  const toast = useToast();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session;
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [stats, setStats] = useState({ usersCount: 0, ordersCount: 0 });
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewCarouselIndex, setReviewCarouselIndex] = useState(0);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.slice(0, 4)));
  }, []);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => []);
  }, []);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || reviewText.trim().length < 10) {
      toast(t("reviewFillBodyFirst"), "error");
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reviewText.trim(), rating: reviewRating }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setReviewText("");
        setReviewRating(5);
        setReviewSubmitted(true);
        toast(t("reviewSubmitSuccess"));
      } else {
        const msg = data?.error === "Unauthorized" ? t("pleaseSignIn") : (data?.error || t("errorOccurred"));
        toast(msg, "error");
      }
    } catch {
      toast(t("errorOccurred"), "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-home" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <motion.section
          className="text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            {t("homeTitle")}{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t("homeTitleHighlight")}
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-300"
          >
            {t("homeSubtitle")}
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/catalog"
              className={
                isLoggedIn
                  ? "group flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 hover:shadow-emerald-500/40"
                  : "rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-indigo-500/20 transition hover:scale-105 hover:bg-slate-100 hover:shadow-indigo-500/30"
              }
            >
              {isLoggedIn && <ShoppingBag className="h-5 w-5 transition group-hover:scale-110" />}
              {t("shopNow")}
            </Link>
            {!isLoggedIn && (
              <Link
                href="/register"
                className="rounded-full border border-white/30 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:scale-105 hover:border-white/50 hover:bg-white/10"
              >
                {t("joinEarn")}
              </Link>
            )}
          </motion.div>
        </motion.section>

        {/* How it works */}
        <motion.section
          className="mt-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <h2 className="mb-8 text-center text-2xl font-bold text-white">{t("homeHowItWorks")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: UserPlus, title: t("homeStep1Title"), desc: t("homeStep1Desc") },
              { icon: ShoppingCart, title: t("homeStep2Title"), desc: t("homeStep2Desc") },
              { icon: Coins, title: t("homeStep3Title"), desc: t("homeStep3Desc") },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-emerald-500/30 hover:bg-white/10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                  <item.icon className="h-7 w-7 text-emerald-400" />
                </div>
                <span className="mt-2 text-sm font-medium text-emerald-400/80">Step {i + 1}</span>
                <h3 className="mt-1 font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-center text-sm text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Feature cards */}
        <motion.section
          className="mt-24 grid gap-8 md:grid-cols-3"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          {[
            { icon: DollarSign, title: t("cashbackTitle"), desc: t("cashbackDesc") },
            { icon: Users, title: t("referralTitle"), desc: t("referralDesc") },
            { icon: Shield, title: t("warrantyTitle"), desc: t("warrantyDesc") },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:scale-[1.02] hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <item.icon className="h-10 w-10 text-emerald-400/80 transition group-hover:scale-110 group-hover:text-emerald-400" />
              <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Popular products */}
        {products.length > 0 && (
          <motion.section
            className="mt-24"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{t("homePopularProducts")}</h2>
              <Link
                href="/catalog"
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                {t("homeViewAllCatalog")} →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:scale-[1.02] hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <Link href={`/product/${p.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-white/5">
                      {p.images[0] ? (
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
                      <p className="text-sm text-emerald-400">+${Math.round(p.price * 0.05)} {t("cashback")}</p>
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
            </div>
          </motion.section>
        )}

        {/* Social proof stats */}
        <motion.section
          className="mt-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <div className="flex flex-wrap justify-center gap-8 rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-md">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <Users className="h-8 w-8 text-emerald-400" />
              <span className="text-lg font-semibold text-white">
                {t("homeStatsUsers", { count: Math.max(stats.usersCount, 100) })}
              </span>
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <Package className="h-8 w-8 text-emerald-400" />
              <span className="text-lg font-semibold text-white">
                {t("homeStatsOrders", { count: Math.max(stats.ordersCount, 50) })}
              </span>
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonials (approved reviews + static fallback), carousel when > 3 */}
        <motion.section
          className="mt-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <h2 className="mb-8 text-center text-2xl font-bold text-white">{t("homeTestimonialsTitle")}</h2>
          {(() => {
            const staticFallback = [
              { name: "testimonial1Name", text: "testimonial1Text" },
              { name: "testimonial2Name", text: "testimonial2Text" },
              { name: "testimonial3Name", text: "testimonial3Text" },
            ] as const;
            const baseItems =
              reviews.length >= 3
                ? reviews.map((r) => ({ id: r.id, text: r.text, userName: r.userName, rating: r.rating }))
                : [
                    ...reviews.map((r) => ({ id: r.id, text: r.text, userName: r.userName, rating: r.rating })),
                    ...staticFallback.slice(0, 3 - reviews.length).map((item, i) => ({
                      id: `static-${i}`,
                      text: t(item.text),
                      userName: t(item.name),
                      rating: 5,
                    })),
                  ];
            const needToPad =
              baseItems.length < 3 ? 3 - baseItems.length : (3 - (baseItems.length % 3)) % 3;
            const padItems = Array.from({ length: needToPad }, (_, i) => {
              const item = staticFallback[(baseItems.length + i) % 3];
              return {
                id: `static-pad-${i}`,
                text: t(item.text),
                userName: t(item.name),
                rating: 5,
              };
            });
            const displayItems = [...baseItems, ...padItems];
            const canScroll = displayItems.length > 3;
            const maxIndex = Math.max(0, displayItems.length - 3);
            const safeIndex = Math.min(reviewCarouselIndex, maxIndex);
            const visibleItems = canScroll
              ? displayItems.slice(safeIndex, safeIndex + 3)
              : displayItems;
            const goPrev = () =>
              setReviewCarouselIndex((i) => (i === 0 ? maxIndex : i - 1));
            const goNext = () =>
              setReviewCarouselIndex((i) => (i >= maxIndex ? 0 : i + 1));
            return (
              <div className="relative">
                {canScroll && (
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label={t("reviewPrev")}
                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 rounded-full border border-white/20 bg-white/10 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20 md:-translate-x-4"
                  >
                    <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                  </button>
                )}
                <div className="grid gap-6 md:grid-cols-3">
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                    >
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`h-4 w-4 ${j < item.rating ? "fill-current" : "text-white/20"}`}
                          />
                        ))}
                      </div>
                      <p className="mt-3 text-slate-300">{item.text}</p>
                      <p className="mt-3 font-medium text-white">{item.userName}</p>
                    </div>
                  ))}
                </div>
                {canScroll && (
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label={t("reviewNext")}
                    className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full border border-white/20 bg-white/10 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20 md:translate-x-4"
                  >
                    <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                  </button>
                )}
                {canScroll && (
                  <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewCarouselIndex(i)}
                        aria-label={t("reviewPage", { num: i + 1 })}
                        className={`h-2 rounded-full transition-all ${
                          i === safeIndex ? "w-6 bg-emerald-400" : "w-2 bg-white/40 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Write review — collapsible block */}
          <div className="mt-12">
            <button
              type="button"
              onClick={() => setReviewFormOpen((v) => !v)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-xl font-bold text-white transition hover:bg-white/10 hover:border-white/20"
            >
              {t("reviewWriteTitle")}
              <ChevronDown
                className={`h-6 w-6 shrink-0 transition-transform duration-200 ${reviewFormOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {reviewFormOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4">
                    {status === "loading" ? (
                      <p className="text-center text-slate-400">{t("loading")}</p>
                    ) : isLoggedIn ? (
                      reviewSubmitted ? (
                        <p className="text-center text-emerald-400">{t("reviewSubmitSuccess")}</p>
                      ) : (
                        <form
                          onSubmit={submitReview}
                          className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                        >
                          <div className="mb-3 flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setReviewRating(n)}
                                className="rounded p-1 transition hover:opacity-80"
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    n <= reviewRating ? "fill-amber-400 text-amber-400" : "text-white/30"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder={t("reviewWritePlaceholder")}
                            rows={4}
                            minLength={10}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
                          />
                          <p className="mt-1 text-xs text-slate-400">{t("reviewMinLength")}</p>
                          <button
                            type="submit"
                            disabled={reviewSubmitting}
                            className="mt-4 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                          >
                            {reviewSubmitting ? "..." : t("reviewSubmit")}
                          </button>
                        </form>
                      )
                    ) : (
                      <p className="text-center text-slate-400">{t("reviewSignInToWrite")}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Trust badges */}
        <motion.section
          className="mt-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <div className="flex flex-wrap justify-center gap-8 rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-md">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">{t("homeTrustApple")}</span>
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <Package className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">{t("homeTrustNovaPoshta")}</span>
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <CreditCard className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">{t("homeTrustSecure")}</span>
            </motion.div>
          </div>
        </motion.section>

        {/* Bottom CTA */}
        <motion.section
          className="mt-24 text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-8 py-12 backdrop-blur-md"
          >
            <h2 className="text-2xl font-bold text-white">{t("homeCtaTitle")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-400">{t("homeCtaDesc")}</p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 hover:shadow-emerald-500/40"
            >
              <ShoppingBag className="h-5 w-5" />
              {t("shopNow")}
            </Link>
          </motion.div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          className="mt-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <h2 className="mb-6 text-center text-2xl font-bold text-white">{t("homeFaqTitle")}</h2>
          <div className="mx-auto max-w-4xl space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left text-white hover:bg-white/5"
                >
                  <span className="font-medium">{t(item.q)}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10"
                    >
                      <p className="px-4 py-3 text-sm text-slate-400">{t(item.a)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
