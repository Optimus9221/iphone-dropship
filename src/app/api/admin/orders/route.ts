import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: { select: { name: true } } } },
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total),
      trackingNumber: o.trackingNumber,
      imei: o.imei,
      shippedAt: o.shippedAt,
      deliveredAt: o.deliveredAt,
      createdAt: o.createdAt,
      shippingName: o.shippingName,
      shippingAddress: o.shippingAddress,
      shippingPhone: o.shippingPhone,
      shippingEmail: o.shippingEmail,
      comment: o.comment,
      user: o.user,
      items: o.items.map((i) => ({
        productName: i.product.name,
        quantity: i.quantity,
        price: Number(i.price),
      })),
    }))
  );
}
