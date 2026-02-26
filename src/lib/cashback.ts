/**
 * Cashback calculation logic
 * Anti-fraud: начисление только после 14 дней (период возврата)
 */

import { prisma } from "./db";

const CASHBACK_HOLD_DAYS = 14;
const DEFAULT_OWN_PERCENT = 5;
const DEFAULT_REFERRAL_PERCENT = 3;
const MIN_WITHDRAWAL = 10;

export async function getCashbackRates(productId: string) {
  const rate = await prisma.productCashbackRate.findFirst({
    where: {
      productId,
      validFrom: { lte: new Date() },
      OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
    },
    orderBy: { validFrom: "desc" },
  });

  return {
    ownPercent: rate ? Number(rate.ownPurchasePercent) : DEFAULT_OWN_PERCENT,
    referralPercent: rate ? Number(rate.referralPercent) : DEFAULT_REFERRAL_PERCENT,
  };
}

export function calculateCashback(amount: number, percent: number): number {
  return Math.round((amount * percent) / 100 * 100) / 100;
}

/**
 * Create cashback entry - available after 14 days from delivery
 */
export async function createCashbackEntry(params: {
  userId: string;
  amount: number;
  type: "OWN_PURCHASE" | "REFERRAL_PURCHASE" | "BONUS_10_REFERRALS" | "BONUS_15_REFERRALS" | "BONUS_20_REFERRALS";
  orderId?: string;
  referralId?: string;
  deliveredAt: Date;
}) {
  const availableAt = new Date(params.deliveredAt);
  availableAt.setDate(availableAt.getDate() + CASHBACK_HOLD_DAYS);

  return prisma.cashbackEntry.create({
    data: {
      userId: params.userId,
      amount: params.amount,
      type: params.type,
      status: "PENDING",
      orderId: params.orderId,
      referralId: params.referralId,
      availableAt,
    },
  });
}

export async function processAvailableCashback() {
  const now = new Date();
  await prisma.cashbackEntry.updateMany({
    where: { status: "PENDING", availableAt: { lte: now } },
    data: { status: "AVAILABLE" },
  });
}

export function getMinWithdrawal() {
  return MIN_WITHDRAWAL;
}
