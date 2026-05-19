import { getClientIp } from "@/lib/request-client";

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  );
}

/** Verify token with Cloudflare. Returns false if misconfigured or invalid. */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret || !token.trim()) return false;

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token.trim());
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error("[turnstile] siteverify failed:", e);
    return false;
  }
}

/**
 * When keys are set (production), captcha is required.
 * When unset (local dev), skips verification.
 */
export async function requireTurnstile(
  req: Request,
  token: string | undefined | null
): Promise<{ ok: true } | { ok: false }> {
  if (!isTurnstileConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[turnstile] TURNSTILE_SECRET_KEY or NEXT_PUBLIC_TURNSTILE_SITE_KEY missing");
      return { ok: false };
    }
    return { ok: true };
  }

  const ip = getClientIp(req);
  const valid = await verifyTurnstileToken(token ?? "", ip);
  return valid ? { ok: true } : { ok: false };
}
