"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { PhoneBackground } from "@/components/phone-background";
import { LoadingButton } from "@/components/ui/loading-button";

function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(t("invalidEmailOrPassword"));
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-login" />
      <div className="relative mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-white">{t("signIn")}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {t("dontHaveAccount")}{" "}
            <Link href="/register" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline">
              {t("signUp")}
            </Link>
          </p>

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
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                {t("passwordLabel")} *
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-slate-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>

            <LoadingButton
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full rounded-full bg-white py-3 font-semibold text-slate-900 shadow-lg shadow-indigo-500/20 transition hover:bg-slate-100 hover:shadow-indigo-500/30"
            >
              {t("signIn")}
            </LoadingButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="h-64 w-96 animate-pulse rounded-2xl bg-white/10" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
