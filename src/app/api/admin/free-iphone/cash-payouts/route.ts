import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { updateFreeIphoneCashPayoutStatus } from "@/lib/payout";

export async function GET() {
  const auth = await requireAdminSession();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rows = await prisma.freeIphoneRewardElection.findMany({
    where: { cashWalletSavedAt: { not: null } },
    include: {
      user: { select: { id: true, email: true, name: true, phone: true } },
    },
    orderBy: { cashWalletSavedAt: "desc" },
  });

  return NextResponse.json(
    rows.map((r) => ({
      userId: r.userId,
      email: r.user.email,
      name: r.user.name,
      phone: r.user.phone,
      walletAddress: r.cashWalletAddress,
      walletNetwork: r.cashWalletNetwork,
      cashWalletSavedAt: r.cashWalletSavedAt?.toISOString() ?? null,
      status: r.cashPayoutStatus ?? "PENDING",
      amount: r.cashPayoutAmount ? Number(r.cashPayoutAmount) : null,
      processedAt: r.cashPayoutProcessedAt?.toISOString() ?? null,
      rejectReason: r.cashPayoutRejectReason,
    }))
  );
}

const patchSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["PROCESSING", "COMPLETED", "REJECTED"]),
  rejectReason: z.string().max(500).optional(),
  amount: z.number().positive().optional(),
});

export async function PATCH(req: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    await updateFreeIphoneCashPayoutStatus({
      userId: parsed.data.userId,
      status: parsed.data.status,
      rejectReason: parsed.data.rejectReason,
      amount: parsed.data.amount,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
