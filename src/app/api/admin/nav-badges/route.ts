import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Counts of items that need admin attention (for nav badges). */
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

  const [orders, callbacks, reviews, payouts] = await Promise.all([
    prisma.order.count({
      where: {
        status: { in: ["NEW", "PAYMENT_VERIFICATION_PENDING"] },
      },
    }),
    prisma.callbackRequest.count({ where: { status: "NEW" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.payoutRequest.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    orders,
    callbacks,
    reviews,
    payouts,
  });
}
