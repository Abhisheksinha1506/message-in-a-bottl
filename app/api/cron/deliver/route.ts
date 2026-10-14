import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32)
    return NextResponse.json(
      { error: "Delivery is not configured." },
      { status: 503 },
    );
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { data, error } = await adminClient().rpc("deliver_due_bottles", {
      p_batch_size: 100,
    });
    if (error)
      return NextResponse.json(
        { error: "The delivery run failed." },
        { status: 500 },
      );
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Delivery is not configured." },
      { status: 503 },
    );
  }
}
