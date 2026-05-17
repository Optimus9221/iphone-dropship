/**
 * Referral system logic
 * 1 person = 1 account (phone verification)
 * Lifetime referral - кешбек с каждой покупки реферала
 */

import { prisma } from "./db";

const REFERRAL_COOKIE_DAYS = 30;

export function getReferralUrl(code: string, baseUrl: string) {
  return `${baseUrl}/ref/${code}`;
}

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (!user) throw new Error("User not found");
  return user.referralCode;
}

export async function trackReferralClick(params: {
  referralCode: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  utmSource?: string;
}) {
  return prisma.referralClick.create({
    data: {
      referralCode: params.referralCode,
      userId: params.userId,
      ipAddress: params.ip,
      userAgent: params.userAgent,
      utmSource: params.utmSource,
    },
  });
}

export async function resolveReferral(referralCode: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { referralCode: referralCode },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function getReferralStats(userId: string) {
  const [total, active, users] = await Promise.all([
    prisma.user.count({ where: { referredById: userId } }),
    prisma.user.count({
      where: {
        referredById: userId,
        orders: {
          some: {
            status: "DELIVERED",
            deliveredAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { referredById: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        orders: {
          where: { status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "PAID"] } },
          select: {
            total: true,
            status: true,
            deliveredAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const referrals = users.map((u) => ({
    ...u,
    purchaseCount: u.orders.length,
    totalSpent: u.orders.reduce((s, o) => s + Number(o.total), 0),
    isActive:
      u.orders.some(
        (o) =>
          o.status === "DELIVERED" &&
          o.deliveredAt &&
          o.deliveredAt >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      ) ?? false,
  }));

  return { total, active, inactive: total - active, referrals };
}

// Milestone bonuses (USD) at referral counts
export const REFERRAL_BONUSES = {
  10: 50,
  15: 100,
};

/** 1 year in ms - referrals must have purchased within this period */
const FREE_IPHONE_REFERRAL_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;
export const FREE_IPHONE_REQUIRED_COUNT = 20;

/**
 * Count referrals who purchased (DELIVERED order) within the last year.
 */
export async function getFreeiPhoneQualifiedReferralsCount(userId: string): Promise<number> {
  const since = new Date(Date.now() - FREE_IPHONE_REFERRAL_WINDOW_MS);
  return prisma.user.count({
    where: {
      referredById: userId,
      orders: {
        some: {
          status: "DELIVERED",
          deliveredAt: { gte: since },
        },
      },
    },
  });
}
