"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";

type CallbackRequest = {
  id: string;
  name: string;
  phone: string;
  comment: string | null;
  status: string;
  createdAt: string;
};

export default function AdminCallbackRequestsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const [list, setList] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/callback-requests")
      .then((r) => r.json())
      .then(setList)
      .catch(() => [])
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/callback-requests?id=${id}`, {
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
        <h1 className="text-2xl font-bold">{t("adminCallbackRequests")}</h1>
        <div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("adminCallbackRequests")}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t("adminCallbackRequestsDesc")}</p>

      {list.length === 0 ? (
        <p className="mt-8 text-zinc-500">{t("adminNoCallbackRequests")}</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left">{t("nameLabel")}</th>
                <th className="px-4 py-3 text-left">{t("phoneLabel")}</th>
                <th className="px-4 py-3 text-left">{t("comment")}</th>
                <th className="px-4 py-3 text-left">{t("orderDate")}</th>
                <th className="px-4 py-3 text-left">{t("orderStatus")}</th>
                <th className="px-4 py-3 text-left">{t("adminActions")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">
                    <a href={`tel:${r.phone}`} className="text-emerald-600 hover:underline">
                      {r.phone}
                    </a>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3" title={r.comment ?? ""}>
                    {r.comment || "—"}
                  </td>
                  <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
