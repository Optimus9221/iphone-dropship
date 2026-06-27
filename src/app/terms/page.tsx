"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { getTermsOfServiceHtml } from "@/lib/i18n/terms-of-service";
import { sanitizeLegalHtml } from "@/lib/sanitize-html";

export default function TermsPage() {
  const { t, locale } = useI18n();
  const html = useMemo(
    () => sanitizeLegalHtml(getTermsOfServiceHtml(locale)),
    [locale]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" data-testid="pf-terms-home-link" className="text-sm text-emerald-600 hover:underline dark:text-emerald-400">
        ← {t("home")}
      </Link>
      <article
        className="prose prose-zinc mt-6 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
