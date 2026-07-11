/** Client-safe cashback display helpers (no DB). */

export const DEFAULT_OWN_CASHBACK_PERCENT = 5;

export function displayCashbackAmount(price: number, ownPercent: number): number {
  return Math.round((price * ownPercent) / 100);
}
