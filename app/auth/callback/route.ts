import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { authRedirectOrigin } from "@/lib/app-origin";
export async function GET(request: NextRequest) {
  const origin = authRedirectOrigin(request.nextUrl.origin);
  try {
    const client = await serverClient();
    const code = request.nextUrl.searchParams.get("code");
    const token = request.nextUrl.searchParams.get("token_hash");
    const type =
      request.nextUrl.searchParams.get("type") === "email_change"
        ? "email_change"
        : "email";
    const result = code
      ? await client.auth.exchangeCodeForSession(code)
      : token
        ? await client.auth.verifyOtp({ token_hash: token, type })
        : { error: new Error("Missing sign-in token") };
    return NextResponse.redirect(
      new URL(result.error ? "/login?error=link" : "/", origin),
    );
  } catch {
    return NextResponse.redirect(new URL("/login?error=link", origin));
  }
}
