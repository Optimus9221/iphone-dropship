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
    <div className="bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <Link
          href="/"
          data-testid="pf-terms-home-link"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400"
        >
          <span aria-hidden>←</span> {t("home")}
        </Link>

        <article className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
          <div
            className={[
              "px-6 py-8 sm:px-12 sm:py-12",
              "text-[15px] leading-7 text-zinc-700 dark:text-zinc-300",
              // Document title
              "[&>h2]:mb-2 [&>h2]:text-center [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-zinc-900 sm:[&>h2]:text-3xl dark:[&>h2]:text-white",
              // Subtitle (first paragraph after the title)
              "[&>h2+p]:text-center [&>h2+p]:text-base [&>h2+p]:font-medium [&>h2+p]:text-zinc-600 dark:[&>h2+p]:text-zinc-400",
              // Effective date line (second paragraph), with a divider under the header block
              "[&>h2+p+p]:mt-1 [&>h2+p+p]:border-b [&>h2+p+p]:border-zinc-200 [&>h2+p+p]:pb-7 [&>h2+p+p]:text-center [&>h2+p+p]:text-sm [&>h2+p+p]:text-zinc-500 dark:[&>h2+p+p]:border-zinc-800",
              // Section headings
              "[&_h3]:mt-9 [&_h3]:scroll-mt-24 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-emerald-700 dark:[&_h3]:text-emerald-400",
              // Paragraphs
              "[&_p]:mt-3.5",
              // Lists
              "[&_ul]:mt-3.5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6 [&_li]:marker:text-emerald-500",
              // Inline emphasis
              "[&_strong]:font-semibold [&_strong]:text-zinc-900 dark:[&_strong]:text-white",
              "[&_em]:not-italic [&_em]:text-zinc-500 dark:[&_em]:text-zinc-400",
              // Links
              "[&_a]:font-medium [&_a]:text-emerald-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-emerald-500 dark:[&_a]:text-emerald-400",
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </div>
  );
}
