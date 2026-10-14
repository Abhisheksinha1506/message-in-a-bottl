import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { serverClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/config";
import { trustedAppOrigins } from "@/lib/app-origin";
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function mutationClient(request: NextRequest) {
  if (!hasSupabase) throw new ApiError("The shore is not configured yet.", 503);
  const origin = request.headers.get("origin");
  if (!origin || !trustedAppOrigins(request.nextUrl.origin).has(origin))
    throw new ApiError("Please send this request from your shore.", 403);
  if (Number(request.headers.get("content-length") ?? 0) > 16384)
    throw new ApiError("This message is too large.", 413);
  const client = await serverClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) throw new ApiError("Please sign in again.", 401);
  return client;
}
export function fail(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0].message },
      { status: 400 },
    );
  if (error instanceof ApiError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: "Please send a valid request." },
      { status: 400 },
    );
  return NextResponse.json(
    { error: "The current is a little rough. Please try again." },
    { status: 500 },
  );
}
export function rpcError(error: { code: string; message: string }) {
  if (error.code === "P0001") throw new ApiError(error.message, 409);
  if (error.code === "42501")
    throw new ApiError("This bottle is no longer available to you.", 403);
  throw new ApiError(
    "The shore couldn’t complete this action. Please try again.",
    500,
  );
}
