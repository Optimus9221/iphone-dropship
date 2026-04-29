/**
 * Email notifications using Resend
 * Set RESEND_API_KEY and (on production) EMAIL_FROM to an address on a domain verified in Resend.
 */

import { Resend } from "resend";
import { getPublicSiteUrl } from "@/lib/public-url";

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "PhoneFree";

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
  const siteUrl = getPublicSiteUrl();
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
          <p>After we review your order, we will send an email with instructions to pay in cryptocurrency. You will find the wallet address and network in your account under Orders.</p>
          <p>You can track your order in your <a href="${siteUrl}/dashboard/orders">dashboard</a>.</p>
          <p>— ${SITE_NAME}</p>
        </div>
      `,
    });
  } catch (e) {
    logResendFailure("order-confirmation", e);
  }
}

/** Sent when admin sets order to AWAITING_PAYMENT — asks customer to open site for crypto details */
export async function sendAwaitingPaymentEmail(params: {
  to: string;
  orderNumber: string;
  locale?: string;
}) {
  if (!resend) return;
  const from = getResendFrom();
  const siteUrl = getPublicSiteUrl();
  const dashboardUrl = `${siteUrl}/dashboard/orders`;
  const loc = params.locale ?? "en";
  const subject =
    loc === "ru"
      ? `Оплатите заказ #${params.orderNumber} — ${SITE_NAME}`
      : loc === "uk"
        ? `Оплатіть замовлення #${params.orderNumber} — ${SITE_NAME}`
        : `Complete payment for order #${params.orderNumber} — ${SITE_NAME}`;
  const html =
    loc === "ru"
      ? `<div style="font-family: sans-serif; max-width: 480px;"><p>Заказ <strong>#${params.orderNumber}</strong> подтверждён. Перейдите в личный кабинет, чтобы увидеть адрес кошелька и сеть для оплаты в криптовалюте.</p><p>После перевода прикрепите скрин транзакции и нажмите «Оплатил» — мы проверим платёж и подтвердим заказ.</p><p><a href="${dashboardUrl}">${dashboardUrl}</a></p><p>— ${SITE_NAME}</p></div>`
      : loc === "uk"
        ? `<div style="font-family: sans-serif; max-width: 480px;"><p>Замовлення <strong>#${params.orderNumber}</strong> підтверджено. Перейдіть у особистий кабінет, щоб побачити адресу гаманця та мережу для оплати криптовалютою.</p><p>Після переказу додайте скрін транзакції та натисніть «Оплатив» — ми перевіримо платіж і підтвердимо замовлення.</p><p><a href="${dashboardUrl}">${dashboardUrl}</a></p><p>— ${SITE_NAME}</p></div>`
        : `<div style="font-family: sans-serif; max-width: 480px;"><p>Your order <strong>#${params.orderNumber}</strong> is confirmed. Sign in to your account to see the crypto wallet address and network for payment.</p><p>After you send the transfer, upload a screenshot of the transaction and click “Paid” — we will verify it and confirm your order.</p><p><a href="${dashboardUrl}">${dashboardUrl}</a></p><p>— ${SITE_NAME}</p></div>`;
  try {
    await resend.emails.send({ from, to: params.to, subject, html });
  } catch (e) {
    logResendFailure("awaiting-payment", e);
  }
}

