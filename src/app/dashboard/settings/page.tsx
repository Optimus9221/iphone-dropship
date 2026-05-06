"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";
import { KeyRound, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const { data: session, status } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAgreed, setDeleteAgreed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const userRole = session?.user?.role;
  const isAdmin = userRole === "ADMIN";

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (!deleteAgreed || deletePassword.length === 0) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/dashboard/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.ok) {
        setShowDeleteModal(false);
        await signOut({ callbackUrl: "/", redirect: true });
        return;
      }

      const msg =
        data.error === "ADMIN_CANNOT_SELF_DELETE"
          ? t("deleteProfileAdminBlocked")
          : data.error === "WRONG_PASSWORD"
            ? t("deleteProfileWrongPassword")
            : data.error === "NO_PASSWORD"
              ? t("deleteProfileNoPassword")
              : t("deleteProfileFailed");
      setDeleteError(msg);
    } catch {
      setDeleteError(t("deleteProfileFailed"));
    } finally {
      setDeleting(false);
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-8 rounded-2xl border border-red-500/25 bg-red-500/5 p-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-400" />
          <h2 className="font-semibold text-white">{t("deleteProfileTitle")}</h2>
        </div>
        <p className="mt-2 text-sm text-slate-400">{t("deleteProfileDesc")}</p>

        {isAdmin ? (
          <p className="mt-4 text-sm text-amber-300/90">{t("deleteProfileAdminBlocked")}</p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDeletePassword("");
              setDeleteAgreed(false);
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
            className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
          >
            {t("deleteProfileButton")}
          </button>
        )}
      </motion.div>

      {showDeleteModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-profile-title"
            className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950 p-6 shadow-xl"
          >
            <h3 id="delete-profile-title" className="text-lg font-semibold text-white">
              {t("deleteProfileModalTitle")}
            </h3>
            <p className="mt-2 text-sm text-slate-400">{t("deleteProfileModalIntro")}</p>

            {deleteError && (
              <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">{deleteError}</p>
            )}

            <div className="mt-4">
              <label htmlFor="delete-password" className="block text-sm font-medium text-slate-300">
                {t("currentPassword")}
              </label>
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-red-500/50 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={deleteAgreed}
                onChange={(e) => setDeleteAgreed(e.target.checked)}
                className="mt-1 rounded border-white/30 bg-white/10 text-red-600 focus:ring-red-500"
              />
              <span>{t("deleteProfileUnderstand")}</span>
            </label>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={deleting || !deleteAgreed || deletePassword.length === 0}
                onClick={() => handleDeleteAccount()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40"
              >
                {deleting ? t("deleteProfileWorking") : t("deleteProfileConfirm")}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-40"
              >
                {t("deleteProfileCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
