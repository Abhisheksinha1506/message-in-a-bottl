import "server-only";
import { serverClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/config";
import { demoData } from "@/lib/demo";
import type { ShoreData } from "@/types/bottle";
import { bottleColumns, collectionPageSize, withNotes } from "@/lib/bottles";
export async function getShore(): Promise<ShoreData> {
  if (isDemo) return demoData();
  const client = await serverClient();
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user) throw new Error("Please sign in again.");
  const [messages, collection, profile, stats] = await Promise.all([
    client
      .from("messages")
      .select(bottleColumns)
      .eq("status", "delivered")
      .order("delivered_at", { ascending: false })
      .limit(5),
    client
      .from("messages")
      .select(bottleColumns, { count: "exact" })
      .eq("status", "kept")
      .order("kept_at", { ascending: false })
      .order("id", { ascending: false })
      .range(0, collectionPageSize - 1),
    client
      .from("profiles")
      .select("id,display_name,receive_limit")
      .eq("id", user.id)
      .single(),
    client.rpc("shore_stats"),
  ]);
  if (
    messages.error ||
    collection.error ||
    profile.error ||
    stats.error ||
    !profile.data
  )
    throw new Error("Your shore couldn’t be reached. Please try again.");
  return {
    bottles: await withNotes(client, [
      ...(messages.data ?? []),
      ...(collection.data ?? []),
    ]),
    profile: profile.data,
    stats: {
      ...(stats.data as ShoreData["stats"]),
      collection_total: collection.count ?? 0,
    },
    guest: Boolean(user.is_anonymous),
    demo: false,
  };
}
