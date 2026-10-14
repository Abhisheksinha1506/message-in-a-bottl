export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
// An unconfigured production deployment must never silently become a demo.
export const isDemo =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL &&
  !hasSupabase &&
  process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
export const moods = [
  "calm",
  "curious",
  "melancholic",
  "playful",
  "grateful",
  "hopeful",
] as const;
export type Mood = (typeof moods)[number];
