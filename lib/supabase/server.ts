import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.generated";
export async function serverClient() {
  const store = await cookies();
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
    throw new Error("Supabase is not configured.");
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            /* Server Components cannot write cookies; middleware refreshes them. */
          }
        },
      },
    },
  );
}
