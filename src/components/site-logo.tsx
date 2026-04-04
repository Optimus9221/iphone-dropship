type SiteLogoProps = {
  /** Подсветка как на главной (активная ссылка в шапке) */
  homeActive?: boolean;
  className?: string;
};

export function SiteLogo({ homeActive = false, className = "" }: SiteLogoProps) {
  const letterI = homeActive
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-zinc-900 dark:text-zinc-100";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        className="h-8 w-8 shrink-0 rounded-lg shadow-sm"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="iphreeLogoGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#iphreeLogoGrad)" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fill="white"
          style={{ fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif", fontSize: "11px", fontWeight: 700 }}
        >
          iP
        </text>
      </svg>
      <span className="text-xl font-semibold tracking-tight">
        <span className={letterI}>i</span>
        <span className="text-emerald-600 dark:text-emerald-400">Phree</span>
      </span>
    </span>
  );
}
