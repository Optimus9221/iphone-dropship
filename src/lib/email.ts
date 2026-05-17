/**
 * Email notifications using Resend
 * Set RESEND_API_KEY and EMAIL_FROM to an address on a domain verified in Resend.
 * On production, EMAIL_FROM must be set вЂ” onboarding@resend.dev triggers 403 for most recipients.
 */

import { Resend, type CreateEmailOptions } from "resend";
import { getPublicSiteUrl } from "@/lib/public-url";

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "PhoneFree";

let warnedMissingEmailFrom = false;

/** Trims accidental whitespace from Vercel вЂ” Resend rejects malformed `from`. */
function getResendFrom(): string {
  const raw = process.env.EMAIL_FROM?.trim();
  if (raw && raw.length > 0) return raw;

  if (process.env.NODE_ENV === "production" && !warnedMissingEmailFrom) {
    warnedMissingEmailFrom = true;
    console.error(
      "[email] EMAIL_FROM is unset in production. Resend test sender onboarding@resend.dev usually returns 403 for arbitrary recipients. Set EMAIL_FROM to an address on your verified domain (e.g. PhoneFree <noreply@phonefree.uk>)."
    );
  }

  return "onboarding@resend.dev";
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

/**
 * Resend's client resolves with `{ data, error }` вЂ” it does not throw on HTTP/API errors.
 * Without checking `error`, callers falsely assume the email was sent.
 */
async function resendSend(op: string, payload: CreateEmailOptions): Promise<boolean> {
  if (!resend) return false;
  try {
    const result = await resend.emails.send(payload);
    /** Treat any present error payload as failure (SDK uses `null` on success). */
    if (result.error != null) {
      logResendFailure(op, result.error);
      return false;
    }
    return true;
  } catch (e) {
    logResendFailure(op, e);
    return false;
  }
}

/** @returns true if Resend accepted the message */
export async function sendEmailVerificationCode(params: {
  to: string;
  code: string;
  locale?: string;
}): Promise<boolean> {
  if (!resend) return false;
  const from = getResendFrom();
  const subject =
    params.locale === "ru"
      ? `РљРѕРґ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ email вЂ” ${SITE_NAME}`
      : params.locale === "uk"
        ? `РљРѕРґ РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ email вЂ” ${SITE_NAME}`
        : `Your email verification code вЂ” ${SITE_NAME}`;
  const body =
    params.locale === "ru"
      ? `<p>Р’Р°С€ РєРѕРґ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ email:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${params.code}</p><p>РљРѕРґ РґРµР№СЃС‚РІРёС‚РµР»РµРЅ 30 РјРёРЅСѓС‚. Р•СЃР»Рё РІС‹ РЅРµ СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°Р»РёСЃСЊ, РїСЂРѕРёРіРЅРѕСЂРёСЂСѓР№С‚Рµ РїРёСЃСЊРјРѕ.</p>`
      : params.locale === "uk"
        ? `<p>Р’Р°С€ РєРѕРґ РїС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ email:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${params.code}</p><p>РљРѕРґ РґС–Р№СЃРЅРёР№ 30 С…РІРёР»РёРЅ. РЇРєС‰Рѕ РІРё РЅРµ СЂРµС”СЃС‚СЂСѓРІР°Р»РёСЃСЏ, С–РіРЅРѕСЂСѓР№С‚Рµ Р»РёСЃС‚.</p>`
        : `<p>Your email verification code:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${params.code}</p><p>This code expires in 30 minutes. If you did not sign up, ignore this email.</p>`;
  return resendSend("verification", {
    from,
    to: params.to,
    subject,
    html: `<div style="font-family: sans-serif; max-width: 480px;">${body}<p>вЂ” ${SITE_NAME}</p></div>`,
  });
}

export async function sendPasswordResetEmail(params: { to: string; resetLink: string; locale?: string }) {
  if (!resend) return;
  const from = getResendFrom();
  const subject =
    params.locale === "ru"
      ? `Р’РѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёРµ РїР°СЂРѕР»СЏ вЂ” ${SITE_NAME}`
      : params.locale === "uk"
        ? `Р’С–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ вЂ” ${SITE_NAME}`
        : `Password reset вЂ” ${SITE_NAME}`;
  const body =
    params.locale === "ru"
      ? `<p>РџРµСЂРµР№РґРёС‚Рµ РїРѕ СЃСЃС‹Р»РєРµ, С‡С‚РѕР±С‹ Р·Р°РґР°С‚СЊ РЅРѕРІС‹Р№ РїР°СЂРѕР»СЊ:</p><p><a href="${params.resetLink}">${params.resetLink}</a></p><p>РЎСЃС‹Р»РєР° РґРµР№СЃС‚РІРёС‚РµР»СЊРЅР° 1 С‡Р°СЃ.</p>`
      : params.locale === "uk"
        ? `<p>РџРµСЂРµР№РґС–С‚СЊ Р·Р° РїРѕСЃРёР»Р°РЅРЅСЏРј, С‰РѕР± РІСЃС‚Р°РЅРѕРІРёС‚Рё РЅРѕРІРёР№ РїР°СЂРѕР»СЊ:</p><p><a href="${params.resetLink}">${params.resetLink}</a></p><p>РџРѕСЃРёР»Р°РЅРЅСЏ РґС–Р№СЃРЅРµ 1 РіРѕРґРёРЅСѓ.</p>`
        : `<p>Click the link to set a new password:</p><p><a href="${params.resetLink}">${params.resetLink}</a></p><p>Link expires in 1 hour.</p>`;
  await resendSend("password-reset", {
    from,
    to: params.to,
    subject,
    html: `<div style="font-family: sans-serif; max-width: 480px;">${body}<p>вЂ” ${SITE_NAME}</p></div>`,
  });
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
  await resendSend("order-confirmation", {
    from,
    to: params.to,
    subject: `Order #${params.orderNumber} confirmed вЂ” ${SITE_NAME}`,
    html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Order confirmed</h2>
          <p>Thank you for your order!</p>
          <p><strong>Order #${params.orderNumber}</strong></p>
          <p>Items: ${params.items}</p>
          <p>Total: $${params.total}</p>
          <p>After we review your order, we will send an email with instructions to pay in cryptocurrency. You will find the wallet address and network in your account under Orders.</p>
          <p>You can track your order in your <a href="${siteUrl}/dashboard/orders">dashboard</a>.</p>
          <p>вЂ” ${SITE_NAME}</p>
        </div>
      `,
  });
}

/** Sent when admin sets order to AWAITING_PAYMENT вЂ” asks customer to open site for crypto details */
export async function sendAwaitingPaymentEmail(params: {
  to: string;
  orderNumber: string;
  /** Opens dashboard orders scrolled to this order (?pay=) */
  orderId: string;
  locale?: string;
  request?: Request;
}) {
  if (!resend) return;
  const from = getResendFrom();
  const siteUrl = getPublicSiteUrl(params.request);
  const paymentPageUrl = `${siteUrl}/dashboard/orders?pay=${encodeURIComponent(params.orderId)}`;
  const loc = params.locale ?? "en";
  const linkLabel =
    loc === "ru"
      ? "РћС‚РєСЂС‹С‚СЊ СЃС‚СЂР°РЅРёС†Сѓ РѕРїР»Р°С‚С‹"
      : loc === "uk"
        ? "Р’С–РґРєСЂРёС‚Рё СЃС‚РѕСЂС–РЅРєСѓ РѕРїР»Р°С‚Рё"
        : "Open payment page";
  const subject =
    loc === "ru"
      ? `РћРїР»Р°С‚РёС‚Рµ Р·Р°РєР°Р· #${params.orderNumber} вЂ” ${SITE_NAME}`
      : loc === "uk"
        ? `РћРїР»Р°С‚С–С‚СЊ Р·Р°РјРѕРІР»РµРЅРЅСЏ #${params.orderNumber} вЂ” ${SITE_NAME}`
        : `Complete payment for order #${params.orderNumber} вЂ” ${SITE_NAME}`;
  const html =
    loc === "ru"
      ? `<div style="font-family: sans-serif; max-width: 480px;"><p>Р—Р°РєР°Р· <strong>#${params.orderNumber}</strong> РїРѕРґС‚РІРµСЂР¶РґС‘РЅ. РќР°Р¶РјРёС‚Рµ РєРЅРѕРїРєСѓ РЅРёР¶Рµ вЂ” РѕС‚РєСЂРѕРµС‚СЃСЏ СЃС‚СЂР°РЅРёС†Р° СЃ Р°РґСЂРµСЃРѕРј РєРѕС€РµР»СЊРєР°, СЃРµС‚СЊСЋ Рё С„РѕСЂРјРѕР№ РґР»СЏ СЃРєСЂРёРЅР° РїРµСЂРµРІРѕРґР°.</p><p style="margin:20px 0;"><a href="${paymentPageUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">${linkLabel}</a></p><p style="font-size:13px;color:#525252;">Р•СЃР»Рё РєРЅРѕРїРєР° РЅРµ СЂР°Р±РѕС‚Р°РµС‚, СЃРєРѕРїРёСЂСѓР№С‚Рµ СЃСЃС‹Р»РєСѓ:<br/><a href="${paymentPageUrl}">${paymentPageUrl}</a></p><p>РџРѕСЃР»Рµ РїРµСЂРµРІРѕРґР° РїСЂРёРєСЂРµРїРёС‚Рµ СЃРєСЂРёРЅ С‚СЂР°РЅР·Р°РєС†РёРё Рё РЅР°Р¶РјРёС‚Рµ В«РћРїР»Р°С‚РёР»В».</p><p>вЂ” ${SITE_NAME}</p></div>`
      : loc === "uk"
        ? `<div style="font-family: sans-serif; max-width: 480px;"><p>Р—Р°РјРѕРІР»РµРЅРЅСЏ <strong>#${params.orderNumber}</strong> РїС–РґС‚РІРµСЂРґР¶РµРЅРѕ. РќР°С‚РёСЃРЅС–С‚СЊ РєРЅРѕРїРєСѓ РЅРёР¶С‡Рµ вЂ” РІС–РґРєСЂРёС”С‚СЊСЃСЏ СЃС‚РѕСЂС–РЅРєР° Р· Р°РґСЂРµСЃРѕСЋ РіР°РјР°РЅС†СЏ, РјРµСЂРµР¶РµСЋ С‚Р° С„РѕСЂРјРѕСЋ РґР»СЏ СЃРєСЂРёРЅР° РїРµСЂРµРєР°Р·Сѓ.</p><p style="margin:20px 0;"><a href="${paymentPageUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">${linkLabel}</a></p><p style="font-size:13px;color:#525252;">РЇРєС‰Рѕ РєРЅРѕРїРєР° РЅРµ РїСЂР°С†СЋС”, СЃРєРѕРїС–СЋР№С‚Рµ РїРѕСЃРёР»Р°РЅРЅСЏ:<br/><a href="${paymentPageUrl}">${paymentPageUrl}</a></p><p>РџС–СЃР»СЏ РїРµСЂРµРєР°Р·Сѓ РґРѕРґР°Р№С‚Рµ СЃРєСЂС–РЅ С‚Р° РЅР°С‚РёСЃРЅС–С‚СЊ В«РћРїР»Р°С‚РёРІВ».</p><p>вЂ” ${SITE_NAME}</p></div>`
        : `<div style="font-family: sans-serif; max-width: 480px;"><p>Your order <strong>#${params.orderNumber}</strong> is confirmed. Use the button below to open the payment page вЂ” wallet address, network, and the upload form for your transaction screenshot.</p><p style="margin:20px 0;"><a href="${paymentPageUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">${linkLabel}</a></p><p style="font-size:13px;color:#525252;">If the button does not work, copy this link:<br/><a href="${paymentPageUrl}">${paymentPageUrl}</a></p><p>After you send the transfer, upload a screenshot and click вЂњPaidвЂќ.</p><p>вЂ” ${SITE_NAME}</p></div>`;
  await resendSend("awaiting-payment", { from, to: params.to, subject, html });
}

/** Customer confirmation after uploading transaction screenshot */
export async function sendPaymentProofSubmittedEmail(params: {
  to: string;
  orderNumber: string;
  orderId: string;
  locale?: string;
  request?: Request;
}) {
  if (!resend) return;
  const from = getResendFrom();
  const siteUrl = getPublicSiteUrl(params.request);
  const ordersUrl = `${siteUrl}/dashboard/orders?pay=${encodeURIComponent(params.orderId)}`;
  const loc = params.locale ?? "en";
  const subject =
    loc === "ru"
      ? `РџР»Р°С‚С‘Р¶ РїРѕР»СѓС‡РµРЅ РЅР° РїСЂРѕРІРµСЂРєСѓ вЂ” Р·Р°РєР°Р· #${params.orderNumber} вЂ” ${SITE_NAME}`
      : loc === "uk"
        ? `РџР»Р°С‚С–Р¶ РЅР° РїРµСЂРµРІС–СЂС†С– вЂ” Р·Р°РјРѕРІР»РµРЅРЅСЏ #${params.orderNumber} вЂ” ${SITE_NAME}`
        : `Payment proof received вЂ” order #${params.orderNumber} вЂ” ${SITE_NAME}`;
  const html =
    loc === "ru"
      ? `<div style="font-family: sans-serif; max-width: 480px;"><p>РњС‹ РїРѕР»СѓС‡РёР»Рё СЃРєСЂРёРЅ С‚СЂР°РЅР·Р°РєС†РёРё РїРѕ Р·Р°РєР°Р·Сѓ <strong>#${params.orderNumber}</strong>. РџРѕСЃР»Рµ РїСЂРѕРІРµСЂРєРё СЃС‚Р°С‚СѓСЃ РѕР±РЅРѕРІРёС‚СЃСЏ вЂ” СЃР»РµРґРёС‚Рµ РІ Р»РёС‡РЅРѕРј РєР°Р±РёРЅРµС‚Рµ.</p><p><a href="${ordersUrl}">${ordersUrl}</a></p><p>вЂ” ${SITE_NAME}</p></div>`
      : loc === "uk"
        ? `<div style="font-family: sans-serif; max-width: 480px;"><p>РњРё РѕС‚СЂРёРјР°Р»Рё СЃРєСЂС–РЅ С‚СЂР°РЅР·Р°РєС†С–С— РґР»СЏ Р·Р°РјРѕРІР»РµРЅРЅСЏ <strong>#${params.orderNumber}</strong>. РџС–СЃР»СЏ РїРµСЂРµРІС–СЂРєРё СЃС‚Р°С‚СѓСЃ РѕРЅРѕРІРёС‚СЊСЃСЏ вЂ” СЃР»С–РґРєСѓР№С‚Рµ РІ РѕСЃРѕР±РёСЃС‚РѕРјСѓ РєР°Р±С–РЅРµС‚С–.</p><p><a href="${ordersUrl}">${ordersUrl}</a></p><p>вЂ” ${SITE_NAME}</p></div>`
        : `<div style="font-family: sans-serif; max-width: 480px;"><p>We received your transaction screenshot for order <strong>#${params.orderNumber}</strong>. We will verify it and update your order status вЂ” check your dashboard.</p><p><a href="${ordersUrl}">${ordersUrl}</a></p><p>вЂ” ${SITE_NAME}</p></div>`;
  await resendSend("payment-proof-submitted", { from, to: params.to, subject, html });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Internal/admin inbox вЂ” payment screenshot uploaded, verification needed.
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

  const subject = `[${SITE_NAME}] Р—Р°РєР°Р· в„–${params.orderNumber} вЂ” РїРѕСЃС‚СѓРїРёР»Рѕ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ РѕРїР»Р°С‚С‹`;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; line-height: 1.55; font-size: 15px;">
  <p style="margin: 0 0 18px;">Р”РѕР±СЂС‹Р№ РґРµРЅСЊ.</p>
  <p style="margin: 0 0 18px;">
    РџРѕ Р·Р°РєР°Р·Сѓ <strong>в„–${num}</strong> РєР»РёРµРЅС‚ РїСЂРёР»РѕР¶РёР» СЃРєСЂРёРЅС€РѕС‚ С‚СЂР°РЅР·Р°РєС†РёРё. РЎСѓРјРјР° Р·Р°РєР°Р·Р° РІ СЃРёСЃС‚РµРјРµ: <strong>$${totalStr}&nbsp;USD</strong>.
    РЎС‚Р°С‚СѓСЃ РїРµСЂРµРІРµРґС‘РЅ РІ СЂРµР¶РёРј РѕР¶РёРґР°РЅРёСЏ РїСЂРѕРІРµСЂРєРё РїР»Р°С‚РµР¶Р°.
  </p>
  <p style="margin: 0 0 18px;"><strong>РќРµРѕР±С…РѕРґРёРјРѕ:</strong> СЃРІРµСЂРёС‚СЊ РґР°РЅРЅС‹Рµ РїРµСЂРµРІРѕРґР° СЃРѕ СЃРєСЂРёРЅС€РѕС‚РѕРј РІ РєР°СЂС‚РѕС‡РєРµ Р·Р°РєР°Р·Р° Рё РїСЂРё СѓСЃРїРµС€РЅРѕР№ РїСЂРѕРІРµСЂРєРµ СѓСЃС‚Р°РЅРѕРІРёС‚СЊ СЃС‚Р°С‚СѓСЃ В«РћРїР»Р°С‡РµРЅВ».</p>
  <p style="margin: 0 0 18px;">
    РђРґРјРёРЅРёСЃС‚СЂР°С‚РёРІРЅР°СЏ РїР°РЅРµР»СЊ вЂ” Р·Р°РєР°Р·С‹:<br />
    <a href="${adminOrdersUrl}" style="color: #0f766e;">${adminOrdersUrl}</a>
  </p>
  <p style="margin: 0 0 24px; color: #525252; font-size: 13px;">Р’СЂРµРјСЏ Р·Р°РіСЂСѓР·РєРё СЃРєСЂРёРЅС€РѕС‚Р° (РљРёРµРІ): ${escapeHtml(whenStr)}</p>
  <p style="margin: 0; color: #737373; font-size: 12px; border-top: 1px solid #e5e5e5; padding-top: 16px;">
    Р­С‚Рѕ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРµ СЃР»СѓР¶РµР±РЅРѕРµ СѓРІРµРґРѕРјР»РµРЅРёРµ. РћС‚РІРµС‚ РЅР° СЌС‚Рѕ РїРёСЃСЊРјРѕ РЅРµ РѕР±СЂР°Р±Р°С‚С‹РІР°РµС‚СЃСЏ.
  </p>
</div>`;

  for (const to of recipients) {
    await resendSend("admin-payment-proof", { from, to, subject, html });
  }
}

export async function sendOrderStatusUpdate(params: {
  to: string;
  orderNumber: string;
  status: string;
  trackingNumber?: string | null;
  imei?: string | null;
  /** Used for dashboard deep-link (?pay=) */
  orderId?: string;
  locale?: string;
  request?: Request;
}) {
  if (!resend) return;
  const from = getResendFrom();
  const siteUrl = getPublicSiteUrl(params.request).replace(/\/$/, "");
  const ordersLink = params.orderId
    ? `${siteUrl}/dashboard/orders?pay=${encodeURIComponent(params.orderId)}`
    : `${siteUrl}/dashboard/orders`;
  const loc = params.locale === "uk" ? "uk" : params.locale === "ru" ? "ru" : "en";

  const trackingHtml =
    params.trackingNumber != null && params.trackingNumber !== ""
      ? `<p>${loc === "ru" ? "РўСЂРµРє-РЅРѕРјРµСЂ" : loc === "uk" ? "РўСЂРµРє-РЅРѕРјРµСЂ" : "Tracking"}: ${params.trackingNumber}</p>
         <p><a href="https://novaposhta.ua/tracking/?cargo_number=${encodeURIComponent(params.trackingNumber)}">${loc === "ru" ? "РћС‚СЃР»РµРґРёС‚СЊ РЅР° РќРѕРІРѕР№ РџРѕС‡С‚Рµ" : loc === "uk" ? "Р’С–РґСЃС‚РµР¶РёС‚Рё РЅР° РќРѕРІС–Р№ РџРѕС€С‚С–" : "Track on Nova Poshta"}</a></p>`
      : "";

  const imeiHtml =
    params.imei != null && params.imei !== ""
      ? `<p>${loc === "ru" ? "IMEI" : loc === "uk" ? "IMEI" : "IMEI"}: ${params.imei}</p>`
      : "";

  /** Payment flow вЂ” avoid misleading В«verificationВ» wording in customer inbox */
  if (params.status === "AWAITING_PAYMENT" || params.status === "PAYMENT_VERIFICATION_PENDING") {
    let subject: string;
    let html: string;
    if (loc === "ru") {
      subject = `Р—Р°РєР°Р· в„–${params.orderNumber} вЂ” РґР»СЏ РѕРїР»Р°С‚С‹ Р·Р°РєР°Р·Р°, РїРµСЂРµР№РґРёС‚Рµ РїРѕ СЃСЃС‹Р»РєРµ вЂ” ${SITE_NAME}`;
      html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="font-size:18px;margin-bottom:12px;">РћР±РЅРѕРІР»РµРЅРёРµ СЃС‚Р°С‚СѓСЃР° Р·Р°РєР°Р·Р°</h2>
          <p>Р”Р»СЏ РѕРїР»Р°С‚С‹ Р·Р°РєР°Р·Р°, РїРµСЂРµР№РґРёС‚Рµ РїРѕ СЃСЃС‹Р»РєРµ:</p>
          <p style="margin:16px 0;"><a href="${ordersLink}" style="display:inline-block;background:#059669;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600;">РћС‚РєСЂС‹С‚СЊ СЃС‚СЂР°РЅРёС†Сѓ Р·Р°РєР°Р·Р°</a></p>
          <p style="font-size:13px;color:#525252;">РР»Рё СЃРєРѕРїРёСЂСѓР№С‚Рµ Р°РґСЂРµСЃ:<br/><a href="${ordersLink}">${ordersLink}</a></p>
          ${trackingHtml}${imeiHtml}
          <p style="margin-top:16px;">вЂ” ${SITE_NAME}</p>
        </div>`;
    } else if (loc === "uk") {
      subject = `Р—Р°РјРѕРІР»РµРЅРЅСЏ в„–${params.orderNumber} вЂ” РґР»СЏ РѕРїР»Р°С‚Рё Р·Р°РјРѕРІР»РµРЅРЅСЏ РїРµСЂРµР№РґС–С‚СЊ Р·Р° РїРѕСЃРёР»Р°РЅРЅСЏРј вЂ” ${SITE_NAME}`;
      html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="font-size:18px;margin-bottom:12px;">РћРЅРѕРІР»РµРЅРЅСЏ СЃС‚Р°С‚СѓСЃСѓ Р·Р°РјРѕРІР»РµРЅРЅСЏ</h2>
          <p>Р”Р»СЏ РѕРїР»Р°С‚Рё Р·Р°РјРѕРІР»РµРЅРЅСЏ РїРµСЂРµР№РґС–С‚СЊ Р·Р° РїРѕСЃРёР»Р°РЅРЅСЏРј:</p>
          <p style="margin:16px 0;"><a href="${ordersLink}" style="display:inline-block;background:#059669;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Р’С–РґРєСЂРёС‚Рё СЃС‚РѕСЂС–РЅРєСѓ Р·Р°РјРѕРІР»РµРЅРЅСЏ</a></p>
          <p style="font-size:13px;color:#525252;">РђР±Рѕ СЃРєРѕРїС–СЋР№С‚Рµ Р°РґСЂРµСЃСѓ:<br/><a href="${ordersLink}">${ordersLink}</a></p>
          ${trackingHtml}${imeiHtml}
          <p style="margin-top:16px;">вЂ” ${SITE_NAME}</p>
        </div>`;
    } else {
      subject = `Order #${params.orderNumber} вЂ” complete payment via link вЂ” ${SITE_NAME}`;
      html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="font-size:18px;margin-bottom:12px;">Order status update</h2>
          <p>To pay for your order, follow the link:</p>
          <p style="margin:16px 0;"><a href="${ordersLink}" style="display:inline-block;background:#059669;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Open order page</a></p>
          <p style="font-size:13px;color:#525252;">Or copy this URL:<br/><a href="${ordersLink}">${ordersLink}</a></p>
          ${trackingHtml}${imeiHtml}
          <p style="margin-top:16px;">вЂ” ${SITE_NAME}</p>
        </div>`;
    }
    await resendSend("order-status", { from, to: params.to, subject, html });
    return;
  }

  const labelRu: Record<string, string> = {
    NEW: "РќРѕРІС‹Р№",
    AWAITING_PAYMENT: "РћР¶РёРґР°РµС‚ РѕРїР»Р°С‚С‹",
    PAYMENT_VERIFICATION_PENDING: "РћР¶РёРґР°РµС‚ РїСЂРѕРІРµСЂРєРё РѕРїР»Р°С‚С‹",
    PAID: "РћРїР»Р°С‡РµРЅ",
    PROCESSING: "Р’ РѕР±СЂР°Р±РѕС‚РєРµ",
    SHIPPED: "РћС‚РїСЂР°РІР»РµРЅ",
    DELIVERED: "Р”РѕСЃС‚Р°РІР»РµРЅ",
    CANCELLED: "РћС‚РјРµРЅС‘РЅ",
    REFUNDED: "Р’РѕР·РІСЂР°С‚",
  };
  const labelUk: Record<string, string> = {
    NEW: "РќРѕРІРёР№",
    AWAITING_PAYMENT: "РћС‡С–РєСѓС” РѕРїР»Р°С‚Рё",
    PAYMENT_VERIFICATION_PENDING: "РћС‡С–РєСѓС” РїРµСЂРµРІС–СЂРєРё РѕРїР»Р°С‚Рё",
    PAID: "РћРїР»Р°С‡РµРЅРѕ",
    PROCESSING: "Р’ РѕР±СЂРѕР±С†С–",
    SHIPPED: "Р’С–РґРїСЂР°РІР»РµРЅРѕ",
    DELIVERED: "Р”РѕСЃС‚Р°РІР»РµРЅРѕ",
    CANCELLED: "РЎРєР°СЃРѕРІР°РЅРѕ",
    REFUNDED: "РџРѕРІРµСЂРЅРµРЅРЅСЏ",
  };
  const labelEn: Record<string, string> = {
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

  const labels = loc === "ru" ? labelRu : loc === "uk" ? labelUk : labelEn;
  const statusLabel = labels[params.status] ?? params.status;

  let subject: string;
  let heading: string;
  let line: string;
  let linkLabel: string;

  if (loc === "ru") {
    subject = `Р—Р°РєР°Р· в„–${params.orderNumber} вЂ” ${statusLabel} вЂ” ${SITE_NAME}`;
    heading = "РћР±РЅРѕРІР»РµРЅРёРµ СЃС‚Р°С‚СѓСЃР° Р·Р°РєР°Р·Р°";
    line = `Р’Р°С€ Р·Р°РєР°Р· <strong>#${params.orderNumber}</strong>. РЎС‚Р°С‚СѓСЃ: <strong>${statusLabel}</strong>`;
    linkLabel = "РћС‚РєСЂС‹С‚СЊ Р·Р°РєР°Р·С‹ РІ Р»РёС‡РЅРѕРј РєР°Р±РёРЅРµС‚Рµ";
  } else if (loc === "uk") {
    subject = `Р—Р°РјРѕРІР»РµРЅРЅСЏ в„–${params.orderNumber} вЂ” ${statusLabel} вЂ” ${SITE_NAME}`;
    heading = "РћРЅРѕРІР»РµРЅРЅСЏ СЃС‚Р°С‚СѓСЃСѓ Р·Р°РјРѕРІР»РµРЅРЅСЏ";
    line = `Р’Р°С€Рµ Р·Р°РјРѕРІР»РµРЅРЅСЏ <strong>#${params.orderNumber}</strong>. РЎС‚Р°С‚СѓСЃ: <strong>${statusLabel}</strong>`;
    linkLabel = "Р’С–РґРєСЂРёС‚Рё Р·Р°РјРѕРІР»РµРЅРЅСЏ РІ РєР°Р±С–РЅРµС‚С–";
  } else {
    subject = `Order #${params.orderNumber} вЂ” ${statusLabel} вЂ” ${SITE_NAME}`;
    heading = "Order status update";
    line = `Your order <strong>#${params.orderNumber}</strong> status: <strong>${statusLabel}</strong>`;
    linkLabel = "View orders";
  }

  const body =
    `<p>${line}</p>${trackingHtml}${imeiHtml}<p><a href="${ordersLink}">${linkLabel}</a></p><p>вЂ” ${SITE_NAME}</p>`;

  await resendSend("order-status", {
    from,
    to: params.to,
    subject,
    html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>${heading}</h2>
          ${body}
        </div>
      `,
  });
}

function getAdminNotificationRecipients(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (!raw || !resend) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
