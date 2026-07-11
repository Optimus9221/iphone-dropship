import { NextResponse } from "next/server";
import { searchNpCities } from "@/lib/nova-poshta";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const cities = await searchNpCities(q);
    return NextResponse.json(cities);
  } catch (e) {
    console.error("[nova-poshta cities]", e);
    return NextResponse.json({ error: "nova_poshta_unavailable" }, { status: 503 });
  }
}
