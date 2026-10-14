import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { bottleColumns, collectionPageSize, withNotes } from "@/lib/bottles";
import { fail, ApiError } from "@/lib/api";
export async function GET(request: NextRequest) {
  try {
    const page = Number(request.nextUrl.searchParams.get("page") ?? "0");
    if (!Number.isSafeInteger(page) || page < 0 || page > 100000)
      throw new ApiError("That page is unavailable.");
    const client = await serverClient();
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();
    if (authError || !user) throw new ApiError("Please sign in again.", 401);
    const { data, error } = await client
      .from("messages")
      .select(bottleColumns)
      .eq("status", "kept")
      .order("kept_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * collectionPageSize, (page + 1) * collectionPageSize - 1);
    if (error) throw new ApiError("Your collection couldn’t be reached.", 500);
    return NextResponse.json(
      { bottles: await withNotes(client, data ?? []) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return fail(error);
  }
}
