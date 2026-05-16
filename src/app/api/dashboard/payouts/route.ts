import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createCashbackPayoutRequest,
  getAvailableCashbackBalance,
  getMinWithdrawalAmount,
  userHasActiveCashbackPayout,
} from "@/lib/payout";

const createSchema = z.object({
  walletAddress: z.string().trim().min(10).max(256),
  walletNetwork: z.string().trim().min(2).max(80),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const [requests, available, minWithdrawal, hasActive] = await Promise.all([
    prisma.payoutRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getAvailableCashbackBalance(userId),
    getMinWithdrawalAmount(),
    userHasActiveCashbackPayout(userId),
  ]);

  return NextResponse.json({
    available,
    minWithdrawal,
    hasActivePayout: hasActive,
    requests: requests.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      status: r.status,
      walletAddress: r.walletAddress,
      walletNetwork: r.walletNetwork,
      rejectReason: r.rejectReason,
      processedAt: r.processedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  });
  if (!user?.email || !user.emailVerified) {
    return NextResponse.json({ error: "email_required", errorCode: "email_required" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  try {
    const payout = await createCashbackPayoutRequest({
      userId: session.user.id,
      walletAddress: parsed.data.walletAddress,
      walletNetwork: parsed.data.walletNetwork,
    });
    return NextResponse.json({
      ok: true,
      id: payout.id,
      amount: Number(payout.amount),
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "failed";
    const status =
      code === "below_minimum" || code === "active_payout_exists" ? 400 : 500;
    return NextResponse.json({ error: code, errorCode: code }, { status });
  }
}
