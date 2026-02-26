import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/orders";
import { z } from "zod";

const createSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  shippingName: z.string().min(1, "Name is required"),
  shippingAddress: z.string().min(1, "Address is required"),
  shippingPhone: z.string().min(1, "Phone is required"),
  shippingEmail: z.string().email("Invalid email"),
  comment: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: { select: { name: true, slug: true } } } },
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
      createdAt: o.createdAt,
      deliveredAt: o.deliveredAt,
      items: o.items.map((i) => ({
        productName: i.product.name,
        productSlug: i.product.slug,
        quantity: i.quantity,
        price: Number(i.price),
      })),
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, quantity, shippingName, shippingAddress, shippingPhone, shippingEmail, comment } =
      parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (!product.isPublished) {
      return NextResponse.json({ error: "Product not available" }, { status: 400 });
    }
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock", stock: product.stock },
        { status: 400 }
      );
    }

    const order = await createOrder({
      userId: session.user.id,
      items: [{ productId, quantity, price: Number(product.price) }],
      shippingName,
      shippingAddress,
      shippingPhone,
      shippingEmail,
      comment,
    });

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create order";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
