/** Approximate USD to UAH rate for display. Override with NEXT_PUBLIC_UAH_RATE env. */
export const USD_TO_UAH = typeof process !== "undefined" && process.env.NEXT_PUBLIC_UAH_RATE
  ? Number(process.env.NEXT_PUBLIC_UAH_RATE)
  : 41;

export function usdToUah(usd: number): number {
  return Math.round(usd * USD_TO_UAH);
}
