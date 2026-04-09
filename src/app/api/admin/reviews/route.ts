import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") throw new Error("Forbidden");
}

// GET: list all reviews (all statuses) for admin; includes videoUrl
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const list = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    return NextResponse.json(
      list.map((r) => ({ ...r, videoUrl: r.videoUrl ?? null }))
    );
  } catch (err) {
    console.error("GET /api/admin/reviews error:", err);
    return NextResponse.json(
      { error: "Помилка БД. Виконайте: npx prisma db push" },
      { status: 500 }
    );
  }
}

const statusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

// PATCH: approve or reject review (id in query)
export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const body = await req.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await prisma.review.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ ok: true });
}
