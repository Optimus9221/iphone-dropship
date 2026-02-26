import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(5).max(30),
  comment: z.string().max(1000).optional(),
});

/** Create callback request — no auth required */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    await prisma.callbackRequest.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        comment: parsed.data.comment ?? null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Callback request error:", e);
    return NextResponse.json(
      { error: "Server error", message: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
