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

const updateSchema = z.object({
  isBlocked: z.boolean().optional(),
  name: z.string().optional().nullable(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session: { user?: { id?: string } } | null = null;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (adminUser?.role !== "ADMIN") throw new Error("Forbidden");
  } catch (e) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data: { isBlocked?: boolean; name?: string | null; email?: string; phone?: string | null; role?: "USER" | "ADMIN" } = {};

  if (parsed.data.isBlocked !== undefined) {
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot block admin" }, { status: 400 });
    }
    data.isBlocked = parsed.data.isBlocked;
  }
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.email !== undefined) {
    const existing = await prisma.user.findFirst({ where: { email: parsed.data.email, NOT: { id } } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    data.email = parsed.data.email;
  }
  if (parsed.data.phone !== undefined) {
    if (parsed.data.phone) {
      const existing = await prisma.user.findFirst({ where: { phone: parsed.data.phone, NOT: { id } } });
      if (existing) return NextResponse.json({ error: "Phone already in use" }, { status: 400 });
    }
    data.phone = parsed.data.phone || null;
  }
  if (parsed.data.role !== undefined) {
    if (user.role === "ADMIN" && session?.user?.id === id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }
    data.role = parsed.data.role;
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  return NextResponse.json({ ok: true });
}
