import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { updateCashbackPayoutStatus } from "@/lib/payout";

export async function GET() {
  const auth = await requireAdminSession();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rows = await prisma.payoutRequest.findMany({
    include: {
      user: { select: { id: true, email: true, name: true, phone: true } },
      _count: { select: { cashbackEntries: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      email: r.user.email,
      name: r.user.name,
      phone: r.user.phone,
      amount: Number(r.amount),
      status: r.status,
      walletAddress: r.walletAddress,
      walletNetwork: r.walletNetwork,
      entryCount: r._count.cashbackEntries,
      processedAt: r.processedAt?.toISOString() ?? null,
      rejectReason: r.rejectReason,
      createdAt: r.createdAt.toISOString(),
    }))
  );
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PROCESSING", "COMPLETED", "REJECTED"]),
  rejectReason: z.string().max(500).optional(),
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
    await updateCashbackPayoutStatus({
      payoutId: parsed.data.id,
      status: parsed.data.status,
      rejectReason: parsed.data.rejectReason,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
