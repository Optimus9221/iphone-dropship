import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAvailableCashbackBalance, userHasActiveCashbackPayout } from "@/lib/payout";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true, isPublished: true },
  });
  if (!product?.isPublished) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const [available, hasActivePayout] = await Promise.all([
    getAvailableCashbackBalance(session.user.id),
    userHasActiveCashbackPayout(session.user.id),
  ]);

  const orderTotal = Number(product.price);
  const canPayWithCashback = !hasActivePayout && available >= orderTotal;

  return NextResponse.json({
    orderTotal,
    availableCashback: available,
    canPayWithCashback,
    hasActivePayout,
  });
}
