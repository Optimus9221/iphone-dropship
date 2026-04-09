"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";
import { Star } from "lucide-react";

type Review = {
  id: string;
  text: string;
  rating: number;
  videoUrl: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null; phone: string | null };
};

export default function AdminReviewsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const [list, setList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = () => {
    setLoadError(null);
    fetch("/api/admin/reviews")
      .then((r) => r.json().then((data) => ({ ok: r.ok, status: r.status, data })))
      .then(({ ok, status, data }) => {
        if (ok && Array.isArray(data)) {
          setList(data);
        } else {
          setList([]);
          if (!ok && data?.error) setLoadError(data.error);
        }
      })
      .catch(() => {
        setList([]);
        setLoadError("Помилка завантаження");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/reviews?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast(t("adminSettingsSaved"));
      load();
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">{t("adminReviews")}</h1>
        <div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  const pendingCount = list.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("adminReviews")}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t("adminReviewsDesc")}</p>
      {pendingCount > 0 && (
        <p className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
          {t("adminReviewsPendingCount", { count: pendingCount })}
        </p>
      )}

      {loadError && (
        <p className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {loadError}
        </p>
      )}

      {list.length === 0 && !loading ? (
        <p className="mt-8 text-zinc-500">{t("adminNoReviews")}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {r.user.name || r.user.email || r.user.phone || "—"}
                  </span>
                  <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-700">
                    {r.status}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < r.rating ? "fill-current" : "text-zinc-300 dark:text-zinc-600"}`}
                  />
                ))}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {r.text}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {r.videoUrl ? (
                  <>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Відео: </span>
                    <a
                      href={r.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      {r.videoUrl}
                    </a>
                  </>
                ) : (
                  <span className="text-zinc-500 dark:text-zinc-500">Відео: не додано</span>
                )}
              </p>
              <div className="mt-3">
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                >
                  <option value="PENDING">{t("reviewStatusPending")}</option>
                  <option value="APPROVED">{t("reviewStatusApproved")}</option>
                  <option value="REJECTED">{t("reviewStatusRejected")}</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
