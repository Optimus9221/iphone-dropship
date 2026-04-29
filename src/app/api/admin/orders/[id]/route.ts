import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { accrueCashbackOnDelivery } from "@/lib/orders";
import { sendOrderStatusUpdate, sendAwaitingPaymentEmail } from "@/lib/email";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";

const STATUS_VALUES = [
  "NEW",
  "AWAITING_PAYMENT",
  "PAYMENT_VERIFICATION_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const updateSchema = z.object({
  status: z.enum(STATUS_VALUES),
  trackingNumber: z.string().optional(),
  imei: z.string().optional(),
  paymentWalletAddress: z.string().optional(),
  paymentNetwork: z.string().optional(),
});

function localeFromRequest(req: Request): string | undefined {
  const raw = req.headers.get("accept-language")?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (raw.startsWith("uk")) return "uk";
  if (raw.startsWith("ru")) return "ru";
  return "en";
}

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

  const clearingRejectedProof =
    parsed.data.status === "AWAITING_PAYMENT" && order.status === "PAYMENT_VERIFICATION_PENDING";

  const updateData: {
    status: OrderStatus;
    trackingNumber?: string | null;
    imei?: string | null;
    shippedAt?: Date;
    deliveredAt?: Date;
    paymentWalletAddress?: string | null;
    paymentNetwork?: string | null;
    paymentProofUrl?: string | null;
    paymentProofSubmittedAt?: Date | null;
  } = {
    status: parsed.data.status as OrderStatus,
  };

  if (clearingRejectedProof) {
    updateData.paymentProofUrl = null;
    updateData.paymentProofSubmittedAt = null;
  }

  if (parsed.data.trackingNumber !== undefined) {
    updateData.trackingNumber = parsed.data.trackingNumber || null;
  }
  if (parsed.data.imei !== undefined) {
    updateData.imei = parsed.data.imei || null;
  }
  if (parsed.data.paymentWalletAddress !== undefined) {
    updateData.paymentWalletAddress = parsed.data.paymentWalletAddress.trim() || null;
  }
  if (parsed.data.paymentNetwork !== undefined) {
    updateData.paymentNetwork = parsed.data.paymentNetwork.trim() || null;
  }

  if (parsed.data.status === "SHIPPED" && !order.shippedAt) {
    updateData.shippedAt = new Date();
  }

  if (parsed.data.status === "DELIVERED") {
    updateData.deliveredAt = order.deliveredAt ?? new Date();
  }

  const enteredAwaitingPayment =
    parsed.data.status === "AWAITING_PAYMENT" &&
    order.status !== "AWAITING_PAYMENT" &&
    order.status !== "PAYMENT_VERIFICATION_PENDING";

  const updated = await prisma.order.update({
    where: { id },
    data: updateData,
    include: { user: { select: { email: true, phone: true } } },
  });

  if (parsed.data.status === "DELIVERED" && updated.deliveredAt) {
    await accrueCashbackOnDelivery(id, updated.deliveredAt);
  }

  const notifyTo = updated.user?.email ?? updated.shippingEmail;

  if (enteredAwaitingPayment && notifyTo) {
    await sendAwaitingPaymentEmail({
      to: notifyTo,
      orderNumber: updated.orderNumber,
      orderId: updated.id,
      locale: localeFromRequest(req),
    });
  }

  const hasChanges =
    order.status !== parsed.data.status ||
    (parsed.data.trackingNumber !== undefined && (order.trackingNumber ?? "") !== (parsed.data.trackingNumber ?? "")) ||
    (parsed.data.imei !== undefined && (order.imei ?? "") !== (parsed.data.imei ?? ""));

  if (hasChanges && notifyTo && !enteredAwaitingPayment && !clearingRejectedProof) {
    await sendOrderStatusUpdate({
      to: notifyTo,
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
    paymentWalletAddress: updated.paymentWalletAddress,
    paymentNetwork: updated.paymentNetwork,
    paymentProofUrl: updated.paymentProofUrl,
    paymentProofSubmittedAt: updated.paymentProofSubmittedAt,
  });
}
