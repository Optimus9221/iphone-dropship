import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET: public — only approved reviews (for main page)
export async function GET() {
  const list = await prisma.review.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { name: true, email: true } },
    },
  });
  const safe = list.map((r) => ({
    id: r.id,
    text: r.text,
    rating: r.rating,
    createdAt: r.createdAt,
    userName: r.user.name || r.user.email?.split("@")[0] || "User",
  }));
  return NextResponse.json(safe);
}

const createSchema = z.object({
  text: z.string().min(10).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
});

// POST: authenticated users — create review (status PENDING)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        text: parsed.data.text,
        rating: parsed.data.rating ?? 5,
        status: "PENDING",
      },
    });
    return NextResponse.json({ id: review.id, status: review.status });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
