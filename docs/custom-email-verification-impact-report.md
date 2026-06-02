# Custom Email Verification Impact Report

Date: 2026-06-02

## Baseline Flow Before Replacement

1. Parent user signs up in `AuthScreen` through `Auth.signUp(email, password)`.
2. Supabase Auth creates the auth user.
3. With Supabase email confirmation enabled, signup may return no browser session.
4. The UI tells the user to check email and sign in after confirmation.
5. On sign-in or auth callback, `App` receives `SIGNED_IN`, `INITIAL_SESSION`, or `TOKEN_REFRESHED`.
6. The previous app gate checked `session.user.email_confirmed_at` or `session.user.confirmed_at`.
7. If either confirmation timestamp was present, `Profile.getOrCreate(userId, role, session)` called `/rest/v1/rpc/ensure_profile` with explicit `Authorization: Bearer <access_token>`.
8. `ensure_profile` reused or created the generated Wayfinder `parent_id`.
9. Parent and counsellor portal routing used the returned profile role.
10. Dashboard and protected data reads used the verified callback session where available and explicit Bearer reads.

## Supabase Confirmation Assumptions Found

- `app.js` assumed `session.user.email_confirmed_at` or `session.user.confirmed_at` represented verified access.
- `app.js` blocked profile creation before those Supabase confirmation fields existed.
- `AuthScreen` assumed an unverified signup with no session should show a Supabase confirmation message.
- `Auth.resendVerification(email)` in `supabase.js` used Supabase's built-in `sb.auth.resend({ type: 'signup', email })`.
- `docs/auth-profile-flow.md` described Supabase confirmation timestamps as the verification gate.
- `docs/app-architecture-navigation-review.md` and `docs/current-state-of-wayfinder.md` contain historical descriptions of the Supabase confirmation-based gate.

## Replacement Impact

- Supabase Auth remains responsible for signup, login, sessions, and password handling.
- Existing Supabase confirmation must remain enabled until the custom flow is deployed, configured, and smoke-tested.
- The replacement gate moves app access from Supabase confirmation timestamps to `profiles.email_verified`.
- Profile creation now needs to happen after a valid Supabase session even if Wayfinder verification is still pending.
- Unverified users are allowed to hold an auth session only long enough to see the verification-required screen and request a link.
- Parent dashboard, child setup, journal submission, and counsellor workspace remain blocked in app code while `email_verified` is false.
- The migration adds verification fields to `profiles`, but does not alter dyad, journal entry, review, counsellor, or journal-access RLS policies.
- Verification emails are sent through a serverless endpoint and a configurable mail endpoint. No Gmail credentials, service-role keys, or email endpoint secrets are stored in browser code.
- Token hashes are stored in `profiles.verification_token`; raw tokens are sent only in the email link and are cleared after success or expiry handling.

## Implementation Guardrails

- Do not disable Supabase "Confirm email" until these are complete:
  - `supabase-email-verification.sql` has been applied.
  - Vercel environment variable names have been configured without exposing values.
  - The Apps Script or mail endpoint has been deployed and can send from `ask.anything@psytec.com.sg`.
  - New signup, resend, valid verification, invalid token, expired token, and post-verification login have been smoke-tested.
- Keep password reset unchanged.
- Keep counsellor permissions, dyad/journal/review RLS policies, and journal access policies unchanged for this task.
- Never expose service-role keys, Gmail credentials, endpoint secrets, JWTs, or environment values in frontend code, docs, logs, or normal UI.
