import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getFreeIphoneClaimUiState,
  canRequestFreeIphoneDevice,
} from "@/lib/free-iphone-reward";
import { getFreeiPhoneQualifiedReferralsCount } from "@/lib/referral";
import { sendAdminFreeIphoneDeviceRequested } from "@/lib/email";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const state = await getFreeIphoneClaimUiState(userId);
  if (!canRequestFreeIphoneDevice(state)) {
    return NextResponse.json({ error: "not_eligible", errorCode: "not_eligible" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, referralCode: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const qualified = await getFreeiPhoneQualifiedReferralsCount(userId);

  await prisma.freeIphoneRewardElection.upsert({
    where: { userId },
    create: { userId, iphoneRequestedAt: now },
    update: { iphoneRequestedAt: now },
  });

  await sendAdminFreeIphoneDeviceRequested({
    userId,
    userEmail: user.email,
    userName: user.name,
    referralCode: user.referralCode,
    qualifiedReferrals: qualified,
  });

  return NextResponse.json({ ok: true });
}
