import type { Tables } from "@/types/database.generated";
export type Bottle = Pick<
  Tables<"messages">,
  | "id"
  | "content"
  | "mood"
  | "status"
  | "hop_count"
  | "created_at"
  | "delivered_at"
  | "kept_at"
  | "replied_at"
  | "is_reply"
> & { notes: Note[] };
export type Note = Pick<
  Tables<"message_history">,
  "id" | "message_id" | "note" | "hop" | "created_at"
>;
export type ShoreData = {
  bottles: Bottle[];
  profile: Pick<Tables<"profiles">, "id" | "display_name" | "receive_limit">;
  stats: {
    pending: number;
    drifting: number;
    next_release_at: string | null;
    collection_total?: number;
  };
  guest: boolean;
  demo: boolean;
};
export type BottleAction = "reply" | "keep" | "release" | "discard" | "delete";
