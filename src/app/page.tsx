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
  Star,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
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

const FAQ_ITEMS = [
  { q: "faq1Q" as const, a: "faq1A" as const },
  { q: "faq2Q" as const, a: "faq2A" as const },
  { q: "faq3Q" as const, a: "faq3A" as const },
  { q: "faq4Q" as const, a: "faq4A" as const },
];

export default function Home() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [products, setProducts] = useState<Product[]>([]);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [stats, setStats] = useState({ usersCount: 0, ordersCount: 0 });

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
                <motion.div key={p.id} variants={fadeUp}>
                  <Link
                    href={`/product/${p.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:scale-[1.02] hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-emerald-500/10"
                  >
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

        {/* Testimonials */}
        <motion.section
          className="mt-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <h2 className="mb-8 text-center text-2xl font-bold text-white">{t("homeTestimonialsTitle")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "testimonial1Name", text: "testimonial1Text" },
              { name: "testimonial2Name", text: "testimonial2Text" },
              { name: "testimonial3Name", text: "testimonial3Text" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
              >
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-slate-300">{t(item.text as "testimonial1Text")}</p>
                <p className="mt-3 font-medium text-white">{t(item.name as "testimonial1Name")}</p>
              </motion.div>
            ))}
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
