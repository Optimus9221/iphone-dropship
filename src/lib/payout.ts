import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { processAvailableCashback } from "./cashback";

const DEFAULT_MIN_WITHDRAWAL = 10;
const DEFAULT_FREE_IPHONE_CASH_USD = 999;

export async function getMinWithdrawalAmount(): Promise<number> {
  const row = await prisma.systemSetting.findUnique({ where: { key: "min_withdrawal" } });
  const n = row ? Number(row.value) : DEFAULT_MIN_WITHDRAWAL;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MIN_WITHDRAWAL;
}

export async function getFreeIphoneCashPayoutAmount(): Promise<number> {
  const row = await prisma.systemSetting.findUnique({ where: { key: "free_iphone_cash_payout_usd" } });
  const n = row ? Number(row.value) : DEFAULT_FREE_IPHONE_CASH_USD;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_FREE_IPHONE_CASH_USD;
}

export async function getAvailableCashbackBalance(userId: string): Promise<number> {
  await processAvailableCashback();
  const agg = await prisma.cashbackEntry.aggregate({
    where: {
      userId,
      status: "AVAILABLE",
      payoutRequestId: null,
    },
    _sum: { amount: true },
  });
  return agg._sum.amount ? Number(agg._sum.amount) : 0;
}

export async function userHasActiveCashbackPayout(userId: string): Promise<boolean> {
  const count = await prisma.payoutRequest.count({
    where: {
      userId,
      status: { in: ["PENDING", "PROCESSING"] },
    },
  });
  return count > 0;
}

export async function createCashbackPayoutRequest(params: {
  userId: string;
  walletAddress: string;
  walletNetwork: string;
}) {
  await processAvailableCashback();

  if (await userHasActiveCashbackPayout(params.userId)) {
    throw new Error("active_payout_exists");
  }

  const min = await getMinWithdrawalAmount();
  const entries = await prisma.cashbackEntry.findMany({
    where: {
      userId: params.userId,
      status: "AVAILABLE",
      payoutRequestId: null,
    },
    orderBy: { availableAt: "asc" },
  });

  const total = entries.reduce((s, e) => s + Number(e.amount), 0);
  const rounded = Math.round(total * 100) / 100;

  if (rounded < min) {
    throw new Error("below_minimum");
  }

  return prisma.$transaction(async (tx) => {
    const payout = await tx.payoutRequest.create({
      data: {
        userId: params.userId,
        amount: rounded,
        walletAddress: params.walletAddress.trim(),
        walletNetwork: params.walletNetwork.trim(),
        status: "PENDING",
      },
    });

    await tx.cashbackEntry.updateMany({
      where: { id: { in: entries.map((e) => e.id) } },
      data: { payoutRequestId: payout.id },
    });

    return payout;
  });
}

export async function updateCashbackPayoutStatus(params: {
  payoutId: string;
  status: "PROCESSING" | "COMPLETED" | "REJECTED";
  rejectReason?: string;
}) {
  const payout = await prisma.payoutRequest.findUnique({
    where: { id: params.payoutId },
    include: { cashbackEntries: true },
  });
  if (!payout) throw new Error("not_found");

  if (params.status === "PROCESSING") {
    return prisma.payoutRequest.update({
      where: { id: params.payoutId },
      data: { status: "PROCESSING" },
    });
  }

  if (params.status === "COMPLETED") {
    if (payout.status === "COMPLETED") return payout;
    return prisma.$transaction(async (tx) => {
      await tx.cashbackEntry.updateMany({
        where: { payoutRequestId: params.payoutId },
        data: { status: "PAID_OUT" },
      });
      return tx.payoutRequest.update({
        where: { id: params.payoutId },
        data: { status: "COMPLETED", processedAt: new Date(), rejectReason: null },
      });
    });
  }

  if (params.status === "REJECTED") {
    return prisma.$transaction(async (tx) => {
      await tx.cashbackEntry.updateMany({
        where: { payoutRequestId: params.payoutId },
        data: { payoutRequestId: null },
      });
      return tx.payoutRequest.update({
        where: { id: params.payoutId },
        data: {
          status: "REJECTED",
          processedAt: new Date(),
          rejectReason: params.rejectReason?.trim() || null,
        },
      });
    });
  }

  throw new Error("invalid_status");
}

export async function hasActiveFreeIphoneCashChoice(userId: string): Promise<boolean> {
  const election = await prisma.freeIphoneRewardElection.findUnique({ where: { userId } });
  if (!election?.cashWalletSavedAt) return false;
  if (!election.cashPayoutStatus) return true;
  return election.cashPayoutStatus === "PENDING" || election.cashPayoutStatus === "PROCESSING";
}

export async function hasCompletedFreeIphoneCashPayout(userId: string): Promise<boolean> {
  const election = await prisma.freeIphoneRewardElection.findUnique({ where: { userId } });
  return election?.cashPayoutStatus === "COMPLETED";
}

export async function updateFreeIphoneCashPayoutStatus(params: {
  userId: string;
  status: "PROCESSING" | "COMPLETED" | "REJECTED";
  rejectReason?: string;
  amount?: number;
}) {
  const election = await prisma.freeIphoneRewardElection.findUnique({
    where: { userId: params.userId },
  });
  if (!election?.cashWalletSavedAt) throw new Error("no_cash_request");

  if (params.status === "PROCESSING") {
    return prisma.freeIphoneRewardElection.update({
      where: { userId: params.userId },
      data: { cashPayoutStatus: "PROCESSING" },
    });
  }

  if (params.status === "COMPLETED") {
    const amount = params.amount ?? (await getFreeIphoneCashPayoutAmount());
    return prisma.freeIphoneRewardElection.update({
      where: { userId: params.userId },
      data: {
        cashPayoutStatus: "COMPLETED",
        cashPayoutProcessedAt: new Date(),
        cashPayoutRejectReason: null,
        cashPayoutAmount: new Prisma.Decimal(amount),
      },
    });
  }

  if (params.status === "REJECTED") {
    return prisma.freeIphoneRewardElection.update({
      where: { userId: params.userId },
      data: {
        cashPayoutStatus: "REJECTED",
        cashPayoutProcessedAt: new Date(),
        cashPayoutRejectReason: params.rejectReason?.trim() || null,
      },
    });
  }

  throw new Error("invalid_status");
}
