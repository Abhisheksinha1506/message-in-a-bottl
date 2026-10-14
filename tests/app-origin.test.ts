import { test } from "node:test";
import assert from "node:assert/strict";
import { trustedAppOrigins, authRedirectOrigin } from "../lib/app-origin";

const primary = "https://slow-correspondence.vercel.app";
const legacy = "https://message-in-a-bottle-two.vercel.app";

test("domain aliases accept only the exact approved origins", () => {
  const origins = trustedAppOrigins(primary, primary, legacy);
  assert.ok(origins.has(primary));
  assert.ok(origins.has(legacy));
  assert.equal(origins.has(`${primary}.attacker.test`), false);
  assert.equal(origins.has("https://unrelated.vercel.app"), false);
  assert.equal(origins.has("http://slow-correspondence.vercel.app"), false);
  assert.equal(origins.has("null"), false);
});

test("auth redirects stay on an approved host to preserve session cookies", () => {
  assert.equal(authRedirectOrigin(primary, primary, legacy), primary);
  assert.equal(authRedirectOrigin(legacy, primary, legacy), legacy);
  assert.equal(
    authRedirectOrigin("https://attacker.test", primary, legacy),
    primary,
  );
});

test("invalid origin configuration fails closed instead of accepting wildcards", () => {
  for (const invalid of [
    "https://*.vercel.app",
    `${legacy}/path`,
    "https://user:pass@example.test",
    "javascript:alert(1)",
  ]) {
    assert.throws(() => trustedAppOrigins(primary, primary, invalid));
  }
});
