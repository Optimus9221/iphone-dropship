import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendPaymentProofSubmittedEmail, sendAdminPaymentProofReceivedNotification } from "@/lib/email";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MiB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function localeFromRequest(req: Request): string | undefined {
  const raw = req.headers.get("accept-language")?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (raw.startsWith("uk")) return "uk";
  if (raw.startsWith("ru")) return "ru";
  return "en";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      userId: true,
      status: true,
      paymentProofUrl: true,
      orderNumber: true,
      shippingEmail: true,
      total: true,
      user: { select: { email: true } },
    },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "AWAITING_PAYMENT") {
    return NextResponse.json(
      { error: "Payment proof can only be submitted while awaiting payment", errorCode: "invalid_status" },
      { status: 400 }
    );
  }

  if (order.paymentProofUrl) {
    return NextResponse.json(
      { error: "Payment proof already submitted", errorCode: "already_submitted" },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("screenshot");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Screenshot file is required", errorCode: "missing_file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be at most 2 MB", errorCode: "file_too_large" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED.has(mime)) {
    return NextResponse.json(
      { error: "Allowed formats: JPEG, PNG, WebP", errorCode: "invalid_type" },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
  if (dataUrl.length > 3_000_000) {
    return NextResponse.json({ error: "Image is too large after encoding", errorCode: "file_too_large" }, { status: 400 });
  }

  const now = new Date();

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: "PAYMENT_VERIFICATION_PENDING",
      paymentProofUrl: dataUrl,
      paymentProofSubmittedAt: now,
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentProofSubmittedAt: true,
    },
  });

  const notifyTo = order.user.email ?? order.shippingEmail;
  if (notifyTo) {
    await sendPaymentProofSubmittedEmail({
      to: notifyTo,
      orderNumber: updated.orderNumber,
      locale: localeFromRequest(req),
    });
  }

  await sendAdminPaymentProofReceivedNotification({
    orderNumber: updated.orderNumber,
    totalUsd: Number(order.total),
    submittedAt: updated.paymentProofSubmittedAt ?? now,
  });

  return NextResponse.json({
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    paymentProofSubmittedAt: updated.paymentProofSubmittedAt,
  });
}
