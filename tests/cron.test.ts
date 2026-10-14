import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { GET } from "../app/api/cron/deliver/route";

test("cron fails closed with missing/short secrets and rejects unauthorized callers", async () => {
  const previous = process.env.CRON_SECRET;
  try {
    delete process.env.CRON_SECRET;
    assert.equal(
      (await GET(new NextRequest("https://example.test/api/cron/deliver")))
        .status,
      503,
    );
    process.env.CRON_SECRET = "too-short";
    assert.equal(
      (await GET(new NextRequest("https://example.test/api/cron/deliver")))
        .status,
      503,
    );
    process.env.CRON_SECRET = randomBytes(32).toString("hex");
    assert.equal(
      (await GET(new NextRequest("https://example.test/api/cron/deliver")))
        .status,
      401,
    );
    assert.equal(
      (
        await GET(
          new NextRequest("https://example.test/api/cron/deliver", {
            headers: { authorization: "Bearer incorrect" },
          }),
        )
      ).status,
      401,
    );
    const sameLengthWrongToken = randomBytes(32).toString("hex");
    assert.equal(
      (
        await GET(
          new NextRequest("https://example.test/api/cron/deliver", {
            headers: { authorization: `Bearer ${sameLengthWrongToken}` },
          }),
        )
      ).status,
      401,
    );
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  }
});
