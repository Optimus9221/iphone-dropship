"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/toast/toast-provider";

type Settings = {
  min_withdrawal: string;
  cashback_hold_days: string;
  whatsapp_phone: string;
  telegram_link: string;
  privacy_policy: string;
  terms_of_service: string;
};

const DEFAULT_SETTINGS: Settings = {
  min_withdrawal: "10",
  cashback_hold_days: "14",
  whatsapp_phone: "+380501234567",
  telegram_link: "https://t.me/iphone_store_ua",
  privacy_policy: "",
  terms_of_service: "",
};

export default function AdminSettingsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const s = settings ?? DEFAULT_SETTINGS;
    if (!s.min_withdrawal || !s.cashback_hold_days) return;
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    setSaving(false);
    if (res.ok) {
      toast(t("adminSettingsSaved"));
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">{t("adminSettings")}</h1>
        <div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("adminSettings")}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t("adminSettingsTitle")}</p>

      <form onSubmit={handleSave} className="mt-8 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium">{t("adminMinWithdrawal")}</label>
          <p className="mt-0.5 text-xs text-zinc-500">{t("adminMinWithdrawalHint")}</p>
          <input
            type="text"
            value={settings?.min_withdrawal ?? "10"}
            onChange={(e) =>
              setSettings((s) => (s ? { ...s, min_withdrawal: e.target.value } : { ...DEFAULT_SETTINGS, min_withdrawal: e.target.value }))
            }
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">{t("adminCashbackHoldDays")}</label>
          <input
            type="text"
            value={settings?.cashback_hold_days ?? "14"}
            onChange={(e) =>
              setSettings((s) => (s ? { ...s, cashback_hold_days: e.target.value } : { ...DEFAULT_SETTINGS, cashback_hold_days: e.target.value }))
            }
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>
        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h3 className="mb-4 font-medium">{t("adminMessengers")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">{t("adminWhatsApp")}</label>
              <input
                type="text"
                value={settings?.whatsapp_phone ?? "+380501234567"}
                onChange={(e) => setSettings((s) => (s ? { ...s, whatsapp_phone: e.target.value } : { ...DEFAULT_SETTINGS, whatsapp_phone: e.target.value }))}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
                placeholder="+380501234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t("adminTelegram")}</label>
              <input
                type="text"
                value={settings?.telegram_link ?? "https://t.me/iphone_store_ua"}
                onChange={(e) => setSettings((s) => (s ? { ...s, telegram_link: e.target.value } : { ...DEFAULT_SETTINGS, telegram_link: e.target.value }))}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
                placeholder="https://t.me/username або @username"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h3 className="mb-4 font-medium">{t("adminLegalPages")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">{t("footerPrivacy")}</label>
              <textarea
                value={settings?.privacy_policy ?? ""}
                onChange={(e) => setSettings((s) => (s ? { ...s, privacy_policy: e.target.value } : { ...DEFAULT_SETTINGS, privacy_policy: e.target.value }))}
                rows={6}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                placeholder="HTML-контент..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t("footerTerms")}</label>
              <textarea
                value={settings?.terms_of_service ?? ""}
                onChange={(e) => setSettings((s) => (s ? { ...s, terms_of_service: e.target.value } : { ...DEFAULT_SETTINGS, terms_of_service: e.target.value }))}
                rows={6}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                placeholder="HTML-контент..."
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? "..." : t("adminSave")}
        </button>
      </form>
    </div>
  );
}
