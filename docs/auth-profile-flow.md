# Auth And Profile Flow

This document describes the current Wayfinder auth/profile flow. The key rule is:

Browser code must never directly insert or upsert rows in `profiles`.

To enable verbose auth/profile logs in the browser console:

```js
localStorage.setItem('wayfinder_debug_auth', '1')
```

To turn them off:

```js
localStorage.removeItem('wayfinder_debug_auth')
```

## Flow

1. A user signs up with Supabase email/password auth.
2. The user must verify their email through Wayfinder's custom app-level verification before app access.
3. `app.js` listens to Supabase auth state changes.
4. Profile setup only runs after all of these are true:
   - Auth event is `SIGNED_IN`, `INITIAL_SESSION`, or `TOKEN_REFRESHED`
   - `session` exists
   - `session.access_token` exists
   - `session.user` exists
5. `app.js` calls `Profile.getOrCreate(userId, role, session)` for parent users, even when Supabase email confirmation is disabled.
6. `supabase.js` validates the session and confirms the session user id matches the requested user id.
7. `supabase.js` calls `ensure_profile` via `fetch` with an explicit `Authorization: Bearer <JWT>` header.
8. Supabase RPC `ensure_profile` uses `auth.uid()` as the source of truth.
9. `ensure_profile` returns the existing profile first and inserts only if no row exists.
10. `ensure_profile` returns `email_verified`; unverified profiles are routed to the verification-required screen.
11. Existing `parent_id` / Wayfinder ID must be reused for the same Supabase auth user.
12. Browser code must never directly insert/upsert `profiles`.

## Email Verification

Supabase Auth remains responsible for email/password signup and login, but Supabase's built-in confirmation email is disabled for this custom flow.

Wayfinder verification is enforced by `profiles.email_verified`.

- New profiles default to `email_verified = false`.
- The verification email endpoint generates a random token, stores only its SHA-256 hash in `profiles.verification_token`, sets a 24-hour expiry, and sends a PsyTec-branded email.
- `/verify.html?token=...` posts the token to `/api/verify-email`.
- On success, the API sets `email_verified = true`, sets `verified_at`, clears the token hash, and clears the expiry.
- Unverified users can sign in but are blocked from the parent dashboard, journal submission, child linking, and counsellor workspace.
- Resend is handled by `/api/resend-verification` with a 60-second server-side rate limit.
- Browser code must never update `email_verified`, verification tokens, expiry, or email delivery logs.

Setup note: run `supabase-email-verification.sql` in Supabase SQL Editor, deploy/configure the email endpoint, and complete the smoke tests in `docs/custom-email-verification-impact-report.md` before changing Supabase email confirmation. Only after the replacement flow is working should Supabase Dashboard -> Authentication -> Providers -> Email -> "Confirm email" be disabled. Keep password reset settings unchanged unless they are separately being changed.

## Known Console Warnings To Ignore

- Browser extension message port errors
- `CS WAX not initialized`
- TensorFlow/WebGL kernel already registered

These are unrelated to Wayfinder auth/profile setup.

## Regression Checklist

- Normal browser login succeeds.
- Incognito login succeeds.
- Refresh keeps the same user/profile.
- Logout/login keeps the same user/profile.
- Wayfinder `profiles.email_verified` is required before app access.
- The same `parent_id` is reused for the same Supabase auth user.
- No duplicate `profiles` rows are created.
- Resend verification email works and returns non-enumerating messages.
