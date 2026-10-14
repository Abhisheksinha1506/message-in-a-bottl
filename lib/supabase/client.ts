"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.generated";
let client: ReturnType<typeof createBrowserClient<Database>> | undefined;
export function browserClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
    throw new Error("Supabase is not configured.");
  return (client ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ));
}
