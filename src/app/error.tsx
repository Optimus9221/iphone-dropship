"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { PhoneBackground } from "@/components/phone-background";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <PhoneBackground patternId="phones-error" />
      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="h-16 w-16 text-red-400/80" />
        <h1 className="mt-4 text-2xl font-bold text-white">{t("errorTitle")}</h1>
        <p className="mt-2 max-w-md text-slate-400">{t("errorDesc")}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}
