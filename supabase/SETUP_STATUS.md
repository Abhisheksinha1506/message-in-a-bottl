# Supabase setup status

Configured and inspected on 14 October 2026 for [message-in-a-bottle](https://supabase.com/dashboard/project/soprezhzcukqzeyzfyfu).

## Database: verified

The initial migration is already installed. It was not rerun. A separate read-only verification query passed all 22 checks:

- RLS is enabled on all five application tables.
- Application users have no direct table write privileges.
- Author, previous-holder, recipient, and pending-owner IDs are hidden from recipients.
- Raw reply records are private.
- All four expected holder/self read policies and eight expected indexes exist.
- The profile-creation trigger is enabled.
- The delivery function is executable only by the service role among application roles.
- Realtime publishes only `inbox_events`.
- All 13 public/private function bodies match the checked-in migration after whitespace normalization.

No user message content was read, and no application data was modified by these checks.

## Authentication: saved and verified

Email sign-in, new-user signup, and email confirmation are already enabled.

Anonymous sign-ins and manual identity linking were enabled after the user's confirmation. Both settings were verified as enabled after reloading the dashboard. Email confirmation remains enabled.

## Callback URLs: saved and verified

The production Site URL is `https://message-in-a-bottle-two.vercel.app`. The exact production callback was added through the Management API using the existing authenticated CLI session, and verified by a fresh configuration read. Local callbacks were preserved:

- `http://localhost:3000/auth/callback`
- `http://127.0.0.1:3000/auth/callback`
- `http://127.0.0.1:3002/auth/callback`
- `https://message-in-a-bottle-two.vercel.app/auth/callback`

## Vercel: connected and redeployed

The live application is [message-in-a-bottle-two.vercel.app](https://message-in-a-bottle-two.vercel.app).

All six environment variables are configured for Production. The existing publishable key is stored under `NEXT_PUBLIC_SUPABASE_ANON_KEY`; the existing backend secret key is stored under the server-only `SUPABASE_SERVICE_ROLE_KEY`. The backend key and randomly generated `CRON_SECRET` are non-revealable Vercel Secrets. No credentials were committed to GitHub or printed in chat. A fresh production deployment completed with status Ready after these variables were saved.

## Delivery: Supabase scheduler

The user approved Supabase Cron as an exception to the original Vercel Cron requirement so the website can stay on Vercel Hobby. The additive `supabase/setup/delivery-cron.sql` setup was applied. Job `message-in-a-bottle-delivery` is active with schedule `*/30 * * * *` and command `SELECT public.deliver_due_bottles(100);`. No delivery timestamps were forced forward and no existing application data was deleted.

The protected Vercel cron route remains available for separately reviewed manual runs and returns HTTP 401 without authorization.

The first automatic Supabase job run succeeded on 14 October 2026 at 17:00 UTC. Its execution status was inspected without reading bottle content.

## Email templates: SMTP required

The dashboard disables template editing and displays “Set up custom SMTP to edit templates.” The current default templates remain installed. The application callback supports their standard PKCE flow when redirect URLs are configured correctly.

Custom SMTP is required before the supplied custom templates can be saved or public email login can be completed. No SMTP provider, credentials, or subscription has been configured.

## Remaining live verification

Live guest signup and the protected inbox, compose, keepsakes, and account settings pages were verified after deployment. The verification created one anonymous Auth account/profile through the normal application workflow, without submitting or deleting bottles. Real delayed message delivery, reply routing, and WebSocket arrivals still need a two-account test with actual 6–72-hour delays. Email login and guest upgrades require email delivery configuration; no SMTP provider has been added.
