# Wayfinder App Architecture And Navigation Review

## Scope

This review covers the current static Wayfinder app in this repo:

- `index.html`
- `counsellor.html`
- `app.js`
- `supabase.js`
- `content.js`
- `styles.css`
- `api/*.js`
- `supabase-schema.sql`
- `supabase-profiles.sql`
- `supabase-add-role.sql`
- `README.md`
- `SETUP.md`
- `docs/auth-profile-flow.md`
- `docs/profile-cleanup.sql`

The working tree currently has local modifications in `app.js` and `supabase.js`. This report describes the current local code, not only the last committed state.

## Current Architecture Summary

Wayfinder is a static React app loaded directly in the browser. It does not use a bundler or Next.js. JSX is compiled in the browser by Babel.

The two browser entry points are:

- `index.html`: parent portal. Sets `PORTAL_ROLE = 'parent'`.
- `counsellor.html`: counsellor portal. Sets `PORTAL_ROLE = 'counsellor'`.

Both pages load the same files in this order:

1. `styles.css`
2. React UMD
3. ReactDOM UMD
4. Babel standalone
5. Supabase JS v2
6. `content.js`
7. `images.js`
8. `supabase.js`
9. `app.js`

`app.js` contains nearly all UI, navigation, and flow logic. `content.js` contains copy, activity lists, phases, markers, value words, child needs, culture notes, and reusable UI text. `supabase.js` contains auth, profile, dyad, journal entry, and review persistence helpers.

Vercel is used for deployment. The `api/` directory contains serverless functions for AI-assisted DISC insight, DISC image extraction, and counsellor analysis. Secrets for those AI calls are expected to live in Vercel environment variables.

## Modular Collaboration Structure

Wayfinder was intentionally built as a static modular app so business partners, content collaborators, visual collaborators, and developers can work in separate areas without accidentally breaking auth/profile/data behavior.

### Safe Content Edit Files

- `content.js`
  - Primary file for partner-editable content.
  - Contains brand copy, phase names, 52-day activity lists, reflection marker labels, CAB field labels, DISC/value words, shift guidance, child needs, culture notes, and reusable UI text.
  - This should remain the first place to change wording, activity titles, marker text, and guidance copy.

- `README.md` and `SETUP.md`
  - Partner/developer onboarding documentation.
  - Safe to improve for clarity, as long as security-sensitive instructions are not weakened.

### Safe Visual Edit Files

- `styles.css`
  - Primary file for theme, spacing, card styles, responsive layout, typography, buttons, chips, tabs, and counsellor UI styling.
  - Visual collaborators should prefer changing CSS variables and class styles here instead of adding large inline style blocks in `app.js`.

- `images.js`, `parent-hero.jpg`, `login-hero.jpg`, `favicon.ico`
  - Visual assets and static images.
  - Safe for brand/visual collaborators if filenames and references are preserved or updated carefully.

### Core UI Logic Files

- `app.js`
  - Main React component and navigation logic.
  - Contains auth rendering branches, Dashboard, child setup, journaling, journal trail, DISC UI, counsellor workspace, and shared UI helpers.
  - Collaborators can enhance UI sections here, but changes should be reviewed when they affect navigation state, privacy masking, profile loading, saves, or Supabase calls.
  - UI sections should stay easy to identify and improve.

### Data/Auth API Layer

- `supabase.js`
  - Data/auth API boundary for the browser app.
  - Owns Supabase client creation, auth helpers, profile helpers, dyad helpers, journal entry helpers, and review helpers.
  - Should not contain visual rendering code.
  - Any changes here require developer review because this file controls identity, persistence, RLS interactions, and privacy boundaries.

### Database And Security References

- `supabase-profiles.sql`
  - Defines `profiles`, profile uniqueness, RLS policy, and `ensure_profile`.
  - Security-sensitive.

- `supabase-schema.sql`
  - Defines dyads, journal entries, reviews, and RLS policies.
  - Security-sensitive and should be kept aligned with production DB.

- `supabase-add-role.sql`
  - Role migration helper.
  - Security-sensitive.

- `docs/profile-cleanup.sql`
  - Operational cleanup guidance.
  - Should remain careful, commented, and backup-first.

