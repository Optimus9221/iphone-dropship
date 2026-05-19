import { prisma } from "@/lib/db";

export type RateLimitResult = { allowed: true } | { allowed: false };

/**
 * Fixed-window counter in PostgreSQL (works on Vercel serverless).
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const row = await prisma.rateLimitCounter.findUnique({ where: { key } });

  if (!row || row.windowEnd <= now) {
    await prisma.rateLimitCounter.upsert({
      where: { key },
      create: {
        key,
        count: 1,
        windowEnd: new Date(now.getTime() + windowMs),
      },
      update: {
        count: 1,
        windowEnd: new Date(now.getTime() + windowMs),
      },
    });
    return { allowed: true };
  }

  if (row.count >= max) {
    return { allowed: false };
  }

  await prisma.rateLimitCounter.update({
    where: { key },
    data: { count: row.count + 1 },
  });
  return { allowed: true };
}

const AUTH_EMAIL_WINDOW_MS = 60 * 60 * 1000;
const AUTH_EMAIL_MAX_PER_IP = 12;
const AUTH_EMAIL_MAX_PER_EMAIL = 3;

/** Shared limit for register / forgot-password / resend-verification. */
export async function checkAuthEmailRateLimit(
  ip: string,
  email: string
): Promise<RateLimitResult> {
  const ipKey = `auth-email:ip:${ip}`;
  const emailKey = `auth-email:addr:${email}`;

  const ipResult = await checkRateLimit(ipKey, AUTH_EMAIL_MAX_PER_IP, AUTH_EMAIL_WINDOW_MS);
  if (!ipResult.allowed) return ipResult;

  return checkRateLimit(emailKey, AUTH_EMAIL_MAX_PER_EMAIL, AUTH_EMAIL_WINDOW_MS);
}
