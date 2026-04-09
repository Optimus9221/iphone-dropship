"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PhoneBackground } from "@/components/phone-background";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/toast/toast-provider";

function VerifyEmailForm() {
  const { t, locale } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20";
  const labelClass = "block text-sm font-medium text-slate-300";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError(t("verifyEmailNotRouted"));
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t("validationError"));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), code: code.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(t(data.error === "CODE_EXPIRED" || data.error === "INVALID_CODE" ? "verifyEmailInvalid" : "registrationFailed"));
      return;
    }
    toast(t("verifyEmailSuccess"));
    router.push("/login?registered=1");
    router.refresh();
  }

  async function handleResend() {
    setError("");
    if (!email.trim()) {
      setError(t("verifyEmailNotRouted"));
      return;
    }
    setResendLoading(true);
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), locale }),
    });
    setResendLoading(false);
    if (res.status === 429) {
      setError(t("verifyEmailCooldown"));
      return;
    }
    if (res.status === 503) {
      setError(t("verifyEmailFailed"));
      return;
    }
    toast(t("verifyEmailResent"));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      <div>
        <label htmlFor="ve-email" className={labelClass}>
          {t("emailLabel")}
        </label>
        <input
          id="ve-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="ve-code" className={labelClass}>
          {t("verifyEmailCodeLabel")}
        </label>
        <input
          id="ve-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={inputClass}
          placeholder="000000"
          autoComplete="one-time-code"
        />
      </div>

      <LoadingButton
        type="submit"
        loading={loading}
        disabled={loading}
        className="w-full rounded-full bg-white py-3 font-semibold text-slate-900 shadow-lg shadow-indigo-500/20 transition hover:bg-slate-100"
      >
        {t("verifyEmailSubmit")}
      </LoadingButton>

      <button
        type="button"
        onClick={handleResend}
        disabled={resendLoading}
        className="w-full text-sm text-emerald-400 hover:text-emerald-300 hover:underline disabled:opacity-50"
      >
        {resendLoading ? "…" : t("verifyEmailResend")}
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-verify-email" />
      <div className="relative mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-white">{t("verifyEmailTitle")}</h1>
          <p className="mt-2 text-sm text-slate-400">{t("verifyEmailDesc")}</p>
          <p className="mt-2 text-sm text-slate-500">
            <Link href="/login" className="text-emerald-400 hover:underline">
              {t("signIn")}
            </Link>
          </p>

          <Suspense fallback={<div className="mt-8 h-48 w-full animate-pulse rounded-lg bg-white/10" />}>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
