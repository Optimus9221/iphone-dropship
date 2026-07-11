import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_OWN_CASHBACK_PERCENT } from "@/lib/cashback-display";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const storage = searchParams.get("storage");
  const color = searchParams.get("color");
  const q = searchParams.get("q")?.trim();
  const sort = searchParams.get("sort") ?? "newest";
  const now = new Date();

  const where: Record<string, unknown> = { isPublished: true };

  if (model) where.model = model;
  if (storage) where.storage = storage;
  if (color) where.color = color;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { color: { contains: q, mode: "insensitive" } },
      { storage: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      cashbackRates: {
        where: {
          validFrom: { lte: now },
          OR: [{ validTo: null }, { validTo: { gte: now } }],
        },
        orderBy: { validFrom: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json(
    products.map((p) => {
      const { costPrice: _omit, cashbackRates, ...rest } = p;
      const rate = cashbackRates[0];
      const cashbackPercent = rate
        ? Number(rate.ownPurchasePercent)
        : DEFAULT_OWN_CASHBACK_PERCENT;
      return {
        ...rest,
        price: Number(p.price),
        cashbackPercent,
      };
    })
  );
}
