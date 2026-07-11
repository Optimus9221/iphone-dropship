/** Approximate USD → UAH rate for display. Override with NEXT_PUBLIC_UAH_RATE. */
const DEFAULT_USD_TO_UAH = 44.8;

/**
 * Exact UAH from the price list (Citrus). USD×44.8 is only a rough guide —
 * table UAH values are authoritative and do not always equal round(usd×44.8).
 */
const EXACT_UAH_BY_USD: Record<number, number> = {
  1044: 46799,
  1115: 49999,
  1267: 56799,
  1338: 59999,
  1383: 61999,
  1495: 66999,
  1561: 69999,
  1651: 73999,
  1784: 79999,
  1874: 83999,
  2007: 89999,
  2453: 109999,
};

function resolveUsdToUahRate(): number {
  const raw = process.env.NEXT_PUBLIC_UAH_RATE;
  if (raw == null || raw === "") return DEFAULT_USD_TO_UAH;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_USD_TO_UAH;
}

export const USD_TO_UAH = resolveUsdToUahRate();

export function usdToUah(usd: number): number {
  const exact = EXACT_UAH_BY_USD[usd];
  if (exact != null) return exact;
  return Math.round(usd * USD_TO_UAH);
}
