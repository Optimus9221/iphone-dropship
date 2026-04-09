/**
 * Email notifications using Resend
 * Set RESEND_API_KEY in .env
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "iPhree";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** @returns true if the message was handed to Resend */
export async function sendEmailVerificationCode(params: {
  to: string;
  code: string;
  locale?: string;
}): Promise<boolean> {
  if (!resend) return false;
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
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: `<div style="font-family: sans-serif; max-width: 480px;">${body}<p>— ${SITE_NAME}</p></div>`,
    });
    return true;
  } catch (e) {
    console.error("Verification email error:", e);
    return false;
  }
}

export async function sendPasswordResetEmail(params: { to: string; resetLink: string; locale?: string }) {
  if (!resend) return;
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
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: `<div style="font-family: sans-serif; max-width: 480px;">${body}<p>— ${SITE_NAME}</p></div>`,
    });
  } catch (e) {
    console.error("Password reset email error:", e);
  }
}

export async function sendOrderConfirmation(params: {
  to: string;
  orderNumber: string;
  total: number;
  items: string;
}) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
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
    console.error("Email send error:", e);
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
      from: FROM_EMAIL,
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
    console.error("Email send error:", e);
  }
}
