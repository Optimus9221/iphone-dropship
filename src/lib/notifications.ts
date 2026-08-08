import { prisma } from "./db";
import { normalizeEmailLocale } from "./user-locale";
import type { Locale } from "./i18n/translations";

export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PAYMENT_PROOF_SUBMITTED: "PAYMENT_PROOF_SUBMITTED",
  ORDER_STATUS: "ORDER_STATUS",
  REVIEW_REQUEST: "REVIEW_REQUEST",
  ADMIN_NEW_ORDER: "ADMIN_NEW_ORDER",
  ADMIN_PAYMENT_PROOF: "ADMIN_PAYMENT_PROOF",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

type CreateParams = {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  orderId?: string | null;
};

export async function createNotification(params: CreateParams) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      href: params.href ?? null,
      orderId: params.orderId ?? null,
    },
  });
}

async function getAdminUsers() {
  return prisma.user.findMany({
    where: { role: "ADMIN", isBlocked: false },
    select: { id: true, email: true, locale: true },
  });
}

/** In-app notification for every admin account. */
export async function notifyAdmins(params: {
  type: string;
  title: string;
  body: string;
  href?: string | null;
  orderId?: string | null;
}) {
  const admins = await getAdminUsers();
  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: params.type,
      title: params.title,
      body: params.body,
      href: params.href ?? null,
      orderId: params.orderId ?? null,
    })),
  });
}

