"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const { t, locale } = useI18n();
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    if (status !== "authenticated") return;
    fetch("/api/dashboard/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setItems(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      })
      .catch(() => undefined);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (status !== "authenticated") return null;

  const markRead = async (ids?: string[]) => {
    await fetch("/api/dashboard/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids ? { ids } : { all: true }),
    }).catch(() => undefined);
    load();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        data-testid="pf-header-notifications-button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="relative rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
        aria-label={t("notifications")}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            data-testid="pf-header-notifications-badge"
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          data-testid="pf-header-notifications-panel"
          className="absolute end-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <p className="text-sm font-medium text-white">{t("notifications")}</p>
            {unreadCount > 0 && (
              <button
                type="button"
                data-testid="pf-header-notifications-mark-all"
                onClick={() => void markRead()}
                className="text-xs text-emerald-400 hover:underline"
              >
                {t("notificationsMarkAllRead")}
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-zinc-500">{t("notificationsEmpty")}</li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-white/5 px-3 py-3 last:border-0 ${
                    n.readAt ? "opacity-70" : "bg-emerald-500/5"
                  }`}
                >
                  {n.href ? (
                    <Link
                      href={n.href}
                      data-testid={`pf-header-notification-${n.id}`}
                      onClick={() => {
                        setOpen(false);
                        if (!n.readAt) void markRead([n.id]);
                      }}
                      className="block"
                    >
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{n.body}</p>
                      <p className="mt-1 text-[10px] text-zinc-600">
                        {new Date(n.createdAt).toLocaleString(locale)}
                      </p>
                    </Link>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{n.body}</p>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
