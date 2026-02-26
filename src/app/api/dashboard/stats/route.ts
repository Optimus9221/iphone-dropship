import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getReferralStats, getOrCreateReferralCode, getFreeiPhoneQualifiedReferralsCount, getLastFreeiPhoneDeliveredAt } from "@/lib/referral";
import { processAvailableCashback } from "@/lib/cashback";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  await processAvailableCashback();

  const [referralStats, code, cashbackAgg, available, qualifiedForFreeiPhone, lastFreeiPhoneAt] = await Promise.all([
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
    getLastFreeiPhoneDeliveredAt(userId),
  ]);

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const referralUrl = `${baseUrl}/ref/${code}`;

  return NextResponse.json({
    totalReferrals: referralStats.total,
    activeReferrals: referralStats.active,
    availableCashback: available._sum.amount ? Number(available._sum.amount) : 0,
    totalEarned: cashbackAgg._sum.amount ? Number(cashbackAgg._sum.amount) : 0,
    referralUrl,
    qualifiedForFreeiPhone,
    lastFreeiPhoneAt: lastFreeiPhoneAt?.toISOString() ?? null,
  });
}
