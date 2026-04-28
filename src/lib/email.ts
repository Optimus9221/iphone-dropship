/**
 * Email notifications using Resend
 * Set RESEND_API_KEY and (on production) EMAIL_FROM to an address on a domain verified in Resend.
 */

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "PhoneFree";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Trims accidental whitespace from Vercel — Resend rejects malformed `from`. */
function getResendFrom(): string {
  const raw = process.env.EMAIL_FROM?.trim();
  return raw && raw.length > 0 ? raw : "onboarding@resend.dev";
}

/** Helps debug failed sends in Vercel Logs (domain not verified, invalid from, bad API key). */
function logResendFailure(op: string, err: unknown): void {
  console.error(`[resend:${op}] send failed`);
  if (err instanceof Error) {
    console.error(`[resend:${op}] ${err.message}`);
    if (err.stack) console.error(err.stack);
  }
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    const extras = ["statusCode", "status", "name"] as const;
    for (const k of extras) {
      if (o[k] !== undefined) console.error(`[resend:${op}] ${k}:`, o[k]);
    }
    const body = o.responseBody ?? (o.response as Record<string, unknown>)?.data;
    if (body !== undefined) {
      console.error(
        `[resend:${op}] response:`,
        typeof body === "string" ? body : JSON.stringify(body)
      );
    }
  }
  if (!(err instanceof Error)) {
    try {
      console.error(`[resend:${op}] raw:`, JSON.stringify(err));
    } catch {
      console.error(`[resend:${op}]`, err);
    }
  }
}

/** @returns true if the message was handed to Resend */
export async function sendEmailVerificationCode(params: {
  to: string;
  code: string;
  locale?: string;
}): Promise<boolean> {
  if (!resend) return false;
  const from = getResendFrom();
  const subject =
    params.locale === "ru"
      ? `Код подтверждения email — ${SITE_NAME}`
      : params.locale === "uk"
        ? `Код підтвердження email — ${SITE_NAME}`
        : `Your email verification code — ${SITE_NAME}`;
  const body =
    params.locale === "ru"
      ? `<p>Ваш код подтверждения email:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${params.code}</p><p>Код действителен 30 минут. Если вы не регистрировались, проигнорируйте письмо.</p>`
      : params.locale === "uk"
        ? `<p>Ваш код підтвердження email:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${params.code}</p><p>Код дійсний 30 хвилин. Якщо ви не реєструвалися, ігноруйте лист.</p>`
        : `<p>Your email verification code:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${params.code}</p><p>This code expires in 30 minutes. If you did not sign up, ignore this email.</p>`;
  try {
    await resend.emails.send({
      from,
      to: params.to,
      subject,
      html: `<div style="font-family: sans-serif; max-width: 480px;">${body}<p>— ${SITE_NAME}</p></div>`,
    });
    return true;
  } catch (e) {
    logResendFailure("verification", e);
    return false;
  }
}

export async function sendPasswordResetEmail(params: { to: string; resetLink: string; locale?: string }) {
  if (!resend) return;
  const from = getResendFrom();
  const subject =
    params.locale === "ru"
      ? `Восстановление пароля — ${SITE_NAME}`
      : params.locale === "uk"
        ? `Відновлення пароля — ${SITE_NAME}`
        : `Password reset — ${SITE_NAME}`;
  const body =
    params.locale === "ru"
      ? `<p>Перейдите по ссылке, чтобы задать новый пароль:</p><p><a href="${params.resetLink}">${params.resetLink}</a></p><p>Ссылка действительна 1 час.</p>`
      : params.locale === "uk"
        ? `<p>Перейдіть за посиланням, щоб встановити новий пароль:</p><p><a href="${params.resetLink}">${params.resetLink}</a></p><p>Посилання дійсне 1 годину.</p>`
        : `<p>Click the link to set a new password:</p><p><a href="${params.resetLink}">${params.resetLink}</a></p><p>Link expires in 1 hour.</p>`;
  try {
    await resend.emails.send({
      from,
      to: params.to,
      subject,
      html: `<div style="font-family: sans-serif; max-width: 480px;">${body}<p>— ${SITE_NAME}</p></div>`,
    });
  } catch (e) {
    logResendFailure("password-reset", e);
  }
}

export async function sendOrderConfirmation(params: {
  to: string;
  orderNumber: string;
  total: number;
  items: string;
}) {
  if (!resend) return;
  const from = getResendFrom();
  try {
    await resend.emails.send({
      from,
      to: params.to,
      subject: `Order #${params.orderNumber} confirmed — ${SITE_NAME}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Order confirmed</h2>
          <p>Thank you for your order!</p>
          <p><strong>Order #${params.orderNumber}</strong></p>
          <p>Items: ${params.items}</p>
          <p>Total: $${params.total}</p>
          <p>You can track your order status in your <a href="${SITE_URL}/dashboard/orders">dashboard</a>.</p>
          <p>— ${SITE_NAME}</p>
        </div>
      `,
    });
  } catch (e) {
    logResendFailure("order-confirmation", e);
  }
}

export async function sendOrderStatusUpdate(params: {
  to: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string | null;
  imei?: string | null;
}) {
  if (!resend) return;
  const from = getResendFrom();
  try {
    const statusLabels: Record<string, string> = {
      NEW: "New",
      PAID: "Paid",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      REFUNDED: "Refunded",
    };
    const statusLabel = statusLabels[params.status] ?? params.status;

    let body = `<p>Your order <strong>#${params.orderNumber}</strong> status: <strong>${statusLabel}</strong></p>`;
    if (params.trackingNumber) {
      body += `<p>Tracking: ${params.trackingNumber}</p>`;
      body += `<p><a href="https://novaposhta.ua/tracking/?cargo_number=${params.trackingNumber}">Track on Nova Poshta</a></p>`;
    }
    if (params.imei) {
      body += `<p>IMEI: ${params.imei}</p>`;
    }
    body += `<p><a href="${SITE_URL}/dashboard/orders">View order</a></p>`;
    body += `<p>— ${SITE_NAME}</p>`;

    await resend.emails.send({
      from,
      to: params.to,
      subject: `Order #${params.orderNumber} — ${statusLabel} — ${SITE_NAME}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Order status update</h2>
          ${body}
        </div>
      `,
    });
  } catch (e) {
    logResendFailure("order-status", e);
  }
}
