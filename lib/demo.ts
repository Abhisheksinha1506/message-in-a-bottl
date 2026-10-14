import type { BottleAction, ShoreData } from "@/types/bottle";
export function demoData(): ShoreData {
  return {
    demo: true,
    guest: true,
    profile: {
      id: "00000000-0000-4000-8000-000000000001",
      display_name: "",
      receive_limit: 5,
    },
    stats: { pending: 3, drifting: 0, next_release_at: null },
    bottles: [
      {
        id: "00000000-0000-4000-8000-000000000101",
        content:
          "This morning, I noticed the light falling on my kitchen wall. Nothing extraordinary. Just a small patch of gold that stayed for a few minutes.\n\nI hope something small and lovely finds you today, too.",
        mood: "grateful",
        status: "delivered",
        hop_count: 2,
        created_at: "2026-10-10T09:00:00Z",
        delivered_at: "2026-10-14T06:00:00Z",
        kept_at: null,
        replied_at: null,
        is_reply: false,
        notes: [
          {
            id: "n1",
            message_id: "00000000-0000-4000-8000-000000000101",
            note: "This found me on a rainy afternoon. Passing a little of that light along.",
            hop: 1,
            created_at: "2026-10-12T09:00:00Z",
          },
        ],
      },
      {
        id: "00000000-0000-4000-8000-000000000102",
        content:
          "Do you ever miss a place you’ve never been?\n\nLately I’ve been thinking about a little house by the sea, with a crooked bookshelf and windows that never quite close. Maybe it’s not a place. Maybe it’s a feeling.",
        mood: "curious",
        status: "delivered",
        hop_count: 0,
        created_at: "2026-10-12T09:00:00Z",
        delivered_at: "2026-10-13T18:00:00Z",
        kept_at: null,
        replied_at: null,
        is_reply: false,
        notes: [],
      },
      {
        id: "00000000-0000-4000-8000-000000000103",
        content:
          "A reminder from one stranger to another: you don’t have to turn every quiet moment into something useful.\n\nSometimes watching the clouds is enough.",
        mood: "calm",
        status: "delivered",
        hop_count: 1,
        created_at: "2026-10-11T09:00:00Z",
        delivered_at: "2026-10-13T07:00:00Z",
        kept_at: null,
        replied_at: null,
        is_reply: false,
        notes: [],
      },
      {
        id: "00000000-0000-4000-8000-000000000104",
        content:
          "There are people in this world who will love the very things you’ve been taught to hide.\n\nI’m learning to leave a little room for that possibility.",
        mood: "hopeful",
        status: "kept",
        hop_count: 3,
        created_at: "2026-10-09T09:00:00Z",
        delivered_at: "2026-10-12T06:00:00Z",
        kept_at: "2026-10-12T08:00:00Z",
        replied_at: null,
        is_reply: false,
        notes: [],
      },
    ],
  };
}
export function demoAction(
  data: ShoreData,
  id: string,
  action: BottleAction,
): ShoreData {
  const bottle = data.bottles.find((b) => b.id === id);
  if (!bottle) throw new Error("This bottle has already drifted away.");
  if (action === "delete" && bottle.status !== "kept")
    throw new Error("Only a kept bottle can be deleted.");
  if (action !== "delete" && bottle.status !== "delivered")
    throw new Error("This bottle is no longer on your shore.");
  if (
    action === "reply" &&
    (bottle.replied_at || data.stats.pending >= data.profile.receive_limit)
  )
    throw new Error(
      bottle.replied_at
        ? "Your reply is already drifting."
        : "Your shore is full. Keep a bottle before replying.",
    );
  const now = new Date().toISOString();
  return {
    ...data,
    bottles:
      action === "delete" || action === "release" || action === "discard"
        ? data.bottles.filter((b) => b.id !== id)
        : data.bottles.map((b) =>
            b.id !== id
              ? b
              : {
                  ...b,
                  ...(action === "keep"
                    ? { status: "kept" as const, kept_at: now }
                    : { replied_at: now }),
                },
          ),
    stats: {
      ...data.stats,
      pending:
        data.stats.pending +
        (action === "reply"
          ? 1
          : ["keep", "discard"].includes(action)
            ? -1
            : 0),
      drifting:
        data.stats.drifting + (["reply", "release"].includes(action) ? 1 : 0),
    },
  };
}
export function demoRelease(data: ShoreData): ShoreData {
  if (
    data.stats.next_release_at &&
    Date.parse(data.stats.next_release_at) > Date.now()
  )
    throw new Error(
      "One new bottle every 12 hours. Let your last thought find its way.",
    );
  if (data.stats.pending >= data.profile.receive_limit)
    throw new Error(
      "Your shore is full. Keep or discard a bottle, or wait for a delivery to make room.",
    );
  return {
    ...data,
    stats: {
      pending: data.stats.pending + 1,
      drifting: data.stats.drifting + 1,
      next_release_at: new Date(Date.now() + 12 * 3600000).toISOString(),
    },
  };
}
