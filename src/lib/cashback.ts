/**
 * Cashback calculation logic
 * Anti-fraud: short hold before cashback becomes available to spend or withdraw
 */

import { prisma } from "./db";

const DEFAULT_CASHBACK_HOLD_DAYS = 1;
const DEFAULT_OWN_PERCENT = 5;
const DEFAULT_REFERRAL_PERCENT = 5;
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

export async function getCashbackHoldDays(): Promise<number> {
  const row = await prisma.systemSetting.findUnique({ where: { key: "cashback_hold_days" } });
  const n = row ? Number(row.value) : DEFAULT_CASHBACK_HOLD_DAYS;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_CASHBACK_HOLD_DAYS;
}

/**
 * Create cashback entry — available after hold period from delivery (default: next day).
 */
export async function createCashbackEntry(params: {
  userId: string;
  amount: number;
  type: "OWN_PURCHASE" | "REFERRAL_PURCHASE" | "BONUS_10_REFERRALS" | "BONUS_15_REFERRALS" | "BONUS_20_REFERRALS";
  orderId?: string;
  referralId?: string;
  deliveredAt: Date;
}) {
  const holdDays = await getCashbackHoldDays();
  const availableAt = new Date(params.deliveredAt);
  availableAt.setDate(availableAt.getDate() + holdDays);

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

async function syncPendingCashbackAvailabilityDates(holdDays: number) {
  const pending = await prisma.cashbackEntry.findMany({
    where: { status: "PENDING" },
    select: {
      id: true,
      availableAt: true,
      createdAt: true,
      order: { select: { deliveredAt: true } },
    },
  });

  for (const entry of pending) {
    const base = entry.order?.deliveredAt ?? entry.createdAt;
    const expected = new Date(base);
    expected.setDate(expected.getDate() + holdDays);
    if (entry.availableAt.getTime() !== expected.getTime()) {
      await prisma.cashbackEntry.update({
        where: { id: entry.id },
        data: { availableAt: expected },
      });
    }
  }
}

export async function processAvailableCashback() {
  const holdDays = await getCashbackHoldDays();
  await syncPendingCashbackAvailabilityDates(holdDays);

  const now = new Date();
  await prisma.cashbackEntry.updateMany({
    where: { status: "PENDING", availableAt: { lte: now } },
    data: { status: "AVAILABLE" },
  });
}

export function getMinWithdrawal() {
  return MIN_WITHDRAWAL;
}
