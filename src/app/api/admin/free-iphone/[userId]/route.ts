import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getFreeiPhoneQualifiedReferrals,
  getFreeiPhoneQualifiedReferralsCount,
  canReceiveFreeiPhone,
} from "@/lib/referral";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (admin?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, referralCode: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [qualifiedCount, referrals, canReceive, election] = await Promise.all([
    getFreeiPhoneQualifiedReferralsCount(userId),
    getFreeiPhoneQualifiedReferrals(userId),
    canReceiveFreeiPhone(userId),
    prisma.freeIphoneRewardElection.findUnique({ where: { userId } }),
  ]);

  return NextResponse.json({
    user,
    qualifiedReferralsCount: qualifiedCount,
    qualifiedReferrals: referrals,
    canReceive,
    election: election
      ? {
          iphoneRequestedAt: election.iphoneRequestedAt?.toISOString() ?? null,
          cashWalletAddress: election.cashWalletAddress,
          cashWalletNetwork: election.cashWalletNetwork,
          cashWalletSavedAt: election.cashWalletSavedAt?.toISOString() ?? null,
          cashPayoutStatus: election.cashPayoutStatus,
          cashPayoutAmount: election.cashPayoutAmount ? Number(election.cashPayoutAmount) : null,
        }
      : null,
  });
}
