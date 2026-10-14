// Explicit manual trigger. The secret is read from the environment, never logged.
const origin = process.env.APP_ORIGIN || "http://localhost:3000";
const secret = process.env.CRON_SECRET;
if (!secret || secret.length < 32)
  throw new Error(
    "Load a CRON_SECRET of at least 32 characters into the environment.",
  );
const target = new URL("/api/cron/deliver", origin);
if (
  target.protocol !== "https:" &&
  !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)
)
  throw new Error("Use HTTPS for remote delivery runs.");
try {
  const response = await fetch(target, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      "Delivery was not completed. Check the configured origin and server configuration.",
    );
  console.log({
    delivered: result.delivered,
    deferred: result.deferred,
    busy: result.busy,
  });
} catch {
  console.error(
    "Delivery was not completed. Check the configured origin and server configuration.",
  );
  process.exitCode = 1;
}
