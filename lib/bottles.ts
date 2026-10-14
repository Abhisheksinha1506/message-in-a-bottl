import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";
import type { Bottle } from "@/types/bottle";
export const bottleColumns =
  "id,content,mood,status,hop_count,created_at,delivered_at,kept_at,replied_at,is_reply" as const;
export const collectionPageSize = 24;
export async function withNotes(
  client: SupabaseClient<Database>,
  bottles: Omit<Bottle, "notes">[],
): Promise<Bottle[]> {
  if (!bottles.length) return [];
  // A short chain: at most 12 recent notes per visible bottle.
  return Promise.all(
    bottles.map(async (bottle) => {
      const { data, error } = await client
        .from("message_history")
        .select("id,message_id,note,hop,created_at")
        .eq("message_id", bottle.id)
        .eq("action", "released")
        .not("note", "is", null)
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw new Error("We couldn’t read this bottle’s journey.");
      return { ...bottle, notes: (data ?? []).reverse() };
    }),
  );
}
