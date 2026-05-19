/**
 * Heuristics for bot / disposable signup abuse (Gmail dot-trick, plus-aliases).
 */

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/** Gmail ignores dots in the local part; plus-suffix is an alias. */
export function normalizeEmailForComparison(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0) return trimmed;
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!GMAIL_DOMAINS.has(domain)) return trimmed;
  const plus = local.indexOf("+");
  if (plus >= 0) local = local.slice(0, plus);
  local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

/**
 * Bot registrations often use many dots in Gmail local parts (am.y.4.6.986@gmail.com).
 */
export function isSuspiciousSignupEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0) return true;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!GMAIL_DOMAINS.has(domain)) return false;
  const dotCount = (local.match(/\./g) ?? []).length;
  if (dotCount >= 3) return true;
  if (local.length > 40 && dotCount >= 2) return true;
  return false;
}