### Serverless API Files

- `api/disc-insight.js`
- `api/disc-vision.js`
- `api/counsellor-analysis.js`

These are backend/serverless endpoints. They use environment secrets and external AI APIs. They require developer review, especially for privacy, prompt safety, model names, and request payload contents.

## Preserving Modular Boundaries

Recommended boundary rules:

- Keep editable copy, activity lists, and framework constants in `content.js` where practical.
- Keep visual/theme changes in `styles.css` where practical.
- Keep app navigation and UI composition in `app.js`.
- Keep Supabase auth/data access in `supabase.js`.
- Keep database shape, RLS, RPC functions, and constraints in SQL files.
- Do not mix visual code into `supabase.js`.
- Do not put auth/profile creation logic into UI-only components.
- Do not put partner-editable content directly into security-sensitive helpers unless required.
- When adding a new UI section, prefer a small named component/function in `app.js` and styles in `styles.css`.

## Major Components And Functions

### Browser App Shell

- `App`
  - Owns auth state, profile state, auth readiness, profile errors, and the profile loading guard.
  - Subscribes to Supabase auth state changes.
  - Applies email verification gating.
  - Routes to `AuthScreen`, loading states, wrong-portal screen, `ClientApp`, or `CounsellorApp`.

- `AuthScreen`
  - Handles sign in and sign up.
  - Shows resend verification email option when passed an unverified-email message.
  - Does not directly call the profile flow after sign in; auth state change is the source of truth.

- `AuthDebugPanel`
  - Shows internal auth/profile state only when `wayfinder_debug_auth` is set.
  - Shows technical user id in debug context only.

- `ProfileSettings`
  - Shows Wayfinder ID, role, parent age, and parent gender.
  - Does not show signed-in email or Supabase user id in normal UI.

### Parent Flow

- `ClientApp`
  - Main logged-in parent experience.
  - Owns Dashboard state, dyads, selected dyad, journal entries, DISC insight state, DISC bar state, and local stage transitions.
  - Stages:
    - `loading`
    - `dashboard`
    - `selectChild`
    - `register`
    - `trail`
    - `journal`
    - `done`

- `RegisterDyad`
  - One-time or additional child setup.
  - Captures generated child id, parent birthdate, child birthdate, parent gender, child gender, optional DISC blend, and culture.
  - Saves through `DB.saveDyad`.

- `ClientJournal`
  - Parent activity journaling flow.
  - First stage captures phase, activity, and CAB reflection fields.
  - Review stage computes automatic stance/value words, asks awareness marker questions, and saves a journal entry through `DB.saveEntry`.

- `JournalTrail`
  - Fetches entries for the current user via `DB.getEntries`.
  - Shows emotional patterns, marker summaries, and past entries.

- `DISCImageUpload`, `DISCIntensityChart`, `discDescriptor`
  - Support DISC blend/profile insight UI.
  - Uses `/api/disc-vision` for uploaded DISC chart extraction.
  - Uses `/api/disc-insight` from `ClientApp.loadDashboard` for parent-facing insight.

### Counsellor Flow

- `CounsellorApp`
  - Fetches all journal entries through `DB.getAllEntries`.
  - Builds per-entry AI flags through `/api/counsellor-analysis`.
  - Builds longitudinal summaries grouped by `parentId`.
  - Lists parent reflections and opens `CounsellorReview`.

- `CounsellorReview`
  - Provides tabs for review, AI analysis, congruence, DISC shift, congruent response, stance, gap, and narrative.
  - Saves counsellor review data through `DB.saveReview`.

## Current Navigation Map

### Parent Portal

1. User opens `index.html`.
2. `App` waits for Supabase auth state readiness.
3. If no verified authenticated user exists, `AuthScreen` renders.
4. User signs up or signs in.
5. Signup without an immediate session shows: "Check your email to confirm your account, then sign in."
6. Auth state change receives `SIGNED_IN`, `INITIAL_SESSION`, or `TOKEN_REFRESHED`.
7. `App` requires:
   - `session`
   - `session.access_token`
   - `session.user`
   - verified email via `email_confirmed_at` or `confirmed_at`
