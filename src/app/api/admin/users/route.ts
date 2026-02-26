import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFreeiPhoneQualifiedReferralsCount } from "@/lib/referral";

const FREE_IPHONE_REQUIRED = 20;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withProgress = await Promise.all(
    users.map(async (u) => {
      const qualifiedReferrals =
        u.role === "USER" ? await getFreeiPhoneQualifiedReferralsCount(u.id) : 0;
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        isBlocked: u.isBlocked,
        createdAt: u.createdAt,
        ordersCount: u._count.orders,
        qualifiedReferrals,
        progressPercent: Math.min(100, (qualifiedReferrals / FREE_IPHONE_REQUIRED) * 100),
      };
    })
  );

  return NextResponse.json(withProgress);
}
