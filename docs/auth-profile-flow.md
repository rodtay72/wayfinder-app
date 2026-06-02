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
2. The user must verify their email through Supabase Confirm Email before app access.
3. `app.js` listens to Supabase auth state changes.
4. Supabase password recovery callbacks are handled before email verification, profile loading, or portal role routing.
5. Normal auth processing only continues after all of these are true:
   - Auth event is `SIGNED_IN`, `INITIAL_SESSION`, or `TOKEN_REFRESHED`
   - `session` exists
   - `session.access_token` exists
   - `session.user` exists
6. `app.js` refreshes the Supabase session/user and checks `session.user.email_confirmed_at` or `session.user.confirmed_at`.
7. Unconfirmed sessions are routed to the verification-required screen before normal app access.
8. Confirmed parent users call `Profile.getOrCreate(userId, role, session)`.
9. Confirmed counsellor users call `Profile.getExisting(userId, session)` and must have `profiles.role = counsellor`.
10. `supabase.js` validates the session and confirms the session user id matches the requested user id.
11. `supabase.js` calls `ensure_profile` via `fetch` with an explicit `Authorization: Bearer <JWT>` header for parent profile creation/retrieval.
12. Supabase RPC `ensure_profile` uses `auth.uid()` as the source of truth.
13. `ensure_profile` returns the existing profile first and inserts only if no row exists.
14. Existing `parent_id` / Wayfinder ID must be reused for the same Supabase auth user.
15. Browser code must never directly insert/upsert `profiles`.

## Email Verification

Supabase Auth remains responsible for email/password signup, login, sessions, password reset, and email confirmation.

Current Option A behavior:

- Supabase Confirm Email remains enabled.
- Supabase Auth sends the branded confirmation email.
- After the confirmation link redirects back with URL hash tokens, the browser lets Supabase establish the session and falls back to `setSession` if needed.
- Auth hash tokens are removed from the URL after processing.
- Wayfinder access is gated by the refreshed Supabase user confirmation fields: `email_confirmed_at` or `confirmed_at`.
- Confirmed parent users continue through `ensure_profile`.
- Confirmed counsellor users must still have `profiles.role = counsellor`.
- Unconfirmed users are blocked from the parent dashboard, journal submission, child linking, and counsellor workspace.
- Browser code must never update verification fields or directly insert/upsert `profiles`.

Deferred custom-flow note: the repo contains staged custom verification endpoint and SQL files from an earlier implementation path, but the current Option A rollout does not require `profiles.email_verified` in the live database and does not disable Supabase Confirm Email.

## Password Recovery

Supabase Auth remains responsible for reset-password emails and recovery sessions.

Current behavior:

- A Supabase recovery callback with `type=recovery` or a `PASSWORD_RECOVERY` auth event is handled before verification screens, profile loading, wrong-portal checks, dashboard rendering, or counsellor workspace checks.
- Wayfinder shows a Set New Password screen and validates the new password before calling Supabase `auth.updateUser({ password })`.
- Auth hash tokens are removed from the URL after the recovery session is processed and after a successful password update.
- After the password update succeeds, the app refreshes the session and routes by profile role.
- Parent users continue through the parent app flow.
- Counsellor users who reset from the parent entry point are shown a clear action to continue to `counsellor.html`.
- Browser code still does not directly insert/upsert `profiles`, and normal UI does not expose email, Supabase UUIDs, tokens, or secrets.

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
- Supabase `email_confirmed_at` or `confirmed_at` is required before app access.
- The same `parent_id` is reused for the same Supabase auth user.
- No duplicate `profiles` rows are created.
- Resend verification email works and returns non-enumerating messages.
