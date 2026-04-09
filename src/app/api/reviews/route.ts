import { Prisma } from "@prisma/client";
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
      user: { select: { name: true, email: true, phone: true } },
    },
  });
  const safe = list.map((r) => ({
    id: r.id,
    text: r.text,
    rating: r.rating,
    videoUrl: r.videoUrl ?? null,
    createdAt: r.createdAt,
    userName:
      r.user.name ||
      r.user.email?.split("@")[0] ||
      (r.user.phone ? `…${r.user.phone.slice(-4)}` : null) ||
      "User",
  }));
  return NextResponse.json(safe);
}

const createSchema = z.object({
  text: z.string().min(10).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  videoUrl: z
    .string()
    .max(500)
    .optional()
    .transform((s) => (typeof s === "string" ? s.trim() : s) || undefined),
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

    const videoUrl = parsed.data.videoUrl?.trim() || null;
    const baseData = {
      userId: session.user.id,
      text: parsed.data.text,
      rating: parsed.data.rating ?? 5,
      status: "PENDING" as const,
    };
    const review = await prisma.review.create({ data: baseData });
    if (videoUrl) {
      try {
        await prisma.$executeRawUnsafe(
          "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_url TEXT"
        );
      } catch {
        // Column may already exist
      }
      try {
        await prisma.$executeRaw(
          Prisma.sql`UPDATE reviews SET video_url = ${videoUrl} WHERE id = ${review.id}`
        );
      } catch (e) {
        console.error("Failed to save video_url:", e);
      }
    }
    return NextResponse.json({ id: review.id, status: review.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { error: "Server error", details: process.env.NODE_ENV === "development" ? message : undefined },
      { status: 500 }
    );
  }
}
