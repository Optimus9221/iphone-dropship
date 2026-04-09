"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKeys } from "@/lib/i18n/translations";
import { PhoneBackground } from "@/components/phone-background";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/toast/toast-provider";

const ERROR_MAP: Record<string, TranslationKeys> = {
  PHONE_EXISTS: "phoneExists",
  REGISTRATION_FAILED: "registrationFailed",
  VALIDATION_ERROR: "validationError",
  INVALID_CODE: "verifyEmailInvalid",
  INVALID_PHONE: "invalidPhone",
  COOLDOWN: "smsCooldown",
  SMS_FAILED: "smsSendFailed",
};

function RegisterForm() {
  const { t, locale } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") ?? "";

  const [step, setStep] = useState<0 | 1>(0);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20";
  const labelClass = "block text-sm font-medium text-slate-300";

  async function sendSms(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    if (!phone.trim()) {
      setError(t("phoneRequired"));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim(), locale }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      const errKey = ERROR_MAP[data.error] ?? "smsSendFailed";
      setError(t(errKey));
      return;
    }
    toast(t("smsSentToast"));
    setStep(1);
  }

  async function completeRegistration(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(t("passwordTooShort", { count: password.length }));
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError(t("validationError"));
      return;
    }
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t("validationError"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone.trim(),
        code: code.trim(),
        name: name.trim(),
        password,
        referralCode: referralCode || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      const errKey = ERROR_MAP[data.error] ?? "registrationFailed";
      setError(t(errKey));
      return;
    }

    toast(t("accountCreated"));
    router.push("/login?registered=1");
    router.refresh();
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      {referralCode && (
        <p className="mb-4 text-sm text-emerald-400">{t("referredMessage")}</p>
      )}

      {step === 0 ? (
        <form onSubmit={sendSms} className="mt-2 space-y-4">
          <p className="text-sm text-slate-400">{t("registerPhoneStep1")}</p>
          <div>
            <label htmlFor="phone" className={labelClass}>
              {t("phoneLabel")} *
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              placeholder={t("phonePlaceholder")}
              className={inputClass}
              autoComplete="tel"
            />
          </div>
          <LoadingButton
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full rounded-full bg-white py-3 font-semibold text-slate-900 shadow-lg shadow-indigo-500/20 transition hover:bg-slate-100"
          >
            {t("sendSmsCode")}
          </LoadingButton>
        </form>
      ) : (
        <form onSubmit={completeRegistration} className="mt-2 space-y-4">
          <p className="text-sm text-slate-400">{t("registerPhoneStep2")}</p>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            {phone}
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setCode("");
                setError("");
              }}
              className="ml-2 text-emerald-400 hover:underline"
            >
              {t("changePhoneNumber")}
            </button>
          </div>
          <div>
            <label htmlFor="sms-code" className={labelClass}>
              {t("smsCodeLabel")} *
            </label>
            <input
              id="sms-code"
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
          <div>
            <label htmlFor="name" className={labelClass}>
              {t("nameLabel")} *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className={inputClass}
              placeholder={t("placeholderName")}
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              {t("passwordLabel")} * ({t("passwordHint")})
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className={inputClass}
            />
          </div>
          <LoadingButton
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full rounded-full bg-white py-3 font-semibold text-slate-900 shadow-lg shadow-indigo-500/20 transition hover:bg-slate-100"
          >
            {t("createAccount")}
          </LoadingButton>
          <button
            type="button"
            onClick={() => sendSms()}
            disabled={loading}
            className="w-full text-sm text-emerald-400 hover:text-emerald-300 hover:underline disabled:opacity-50"
          >
            {t("resendSmsCode")}
          </button>
        </form>
      )}
    </>
  );
}

export default function RegisterPage() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-register" />
      <div className="relative mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-white">{t("registerByPhoneTitle")}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline">
              {t("signIn")}
            </Link>
          </p>

          <Suspense fallback={<div className="mt-8 h-64 w-full animate-pulse rounded-lg bg-white/10" />}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