8. If email is unverified:
   - profile setup is blocked
   - user/profile state is cleared
   - a verification message is shown
   - `Auth.signOut()` is called
9. If email is verified:
   - `Profile.getOrCreate(session.user.id, role, session)` runs
   - the returned profile provides `parent_id` and `role`
10. Wrong portal role shows a wrong-portal screen.
11. Parent role renders `ClientApp`.
12. `ClientApp` loads:
   - all dyads/children
   - extended profile fields
   - journal entries
13. Dashboard renders.
14. From Dashboard:
   - `+ New child` goes to `RegisterDyad`
   - `Start new activity` goes to `ClientJournal` directly if one child exists, or `selectChild` if multiple children exist
   - `My journal trail` goes to `JournalTrail`
15. Saving a journal entry goes to `done`, then the user can return to Dashboard or journal another entry.

### Counsellor Portal

1. User opens `counsellor.html`.
2. Same auth/profile gate runs, but with `PORTAL_ROLE = 'counsellor'`.
3. Profile role must be `counsellor`.
4. `CounsellorApp` renders.
5. Counsellor sees all entries returned by `DB.getAllEntries`.
6. Counsellor can open an entry in `CounsellorReview`.
7. Counsellor review notes are stored in `reviews`.

## Auth And Profile Flow

Auth is centralized in `supabase.js` under `Auth`:

- `signUp(email, password)`: Supabase email/password signup.
- `signIn(email, password)`: Supabase password login.
- `resendVerification(email)`: Supabase signup verification resend.
- `signOut()`: Supabase sign out.
- `getSession()`: Supabase session read.
- `onAuthChange(cb)`: Supabase `onAuthStateChange` subscription.

Profile setup is intentionally not driven by browser localStorage. The intended stable identity key is Supabase `auth.users.id`.

Profile flow:

1. `App` receives a valid auth callback session.
2. `App` verifies event type, session, access token, user, and email verification.
3. `App` uses `profileLoadRef` to avoid duplicate `Profile.getOrCreate` calls for the same user.
4. `Profile.getOrCreate(userId, role, session)` validates the provided session.
5. `Profile.waitForSession` confirms:
   - session exists
   - access token exists
   - session user id matches requested user id
6. `Profile.getOrCreate` calls:
   - `POST ${SUPABASE_URL}/rest/v1/rpc/ensure_profile`
   - headers include `apikey` and explicit `Authorization: Bearer <JWT>`
7. SQL function `ensure_profile(p_role text)` uses `auth.uid()` as the source of truth.
8. If a profile exists for `auth.uid()`, it returns existing `parent_id` and `role`.
9. If missing, it inserts a new profile row.
10. On unique conflicts, it re-fetches the existing row.

`supabase-profiles.sql` defines:

- `profiles.user_id uuid primary key references auth.users(id)`
- `profiles.parent_id text unique not null`
- `profiles.role text not null default 'parent'`
- unique indexes on `user_id` and `parent_id`
- RLS policy for users managing their own profile
- `ensure_profile` as `security definer`
- execute grant to `authenticated`

## Existing Dashboard Data Flow

`ClientApp.loadDashboard` currently loads:

- `DB.getAllDyads(user.id)` into `dyads`
- `Profile.getExtended(user.id)` into profile-derived DISC fields
- `DB.getEntries(user.id)` into `entries`

The Dashboard uses:

- `dyads` to render children and select a primary DISC dyad.
- `entries` to render Past activities and child recent reflections.
- `discBars`, dyad `disc`, cached profile insight, and entry count/date to render DISC insight.

Current Dashboard sections:

- Header/banner:
  - Welcome back
  - shows generated Parent ID / Wayfinder ID
  - Wayfinder ID
  - role
  - `+ New child`
  - `Start new activity`
  - `Sign out`

- Profile card:
  - Wayfinder ID
  - role
  - parent age
  - parent gender
  - does not show Supabase id in normal card

- Past activities:
  - uses `entries`, sorted by timestamp/submittedAt/date/created_at.
  - shows activity title, date, phase when available, and Child ID.

