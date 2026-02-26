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

const createSchema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  storage: z.string().min(1),
  color: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  isPublished: z.boolean().default(true),
  description: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      price: Number(p.price),
      costPrice: p.costPrice ? Number(p.costPrice) : null,
    }))
  );
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const slug = `iphone-${parsed.data.model}-${parsed.data.storage.toLowerCase()}-${parsed.data.color.toLowerCase().replace(/\s/g, "-")}`;

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Product with this slug exists" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      model: parsed.data.model,
      storage: parsed.data.storage,
      color: parsed.data.color,
      price: parsed.data.price,
      stock: parsed.data.stock,
      isPublished: parsed.data.isPublished,
      description: parsed.data.description ?? null,
      images: parsed.data.images ?? [],
      specs: {},
    },
  });

  return NextResponse.json({ ...product, price: Number(product.price) });
}
