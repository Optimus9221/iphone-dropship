import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Public stats for homepage social proof — no auth required */
export async function GET() {
  try {
    const [usersCount, ordersCount] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    ]);
    return NextResponse.json({ usersCount, ordersCount });
  } catch {
    return NextResponse.json({ usersCount: 0, ordersCount: 0 });
  }
}