- DISC section:
  - uses the first dyad with a DISC blend, or first dyad.
  - shows DISC descriptor, generated/cached insight, intensity chart, and upload/manual input.

- Your children:
  - lists dyads.
  - shows Child ID, child gender, child age.
  - links child recent reflections by child id.
  - includes `+ New entry`.

- My journal trail:
  - opens `JournalTrail`.

- This week, lean into:
  - uses `SHIFT_WORDS.raiseIS` and `CHILD_NEEDS_WORDS`.

## Database Relationships

### `profiles`

Purpose: one stable Wayfinder profile per Supabase auth user.

Key columns:

- `user_id`: Supabase auth user id. Primary stable key.
- `parent_id`: generated Wayfinder ID, e.g. `P-ABCDE`. Unique.
- `role`: `parent` or `counsellor`.
- `created_at`.

Creation path:

- Only through SQL RPC `ensure_profile`.
- Browser must not directly insert/upsert `profiles`.

### `dyads`

Purpose: parent-child configuration.

Schema in `supabase-schema.sql`:

- `user_id uuid`
- `parent_id text`
- `data jsonb`
- `created_at`
- primary key currently shown as `(user_id, parent_id)`

Current browser code also writes:

- `child_id: dyad.childId`
- `upsert(..., { onConflict: 'user_id,child_id' })`

Risk: SQL schema and browser write expectations are not fully aligned unless production DB has a `child_id` column and matching unique constraint. The checked-in `supabase-schema.sql` does not show `child_id` in `dyads`, but `supabase.js` expects it.

Dyad JSON usually contains:

- `childId`
- `parentDob`
- `childDob`
- `parentGender`
- `childGender`
- `disc`
- `ethnicity`

### `journal_entries`

Purpose: parent reflection entries.

Schema in `supabase-schema.sql`:

- `id bigint primary key`
- `user_id uuid`
- `parent_id text`
- `data jsonb`
- `created_at`

Entry JSON from `ClientJournal.finalSubmit` includes:

- `id`
- `parentId`
- `childId`
- `date`
- `phase`
- `activity`
- `cab`
- `autoWords`
- `markers`
- `disc`
- `ethnicity`
- `childDob`
- `parentDob`
- `parentGender`
- `childGender`
- `submittedAt`

Current entries are linked by:

- row `user_id`
- row `parent_id`
- JSON `parentId`
- JSON `childId`
- row `id`
- JSON `id`

There is no checked-in `child_id` or `dyad_id` column for `journal_entries`; child linkage is primarily inside `data.childId`.

### `reviews`

Purpose: counsellor notes per entry.

Schema:

- `entry_id bigint primary key`
- `user_id uuid`
- `data jsonb`
- `created_at`

Current review lookup uses:

- `user_id`
- `entry_id`

Risk: counsellor users saving a review against a parent's entry may not match the parent entry's `user_id`. If RLS requires `auth.uid() = user_id`, counsellor review persistence may not work unless production policies differ.

## Existing DB/Auth/Profile Methods

### `Auth`

- `signUp`: Supabase signup.
- `signIn`: Supabase email/password login.
- `resendVerification`: sends Supabase signup verification email.
- `signOut`: signs out.
- `getSession`: reads current Supabase session.
- `onAuthChange`: subscribes to auth state changes.

### `Profile`

- `get(userId)`: direct select from `profiles`, oldest row. Diagnostic/legacy helper.
- `getExtended(userId)`: select profile metadata including DISC image/url/bar/insight cache fields.
- `waitForSession(userId, providedSession)`: validates callback session or retries `getSession`.
- `getOrCreate(userId, role, session)`: validates session and calls `ensure_profile` via explicit authenticated fetch.
- `saveDiscBars(userId, bars)`: updates `profiles.disc_bars`.
- `saveDiscImageUrl(userId, url)`: updates `profiles.disc_image_url`.
- `saveInsight(userId, text, entryCount, latestEntryAt)`: updates cached profile insight metadata.

### `DB`

