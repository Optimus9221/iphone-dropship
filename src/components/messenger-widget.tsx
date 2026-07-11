"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DEFAULT_TELEGRAM = "https://t.me/SVSB777";

type SiteSettings = {
  telegram_link: string;
};

function toTelegramUrl(link: string): string {
  if (link.startsWith("http")) return link;
  return `https://t.me/${link.replace("@", "")}`;
}

export function MessengerWidget() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/public/site")
      .then((r) => r.json())
      .then((data: { telegram_link?: string }) =>
        setSettings({ telegram_link: data.telegram_link || DEFAULT_TELEGRAM })
      )
      .catch(() => setSettings({ telegram_link: DEFAULT_TELEGRAM }));
  }, []);

  if (pathname !== "/" || !settings) return null;

  const tgUrl = toTelegramUrl(settings.telegram_link);

  return (
    <div className="fixed bottom-28 right-4 z-40 flex flex-col gap-2 sm:bottom-24">
      <Link
        href={tgUrl}
        data-testid="pf-messenger-telegram-link"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0088cc] text-white shadow-lg transition hover:scale-110 hover:shadow-xl"
        aria-label="Telegram"
      >
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </Link>
    </div>
  );
}
