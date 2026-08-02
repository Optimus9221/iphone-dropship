"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";

type WriteReviewFormProps = {
  /** Prefix for data-testid attributes, e.g. "pf-home-review" or "pf-dashboard-review" */
  testIdPrefix: string;
  /** Override for the open/close button test id (home keeps legacy pf-home-review-form-toggle) */
  toggleTestId?: string;
  /** Start with the form panel open */
  defaultOpen?: boolean;
  /** Button style: full-width block (home) or compact CTA (dashboard) */
  variant?: "block" | "button";
};

export function WriteReviewForm({
  testIdPrefix,
  toggleTestId,
  defaultOpen = false,
  variant = "block",
}: WriteReviewFormProps) {
  const { t } = useI18n();
  const toast = useToast();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [open, setOpen] = useState(defaultOpen);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.trim().length < 10) {
      toast(t("reviewFillBodyFirst"), "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          rating,
          videoUrl: videoUrl.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setText("");
        setRating(5);
        setVideoUrl("");
        setSubmitted(true);
        toast(t("reviewSubmitSuccess"));
      } else {
        const msg =
          data?.error === "Unauthorized" ? t("pleaseSignIn") : data?.error || t("errorOccurred");
        toast(msg, "error");
      }
    } catch {
      toast(t("errorOccurred"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formBody =
    status === "loading" ? (
      <p className="text-center text-slate-400">{t("loading")}</p>
    ) : isLoggedIn ? (
      submitted ? (
        <p className="text-center text-emerald-400">{t("reviewSubmitSuccess")}</p>
      ) : (
        <form
          onSubmit={submit}
          className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <textarea
            data-testid={`${testIdPrefix}-text`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("reviewWritePlaceholder")}
            rows={4}
            minLength={10}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">{t("reviewMinLength")}</p>
          <input
            type="url"
            data-testid={`${testIdPrefix}-video-url`}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={t("reviewVideoPlaceholder")}
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none"
          />
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-slate-400">{t("reviewRatingLabel")}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  data-testid={`${testIdPrefix}-rating-${n}`}
                  onClick={() => setRating(n)}
                  className="rounded p-1 transition hover:opacity-80"
                  aria-label={`${n} ${t("reviewRatingLabel")}`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      n <= rating ? "fill-amber-400 text-amber-400" : "text-white/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            data-testid={`${testIdPrefix}-submit`}
            disabled={submitting}
            className="mt-4 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {submitting ? "..." : t("reviewSubmit")}
          </button>
        </form>
      )
    ) : (
      <p className="text-center text-slate-400">{t("reviewSignInToWrite")}</p>
    );

  const toggleClass =
    variant === "button"
      ? "inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
      : "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-xl font-bold text-white transition hover:border-white/20 hover:bg-white/10";

  const chevronClass =
    variant === "button"
      ? `h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`
      : `h-6 w-6 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`;

  return (
    <div>
      <button
        type="button"
        data-testid={toggleTestId ?? `${testIdPrefix}-toggle`}
        onClick={() => setOpen((v) => !v)}
        className={toggleClass}
      >
        {t("reviewWriteTitle")}
        <ChevronDown className={chevronClass} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4">{formBody}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