- `getAllDyads(userId)`: reads dyads for current user and returns JSON data. Current local code also restores `childId` from row `child_id`.
- `getDyad(userId, childId)`: reads one dyad by `user_id` and `child_id`.
- `saveDyad(userId, parentId, dyad)`: upserts dyad row using `user_id`, `parent_id`, `child_id`, and JSON data.
- `getEntries(userId)`: reads current user's `journal_entries`. Current local code selects row id, parent_id, data, and created_at, then merges them into returned entry objects.
- `getAllEntries()`: reads all `journal_entries`. Used by counsellor flow.
- `saveEntry(userId, entry)`: inserts journal entry row with row id, user id, parent id, and JSON data.
- `getReview(userId, entryId)`: reads one counsellor review by `user_id` and `entry_id`.
- `saveReview(userId, entryId, review)`: upserts review row.

## Previous Dashboard And History Logic

Past activities and child journal entries were designed to come from `journal_entries.data` after `DB.getEntries(user.id)`.

Linkage:

- The parent Dashboard fetches entries by `user_id`.
- Past activities render from all fetched entries.
- Child recent reflections filter entries by `entry.childId === child.childId`.
- `parent_id` ties records to the generated Wayfinder ID.
- `child_id` is used as a row-level dyad identifier in the current browser code, but journal entries store child linkage primarily as JSON `childId`.

The Dashboard was designed as the parent home screen after profile load, not as a separate marketing/welcome page. It should remain reachable even with zero dyads or zero entries.

## Privacy And PDPA Findings

### Normal User-Facing UI Must Not Show

Per the stated privacy rule, normal parent UI must not show:

- parent email
- Supabase user UUID
- raw auth identifiers
- tokens
- child names
- directly identifying parent/child information

### Current Findings

- `AuthDebugPanel` shows Supabase user id only behind `wayfinder_debug_auth`. This is acceptable because it is debug/internal and not enabled by default.
- `ProfileSettings` no longer shows Supabase user id in normal UI.
- `ProfileSettings` does not show signed-in email in normal UI.
- Dashboard header uses the generated Parent ID / Wayfinder ID instead of signed-in email.
- `AuthScreen` necessarily collects email for auth. That is acceptable for auth UI, but the logged-in app should not continue displaying it.
- `ClientJournal` and `JournalTrail` show user-entered reflections. This appears intended by app design, but the UI should continue warning/structuring around no names if needed.
- `RegisterDyad` says "No names - codes only" and uses generated child IDs rather than names.
- Counsellor views show Parent ID, Child ID, ages, activity titles, and journal content. That appears intentional for counsellor workflow, but access control should be verified.
- No JWTs or refresh tokens are visibly rendered.
- Debug logs are behind `AuthDebug`, but real `console.error` logs may include error bodies. They should never include raw tokens.

### Privacy-Compliant Display Target

Normal logged-in parent UI should show:

- Parent ID / Wayfinder ID
- role
- parent age
- parent gender
- Child ID
- child age
- child gender
- activity titles
- journal/reflection content intended by the user

Normal logged-in parent UI should not show:

- email
- Supabase UUID
- raw auth/session identifiers
- tokens

## Current Bugs And Risks

1. Header must remain free of email and raw auth identifiers.
   - File/function: `app.js`, `ClientApp`, Dashboard branch.
   - Current target: show generated Parent ID / Wayfinder ID instead.

2. Profile card must remain free of email and raw auth identifiers.
   - File/function: `app.js`, `ProfileSettings`.
   - Current target: show Wayfinder ID, role, parent age, and parent gender only.

3. `Landing` still calls `ProfileSettings` with an old `onSignOut` prop.
   - File/function: `app.js`, `Landing`.
   - Impact is low because parent flow currently routes directly to `ClientApp`, but the old usage is stale.

4. `dyads` SQL schema and browser code appear mismatched.
   - Files/functions: `supabase-schema.sql`, `supabase.js` `DB.getAllDyads`, `DB.getDyad`, `DB.saveDyad`.
   - Browser expects `dyads.child_id` and `onConflict: 'user_id,child_id'`.
   - Checked-in schema only defines primary key `(user_id, parent_id)` and no `child_id`.
   - Risk: save/load failures or hidden children if production schema differs from repo schema.

