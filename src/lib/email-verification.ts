import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { sendEmailVerificationCode } from "./email";
import type { Locale } from "./i18n/translations";

const CODE_EXPIRY_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export type EmailVerificationIssueResult =
  | { ok: true }
  | { ok: false; error: "COOLDOWN" | "EMAIL_FAILED" };

/**
 * Creates a new verification code (invalidates any previous) and sends it by email.
 * In development without RESEND_API_KEY, logs the code to the server console.
 */
export async function issueEmailVerificationCode(
  userId: string,
  email: string,
  locale: Locale | undefined
): Promise<EmailVerificationIssueResult> {
  const existing = await prisma.emailVerificationToken.findUnique({ where: { userId } });
  if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return { ok: false, error: "COOLDOWN" };
  }

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  const code = generateSixDigitCode();
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_EXPIRY_MS),
    },
  });

  const sent = await sendEmailVerificationCode({ to: email, code, locale });
  if (!sent) {
    if (process.env.NODE_ENV === "production") {
      await prisma.emailVerificationToken.deleteMany({ where: { userId } });
      return { ok: false, error: "EMAIL_FAILED" };
    }
    console.info(`[dev] Email verification code for ${email}: ${code}`);
  }
  return { ok: true };
}
