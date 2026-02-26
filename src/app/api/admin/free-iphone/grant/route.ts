import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createFreeiPhoneOrder } from "@/lib/orders";
import {
  getFreeiPhoneQualifiedReferralsCount,
  canReceiveFreeiPhone,
} from "@/lib/referral";

const grantSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
});

export async function POST(req: Request) {
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

  const body = await req.json();
  const parsed = grantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { userId, productId } = parsed.data;

    const [qualifiedCount, eligible] = await Promise.all([
    getFreeiPhoneQualifiedReferralsCount(userId),
    canReceiveFreeiPhone(userId),
  ]);

  if (qualifiedCount < 20) {
    return NextResponse.json(
      { error: "User does not qualify (need 20 referrals with purchases in last year)" },
      { status: 400 }
    );
  }
    if (!eligible) {
    return NextResponse.json(
      { error: "User is not eligible (already received this year or within last 12 months)" },
      { status: 400 }
    );
  }

  try {
    const order = await createFreeiPhoneOrder({ userId, productId });
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create order";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
