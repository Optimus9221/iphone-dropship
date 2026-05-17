/**
 * Order creation and cashback accrual
 */

import { prisma } from "./db";
import { getCashbackRates, calculateCashback, createCashbackEntry } from "./cashback";
import { processAvailableCashback } from "./cashback";
import { redeemCashbackForOrder, userHasActiveCashbackPayout } from "./payout";

export function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createOrder(params: {
  userId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  shippingEmail: string;
  comment?: string;
  payWithCashback?: boolean;
}) {
  const orderNumber = generateOrderNumber();
  const subtotal = params.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = 0; // MVP: free shipping
  const total = subtotal + shippingCost;

  // Validate products exist (allow pre-order when stock 0)
  for (const item of params.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");
  }

  if (params.payWithCashback) {
    await processAvailableCashback();
    if (await userHasActiveCashbackPayout(params.userId)) {
      throw new Error("active_payout_exists");
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const ord = await tx.order.create({
      data: {
        orderNumber,
        userId: params.userId,
        status: params.payWithCashback ? "PAID" : "NEW",
        shippingName: params.shippingName,
        shippingAddress: params.shippingAddress,
        shippingPhone: params.shippingPhone,
        shippingEmail: params.shippingEmail,
        comment: params.comment ?? null,
        subtotal,
        shippingCost,
        total,
        paidWithCashback: Boolean(params.payWithCashback),
        cashbackRedeemedAmount: params.payWithCashback ? total : null,
      },
    });

    for (const item of params.items) {
      await tx.orderItem.create({
        data: {
          orderId: ord.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        },
      });
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true },
      });
      const newStock = product ? Math.max(0, product.stock - item.quantity) : 0;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: newStock },
      });
    }

    if (params.payWithCashback) {
      await redeemCashbackForOrder(
        {
          userId: params.userId,
          orderId: ord.id,
          amount: total,
        },
        tx
      );
    }

    return ord;
  });

  return order;
}

/**
 * Accrue cashback when order is delivered.
 * Called when admin sets status to DELIVERED.
 */
export async function accrueCashbackOnDelivery(orderId: string, deliveredAt: Date) {
  const existing = await prisma.cashbackEntry.count({
    where: { orderId, type: "OWN_PURCHASE" },
  });
  if (existing > 0) return; // Already accrued

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      user: { select: { referredById: true } },
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.paidWithCashback) return;

  const buyerId = order.userId;
  const referrerId = order.user.referredById;

  for (const item of order.items) {
    const { ownPercent, referralPercent } = await getCashbackRates(item.productId);
    const itemTotal = Number(item.price) * item.quantity;
    const ownAmount = calculateCashback(itemTotal, ownPercent);
    const referralAmount = calculateCashback(itemTotal, referralPercent);

    if (ownAmount > 0) {
      await createCashbackEntry({
        userId: buyerId,
        amount: ownAmount,
        type: "OWN_PURCHASE",
        orderId,
        deliveredAt,
      });
    }

    if (referrerId && referralAmount > 0) {
      await createCashbackEntry({
        userId: referrerId,
        amount: referralAmount,
        type: "REFERRAL_PURCHASE",
        orderId,
        referralId: buyerId,
        deliveredAt,
      });
    }
  }
}
