import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email";
import { getCryptoPaymentDefaults } from "@/lib/payment-settings";
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

  const [orders, cryptoDefaults] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: { include: { product: { select: { name: true, slug: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getCryptoPaymentDefaults(),
  ]);

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total),
      trackingNumber: o.trackingNumber,
      imei: o.imei,
      createdAt: o.createdAt,
      deliveredAt: o.deliveredAt,
      paymentInstructions:
        o.status === "AWAITING_PAYMENT"
          ? {
              network: (o.paymentNetwork?.trim() || cryptoDefaults.network).trim(),
              address: (o.paymentWalletAddress?.trim() || cryptoDefaults.walletAddress).trim(),
            }
          : null,
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
        { error: "Validation error", errorCode: "validation", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId, quantity, shippingName, shippingAddress, shippingPhone, shippingEmail, comment } =
      parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found", errorCode: "product_not_found" }, { status: 404 });
    }
    if (!product.isPublished) {
      return NextResponse.json({ error: "Product not available", errorCode: "product_not_available" }, { status: 400 });
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

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: { select: { name: true } } } } },
    });
    if (fullOrder?.shippingEmail) {
      const itemsStr = fullOrder.items
        .map((i) => `${i.product.name} × ${i.quantity}`)
        .join(", ");
      await sendOrderConfirmation({
        to: fullOrder.shippingEmail,
        orderNumber: fullOrder.orderNumber,
        total: Number(fullOrder.total),
        items: itemsStr,
      });
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create order";
    return NextResponse.json({ error: msg, errorCode: "failed" }, { status: 400 });
  }
}