5. `journal_entries` child linkage is JSON-only in checked-in schema.
   - File/function: `ClientJournal.finalSubmit`, `DB.getEntries`, Dashboard child filtering.
   - Risk: if older rows use `child_id` or `dyad_id` outside JSON, Dashboard may hide them unless read normalization includes those columns.

6. Counsellor `DB.getAllEntries` reads all rows.
   - File/function: `supabase.js`, `CounsellorApp`.
   - Risk: with strict RLS, counsellor may see no parent entries; with broad RLS, counsellor access must be intentionally controlled.

7. Counsellor review persistence uses counsellor `user.id`.
   - File/function: `CounsellorReview`, `DB.getReview`, `DB.saveReview`.
   - Risk: review rows are keyed to counsellor user id, not parent user id. That may be intended, but it should be documented and supported by RLS.

8. `App` clears legacy localStorage keys after verified login.
   - File/function: `app.js`, auth callback.
   - This supports the "browser storage is cache only" direction, but it also means any old local-only data is removed after login.

9. Dashboard has multiple entry points to start activity.
   - Header always shows `Start new activity`.
   - Empty Past activities also shows `Start new activity`.
   - This is probably acceptable when empty, but duplicate primary actions should be minimized when entries exist.

10. Production logs are mostly quiet, but errors remain.
   - Expected and useful for real failures.
   - Verbose auth/profile logs are behind `AuthDebug`.

## Recommended Fixes

### Minimal UI/Privacy Fixes

Edit `app.js` only:

1. In `ClientApp` Dashboard header:
   - Use a non-identifying heading such as `Parent P-00001`.
   - Keep `Welcome back`.
   - Keep Wayfinder ID and role.

2. In `ProfileSettings`:
   - Keep Wayfinder ID, role, parent age, parent gender.
   - Do not show Supabase user id.
   - Do not show signed-in email.

3. Keep Supabase user id only in `AuthDebugPanel`.
   - Gate it with `localStorage.setItem('wayfinder_debug_auth', '1')`.
   - Do not show tokens.

4. Past activities:
   - Keep Child ID, date, phase, and activity title.
   - Do not use child names.
   - Avoid duplicate `Start new activity` inside the section when entries exist.

5. Child cards:
   - Show Child ID, age, gender.
   - Keep recent reflections.
   - Keep `+ New entry`.

### Data Visibility Fixes

Edit `supabase.js` carefully if production schema supports row-level `child_id`:

1. Consider selecting `child_id` in `journal_entries` only if the DB has such a column.
2. If not, keep JSON-based child linkage as source of truth for entries.
3. Keep merged row metadata (`id`, `parent_id`, `created_at`) so older records have stable display/sort values.

### Schema Documentation Fixes

Edit SQL/docs, not browser auth flow:

1. Update `supabase-schema.sql` to match current dyad browser code if production has evolved:
   - add `child_id text not null`
   - add unique or primary key on `(user_id, child_id)`
   - keep `parent_id`
2. If production intentionally differs, document that production schema is newer than `supabase-schema.sql`.

### Auth/Profile Safety Rules

Do not change unless a specific bug requires it:

- Keep `ensure_profile`.
- Keep explicit `Authorization: Bearer <JWT>` fetch.
- Do not reintroduce browser-side `profiles.insert` or `profiles.upsert`.
- Keep email verification gate before profile creation.
- Keep `profileLoadRef` guard.

## Partner Collaboration Guidance

### Safe For Content Collaborators

Content collaborators can usually edit:

- `content.js`
- copy-only sections of `README.md`
- copy-only sections of `SETUP.md`
- partner-facing docs in `docs/`

They should avoid changing JavaScript control flow, Supabase calls, SQL, auth checks, or API routes.

### Safe For Visual Collaborators

Visual collaborators can usually edit:

- `styles.css`
- image assets
- simple static markup or layout inside clearly identified UI sections of `app.js`, with developer review before deployment

Preferred visual workflow:

1. Change CSS variables/classes in `styles.css`.
2. Reuse existing classes like `card`, `banner`, `btn`, `switch`, `grid2`, `sub`, `chips`, and `entry-row`.
3. Avoid changing `App`, `Profile.getOrCreate`, `DB.*`, or SQL files for visual-only work.

