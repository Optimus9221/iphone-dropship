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

// Бонусы: 10=$50, 15=$100, 20=бесплатный iPhone
export const REFERRAL_BONUSES = {
  10: 50,
  15: 100,
  20: "free_iphone" as const,
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

/**
 * Get detailed list of referrals who purchased in the last year (for admin verification).
 */
export async function getFreeiPhoneQualifiedReferrals(userId: string) {
  const since = new Date(Date.now() - FREE_IPHONE_REFERRAL_WINDOW_MS);
  const users = await prisma.user.findMany({
    where: {
      referredById: userId,
      orders: {
        some: {
          status: "DELIVERED",
          deliveredAt: { gte: since },
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      orders: {
        where: { status: "DELIVERED", deliveredAt: { gte: since } },
        select: { orderNumber: true, total: true, deliveredAt: true },
        orderBy: { deliveredAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return users.map((u) => ({
    ...u,
    firstPurchaseDeliveredAt: u.orders[0]?.deliveredAt,
    orderCount: u.orders.length,
  }));
}

export async function hasReceivedFreeiPhoneBonus(userId: string): Promise<boolean> {
  const count = await prisma.order.count({
    where: { userId, isFreeiPhoneBonus: true },
  });
  return count > 0;
}

/** Last delivered free iPhone order date (for "every year" eligibility) */
export async function getLastFreeiPhoneDeliveredAt(userId: string): Promise<Date | null> {
  const order = await prisma.order.findFirst({
    where: { userId, isFreeiPhoneBonus: true, status: "DELIVERED", deliveredAt: { not: null } },
    orderBy: { deliveredAt: "desc" },
    select: { deliveredAt: true },
  });
  return order?.deliveredAt ?? null;
}

/** Can receive free iPhone: 20+ qualified refs AND (never received OR last received > 1 year ago) */
export async function canReceiveFreeiPhone(userId: string): Promise<boolean> {
  const [count, lastDelivered] = await Promise.all([
    getFreeiPhoneQualifiedReferralsCount(userId),
    getLastFreeiPhoneDeliveredAt(userId),
  ]);
  if (count < FREE_IPHONE_REQUIRED_COUNT) return false;
  if (!lastDelivered) return true;
  const oneYearAgo = new Date(Date.now() - FREE_IPHONE_REFERRAL_WINDOW_MS);
  return lastDelivered < oneYearAgo;
}

/**
 * Users who have 20+ referrals with purchases in the last year and haven't received the bonus.
 */
export async function getFreeiPhoneCandidates() {
  const usersWithReferrals = await prisma.user.findMany({
    where: {
      role: "USER",
      referrals: { some: {} },
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      referralCode: true,
    },
  });

  const candidates: Array<{
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    referralCode: string;
    qualifiedReferralsCount: number;
  }> = [];

  for (const u of usersWithReferrals) {
    const count = await getFreeiPhoneQualifiedReferralsCount(u.id);
    if (count >= FREE_IPHONE_REQUIRED_COUNT) {
      const eligible = await canReceiveFreeiPhone(u.id);
      if (eligible) {
        candidates.push({
          id: u.id,
          email: u.email,
          name: u.name,
          phone: u.phone,
          referralCode: u.referralCode,
          qualifiedReferralsCount: count,
        });
      }
    }
  }

  return candidates.sort((a, b) => b.qualifiedReferralsCount - a.qualifiedReferralsCount);
}
