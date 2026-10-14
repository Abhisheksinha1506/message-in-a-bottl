import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSchema, actionSchema, releaseSchema } from "../lib/moderation";
import { demoData, demoAction, demoRelease } from "../lib/demo";

test("message boundary counts Unicode code points, matching PostgreSQL", () => {
  assert.equal(contentSchema.parse(" 🌊 "), "🌊");
  assert.ok(contentSchema.safeParse("🌊".repeat(800)).success);
  assert.equal(contentSchema.safeParse("🌊".repeat(801)).success, false);
  assert.equal(contentSchema.safeParse("   ").success, false);
});
test("moderation blocks whole words without rejecting innocent substrings", () => {
  assert.equal(contentSchema.safeParse("This is SHIT.").success, false);
  assert.ok(contentSchema.safeParse("A little shift in the tide.").success);
});
test("API rejects invalid moods, extra fields, malformed IDs and empty replies", () => {
  assert.equal(
    releaseSchema.safeParse({ content: "Hi", mood: "angry" }).success,
    false,
  );
  assert.equal(
    releaseSchema.safeParse({ content: "Hi", author_id: "spoof" }).success,
    false,
  );
  assert.equal(
    actionSchema.safeParse({ id: "invalid", action: "keep" }).success,
    false,
  );
  const id = demoData().bottles[0].id;
  assert.equal(
    actionSchema.safeParse({ id, action: "reply", content: " " }).success,
    false,
  );
  assert.equal(
    actionSchema.safeParse({ id, action: "release", content: "x".repeat(201) })
      .success,
    false,
  );
  assert.ok(
    actionSchema.safeParse({ id, action: "release", content: "" }).success,
  );
});
test("a kept bottle frees capacity and can be removed only from collection", () => {
  const data = demoData();
  const id = data.bottles[0].id;
  assert.throws(() => demoAction(data, id, "delete"));
  const kept = demoAction(data, id, "keep");
  assert.equal(kept.stats.pending, 2);
  assert.equal(kept.bottles.find((b) => b.id === id)?.status, "kept");
  assert.equal(
    demoAction(kept, id, "delete").bottles.some((b) => b.id === id),
    false,
  );
});
test("preview preserves cooldown and cannot reply twice", () => {
  const data = demoData();
  const id = data.bottles[0].id;
  const released = demoRelease(data);
  assert.equal(released.stats.pending, 4);
  assert.throws(() => demoRelease(released), /12 hours/);
  const replied = demoAction(data, id, "reply");
  assert.throws(() => demoAction(replied, id, "reply"), /already drifting/);
  assert.throws(
    () => demoRelease({ ...data, stats: { ...data.stats, pending: 5 } }),
    /full/,
  );
});
