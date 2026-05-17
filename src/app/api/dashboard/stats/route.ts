import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getReferralStats, getOrCreateReferralCode, getFreeiPhoneQualifiedReferralsCount, getLastFreeiPhoneRewardAt } from "@/lib/referral";
import { processAvailableCashback } from "@/lib/cashback";
import { getPublicSiteUrl } from "@/lib/public-url";
import {
  getFreeIphoneClaimUiState,
  canRequestFreeIphoneDevice,
  canStartCashAlternative,
} from "@/lib/free-iphone-reward";
import { getFreeIphoneCashPayoutAmount, getMinWithdrawalAmount } from "@/lib/payout";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  await processAvailableCashback();

  const [
    referralStats,
    code,
    cashbackAgg,
    available,
    qualifiedForFreeiPhone,
    lastFreeiPhoneAt,
    claimState,
    userFlags,
    freeIphoneCashPayoutUsd,
    minWithdrawal,
  ] = await Promise.all([
      getReferralStats(userId),
      getOrCreateReferralCode(userId),
      prisma.cashbackEntry.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.cashbackEntry.aggregate({
        where: { userId, status: "AVAILABLE" },
        _sum: { amount: true },
      }),
      getFreeiPhoneQualifiedReferralsCount(userId),
      getLastFreeiPhoneRewardAt(userId),
      getFreeIphoneClaimUiState(userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true, email: true },
      }),
      getFreeIphoneCashPayoutAmount(),
      getMinWithdrawalAmount(),
    ]);

  const canClaimFreeIphone = claimState.canClaim;

  const baseUrl = getPublicSiteUrl(req);
  const referralUrl = `${baseUrl}/ref/${code}`;

  return NextResponse.json({
    totalReferrals: referralStats.total,
    activeReferrals: referralStats.active,
    availableCashback: available._sum.amount ? Number(available._sum.amount) : 0,
    totalEarned: cashbackAgg._sum.amount ? Number(cashbackAgg._sum.amount) : 0,
    referralUrl,
    qualifiedForFreeiPhone,
    lastFreeiPhoneAt: lastFreeiPhoneAt?.toISOString() ?? null,
    canClaimFreeIphone,
    freeIphone: {
      ...claimState,
      canRequestDevice: canRequestFreeIphoneDevice(claimState),
      canStartCash: canStartCashAlternative(claimState),
    },
    emailVerified: userFlags?.emailVerified ?? false,
    hasEmail: Boolean(userFlags?.email),
    freeIphoneCashPayoutUsd,
    minWithdrawal,
  });
}
