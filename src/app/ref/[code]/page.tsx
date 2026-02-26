"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const REFERRAL_COOKIE = "ref_code";
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export default function RefPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  useEffect(() => {
    if (code) {
      setCookie(REFERRAL_COOKIE, code, COOKIE_DAYS);
      // Track click via API (optional, for analytics)
      fetch("/api/referral/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: code }),
      }).catch(() => {});
    }
    router.replace(`/register?ref=${encodeURIComponent(code)}`);
  }, [code, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-zinc-500">Redirecting...</p>
    </div>
  );
}
