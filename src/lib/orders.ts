/**
 * Order creation and cashback accrual
 */

import { prisma } from "./db";
import { getCashbackRates, calculateCashback, createCashbackEntry } from "./cashback";

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
}) {
  const orderNumber = generateOrderNumber();
  const subtotal = params.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = 0; // MVP: free shipping
  const total = subtotal + shippingCost;

  // Check stock and decrease
  for (const item of params.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
  }

  const order = await prisma.$transaction(async (tx) => {
    const ord = await tx.order.create({
      data: {
        orderNumber,
        userId: params.userId,
        status: "NEW",
        shippingName: params.shippingName,
        shippingAddress: params.shippingAddress,
        shippingPhone: params.shippingPhone,
        shippingEmail: params.shippingEmail,
        comment: params.comment ?? null,
        subtotal,
        shippingCost,
        total,
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
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return ord;
  });

  return order;
}

/**
 * Create a free iPhone bonus order (admin only).
 * User must have qualified (20 referrals with purchases in last year).
 */
export async function createFreeiPhoneOrder(params: {
  userId: string;
  productId: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { email: true, name: true, phone: true },
  });
  if (!user) throw new Error("User not found");

  const product = await prisma.product.findUnique({
    where: { id: params.productId },
  });
  if (!product) throw new Error("Product not found");
  if (product.stock < 1) throw new Error("Insufficient stock");

  const orderNumber = generateOrderNumber();
  const shippingName = user.name ?? user.email;
  const shippingAddress = "Address to be provided by customer";
  const shippingPhone = user.phone ?? "-";
  const shippingEmail = user.email;
  const comment = "Free iPhone — 20 referrals bonus";

  return prisma.$transaction(async (tx) => {
    const ord = await tx.order.create({
      data: {
        orderNumber,
        userId: params.userId,
        status: "NEW",
        shippingName,
        shippingAddress,
        shippingPhone,
        shippingEmail,
        comment,
        subtotal: 0,
        shippingCost: 0,
        total: 0,
        isFreeiPhoneBonus: true,
      },
    });
    await tx.orderItem.create({
      data: {
        orderId: ord.id,
        productId: params.productId,
        quantity: 1,
        price: 0,
      },
    });
    await tx.product.update({
      where: { id: params.productId },
      data: { stock: { decrement: 1 } },
    });
    return ord;
  });
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
