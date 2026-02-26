import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { processAvailableCashback } from "@/lib/cashback";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await processAvailableCashback();

  const entries = await prisma.cashbackEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    entries.map((e) => ({
      id: e.id,
      amount: Number(e.amount),
      type: e.type,
      status: e.status,
      orderId: e.orderId,
      referralId: e.referralId,
      availableAt: e.availableAt,
      createdAt: e.createdAt,
    }))
  );
}
