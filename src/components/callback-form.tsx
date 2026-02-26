"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";
import { Phone } from "lucide-react";

export function CallbackFormTrigger() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
      >
        <Phone className="h-4 w-4" />
        {t("footerCallback")}
      </button>
      {open && <CallbackFormModal onClose={() => setOpen(false)} />}
    </>
  );
}

function CallbackFormModal(props: { onClose: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast(t("callbackNamePhoneRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          comment: comment.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast(t("callbackSuccess"));
        setName("");
        setPhone("");
        setComment("");
        props.onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error === "Invalid data" ? t("callbackValidationError") : t("errorOccurred");
        toast(msg);
      }
    } catch {
      toast(t("errorOccurred"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={props.onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{t("callbackTitle")}</h3>
        <p className="mt-1 text-sm text-zinc-500">{t("callbackDesc")}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">{t("nameLabel")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t("phoneLabel")}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t("comment")}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={props.onClose} className="rounded border border-zinc-300 px-4 py-2 dark:border-zinc-600">
              {t("adminCancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {submitting ? "..." : t("callbackSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
