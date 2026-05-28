# Auth And Profile Flow

This document describes the current Wayfinder auth/profile flow. The key rule is:

Browser code must never directly insert or upsert rows in `profiles`.

## Flow

1. A user signs up with Supabase email/password auth.
2. The user must verify their email before app access.
3. `app.js` listens to Supabase auth state changes.
4. Profile setup only runs after all of these are true:
   - Auth event is `SIGNED_IN`, `INITIAL_SESSION`, or `TOKEN_REFRESHED`
   - `session` exists
   - `session.access_token` exists
   - `session.user` exists
   - Email is verified via `session.user.email_confirmed_at` or `session.user.confirmed_at`
5. `app.js` calls `Profile.getOrCreate(userId, role, session)`.
6. `supabase.js` validates the session and confirms the session user id matches the requested user id.
7. `supabase.js` calls `ensure_profile` via `fetch` with an explicit `Authorization: Bearer <JWT>` header.
8. Supabase RPC `ensure_profile` uses `auth.uid()` as the source of truth.
9. `ensure_profile` returns the existing profile first and inserts only if no row exists.
10. Browser code must never directly insert/upsert `profiles`.

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
- Verified email is required before app access.
- The same `parent_id` is reused for the same Supabase auth user.
- No duplicate `profiles` rows are created.