/** Customer confirmation after uploading transaction screenshot */
export async function sendPaymentProofSubmittedEmail(params: {
  to: string;
  orderNumber: string;
  locale?: string;
}) {
  if (!resend) return;
  const from = getResendFrom();
  const siteUrl = getPublicSiteUrl();
  const ordersUrl = `${siteUrl}/dashboard/orders`;
  const loc = params.locale ?? "en";
  const subject =
    loc === "ru"
      ? `Платёж получен на проверку — заказ #${params.orderNumber} — ${SITE_NAME}`
      : loc === "uk"
        ? `Платіж на перевірці — замовлення #${params.orderNumber} — ${SITE_NAME}`
        : `Payment proof received — order #${params.orderNumber} — ${SITE_NAME}`;
  const html =
    loc === "ru"
      ? `<div style="font-family: sans-serif; max-width: 480px;"><p>Мы получили скрин транзакции по заказу <strong>#${params.orderNumber}</strong>. После проверки статус обновится — следите в личном кабинете.</p><p><a href="${ordersUrl}">${ordersUrl}</a></p><p>— ${SITE_NAME}</p></div>`
      : loc === "uk"
        ? `<div style="font-family: sans-serif; max-width: 480px;"><p>Ми отримали скрін транзакції для замовлення <strong>#${params.orderNumber}</strong>. Після перевірки статус оновиться — слідкуйте в особистому кабінеті.</p><p><a href="${ordersUrl}">${ordersUrl}</a></p><p>— ${SITE_NAME}</p></div>`
        : `<div style="font-family: sans-serif; max-width: 480px;"><p>We received your transaction screenshot for order <strong>#${params.orderNumber}</strong>. We will verify it and update your order status — check your dashboard.</p><p><a href="${ordersUrl}">${ordersUrl}</a></p><p>— ${SITE_NAME}</p></div>`;
  try {
    await resend.emails.send({ from, to: params.to, subject, html });
  } catch (e) {
    logResendFailure("payment-proof-submitted", e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Internal/admin inbox — payment screenshot uploaded, verification needed.
 * Requires ADMIN_NOTIFICATION_EMAIL (comma-separated allowed).
 */
export async function sendAdminPaymentProofReceivedNotification(params: {
  orderNumber: string;
  totalUsd: number;
  submittedAt: Date;
}) {
  const raw = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (!raw || !resend) return;

  const recipients = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (recipients.length === 0) return;

  const from = getResendFrom();
  const siteUrl = getPublicSiteUrl().replace(/\/$/, "");
  const adminOrdersUrl = `${siteUrl}/admin/orders`;
  const num = escapeHtml(params.orderNumber);
  const totalStr = params.totalUsd.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const whenStr = params.submittedAt.toLocaleString("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Kyiv",
  });

  const subject = `[${SITE_NAME}] Заказ №${params.orderNumber} — поступило подтверждение оплаты`;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; line-height: 1.55; font-size: 15px;">
  <p style="margin: 0 0 18px;">Добрый день.</p>
  <p style="margin: 0 0 18px;">
    По заказу <strong>№${num}</strong> клиент приложил скриншот транзакции. Сумма заказа в системе: <strong>$${totalStr}&nbsp;USD</strong>.
    Статус переведён в режим ожидания проверки платежа.
  </p>
  <p style="margin: 0 0 18px;"><strong>Необходимо:</strong> сверить данные перевода со скриншотом в карточке заказа и при успешной проверке установить статус «Оплачен».</p>
  <p style="margin: 0 0 18px;">
    Административная панель — заказы:<br />
    <a href="${adminOrdersUrl}" style="color: #0f766e;">${adminOrdersUrl}</a>
  </p>
  <p style="margin: 0 0 24px; color: #525252; font-size: 13px;">Время загрузки скриншота (Киев): ${escapeHtml(whenStr)}</p>
  <p style="margin: 0; color: #737373; font-size: 12px; border-top: 1px solid #e5e5e5; padding-top: 16px;">
    Это автоматическое служебное уведомление. Ответ на это письмо не обрабатывается.
  </p>
</div>`;

  for (const to of recipients) {
    try {
      await resend.emails.send({ from, to, subject, html });
    } catch (e) {
      logResendFailure("admin-payment-proof", e);
    }
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
  const siteUrl = getPublicSiteUrl();
  try {
    const statusLabels: Record<string, string> = {
      NEW: "New",
      AWAITING_PAYMENT: "Awaiting payment",
      PAYMENT_VERIFICATION_PENDING: "Payment verification pending",
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
    body += `<p><a href="${siteUrl}/dashboard/orders">View order</a></p>`;
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
