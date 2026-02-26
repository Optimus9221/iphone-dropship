"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";

const FREE_IPHONE_REQUIRED = 20;

type User = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  ordersCount: number;
  qualifiedReferrals: number;
  progressPercent: number;
};

export default function AdminUsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => [])
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleBlock = async (id: string, isBlocked: boolean) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked }),
    });
    if (res.ok) load();
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">{t("adminUsers")}</h1>
        <div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("adminUsers")}</h1>

      {users.length === 0 ? (
        <p className="mt-8 text-zinc-500">{t("adminNoUsers")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminUserEmail")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminUserName")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminUserRole")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminUserOrders")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium min-w-[140px]">{t("adminUserProgress")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminUserJoined")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("adminActions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        u.role === "ADMIN" ? "bg-amber-500/20 text-amber-600" : "bg-zinc-500/20"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{u.ordersCount}</td>
                  <td className="px-4 py-3">
                    {u.role === "USER" ? (
                      <div className="min-w-[120px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-500">
                            {u.qualifiedReferrals}/{FREE_IPHONE_REQUIRED}
                          </span>
                          {u.qualifiedReferrals >= FREE_IPHONE_REQUIRED && (
                            <span className="text-xs font-medium text-emerald-600">✓</span>
                          )}
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div
                            className={`h-full rounded-full transition-all ${
                              u.qualifiedReferrals >= FREE_IPHONE_REQUIRED
                                ? "bg-emerald-500"
                                : "bg-emerald-400"
                            }`}
                            style={{ width: `${u.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== "ADMIN" && (
                      <button
                        type="button"
                        onClick={() => handleBlock(u.id, !u.isBlocked)}
                        className={`text-sm hover:underline ${
                          u.isBlocked ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {u.isBlocked ? t("adminUnblock") : t("adminBlock")}
                      </button>
                    )}
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
