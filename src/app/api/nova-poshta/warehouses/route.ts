import { NextResponse } from "next/server";
import { searchNpWarehouses } from "@/lib/nova-poshta";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityRef = searchParams.get("cityRef")?.trim() ?? "";
  const q = searchParams.get("q")?.trim() ?? "";

  if (!cityRef) {
    return NextResponse.json({ error: "cityRef_required" }, { status: 400 });
  }

  try {
    const warehouses = await searchNpWarehouses(cityRef, q);
    return NextResponse.json(warehouses);
  } catch (e) {
    console.error("[nova-poshta warehouses]", e);
    return NextResponse.json({ error: "nova_poshta_unavailable" }, { status: 503 });
  }
}
