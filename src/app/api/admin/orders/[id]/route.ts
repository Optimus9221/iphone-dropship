import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { accrueCashbackOnDelivery } from "@/lib/orders";
import { sendOrderStatusUpdate } from "@/lib/email";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";

const updateSchema = z.object({
  status: z.enum(["NEW", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  trackingNumber: z.string().optional(),
  imei: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const updateData: {
    status: OrderStatus;
    trackingNumber?: string | null;
    imei?: string | null;
    shippedAt?: Date;
    deliveredAt?: Date;
  } = {
    status: parsed.data.status as OrderStatus,
  };

  if (parsed.data.trackingNumber !== undefined) {
    updateData.trackingNumber = parsed.data.trackingNumber || null;
  }
  if (parsed.data.imei !== undefined) {
    updateData.imei = parsed.data.imei || null;
  }

  if (parsed.data.status === "SHIPPED" && !order.shippedAt) {
    updateData.shippedAt = new Date();
  }

  if (parsed.data.status === "DELIVERED") {
    updateData.deliveredAt = order.deliveredAt ?? new Date();
  }

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
    include: { user: { select: { email: true } } },
  });

  if (parsed.data.status === "DELIVERED" && updated.deliveredAt) {
    await accrueCashbackOnDelivery(id, updated.deliveredAt);
  }

  // Send email notification on status/tracking/IMEI update
  const hasChanges = order.status !== parsed.data.status ||
    (parsed.data.trackingNumber !== undefined && (order.trackingNumber ?? "") !== (parsed.data.trackingNumber ?? "")) ||
    (parsed.data.imei !== undefined && (order.imei ?? "") !== (parsed.data.imei ?? ""));
  if (hasChanges && updated.user?.email) {
    await sendOrderStatusUpdate({
      to: updated.user.email,
      orderNumber: updated.orderNumber,
      status: updated.status,
      trackingNumber: updated.trackingNumber,
      imei: updated.imei,
    });
  }

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    trackingNumber: updated.trackingNumber,
    imei: updated.imei,
    deliveredAt: updated.deliveredAt,
  });
}
