import { useId } from "react";

type SiteLogoProps = {
  /** Подсветка как на главной (активная ссылка в шапке) */
  homeActive?: boolean;
  /** Шапка тёмная: читаемый светлый текст у «Phone» */
  forDarkHeader?: boolean;
  className?: string;
};

export function SiteLogo({ homeActive = false, forDarkHeader = false, className = "" }: SiteLogoProps) {
  const rawId = useId().replace(/:/g, "");
  const gradId = `pf-logo-grad-${rawId}`;

  const phoneClass = forDarkHeader
    ? homeActive
      ? "text-emerald-400"
      : "text-zinc-100"
    : homeActive
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-zinc-900 dark:text-zinc-50";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        className="h-9 w-9 shrink-0 drop-shadow-sm"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="6" y1="4" x2="30" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" />
            <stop offset="0.5" stopColor="#059669" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="11" fill={`url(#${gradId})`} />
        {/* Минималистичный силуэт телефона */}
        <rect
          x="12"
          y="7"
          width="12"
          height="22"
          rx="2.5"
          stroke="white"
          strokeWidth="1.75"
          strokeOpacity={0.92}
          fill="none"
        />
        <line
          x1="15"
          y1="26.5"
          x2="21"
          y2="26.5"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeOpacity={0.55}
        />
      </svg>
      <span className="leading-none">
        <span className="font-bold tracking-[-0.02em]">
          <span className={`inline align-baseline text-xl sm:text-[1.35rem] ${phoneClass}`}>Phone</span>
          <span className="inline bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 bg-clip-text text-xl text-transparent sm:text-[1.35rem] dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-500">
            Free
          </span>
        </span>
      </span>
    </span>
  );
}
