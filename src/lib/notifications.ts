import { prisma } from "./db";
import { normalizeEmailLocale } from "./user-locale";

export const NOTIFICATION_TYPE_REVIEW_REQUEST = "REVIEW_REQUEST";

function reviewRequestCopy(locale: string, orderNumber: string) {
  if (locale === "ru") {
    return {
      title: "Оставьте отзыв о покупке",
      body: `Заказ #${orderNumber} доставлен. Поделитесь впечатлением — это поможет другим покупателям.`,
    };
  }
  if (locale === "uk") {
    return {
      title: "Залиште відгук про покупку",
      body: `Замовлення #${orderNumber} доставлено. Поділіться враженням — це допоможе іншим покупцям.`,
    };
  }
  if (locale === "he") {
    return {
      title: "השאירו ביקורת על הרכישה",
      body: `הזמנה #${orderNumber} נמסרה. שתפו חוויה — זה יעזור ללקוחות אחרים.`,
    };
  }
  return {
    title: "Leave a review of your purchase",
    body: `Order #${orderNumber} was delivered. Share your experience — it helps other buyers.`,
  };
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
      type: NOTIFICATION_TYPE_REVIEW_REQUEST,
    },
    select: { id: true },
  });
  if (existing) return existing;

  const locale = normalizeEmailLocale(params.locale);
  const copy = reviewRequestCopy(locale, params.orderNumber);

  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: NOTIFICATION_TYPE_REVIEW_REQUEST,
      title: copy.title,
      body: copy.body,
      href: "/dashboard#write-review",
      orderId: params.orderId,
    },
  });
}
