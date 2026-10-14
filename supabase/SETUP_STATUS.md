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

The Site URL is currently `http://localhost:3000`. The following callback URLs were saved after the user's confirmation and verified after reloading the dashboard:

- `http://localhost:3000/auth/callback`
- `http://127.0.0.1:3000/auth/callback`
- `http://127.0.0.1:3002/auth/callback`

The production Site URL and production callback must be configured after the final website origin is available.

## Email templates: SMTP required

The dashboard disables template editing and displays “Set up custom SMTP to edit templates.” The current default templates remain installed. The application callback supports their standard PKCE flow when redirect URLs are configured correctly.

Custom SMTP is required before the supplied custom templates can be saved or public email login can be completed. No SMTP provider, credentials, or subscription has been configured.

## Remaining live verification

The connected application should verify guest signup/profile creation and WebSocket inbox updates once its environment variables are set. Email login and guest upgrades require email delivery configuration. The database metadata and saved-setting checks do not substitute for these live flows.
