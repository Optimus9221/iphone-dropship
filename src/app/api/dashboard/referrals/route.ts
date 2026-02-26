import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getReferralStats, getFreeiPhoneQualifiedReferralsCount } from "@/lib/referral";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats, qualifiedForFreeiPhone] = await Promise.all([
    getReferralStats(session.user.id),
    getFreeiPhoneQualifiedReferralsCount(session.user.id),
  ]);

  return NextResponse.json({
    total: stats.total,
    active: stats.active,
    inactive: stats.inactive,
    qualifiedForFreeiPhone,
    referrals: stats.referrals.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      createdAt: r.createdAt,
      purchaseCount: r.purchaseCount,
      totalSpent: r.totalSpent,
      isActive: r.isActive,
    })),
  });
}
