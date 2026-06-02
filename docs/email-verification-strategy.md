# Wayfinder Email Verification Strategy

## Status

This document records both the deferred custom verification strategy and the current Option A rollout state.

Wayfinder still uses Supabase Auth for email/password signup and login.

Current Option A update: live Wayfinder is keeping Supabase Confirm Email enabled and is not using `profiles.email_verified` as the active gate, because that column does not exist in the live database. Runtime access is gated by the refreshed Supabase user confirmation fields: `session.user.email_confirmed_at` or `session.user.confirmed_at`.

Supabase Confirm Email remains enabled for Option A. The custom `profiles.email_verified` flow below is deferred unless its SQL migration and sender flow are explicitly approved and applied.

Recommendation: keep Supabase Confirm Email enabled. Do not disable it for the branded Supabase email rollout.

## Current Option A Source Of Truth

The current live app-level verification source of truth is:

```text
session.user.email_confirmed_at || session.user.confirmed_at
```

Normal parent and counsellor workspace access is blocked unless the refreshed Supabase session user has one of those confirmation fields.

After the Supabase confirmation link redirects back with URL hash tokens, the browser should establish the session, refresh the user, check those confirmation fields, and clear auth tokens from the URL.

## Deferred Custom Source Of Truth

The deferred custom verification design would use:

```sql
profiles.email_verified
```

That design is not active for the current Option A rollout unless the custom SQL and sender setup are explicitly applied.

New or unverified profiles should have:

- `email_verified = false`
- a verification token hash in `verification_token`
- `verification_token_expires_at` set to a 24-hour expiry
- `verified_at = null`

After a successful verification link:

- `email_verified = true`
- `verified_at` is set
- `verification_token` is cleared
- `verification_token_expires_at` is cleared

## Option A Confirmation Timestamp Audit

Current app code gates Wayfinder access on the refreshed Supabase session user:

- `session.user.email_confirmed_at`
- `session.user.confirmed_at`

The corresponding Supabase Auth record field is `auth.users.email_confirmed_at`. Browser code does not query `auth.users` directly; it uses the confirmed fields returned on the current Supabase user/session.

After a Supabase confirmation redirect, the browser must process URL hash tokens, establish or refresh the session, fetch the latest user, and then remove hash tokens from the URL without logging token values.

## Deferred Custom Implementation Summary

The staged implementation does the following:

- Keeps Supabase Auth for signup, login, password handling, and sessions.
- Uses `ensure_profile` for profile creation/retrieval.
- Returns `email_verified` from the profile flow.
- Blocks normal parent dashboard, journal submission, child linking, and counsellor workspace access when `profiles.email_verified` is not true.
- Shows a verification-required screen with a resend action.
- Sends resend requests through `/api/resend-verification`.
- Verifies tokens through `/api/verify-email`.
- Stores a SHA-256 hash of the verification token, not the raw token.
- Expires verification tokens.
- Clears the token hash after successful verification.
- Tracks `email_sent_at`, `email_delivery_provider`, `verification_email_attempts`, and `verification_email_last_attempt_at`.

## Risks Before Disabling Supabase Confirm Email

Do not disable Supabase Confirm Email until these risks have been addressed:

- The SQL migration may not be applied, or `ensure_profile` may not return `email_verified` in the deployed database.
- Existing users may not have an agreed `profiles.email_verified` state. A careful migration/backfill decision is needed before cutover.
- Missing Vercel environment variables can prevent `/api/resend-verification` or `/api/verify-email` from working.
- Missing `SUPABASE_ANON_KEY` can weaken the bearer-token user lookup path used by the resend API, even though service-role operations remain server-side only.
- The email sender endpoint may be unavailable, misconfigured, or unable to send as the required PsyTec sender.
- Gmail or Apps Script send-as permissions may be missing.
- Apps Script and Gmail quotas are finite, so delivery may fail under higher volume.
- SPF, DKIM, or DMARC may be missing or misaligned for `psytec.com.sg`, increasing spam placement risk.
- Resend is non-enumerating and rate-limited per profile, but public email-based resend still needs operational monitoring for abuse.
- If Supabase Confirm Email is disabled before the custom flow is tested, users may be able to create Supabase sessions but remain blocked from Wayfinder access without receiving a working verification email.

## Required Setup

### SQL

Apply the custom verification migration in Supabase:

- `supabase-email-verification.sql`

Confirm the database includes:

- `profiles.email_verified boolean default false not null`
- `profiles.verification_token text`
- `profiles.verification_token_expires_at timestamptz`
- `profiles.verified_at timestamptz`
- `profiles.email_sent_at timestamptz`
- `profiles.email_delivery_provider text`
- `profiles.verification_email_attempts integer default 0 not null`
- `profiles.verification_email_last_attempt_at timestamptz`
- unique index on `verification_token` where not null
- updated `ensure_profile` return shape including `email_verified`

### Vercel Environment Variables

Configure names only; do not expose values in code, logs, documentation, or browser output.

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `VERIFICATION_EMAIL_ENDPOINT`
- `VERIFICATION_EMAIL_SECRET`
- `EMAIL_FROM`
- `EMAIL_FROM_NAME`

Required sender values:

- `EMAIL_FROM=ask.anything@psytec.com.sg`
- `EMAIL_FROM_NAME="Wayfinder by PsyTec"`

