import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const storage = searchParams.get("storage");
  const color = searchParams.get("color");
  const sort = searchParams.get("sort") ?? "newest";

  const where: Record<string, unknown> = { isPublished: true };

  if (model) where.model = model;
  if (storage) where.storage = storage;
  if (color) where.color = color;

  const orderBy: Record<string, string> =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      price: Number(p.price),
      costPrice: p.costPrice ? Number(p.costPrice) : null,
    }))
  );
}
