"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PhoneBackground } from "@/components/phone-background";
import { LoadingButton } from "@/components/ui/loading-button";
import { TurnstileWidget } from "@/components/turnstile-widget";

export default function ForgotPasswordPage() {
  const { t, locale } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
  const onTurnstileToken = useCallback((token: string | null) => setTurnstileToken(token), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (turnstileEnabled && !turnstileToken) {
      setError(t("captchaRequired"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          locale,
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      if (res.status === 400) {
        setError(t("captchaFailed"));
        return;
      }
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      setError(t("forgotPasswordError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-forgot" />
      <div className="relative mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-white">{t("forgotPasswordTitle")}</h1>
          <p className="mt-2 text-sm text-slate-400">{t("forgotPasswordDesc")}</p>

          {sent ? (
            <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {t("forgotPasswordSent")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  {t("emailLabel")} *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-white/40 focus:outline-none"
                  placeholder={t("placeholderEmail")}
                />
              </div>
              <TurnstileWidget onToken={onTurnstileToken} theme="dark" />
              <LoadingButton
                type="submit"
                loading={loading}
                disabled={loading || (turnstileEnabled && !turnstileToken)}
                className="w-full rounded-full bg-white py-3 font-semibold text-slate-900"
              >
                {t("forgotPasswordTitle")}
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