### Requires Developer Or Security Review

These files and areas require review:

- `supabase.js`
- `supabase-profiles.sql`
- `supabase-schema.sql`
- `supabase-add-role.sql`
- `api/*.js`
- auth state handling in `App`
- profile creation/loading logic
- RLS policies
- debug logging
- any display of identifiers or journal content
- any change to what counsellors can see

### Do Not Change Without Explicit Approval

Do not change these working invariants:

- Auth/profile RPC flow.
- `ensure_profile`.
- Email verification gate before app/profile access.
- Explicit `Authorization: Bearer <JWT>` fetch for `ensure_profile`.
- PDPA privacy masking rules.
- Generated Parent ID / Wayfinder ID rule.
- Generated Child ID rule.
- No parent or child names in normal UI.
- No browser-side `profiles.insert`.
- No browser-side `profiles.upsert`.
- No JWTs, refresh tokens, anon keys, service keys, or secrets in visible UI or console logs.

## Recommended Modularization Improvements

Keep this app static and easy to edit. Do not convert it to a new framework just to improve organization.

Small useful refactors:

1. Split Dashboard rendering into clearer component functions inside `app.js`.
   - Example: `DashboardHeader`, `ProfileCard`, `PastActivities`, `DiscInsightCard`, `ChildrenSection`, `WeeklyGuidance`.
   - This would make visual collaboration safer without changing architecture.

2. Move repeated display helpers into a small helper section in `app.js`.
   - Example: date formatting, entry title, entry child id, entry sorting, age labels.

3. Centralize privacy display helpers.
   - Example: `displayParentId(profile)`, `displayChildId(child)`, `displayAge(dob, at)`.
   - Avoid ad hoc email/user-id rendering in UI sections.

4. Keep activity/entry normalization centralized.
   - Current local code has helper functions in `ClientApp`.
   - If reused by `JournalTrail` and counsellor views, consider moving them to a shared helper area in `app.js`.

5. Document safe edit zones with comments.
   - Add short comments around partner-safe UI sections and security-sensitive sections.
   - Keep comments brief and practical.

6. Keep `content.js` as the content contract.
   - When adding new labels or text-heavy UI, place reusable strings in `content.js` where reasonable.

Avoid over-engineering:

- Do not introduce a build system unless the team explicitly wants that.
- Do not migrate to Next.js or another framework as part of Dashboard cleanup.
- Do not split files so aggressively that non-technical collaborators lose the simple edit path.
- Do not move Supabase persistence into UI components.

## Exact Files And Functions That Need Editing

For the next minimal code-change pass:

- `app.js`
  - `ProfileSettings`
    - remove email from normal card
    - keep Parent/Wayfinder ID, role, parent age, parent gender
  - `ClientApp` Dashboard branch
    - remove email from header H1
    - ensure only useful action buttons render
    - keep past activity and child recent-reflection rendering
  - `Landing`
    - update stale `ProfileSettings` usage if this component remains reachable

- `supabase.js`
  - no auth/profile RPC changes needed
  - only consider read normalization changes if records are still hidden

- `supabase-schema.sql`
  - reconcile checked-in `dyads` schema with browser code expectations

## Proposed Minimal Code-Change Plan

1. Preserve auth/profile flow exactly as-is.
2. Remove email from logged-in Dashboard header.
3. Remove email from `ProfileSettings`.
4. Keep Supabase UUID only in `AuthDebugPanel`.
5. Keep Dashboard as the first post-login parent screen.
6. Keep prior Dashboard sections:
   - header
   - profile/identity card
   - past activities
   - DISC blend/insight
   - children
   - recent reflections
   - journal trail
   - weekly guidance
7. Ensure Past activities renders existing `entries` and only shows empty state when `entries.length === 0`.
8. Ensure child recent reflections link by generated Child ID.
9. Avoid duplicate `Start new activity` buttons when past activity data exists.
10. Run:
    - `git diff --check`
    - `node --check supabase.js`
    - search for browser-side `profiles.insert` / `profiles.upsert`
    - confirm `/rest/v1/rpc/ensure_profile` explicit Authorization fetch remains