function statusLabel(status: string, locale: Locale): string {
  const ru: Record<string, string> = {
    NEW: "Новый",
    AWAITING_PAYMENT: "Ожидает оплаты",
    PAYMENT_VERIFICATION_PENDING: "Ожидает проверки оплаты",
    PAID: "Оплачен",
    PROCESSING: "В обработке",
    SHIPPED: "Отправлен",
    DELIVERED: "Доставлен",
    CANCELLED: "Отменён",
    REFUNDED: "Возврат",
  };
  const uk: Record<string, string> = {
    NEW: "Новий",
    AWAITING_PAYMENT: "Очікує оплати",
    PAYMENT_VERIFICATION_PENDING: "Очікує перевірки оплати",
    PAID: "Оплачено",
    PROCESSING: "В обробці",
    SHIPPED: "Відправлено",
    DELIVERED: "Доставлено",
    CANCELLED: "Скасовано",
    REFUNDED: "Повернення",
  };
  const en: Record<string, string> = {
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
  if (locale === "ru") return ru[status] ?? status;
  if (locale === "uk") return uk[status] ?? status;
  return en[status] ?? status;
}

export async function notifyUserOrderConfirmed(params: {
  userId: string;
  orderId: string;
  orderNumber: string;
  total: number;
  locale?: string | null;
}) {
  const locale = normalizeEmailLocale(params.locale);
  const title =
    locale === "ru"
      ? "Заказ подтверждён"
      : locale === "uk"
        ? "Замовлення підтверджено"
        : "Order confirmed";
  const body =
    locale === "ru"
      ? `Заказ #${params.orderNumber} на $${params.total.toFixed(2)} принят.`
      : locale === "uk"
        ? `Замовлення #${params.orderNumber} на $${params.total.toFixed(2)} прийнято.`
        : `Order #${params.orderNumber} for $${params.total.toFixed(2)} was placed.`;

  await createNotification({
    userId: params.userId,
    type: NOTIFICATION_TYPES.ORDER_CONFIRMED,
    title,
    body,
    href: `/dashboard/orders?pay=${encodeURIComponent(params.orderId)}`,
    orderId: params.orderId,
  });
}

export async function notifyAdminsNewOrder(params: {
  orderId: string;
  orderNumber: string;
  total: number;
  customerName?: string | null;
}) {
  const who = params.customerName?.trim() || "—";
  await notifyAdmins({
    type: NOTIFICATION_TYPES.ADMIN_NEW_ORDER,
    title: `Новый заказ #${params.orderNumber}`,
    body: `${who} · $${params.total.toFixed(2)}. Откройте админку для обработки.`,
    href: "/admin/orders",
    orderId: params.orderId,
  });
}

export async function notifyUserAwaitingPayment(params: {
  userId: string;
  orderId: string;
  orderNumber: string;
  locale?: string | null;
}) {
  const locale = normalizeEmailLocale(params.locale);
  const title =
    locale === "ru" ? "Оплатите заказ" : locale === "uk" ? "Оплатіть замовлення" : "Complete payment";
  const body =
    locale === "ru"
      ? `Заказ #${params.orderNumber} ожидает оплаты криптовалютой.`
      : locale === "uk"
        ? `Замовлення #${params.orderNumber} очікує оплати криптовалютою.`
        : `Order #${params.orderNumber} is awaiting crypto payment.`;

  await createNotification({
    userId: params.userId,
    type: NOTIFICATION_TYPES.AWAITING_PAYMENT,
    title,
    body,
    href: `/dashboard/orders?pay=${encodeURIComponent(params.orderId)}`,
    orderId: params.orderId,
  });
}

export async function notifyUserPaymentProofSubmitted(params: {
  userId: string;
  orderId: string;
  orderNumber: string;
  locale?: string | null;
}) {
  const locale = normalizeEmailLocale(params.locale);
  const title =
    locale === "ru"
      ? "Платёж на проверке"
      : locale === "uk"
        ? "Платіж на перевірці"
        : "Payment proof received";
  const body =
    locale === "ru"
      ? `Скрин по заказу #${params.orderNumber} получен. Ждите проверки.`
      : locale === "uk"
        ? `Скрін по замовленню #${params.orderNumber} отримано. Чекайте перевірки.`
        : `We received your screenshot for order #${params.orderNumber}.`;

  await createNotification({
    userId: params.userId,
    type: NOTIFICATION_TYPES.PAYMENT_PROOF_SUBMITTED,
    title,
    body,
    href: `/dashboard/orders?pay=${encodeURIComponent(params.orderId)}`,
    orderId: params.orderId,
  });
}

export async function notifyAdminsPaymentProof(params: {
  orderId: string;
  orderNumber: string;
  totalUsd: number;
}) {
  await notifyAdmins({
    type: NOTIFICATION_TYPES.ADMIN_PAYMENT_PROOF,
    title: `Скрин оплаты — заказ #${params.orderNumber}`,
    body: `Сумма $${params.totalUsd.toFixed(2)}. Проверьте платёж в админке.`,
    href: "/admin/orders",
    orderId: params.orderId,
  });
}

export async function notifyUserOrderStatus(params: {
  userId: string;
  orderId: string;
  orderNumber: string;
  status: string;
  locale?: string | null;
}) {
  const locale = normalizeEmailLocale(params.locale);
  const label = statusLabel(params.status, locale);
  const title =
    locale === "ru"
      ? "Статус заказа обновлён"
      : locale === "uk"
        ? "Статус замовлення оновлено"
        : "Order status updated";
  const body =
    locale === "ru"
      ? `Заказ #${params.orderNumber}: ${label}`
      : locale === "uk"
        ? `Замовлення #${params.orderNumber}: ${label}`
        : `Order #${params.orderNumber}: ${label}`;

  await createNotification({
    userId: params.userId,
    type: NOTIFICATION_TYPES.ORDER_STATUS,
    title,
    body,
    href: `/dashboard/orders?pay=${encodeURIComponent(params.orderId)}`,
    orderId: params.orderId,
  });
}

/** Creates an in-app review request once per order (idempotent). */
export async function createReviewRequestNotification(params: {
  userId: string;
  orderId: string;
  orderNumber: string;
  locale?: string | null;
}) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId: params.userId,
      orderId: params.orderId,
      type: NOTIFICATION_TYPES.REVIEW_REQUEST,
    },
    select: { id: true },
  });
  if (existing) return existing;

  const locale = normalizeEmailLocale(params.locale);
  const title =
    locale === "ru"
      ? "Оставьте отзыв о покупке"
      : locale === "uk"
        ? "Залиште відгук про покупку"
        : locale === "he"
          ? "השאירו ביקורת על הרכישה"
          : "Leave a review of your purchase";
  const body =
    locale === "ru"
      ? `Заказ #${params.orderNumber} доставлен. Поделитесь впечатлением — это поможет другим покупателям.`
      : locale === "uk"
        ? `Замовлення #${params.orderNumber} доставлено. Поділіться враженням — це допоможе іншим покупцям.`
        : locale === "he"
          ? `הזמנה #${params.orderNumber} נמסרה. שתפו חוויה — זה יעזור ללקוחות אחרים.`
          : `Order #${params.orderNumber} was delivered. Share your experience — it helps other buyers.`;

  return createNotification({
    userId: params.userId,
    type: NOTIFICATION_TYPES.REVIEW_REQUEST,
    title,
    body,
    href: "/dashboard#write-review",
    orderId: params.orderId,
  });
}
