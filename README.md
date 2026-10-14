# Message in a Bottle

A quiet, anonymous correspondence app. Write up to 800 characters, release a bottle, and let it drift for a randomly selected 6–72 hours. Bottles find one other active person, who can reply, keep, release again, or discard.

Built with **Next.js 15 App Router, TypeScript, Tailwind CSS 4, shadcn/ui primitives, Supabase Postgres/Auth/Realtime, and Vercel hosting**. Scheduled delivery uses Supabase Cron on Vercel Hobby, an explicitly approved exception to the original Vercel Cron requirement. No application integration uses another service.

## Try the interface locally

Requires **Node.js 22+** and npm.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Next.js. Without Supabase variables, development defaults to a labeled browser preview with sample bottles. Reply, keep, release, compose, cooldown, and collection interactions persist in localStorage. Preview bottles are not delivered to other people. Clear this site's browser storage to reset it. Demo mode is disabled in production and on Vercel; an unconfigured deployment shows setup guidance instead of sample data. Set `NEXT_PUBLIC_DEMO_MODE=false` to disable the preview locally too.

## Environment

Create `.env.local` using `.env.example` as a reference. Do not commit it or paste credentials into messages, logs, screenshots, or terminal command arguments.

| Variable                        | Scope       | Purpose                                                                                                                 |
| ------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public      | Supabase project URL                                                                                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public      | Supabase publishable key or legacy anon key; RLS protects data                                                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only | Supabase secret key or legacy service-role key for delivery RPC; never prefix with `NEXT_PUBLIC_`                       |
| `NEXT_PUBLIC_APP_URL`           | Public      | Exact application origin, e.g. `http://localhost:3000` or the production Vercel domain; also validates mutation origins |
| `CRON_SECRET`                   | Server only | Random secret of at least 32 characters; Vercel sends it as a Bearer token                                              |
| `NEXT_PUBLIC_DEMO_MODE`         | Local only  | `false` opts out of the sample preview                                                                                  |

Use your secret manager or Vercel's environment editor to create/store the cron secret. If you run on a different local port, update `NEXT_PUBLIC_APP_URL` and Supabase's allowed redirect URLs accordingly. Restart/rebuild after changing public variables. Configure a distinct Supabase project for preview deployments; `NEXT_PUBLIC_APP_URL` must match that preview's exact origin.

## Create the Supabase project

