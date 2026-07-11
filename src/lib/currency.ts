/** Approximate USD → UAH rate for display. Override with NEXT_PUBLIC_UAH_RATE. */
const DEFAULT_USD_TO_UAH = 44.8;

function resolveUsdToUahRate(): number {
  const raw = process.env.NEXT_PUBLIC_UAH_RATE;
  if (raw == null || raw === "") return DEFAULT_USD_TO_UAH;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_USD_TO_UAH;
}

export const USD_TO_UAH = resolveUsdToUahRate();

export function usdToUah(usd: number): number {
  return Math.round(usd * USD_TO_UAH);
}
