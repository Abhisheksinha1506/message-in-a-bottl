import { test } from "node:test";
import assert from "node:assert/strict";
import { privacyContact, privacySections } from "../lib/privacy";

test("privacy sections have unique accessible navigation targets", () => {
  assert.equal(
    new Set(privacySections.map((s) => s.id)).size,
    privacySections.length,
  );
  assert.ok(privacySections.every((s) => s.title && s.paragraphs.length));
});
test("privacy disclosures distinguish recipient anonymity and data retention", () => {
  const text = privacySections.flatMap((s) => s.paragraphs).join(" ");
  for (const statement of [
    "stored by Supabase Auth",
    "not end-to-end encrypted",
    "no automatic expiry",
    "Discard removes",
    "not storage-free",
    "does not delete",
  ])
    assert.ok(text.includes(statement));
});
test("privacy contact is optional and rejects malformed email links", () => {
  assert.equal(privacyContact(), null);
  assert.equal(
    privacyContact(" privacy@example.test "),
    "privacy@example.test",
  );
  for (const invalid of [
    "not-an-email",
    "mailto:privacy@example.test",
    "x@example.test?subject=oops",
    "x@example.test\r\nBcc:someone@example.test",
  ])
    assert.equal(privacyContact(invalid), null);
});
