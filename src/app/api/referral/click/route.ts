import { NextResponse } from "next/server";
import { trackReferralClick } from "@/lib/referral";

export async function POST(req: Request) {
  try {
    const { referralCode } = await req.json();
    if (!referralCode || typeof referralCode !== "string") {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;
    const url = new URL(req.url);
    const utmSource = url.searchParams.get("utm_source") ?? undefined;

    await trackReferralClick({
      referralCode,
      ip,
      userAgent,
      utmSource,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
