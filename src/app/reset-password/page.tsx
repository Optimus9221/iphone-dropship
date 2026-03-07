"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PhoneBackground } from "@/components/phone-background";
import { LoadingButton } from "@/components/ui/loading-button";

function ResetPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === "invalid_token" ? t("resetPasswordInvalidToken") : t("errorOccurred"));
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError(t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <PhoneBackground patternId="phones-reset" />
        <div className="relative mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-slate-400">{t("resetPasswordInvalidToken")}</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-emerald-400 hover:underline">
            {t("forgotPasswordTitle")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-reset" />
      <div className="relative mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-white">{t("resetPasswordTitle")}</h1>

          {success ? (
            <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {t("resetPasswordSuccess")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300">
                  {t("resetPasswordNewPassword")} *
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                  placeholder={t("placeholderPassword")}
                />
                <p className="mt-1 text-xs text-slate-500">{t("passwordHint")}</p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                  {t("confirmPassword")} *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                  placeholder={t("placeholderPassword")}
                />
              </div>
              <LoadingButton
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full rounded-full bg-white py-3 font-semibold text-slate-900"
              >
                {t("savePassword")}
              </LoadingButton>
            </form>
          )}

          <Link href="/login" className="mt-6 block text-center text-sm text-emerald-400 hover:underline">
            ← {t("signIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
