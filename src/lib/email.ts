/**
 * Email notifications using Resend
 * Set RESEND_API_KEY in .env
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "iPhone Store";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