1. Create a **new** Supabase project. Locate its project URL, public anon key, and server-only service-role key in the dashboard and store them in the environment fields above.
2. Read `supabase/migrations/202610140001_initial.sql` in full. Apply this additive migration to the new project with the Supabase SQL Editor, or link the CLI to the new project and review the migration plan before pushing:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push --dry-run
   # Database write: applies the reviewed migration to the linked project.
   supabase db push
   ```

   Never run a reset against an existing or production project. The application migration does not drop/truncate tables or rewrite existing data. The permanent-delete function is defined here but deletes nothing until a user explicitly invokes it for their own kept bottle.

3. In Authentication, enable the Email provider, anonymous sign-ins, and **manual identity linking**. Keep email confirmation enabled. Guest upgrades call `auth.updateUser({ email })`, preserving the user's UUID and bottles. An email already attached to another account cannot be merged automatically; the UI reports a failure instead of silently moving data.
4. Set Site URL to the exact app origin. Allow `/auth/callback` on your local and deployed origins. Avoid broad production redirect wildcards.
5. After configuring custom SMTP, set both the Magic Link and Confirm Signup templates to `supabase/templates/magic-link.html`, and the Change Email template to `supabase/templates/email-change.html`. Hosted Supabase disables template editing until custom SMTP is configured. The supplied templates use token hashes that can be redeemed in the server callback even when the email opens on another device. For team-member testing with the built-in sender, keep the default templates and configure the redirect URLs; the callback also supports their standard PKCE authorization-code flow. Verify both first-time sign-up and guest conversion in staging.
6. Confirm Realtime replication is enabled for **`inbox_events` only**, as configured by the migration. Do not publish `messages`, `message_replies`, or `message_history`: those tables contain private routing data. RLS limits arrival events to the current user.

**Public email limitation:** [Supabase's built-in sender](https://supabase.com/docs/guides/auth/auth-smtp) only sends to project team members and is intended for testing, with strict rate limits. Public production magic links require custom SMTP. That would be an explicit exception to this project's “no other external services” constraint; no SMTP provider has been added. Under the strict constraint, use guest mode for public access and team-member accounts to verify magic links. Arrival email notifications are intentionally absent.

### Local Supabase instead

The Supabase CLI and Docker are needed for its local stack. `supabase/config.toml` includes anonymous sessions and the magic-link template.

```sh
supabase start
supabase migration up --local
```

Review the local migration and apply it to the **local** stack using the CLI migration workflow. Populate `.env.local` from local credentials without sharing or logging them. Development email is captured by Supabase's local mail viewer. Do not run database reset or container deletion commands on existing environments. To enable identity linking locally, set `enable_manual_linking = true` in `[auth]` as included in the configuration.

## Database design and privacy

All five public tables have RLS: `profiles`, `messages`, `message_replies`, `message_history`, and `inbox_events`. App users have no direct table write privileges. They call narrowly granted, fixed-search-path `SECURITY DEFINER` functions that independently verify `auth.uid()` and ownership. Service role alone can invoke delivery. Public function execution defaults are revoked explicitly.

Only the current holder can read delivered or kept bottles. Column grants hide `author_id`, previous holders, directed recipients, pending owners, and routing times even from a direct REST request. Display names are private. The application never returns a sender's account ID/email. There is **no end-to-end encryption**: the operator can inspect database content. Users should not include identifying details in text.

Replies are new delayed envelopes, recorded in `message_replies` and addressed to the previous holder. An incoming directed reply reserves a recipient slot before delivery. Each person has at most their `receive_limit` (1–5) pending/delivered bottles, counting:

- bottles currently delivered to them;
- bottles they are currently sending into the pool, including re-releases;
- directed replies waiting to return to them.

Kept and discarded bottles use no capacity. Keeping or discarding frees a slot immediately. Re-releasing replaces a delivered slot with an outgoing slot until delivery completes. `pending_owner_id` tracks the current sender separately from the original author, preventing another person's actions from unexpectedly consuming the author's capacity.

One original bottle may be released every 12 hours. Replies and onward releases are not new original bottles; one reply per bottle per holding turn prevents duplicate reply spam. A reply can be sent while the original remains delivered. At capacity, keep/discard another bottle before replying.

Delivery chooses one random eligible user who was active in the past 14 days, excludes the original author and immediately previous holder, and honors reserved capacity. Directed replies retain their intended recipient. If no suitable recipient exists, the bottle stays drifting and retries after 30 minutes; 72 hours is the initial maximum delay, **not a delivery SLA**. The cron handles 100 envelopes per run, capped at 500 inside SQL. Due rows use a partial index and row locks.

All quota-changing operations share a transaction-level advisory lock. This is intentionally simple for an MVP and guarantees limits under concurrent requests and overlapping cron invocations. At substantial scale, replace the global lock and `ORDER BY random()` with per-recipient reservation locks and a sampled eligibility queue after measuring load.

`message_history` records actions and notes. The interface displays the last 12 release notes on a bottle. Keepsakes load in pages of 24. Discard is a terminal hidden status. Permanently deleting an owned kept bottle removes its row, its journey notes, arrival events, and any duplicate reply record for that envelope. Independently created reply bottles survive with their source reference cleared. Auth-user deletion is not implemented; account erasure requires a separately reviewed anonymization/retention workflow because holder-state constraints protect live bottles.

The same basic whole-word moderation list is enforced by the API and SQL for messages, replies, names, and onward notes. This is a soft filter, **not comprehensive abuse detection**. Per-user limits cannot prevent a person from creating multiple guest accounts. Configure Supabase Auth's available rate limits and review anonymous-session abuse before a public launch. No third-party moderation/CAPTCHA service has been added.

## Generated types

`types/database.generated.ts` was generated with Supabase's official `postgres-meta` TypeScript template from the applied initial migration, including relationships, function signatures, and enums. Regenerate when the schema changes:

```sh
# Read-only schema introspection on a running local Supabase instance:
npm run db:types

