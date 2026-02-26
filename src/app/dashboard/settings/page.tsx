"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";
import { KeyRound } from "lucide-react";

export default function SettingsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const { data: session, status } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError(t("passwordTooShort", { count: newPassword.length }));
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      setError(t("passwordMustContain"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast(t("passwordChanged"));
      } else {
        setError(data.error === "WRONG_CURRENT" ? t("wrongCurrentPassword") : data.error ?? t("errorOccurred"));
      }
    } catch {
      setError(t("errorOccurred"));
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-slate-400">{t("pleaseSignIn")}</p>
        <Link href="/login" className="mt-4 inline-block font-medium text-emerald-400 hover:underline">
          {t("signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white hover:underline">
        {t("backToDashboard")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{t("dashboardSettings")}</h1>
      <p className="mt-1 text-slate-400">{t("dashboardSettingsDesc")}</p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-emerald-400" />
          <h2 className="font-semibold text-white">{t("changePassword")}</h2>
        </div>
        <p className="mt-2 text-sm text-slate-400">{t("changePasswordDesc")}</p>

        <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
          {error && (
            <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <div>
            <label htmlFor="current" className="block text-sm font-medium text-slate-300">
              {t("currentPassword")}
            </label>
            <input
              id="current"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="new" className="block text-sm font-medium text-slate-300">
              {t("newPassword")}
            </label>
            <input
              id="new"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-slate-500">{t("passwordHint")}</p>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-300">
              {t("confirmPassword")}
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-white px-4 py-2 font-medium text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {saving ? "..." : t("savePassword")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
