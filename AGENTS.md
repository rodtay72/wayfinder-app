# AGENTS.md — Wayfinder App Operating Rules

## Mission

Wayfinder is a privacy-safe, modular parent-child reflection app.

The app must always remain deployable and working. Partners may improve visuals, content, UX, and functional features, but every change must preserve authentication, privacy, dashboard data loading, and existing user records.

## Must Read Before Editing

Before making code changes, read:

- docs/app-architecture-navigation-review.md
- docs/auth-profile-flow.md
- docs/partner-collaboration-and-deployment-rules.md
- docs/profile-cleanup.sql

## Core Architecture Rules

Stable identity chain:

Supabase auth user -> profiles.parent_id / Wayfinder ID -> dyads.child_id -> journal_entries

Use:
- Supabase user_id only as technical auth identity.
- parent_id / Wayfinder ID as the app identity.
- child_id as child identity.
- Dashboard data should load by parent_id first.

## Auth/Profile Rules

Required:
1. User signs up/signs in with Supabase email/password.
2. Email must be verified before app access.
3. Profile creation/retrieval goes through ensure_profile.
4. ensure_profile is called via explicit /rest/v1/rpc/ensure_profile fetch.
5. Request must send Authorization: Bearer <access_token>.
6. Browser code must never directly insert/upsert into profiles.

Never add browser-side:
profiles.insert
profiles.upsert

## Dashboard Read Rules

Dashboard reads are protected by Supabase RLS.

For dyads and journal_entries:
1. Use the verified callback auth session where available.
2. Send explicit Authorization: Bearer <access_token> for protected reads.
3. Load by parent_id first.
4. Use user_id only as fallback.
5. Do not rely only on sb.auth.getSession(), because in this static app it may return no session after the auth callback.

Expected working reads:
DB.getAllDyads(user.id, profile.parent_id, authSession)
DB.getEntries(user.id, profile.parent_id, authSession)

## PDPA / Privacy Rules

Normal user-facing UI must not show:
- parent email
- Supabase UUID
- child names
- JWTs
- refresh tokens
- anon keys
- service keys
- raw auth identifiers

Normal user-facing UI may show:
- generated Parent ID / Wayfinder ID
- generated Child ID
- parent age
- parent gender
- child age
- child gender
- role
- non-identifying activity/reflection content

Debug UI may show technical IDs only when hidden behind:
localStorage.getItem('wayfinder_debug_auth') === '1'

Never show tokens or secrets, even in debug UI.

## Date/Time Rules

Any value written to Supabase timestamp/timestamptz columns must use ISO format:
new Date().toISOString()

Never write locale strings such as:
28/05/2026, 00:23:02

Locale formatting is allowed only for display.

## Dashboard Must Keep Working

After verified login, Dashboard must show:
- Parent ID / Wayfinder ID
- role
- parent age/gender if available
- Past activities
- DISC insight if available
- Your children
- Child ID
- child age/gender
- recent reflections
- My journal trail
- This week, lean into

If no records exist, show friendly empty states. Do not break the Dashboard just because one data fetch fails.

## Modular Collaboration Rules

Low-risk edits:
- styles.css
- content.js
- docs
- UI-only layout sections in app.js

Medium-risk edits:
- dashboard widgets
- journal views
- activity history views
- read-only DB display methods

High-risk edits requiring extra review:
- supabase.js
- SQL/RLS files
- auth/profile logic
- ensure_profile
- email verification gate
- Parent ID / Child ID generation
- data writes/deletes
- Vercel/Supabase config

## Required Checks Before Commit

Run:
git diff --check
node --check supabase.js

Also search:
Select-String -Path .\*.js -SimpleMatch -Pattern "profiles.insert","profiles.upsert","ensure_profile","Authorization"

Confirm:
- no browser-side profiles.insert
- no browser-side profiles.upsert
- ensure_profile still uses explicit Bearer fetch
- dashboard reads still use verified session / Bearer token
- normal UI does not show parent email, Supabase UUID, child names, or tokens

## Manual Smoke Test

Before deploying or after Vercel deploys:
1. Verified user can log in.
2. Dashboard appears.
3. Same Parent ID is reused.
4. Child ID appears if records exist.
5. Past activities appear if records exist.
6. Recent reflections appear.
7. Sign out works.
8. Unverified email is blocked.
9. No parent email appears in normal UI.
10. No Supabase UUID appears in normal UI.
11. Incognito and normal browser show the same dashboard records.

Useful console checks:
await DB.getAllDyads("USER_ID", "PARENT_ID")
await DB.getEntries("USER_ID", "PARENT_ID")

Expected:
- dyads return existing child records
- entries return existing journal records

## Commit Rule

Do not commit if the app is knowingly broken.

If a check fails, stop and report:
- what failed
- suspected cause
- proposed fix