# Or, after CLI authentication, introspect your connected project:
supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public
```

Save the resulting TypeScript to `types/database.generated.ts` and run `npm run typecheck`. `scripts/generate-types.mjs` is an optional Docker-free development alternative using the same official generator against PostgreSQL configured with standard `PG*` environment variables. It prints only generated types, not credentials.

## Delivery cron

The current deployment uses **Supabase Cron every 30 minutes** (`*/30 * * * *`). Review and run `supabase/setup/delivery-cron.sql` as the database administrator after the initial migration. It enables `pg_cron` and schedules `SELECT public.deliver_due_bottles(100);` directly inside Postgres; no HTTP token or extra service is needed. The setup is repeatable but refuses to overwrite a same-named job with different settings. Verify the active job and successful runs in **Integrations > Cron**. `vercel.json` intentionally has no cron entry so Hobby deployments succeed.

The protected `GET /api/cron/deliver` route remains available for reviewed manual/staging runs. It uses a timing-safe comparison against `CRON_SECRET`, returns no message content, and calls the atomic service-role `deliver_due_bottles` RPC. Unauthorized callers receive 401; missing configuration receives 503. Overlapping runs either process atomically or return `busy: true`. Failed transactions roll back; the next run retries safely.

To use the original Vercel Cron option instead, **Vercel Pro is required**: [Hobby cron jobs run at most once per day](https://vercel.com/docs/cron-jobs/usage-and-pricing). Restore `{"crons":[{"path":"/api/cron/deliver","schedule":"*/30 * * * *"}]}` in `vercel.json` and deploy with `CRON_SECRET` set. Vercel sends the secret as a Bearer token automatically. Do not enable both schedulers unnecessarily; changing an existing production job requires separate review.

To trigger a development/staging run without putting the secret in terminal arguments:

```sh
# Load CRON_SECRET securely into the process environment first.
APP_ORIGIN=http://localhost:3000 npm run cron:run
```

This is a database write: the script sends an authenticated GET to `/api/cron/deliver`, which executes `select public.deliver_due_bottles(100)`. Review the target origin before running. The script prints only aggregate counts. It waits for real delays; it never forces production timestamps forward. Use synthetic fixtures only in a fresh, isolated test database if testing immediate delivery.

## Vercel deployment

1. Store this directory in your own Git repository and import it into Vercel as a Next.js project (set the root directory if using a monorepo).
2. Select **Node.js 22 or newer**. Install with `npm ci`; build with `npm run build`. The lockfile pins patched dependencies while keeping Next.js 15. Server-only keys are isolated using `server-only` imports.
3. Add the environment variables, with separate values/projects for Preview and Production. Set `NEXT_PUBLIC_APP_URL` to the production origin before building. Keep `CRON_SECRET` at least 32 random characters. Never expose the service-role key in public variables.
4. Apply the reviewed initial migration to the new Supabase project. Configure Auth URLs, templates, anonymous sign-in, identity linking, and Realtime as above.
5. On Hobby, apply the separately reviewed Supabase cron setup and verify its job/history. For the optional Pro configuration, verify the job in Vercel's cron dashboard instead.
6. In staging, use two distinct sessions/accounts. Release a message, confirm cooldown enforcement, wait for eligibility, then verify delivery, delayed reply, keep/re-release/discard, collection deletion confirmation, and cross-account denial. Check guest upgrade preserves its collection. Verify public email readiness separately if an SMTP exception is authorized.

## Verification

```sh
npm run typecheck
npm test
npm run build
npm audit
```

Tests cover Unicode message limits, API moderation/validation, preview quotas, cooldown, and collection transitions. `tests/database-bootstrap.sql` and `tests/database-integration.sql` test the actual migration's RLS, privileges, mutation ownership, cooldown, random delay, reply routing, multi-hop behavior, retries, and capacity in a **fresh isolated PostgreSQL database**. They insert synthetic fixtures and contain no data/table removal commands. Never run the bootstrap or fixture SQL on an existing Supabase/production project. A real Supabase staging test is still required for email and WebSocket delivery; standalone PostgreSQL does not emulate Auth/Realtime servers.

## Project map

```text
app/
  (shore)/             protected inbox, write, collection, settings
  api/bottles/         authenticated original bottle and holder mutations
  api/collection/      private paginated keepsakes
  api/profile/         private preferences
  api/cron/deliver/    service-role scheduled delivery
  auth/callback/       token-hash / PKCE exchange
  login/               magic-link / guest entry
  about/               product/privacy explanation
components/
  ui/                  shadcn-style Button and accessible Radix Dialog
  shore-app.tsx        navigation, inbox, reader, Realtime lifecycle
  compose.tsx          message/mood/release form
  bottle-card.tsx       readable message preview
  settings-view.tsx    private preferences and guest upgrade
lib/supabase/          typed browser, server, and isolated admin clients
supabase/              migration, local configuration, email template
types/                 generated database types and safe UI projections
tests/                 application and PostgreSQL integration checks
```

Stretch feature included: multi-hop note chains. Public galleries, seasonal pools, and arrival emails have not been added; privacy and the requested correspondence flows remain the focus.