### Email Sender

The email sender endpoint can be Google Apps Script, Gmail API, SMTP, or another mail service. It must:

- accept the configured shared secret
- send from `Wayfinder by PsyTec <ask.anything@psytec.com.sg>`
- use the subject `Verify Your Wayfinder Account`
- include Wayfinder/PsyTec branding
- include a verification button
- include the 24-hour expiry notice
- include support contact `ask.anything@psytec.com.sg`
- fail gracefully when send permissions or provider availability fail

### Deliverability

Before cutover, verify DNS and alignment for `psytec.com.sg`:

- SPF
- DKIM
- DMARC

Emails should pass SPF/DKIM alignment to reduce spam placement risk.

## Gmail And Apps Script Feasibility

Google Apps Script is feasible for a low-volume staged rollout if it is deployed under a Google Workspace account that owns, or has Send As permission for, `ask.anything@psytec.com.sg`.

Apps Script/Gmail is not unlimited. Google documents quotas for Apps Script services, including mail-related quotas:

https://developers.google.com/apps-script/guides/services/quotas

For production volume, abuse resistance, analytics, and deliverability controls, Wayfinder may eventually need a transactional email provider or custom SMTP setup. The current abstraction intentionally keeps the sender configurable through environment variables so the provider can be changed later without browser-code changes.

## Smoke-Test Checklist Before Custom Cutover

Run these before disabling Supabase Confirm Email:

- Confirm Supabase Confirm Email is still enabled during the staged test.
- Apply `supabase-email-verification.sql` in the target Supabase project.
- Confirm `ensure_profile` returns `email_verified`.
- Configure all required Vercel environment variable names with deployment values.
- Deploy and test the email sender endpoint.
- Confirm the sender can send as `Wayfinder by PsyTec <ask.anything@psytec.com.sg>`.
- Confirm SPF, DKIM, and DMARC are configured for `psytec.com.sg`.
- Sign up a new parent account and confirm the profile is created with `email_verified = false`.
- Sign in after Supabase confirmation and confirm the verification-required screen appears.
- Confirm an unverified parent cannot reach dashboard use, child linking, or journal submission.
- Confirm an unverified counsellor cannot reach the counsellor workspace.
- Use resend and confirm a PsyTec-branded verification email is sent.
- Confirm `email_sent_at`, `email_delivery_provider`, and `verification_email_attempts` update.
- Open a valid verification link and confirm `profiles.email_verified = true`.
- Confirm `verified_at` is set and token fields are cleared.
- Confirm missing, invalid, expired, and already-used tokens fail clearly.
- Confirm resend regenerates a token and the old token no longer works.
- Confirm a verified parent reaches the dashboard and existing records load.
- Confirm a verified counsellor reaches the counsellor workspace.
- Confirm sign out works.
- Confirm normal UI does not show parent email, Supabase UUID, child names, JWTs, refresh tokens, anon keys, service-role keys, or secrets.
- After all staged checks pass, disable Supabase Confirm Email and repeat signup, resend, verify, login, dashboard, and counsellor smoke tests.

## Exact Files Changed By The Custom Verification Implementation

Git history for `e69241d` and `800abb4` shows the custom verification implementation touched these files:

- `api/_supabase-admin.js`
- `api/_verification-email.js`
- `api/resend-verification.js`
- `api/verify-email.js`
- `app.js`
- `supabase.js`
- `verify.html`
- `supabase-email-verification.sql`
- `supabase-profiles.sql`
- `supabase-counsellor-rls.sql`
- `docs/auth-profile-flow.md`
- `docs/custom-email-verification-impact-report.md`
- `docs/gmail-verification-apps-script.md`

Deferred custom verification behavior is carried by:

- `api/_supabase-admin.js`
- `api/_verification-email.js`
- `api/resend-verification.js`
- `api/verify-email.js`
- `app.js`
- `supabase.js`
- `verify.html`
- `supabase-email-verification.sql`
- `supabase-profiles.sql`
- `docs/auth-profile-flow.md`
- `docs/custom-email-verification-impact-report.md`
- `docs/gmail-verification-apps-script.md`

`supabase-counsellor-rls.sql` was touched during the implementation history, then scoped back so the deferred custom verification behavior does not depend on counsellor RLS changes.

## Rollback Plan

If the custom verification flow fails before Supabase Confirm Email is disabled:

- Keep Supabase Confirm Email enabled.
- Disable or ignore the custom resend/verification path in deployment.
- Redeploy the last known good app version or revert the custom verification commits.
- Leave added profile columns in place temporarily if removing them would add risk.
- Remove or disable the verification email endpoint and related Vercel environment variables only after confirming no deployed code depends on them.
- Smoke-test signup, login, dashboard loading, counsellor access, sign out, and privacy display.

If Supabase Confirm Email has already been disabled:

- Re-enable Supabase Confirm Email first.
- Redeploy the last known good app version.
- Coordinate any SQL rollback with the deployed app version, especially the `ensure_profile` return shape.
- Do not drop verification columns or indexes without backup and explicit approval.
- Confirm existing records still load by the stable identity chain.

Rollback must not expose service-role keys, weaken RLS, bypass profile creation rules, or alter counsellor/parent data policies.
