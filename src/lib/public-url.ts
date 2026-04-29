/**
 * Canonical public https URL for this deployment (no trailing slash).
 * Used for password-reset links, referral URLs, email templates.
 *
 * Priority: NEXT_PUBLIC_SITE_URL → NEXTAUTH_URL → Request Host → VERCEL_URL → localhost.
 */

function trimUrl(s: string | undefined): string {
  return (s ?? "").trim().replace(/\/$/, "");
}

export function getPublicSiteUrl(req?: Request): string {
  const explicit = trimUrl(process.env.NEXT_PUBLIC_SITE_URL) || trimUrl(process.env.NEXTAUTH_URL);
  if (explicit) return explicit;

  if (req) {
    const hostRaw =
      req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      req.headers.get("host")?.split(",")[0]?.trim();
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (hostRaw?.includes("localhost") ? "http" : "https");
    if (hostRaw && !/^localhost(:\d+)?$/i.test(hostRaw) && hostRaw !== "127.0.0.1") {
      return `${proto}://${hostRaw}`;
    }
  }

  const vercel = trimUrl(process.env.VERCEL_URL);
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
