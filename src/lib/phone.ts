/**
 * Normalize phone to digits only (no +), E.164 without leading +.
 * Ukraine: 0XX... -> 380XX..., 380..., or 9 digits -> 380...
 */
export function normalizePhoneDigits(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (d.length < 9) return null;

  if (d.length === 12 && d.startsWith("380")) return d;
  if (d.length === 11 && d.startsWith("380")) return d;
  if (d.length === 10 && d.startsWith("0")) return `380${d.slice(1)}`;
  if (d.length === 9) return `380${d}`;

  if (d.length >= 10 && d.length <= 15) return d;
  return null;
}

export function toE164(digits: string): string {
  return `+${digits}`;
}
