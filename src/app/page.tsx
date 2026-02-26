"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DollarSign, Users, Shield, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { PhoneBackground } from "@/components/phone-background";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

export default function Home() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const isLoggedIn = !!session;

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
      </div>
    </div>
  );
}
