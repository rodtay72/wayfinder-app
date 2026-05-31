# Current State of Wayfinder

Last inspected: 2026-05-31
Inspection scope: local repository only. Live Supabase schema, live RLS state, Vercel environment variables, and deployed runtime behavior were not directly queried.

## 1. Product and clinical model

### What Wayfinder does today

Wayfinder is a privacy-safe parent-child reflection app with two browser entry points:

- Parent portal: `index.html`
- Counsellor portal: `counsellor.html`

The parent portal lets a verified parent:

- sign up or sign in through Supabase email/password auth
- get or reuse a generated Parent ID / Wayfinder ID
- create one or more child dyads using generated Child IDs
- choose a 52-day ALIGN activity
- write a CAB reflection: Cognition, Affect, Behaviour, Meaning
- receive local reflective words inferred from the CAB text
- mark congruence/self-awareness markers
- save journal entries
- view dashboard summaries, children, past activities, recent reflections, journal trail, and DISC insight
- upload or manually enter DISC bar values

The counsellor portal lets a verified counsellor-role user:

- sign in through the separate counsellor entry point
- read journal entries if the required RLS policy has been installed
- view parent/child coded records
- request AI-assisted single-entry and longitudinal analyses
- write private review notes into `reviews`
- use structured tabs for congruence, DISC shift, Satir congruent response, stance, gap, and narrative

### Parent problem addressed

The product is aimed at parents who may feel stuck repeating instructions, correcting, over-functioning, or losing emotional connection with a child. The app positions the primary work as parent noticing, self-awareness, emotional regulation, and congruent presence so the child experiences a calmer, safer adult.

The current code frames change as parent growth first, not child correction first.

### How DISC is used

DISC appears in several layers:

- Parent setup captures optional `disc` blend per dyad.
- `discDescriptor()` in `app.js` gives parent-facing blend descriptions and growth edges.
- `DISCIntensityChart()` displays D/I/S/C bar heights and labels high D/C as "soften" and low I/S as "support".
- `DISCImageUpload()` calls `/api/disc-vision` to extract D/I/S/C bar heights from an uploaded DISC image.
- `Profile.saveDiscBars()` stores extracted or manually entered bars on `profiles.disc_bars`.
- `/api/disc-insight` uses Anthropic to generate a short parent-facing reflection based on DISC, child age, child gender, and entry count.
- `analyzeCAB()` in `app.js` uses keyword matching to infer local value words from CAB text, roughly mapped to DISC quadrants.
- Counsellor analysis prompts use DISC to interpret behavioural intensity, pacing, and developmental fit.

DISC is currently used as a reflective lens, not as diagnosis.

### How CAB is used

CAB means:

- Cognition: thoughts
- Affect: feelings
- Behaviour: actions
- Meaning: interpretation made by the parent

CAB is central to the parent journal flow:

- `ClientJournal` requires an activity and at least one CAB field before moving to reflection.
- CAB text is saved inside `journal_entries.data.cab`.
- `analyzeCAB()` scans CAB text to generate reflective value words.
- Journal trail and counsellor review display the CAB fields.
- `/api/counsellor-analysis` explicitly performs CAB congruence analysis.
- Counsellor review tabs let the counsellor annotate moments across cognitive, affective, and behavioural dimensions.

### Satir, coping, and congruence lenses

These lenses are present in code and prompts:

- `app.js` defines `SATIR` descriptions for Blaming, Super-reasonable, Placating, Distracting, and Congruent.
- `app.js` maps DISC quadrants to possible Satir coping stances:
  - D -> Blaming
  - C -> Super-reasonable
  - S -> Placating
  - I -> Distracting
- Counsellor review includes tabs for "Congruence", "Congruent Response", "Stance", and "Gap & Narrative".
- `/api/counsellor-analysis` asks the model to identify possible Satir coping patterns without treating them as fixed labels.
- Parent-facing `/api/disc-insight` mentions congruence but explicitly says not to use Satir terms.

### Generic AI reflection

The AI currently provides:

- Parent-facing DISC insight in `/api/disc-insight`.
- DISC image extraction in `/api/disc-vision`.
- Counsellor-facing single-entry analysis in `/api/counsellor-analysis` with `mode: "entry"`.
- Counsellor-facing longitudinal synthesis in `/api/counsellor-analysis` with `mode: "longitudinal"`.

Local, non-AI reflection includes:

- keyword-based `analyzeCAB()`
- dashboard summaries
- journal trail pattern counts
- counsellor stance scoring
- generated counsellor narrative in `buildNarrative()`

### Counsellor or therapist-facing parts

Counsellor-facing parts:

- `counsellor.html`
- `CounsellorApp`
- `CounsellorReview`
- `DB.getAllEntries()`
- `DB.getReview()`
- `DB.saveReview()`
- `/api/counsellor-analysis`
- `reviews` table
- `supabase-counsellor-rls.sql`

Therapist-facing/request parts:

- The parent "Ask the therapist for any clarifications" button currently shows an alert saying the feature is coming soon.
- No therapist request table or complete request workflow was found in the repo.

### Parts that require therapist vetting

The following require therapist or clinical-owner vetting before being treated as approved clinical practice:

- exact DISC/CAB/Satir language and boundaries
- `analyzeCAB()` keyword mapping
- `discDescriptor()` growth-edge language
- `/api/disc-insight` parent-facing prompt and outputs
- `/api/counsellor-analysis` system prompt and output schema
- counsellor review tabs and stance heuristics
- generated client narrative from `buildNarrative()`
- any future therapist request flow
- any GenAI workflow that moves from reflection into advice, recommendations, or intervention planning

### Current non-negotiables

These are treated as non-negotiable product and clinical boundaries:

- Wayfinder must never diagnose.
- Wayfinder must never replace counselling.
- Parent growth and regulation are the primary target.
- Child behaviour is interpreted through parent regulation and parent-child relational context.
- AI may provide reflection, perspective, pattern noticing, and consequence-awareness.
- AI must not provide behavioural prescriptions.

## 2. Current technical state

### Repository and deployment

| Item | Current state |
|---|---|
| GitHub repo URL | `https://github.com/rodtay72/wayfinder-app.git` |
| Active branch | `main` |
| Production URL | `https://wayfinder-modular.vercel.app` |
| Counsellor URL | `https://wayfinder-modular.vercel.app/counsellor.html` |
| Deployment platform | Vercel |
| App type | Static React UMD app with browser Babel, plus Vercel serverless API functions |
| Build pipeline | No package/build pipeline found |
| GitHub Actions | `.github/workflows/wayfinder-checks.yml` exists |

### App entry points

| Entry point | Responsibility |
|---|---|
| `index.html` | Parent portal. Loads React, ReactDOM, Babel, Supabase JS, `content.js`, `images.js`, `supabase.js`, sets `PORTAL_ROLE = 'parent'`, loads `app.js`, renders `<App/>`. |
| `counsellor.html` | Counsellor portal. Same static app stack, sets `PORTAL_ROLE = 'counsellor'`, renders `<App/>`. |

### Major files and responsibilities

| File or folder | Responsibility |
|---|---|
| `app.js` | Main React app, auth rendering branches, parent dashboard, child setup, journal flow, journal trail, DISC UI, counsellor workspace, counsellor review, local clinical heuristics, local display helpers. |
| `supabase.js` | Supabase client, auth helpers, profile helpers, authenticated REST reads, dyad persistence, journal persistence, review persistence, DISC/profile cache fields. |
| `content.js` | Partner-editable content: brand copy, ALIGN phases, activity lists, markers, CAB labels, value words, shift words, child need words, culture notes, UI text. |
| `images.js` | Currently an empty image export placeholder. `app.js` also contains large embedded base64 image data. |
| `api/disc-insight.js` | Vercel function for parent-facing Anthropic DISC reflection. |
| `api/disc-vision.js` | Vercel function for Anthropic vision extraction of D/I/S/C bar heights. |
| `api/counsellor-analysis.js` | Vercel function for OpenAI counsellor-facing single-entry and longitudinal analysis. |
| `supabase-profiles.sql` | Profiles table, role column, unique indexes, RLS, `ensure_profile` RPC. |
| `supabase-schema.sql` | Base dyads, journal_entries, reviews tables and simple owner-only RLS. May be behind current code expectations. |
| `supabase-counsellor-rls.sql` | Counsellor helper function and read policy for journal entries. Must be run in Supabase for counsellor read access. |
| `supabase-add-role.sql` | Small migration to add `profiles.role`. |
| `docs/*` | Operating rules, architecture review, auth/profile flow, partner/deployment rules, profile cleanup SQL, Codex task template, and this current-state document. |
| `scripts/verify-wayfinder.ps1` | Local verification script for git diff whitespace, `supabase.js` syntax, forbidden profile writes, and required auth/profile patterns. |
| `.github/workflows/wayfinder-checks.yml` | CI on push/PR to `main`: whitespace check, `supabase.js` syntax, profile write rejection, and required auth/profile pattern checks. |

### Current feature status

| Feature | Status | Notes |
|---|---|---|
| Auth | Working | Supabase email/password helpers exist and app gates on auth state. Not live-smoke-tested in this inspection. |
| Verified email | Working | `App` blocks profile setup if `email_confirmed_at` or `confirmed_at` is missing, then signs out. |
| Profile/Parent ID reuse | Working | Parent profile creation uses `ensure_profile`; existing profile is returned before insert. |
| Dashboard | Working | Loads dyads, extended profile, entries with independent try/catch blocks and friendly empty states. |
| Dyads/children | Partially implemented | UI and DB methods support multi-child. Code expects `dyads.child_id` and `user_id,child_id` conflict target; checked-in `supabase-schema.sql` does not define `child_id`. |
| Journal entries | Working | Parent journal writes ISO `submittedAt` and inserts to `journal_entries`; reads normalize row metadata and JSON data. |
| DISC image upload | Partially implemented | UI and `/api/disc-vision` exist. Function requires `ANTHROPIC_VISION_MODEL`; TODO says model must be verified. No rate limiting. |
| AI parent insight | Working | `/api/disc-insight` exists and dashboard caches output in profile fields. Depends on Anthropic env var and profile cache columns existing in live DB. |
| Counsellor portal | Partially implemented | Separate entry point, role check, UI, reads, and reviews exist. Requires SQL RLS helper/policy to be installed and live RLS verified. |
| Counsellor AI analysis | Working | `/api/counsellor-analysis` exists for entry and longitudinal JSON analysis. Depends on `OPENAI_API_KEY`. No rate limiting. |
| Reviews caching | Unknown | `reviews` persistence exists for counsellor notes. "Caching" as a named product feature is not clearly implemented beyond saved review notes and dashboard insight cache. |
| Multi-child | Partially implemented | UI supports multiple dyads and child-specific journalling, but schema mismatch around `dyads.child_id` must be resolved/verified. |
| Therapist request flow | Not implemented | Parent button shows "feature coming soon" alert. No request table found. |
| GenAI therapist-vetted workflow | Not implemented | GenAI outputs exist, but no approval/vetting workflow or therapist sign-off table was found. |
| RLS | Partially implemented | SQL files define owner RLS and counsellor read policy. Live installation and policy completeness are unknown. |
| Verification scripts | Working | `scripts/verify-wayfinder.ps1` exists and ran successfully in this inspection. |
| GitHub Actions | Working | Workflow file exists. It performs static checks on push/PR to `main`; not live-run in this inspection. |

## 3. Database truth

This section documents the schema expected by code and the schema present in checked-in SQL files. The actual live Supabase database may differ and must be queried directly.

### Identity relationship

Stable identity chain:

```text
Supabase auth user -> profiles.parent_id / Wayfinder ID -> dyads.child_id -> journal_entries.data.childId
```

Rules from repo docs and code:

- Supabase `user_id` is technical auth identity.
- `profiles.parent_id` is app identity / Wayfinder ID.
- `dyads.child_id` is expected by current browser code as child identity.
- `journal_entries.data.childId` is the main child link in saved journal payloads.
- Dashboard reads by `parent_id` first, then falls back to `user_id`.

### `profiles`

Expected by code:

- `user_id`
- `parent_id`
- `role`
- `disc_image_url`
- `disc_bars`
- `insight_text`
- `insight_generated_at`
- `insight_entry_count`
- `insight_latest_entry_at`
- `created_at`

Defined in `supabase-profiles.sql`:

- `user_id uuid primary key references auth.users(id) on delete cascade`
- `parent_id text unique not null`
- `role text not null default 'parent'`
- `created_at timestamptz default now()`
- unique index on `user_id`
- unique index on `parent_id`
- RLS enabled
- policy "Users manage own profile" for all operations where `auth.uid() = user_id`
- RPC `public.ensure_profile(p_role text default 'parent')`
- execute grant on `ensure_profile` to `authenticated`

Relationships:

- `profiles.user_id` references Supabase auth users.
- `profiles.parent_id` is copied into `dyads.parent_id` and `journal_entries.parent_id`.

Dependent features:

- Auth/profile gate
- Parent ID reuse
- Portal role check
- Dashboard identity card
- DISC bars and AI insight cache
- Counsellor role check and `is_wayfinder_counsellor()`

Mismatch:

- Code reads/writes DISC/cache columns that are not present in checked-in `supabase-profiles.sql`: `disc_image_url`, `disc_bars`, `insight_text`, `insight_generated_at`, `insight_entry_count`, `insight_latest_entry_at`.
- Live DB may already have these columns, but the repo SQL does not prove it.

### `dyads`

Expected by code:

- `id` for ordering by `id.asc`
- `user_id`
- `parent_id`
- `child_id`
- `data`
- likely `created_at`

Writes in `supabase.js`:

```js
upsert(
  { user_id: userId, parent_id: parentId, child_id: dyad.childId, data: dyad },
  { onConflict: 'user_id,child_id' }
)
```

Reads in `supabase.js`:

- select `child_id,parent_id,data`
- first filter by `parent_id`
- fallback filter by `user_id`
- `getDyad()` filters by `child_id`
- orders by `id.asc`

Defined in `supabase-schema.sql`:

- `user_id uuid not null references auth.users(id) on delete cascade`
- `parent_id text not null`
- `data jsonb not null default '{}'`
- `created_at timestamptz default now()`
- primary key `(user_id, parent_id)`
- RLS enabled
- policy "Users manage own dyads" for all operations where `auth.uid() = user_id`

Relationships:

- `dyads.user_id` references auth user.
- `dyads.parent_id` should match `profiles.parent_id`.
- `dyads.child_id` is expected by code to identify children, but is not in checked-in base schema.

Dependent features:

- Child setup
- Multi-child dashboard
- Child-specific journalling
- Recent reflections by child
- DISC blend source for dashboard insight

Mismatch:

- Checked-in SQL lacks `id`.
- Checked-in SQL lacks `child_id`.
- Checked-in SQL primary key `(user_id, parent_id)` conflicts with current multi-child expectation.
- Code expects unique or conflict target `(user_id, child_id)`.

### `journal_entries`

Expected by code:

- `id`
- `user_id`
- `parent_id`
- `data`
- `created_at`

Saved JSON payload includes:

- `id`
- `parentId`
- `childId`
- `date`
- `phase`
- `activity`
- `cab.thoughts`
- `cab.feelings`
- `cab.actions`
- `cab.meaning`
- `autoWords`
- `markers`
- `disc`
- `ethnicity`
- `childDob`
- `parentDob`
- `parentGender`
- `childGender`
- `submittedAt`

Defined in `supabase-schema.sql`:

- `id bigint primary key`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `parent_id text not null`
- `data jsonb not null default '{}'`
- `created_at timestamptz default now()`
- RLS enabled
- policy "Users manage own entries" for all operations where `auth.uid() = user_id`

Relationships:

- `journal_entries.user_id` references auth user.
- `journal_entries.parent_id` should match `profiles.parent_id`.
- Child relationship currently lives in JSON as `data.childId`; there is no checked-in `child_id` column.

Dependent features:

- Dashboard past activities
- Child recent reflections
- Journal trail
- Counsellor workspace
- Counsellor AI analysis
- Longitudinal summaries

Mismatch:

- Code does not require row `child_id` for journal entries, but normalization will use it if present.
- Counsellor access requires additional RLS policy from `supabase-counsellor-rls.sql`.
- There is no foreign key from `parent_id` to `profiles.parent_id` in checked-in SQL.

### `reviews`

Expected by code:

- `entry_id`
- `user_id`
- `data`
- `created_at`

Writes in `supabase.js`:

```js
POST /rest/v1/reviews?on_conflict=entry_id
body: { entry_id, user_id, data }
```

Defined in `supabase-schema.sql`:

- `entry_id bigint primary key`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `data jsonb not null default '{}'`
- `created_at timestamptz default now()`
- RLS enabled
- policy "Users manage own reviews" for all operations where `auth.uid() = user_id`

Relationships:

- Intended review target is a journal entry by `entry_id`.
- Code stores `user_id` as the counsellor user's id when a counsellor saves review notes.

Dependent features:

- `CounsellorReview`
- saved counsellor private notes
- congruence annotations
- Satir/congruent response notes
- stance/gap/narrative notes

Mismatch:

- Checked-in SQL has no foreign key from `reviews.entry_id` to `journal_entries.id`.
- Because `entry_id` is primary key, only one review row can exist per entry across all counsellors.
- Owner-only reviews RLS allows a counsellor to manage their own review rows, but there is no checked-in counsellor-specific review policy beyond this.

### Counsellor helper and policies

Defined in `supabase-counsellor-rls.sql`:

- function `public.is_wayfinder_counsellor()`
- checks whether current `auth.uid()` has `profiles.role = 'counsellor'`
- grants execute to `authenticated`
- policy "Counsellors can read journal entries" on `public.journal_entries`
- select-only to authenticated
- using `public.is_wayfinder_counsellor()`

Dependent features:

- `CounsellorApp`
- `DB.getAllEntries()`
- all counsellor AI analysis and review workflows that depend on entry reads

Mismatch or risk:

- This file must be run in Supabase after profile/schema SQL.
- There is no equivalent checked-in policy granting counsellors read access to dyads or profiles.
- Counsellor portal currently derives displayed parent/child metadata from journal entry JSON rather than joining dyads/profiles.

### Therapist request tables

No therapist request table was found in checked-in SQL or code.

The only therapist-request-related behavior found is a parent button that shows a "feature coming soon" alert.

### SQL queries to inspect live Supabase schema and RLS

Run these in the Supabase SQL Editor.

```sql
-- Tables and columns used by Wayfinder
select
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'dyads', 'journal_entries', 'reviews')
order by table_name, ordinal_position;
```

```sql
-- Primary keys, unique constraints, and foreign keys
select
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
left join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
 and tc.table_schema = ccu.table_schema
where tc.table_schema = 'public'
  and tc.table_name in ('profiles', 'dyads', 'journal_entries', 'reviews')
order by tc.table_name, tc.constraint_type, tc.constraint_name, kcu.ordinal_position;
```

```sql
-- Indexes
select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('profiles', 'dyads', 'journal_entries', 'reviews')
order by tablename, indexname;
```

```sql
-- RLS enabled flags
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'dyads', 'journal_entries', 'reviews')
order by c.relname;
```

```sql
-- RLS policies
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'dyads', 'journal_entries', 'reviews')
order by tablename, policyname;
```

```sql
-- Wayfinder helper functions
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as result_type,
  p.prosecdef as security_definer,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('ensure_profile', 'is_wayfinder_counsellor')
order by p.proname;
```

```sql
-- Quick schema mismatch checks
select
  'profiles.disc_bars' as check_name,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'disc_bars'
  ) as exists;

select
  'profiles.insight_text' as check_name,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'insight_text'
  ) as exists;

select
  'dyads.child_id' as check_name,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'dyads' and column_name = 'child_id'
  ) as exists;

select
  'dyads.id' as check_name,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'dyads' and column_name = 'id'
  ) as exists;
```

```sql
-- Sample live data shape without exposing journal contents
select count(*) as profile_count from public.profiles;
select count(*) as dyad_count from public.dyads;
select count(*) as journal_entry_count from public.journal_entries;
select count(*) as review_count from public.reviews;
```

## 4. AI architecture

### AI endpoints

| Endpoint | File | Provider/model | Facing | Purpose |
|---|---|---|---|---|
| `/api/disc-insight` | `api/disc-insight.js` | Anthropic `claude-haiku-4-5-20251001` | Parent-facing | Short DISC reflection about parent pattern under pressure with child. |
| `/api/disc-vision` | `api/disc-vision.js` | Anthropic model from `ANTHROPIC_VISION_MODEL` env var | Parent-facing extraction utility | Extract D/I/S/C bar heights from uploaded DISC image. |
| `/api/counsellor-analysis` | `api/counsellor-analysis.js` | OpenAI `gpt-4o` | Counsellor-facing | Single-entry and longitudinal analysis of parent reflection journals. |

### Where prompts live

- Parent DISC insight prompt: `api/disc-insight.js`
- DISC vision extraction prompt: `api/disc-vision.js`
- Counsellor analysis prompt: `api/counsellor-analysis.js`
- Local non-AI clinical framing and heuristics: `app.js`
- Partner-editable copy and labels: `content.js`

### What each model output is used for

| Output | Used by | Stored or cached |
|---|---|---|
| Parent DISC insight text | Dashboard DISC insight panel | Cached in `profiles.insight_text` with count/date metadata. |
| DISC bar extraction JSON | DISC chart and profile DISC bars | Saved to `profiles.disc_bars`. |
| Counsellor entry analysis JSON | Counsellor "AI Analysis" tab and list flag | Not persisted by current code; fetched on demand and held in React state. |
| Counsellor longitudinal JSON | Counsellor workspace longitudinal reflections | Not persisted by current code; fetched in `refresh()` and held in React state. |

### Parent-facing versus counsellor-facing outputs

Parent-facing:

- `discDescriptor()` local copy
- `/api/disc-insight` output
- DISC bar chart, reflective/non-diagnostic note
- local journaling reflection and markers

Counsellor-facing:

- `/api/counsellor-analysis` entry and longitudinal outputs
- AI flags in counsellor list view
- CAB congruence analysis
- possible Satir coping pattern
- developmental considerations
- counsellor reflection focus
- counsellor review notes and generated narrative tools

### API key handling

API keys appear server-side only in `api/*`:

- `process.env.ANTHROPIC_API_KEY`
- `process.env.ANTHROPIC_VISION_MODEL`
- `process.env.OPENAI_API_KEY`

No `OPENAI_API_KEY`, Anthropic key, or service-role key was found in browser code. The Supabase anon key is present in `supabase.js`, which is normal for Supabase browser clients but must not be displayed in normal UI.

### Rate limiting

No application-level rate limiting was found in the API files.

Risk points:

- `/api/disc-insight` can be called by any browser client.
- `/api/disc-vision` accepts image base64 and can be expensive.
- `/api/counsellor-analysis` can be called for each entry and each parent group.
- No auth verification is performed inside these API endpoints.
- CORS is set to `*` in all API functions.

### Output disclaimers and safety wording

Present:

- `/api/disc-insight` prompt says the AI is not a therapist and is not diagnosing.
- `/api/counsellor-analysis` prompt says not to diagnose, assess pathology, replace a counsellor, or provide therapy directly.
- `/api/disc-vision` says not to interpret personality or provide advice.
- `DISCIntensityChart()` displays: "This chart is reflective, not diagnostic. Use it to notice pressure patterns, not to label yourself."
- Journal trail says patterns are reflective signals, not fixed traits.

Potential gap:

- The parent-facing AI insight itself may not always display a visible disclaimer beside the generated text beyond the surrounding chart disclaimer.
- API endpoints do not enforce post-generation policy checks.

### Advice, recommendations, and prescriptions

The intended prompt boundary is reflection, perspective, and cautious hypothesis.

Observed:

- `/api/disc-insight` asks for "one specific suggestion for an activity moment" and "growth edge". This is close to advice and should be therapist-vetted.
- `/api/counsellor-analysis` asks for "counsellorReflectionFocus" and "counsellorFocus", which is counsellor-facing and framed as exploration.
- `/api/disc-vision` does extraction only.
- `buildNarrative()` creates a suggested client narrative for counsellor editing; this should be vetted before sharing.

Current conclusion:

- GenAI is mostly framed as reflection/perspective and counsellor support.
- Parent-facing "specific suggestion" language should be reviewed to ensure it does not become behavioural prescription.

## 5. Counsellor portal

### How counsellor login works

- `counsellor.html` sets `PORTAL_ROLE = 'counsellor'`.
- `App` uses the same Supabase auth flow as parent portal.
- Counsellor signup is disabled in `AuthScreen` because `allowSignup = role !== 'counsellor'`.
- Counsellor accounts must be provisioned by an administrator.
- Verified email is required before profile/portal access.

### How counsellor role is checked

In `App`:

- For counsellor role, profile loading calls `Profile.getExisting(session.user.id, session)`, not `Profile.getOrCreate()`.
- If no profile exists or `p.role !== 'counsellor'`, access is denied.
- After profile load, `profile.role !== APP_ROLE` also triggers the wrong-portal/access-denied branch.

In SQL:

- `supabase-counsellor-rls.sql` defines `is_wayfinder_counsellor()` based on `profiles.role = 'counsellor'`.
- The policy "Counsellors can read journal entries" uses that function.

### Which tables counsellor can read

From code:

- `journal_entries`: via `DB.getAllEntries(user.id, authSession)`
- `reviews`: via `DB.getReview(user.id, entry.id, authSession)` for the counsellor user's own saved review row

From checked-in RLS:

- `journal_entries`: read allowed to counsellors if `supabase-counsellor-rls.sql` is installed.
- `reviews`: owner-only policy where `auth.uid() = user_id`.
- `profiles` and `dyads`: no special counsellor read policy found.

### Which records counsellor sees

If the counsellor RLS policy is installed, `DB.getAllEntries()` requests all `journal_entries` rows, ordered by newest first. The displayed record data is normalized from each entry row and its JSON payload.

The counsellor sees:

- Parent ID
- Child ID
- activity
- date
- child age/gender if present in entry data
- parent age/gender if present in entry data
- phase
- trait-word count
- marker count
- full CAB reflection fields
- claimed markers and evidence
- DISC, ethnicity, and related contextual fields saved in the entry

### Whether parent users are denied

Yes, in app logic:

- Parent users opening `counsellor.html` are denied if their profile role is not `counsellor`.
- Counsellor users opening the parent portal are sent to the wrong-portal branch.

This was verified by code inspection, not by live browser smoke test.

### Whether normal UI hides emails, Supabase UUIDs, child names

Parent normal UI:

- Dashboard header shows Parent ID / Wayfinder ID and role, not email.
- `ProfileSettings` shows Wayfinder ID, role, parent age, and parent gender.
- Child cards show Child ID, age, and gender.
- The setup copy says "No names - codes only."
- Auth screen collects email, which is expected for login, but logged-in normal parent UI does not continue displaying email.

Debug/technical:

- Auth debug logging is gated by `localStorage.getItem('wayfinder_debug_auth') === '1'`.
- The code should continue avoiding token logging. Current debug logs report booleans and ids but not token values.

Counsellor UI:

- Counsellor sees Parent IDs, Child IDs, ages, gender, journal content, and reflections.
- Counsellor UI does not intentionally show parent email, Supabase UUID, child names, JWTs, or service keys.

### Whether SQL file must be run in Supabase

Yes. `supabase-counsellor-rls.sql` must be run in Supabase after the base schema/profile SQL for counsellor read access to work. Without it, owner-only `journal_entries` RLS likely prevents counsellors from reading parent entries.

### Remaining tests needed

- Create/verify a counsellor profile row with `role = 'counsellor'`.
- Confirm parent users are denied in `counsellor.html`.
- Confirm counsellor users can load parent journal entries after `supabase-counsellor-rls.sql` is installed.
- Confirm counsellor users cannot write/delete parent journal entries.
- Confirm counsellor review saves work under `reviews` RLS.
- Confirm normal UI does not show email, Supabase UUIDs, child names, JWTs, refresh tokens, anon keys, service keys, or raw auth identifiers.
- Confirm API endpoints cannot be abused or add rate limiting/auth controls.

## 6. Business/product model

Possible paths only:

- Counsellor SaaS
- Parent subscription
- Institutional licensing
- DISC assessment upsell
- Marketplace

Business model: Open decision.

## 7. Partner handoff

### Partner-safe files

Generally safe for partner/content/visual edits:

- `content.js`
- `styles.css`
- image assets if references remain correct
- `docs/*`
- copy-only updates in `README.md` and `SETUP.md`
- UI-only layout sections in `app.js` with review before deploy

### Files requiring developer review

- dashboard widgets in `app.js`
- journal views in `app.js`
- activity history and journal trail views
- read-only display methods
- `api/*` prompt wording or payload changes
- verification scripts
- GitHub Actions workflow

### High-risk files and areas

- `supabase.js`
- SQL/RLS files
- auth/profile logic
- `ensure_profile`
- email verification gate
- Parent ID / Child ID generation
- data writes/deletes
- Vercel/Supabase configuration
- what counsellors can read
- anything that displays identifiers or journal content

### How to run verification

Run:

```powershell
git diff --check
node --check supabase.js
powershell -ExecutionPolicy Bypass -File .\scripts\verify-wayfinder.ps1
Select-String -Path .\*.js,.\*.html,.\api\*.js -SimpleMatch -Pattern "profiles.insert","profiles.upsert","service_role","service-role","OPENAI_API_KEY","Authorization","ensure_profile","ai","Claude","GPT","review"
```

Confirm manually:

- no browser-side `profiles.insert`
- no browser-side `profiles.upsert`
- `ensure_profile` still uses explicit Bearer fetch
- dashboard reads still use verified callback session / Bearer token
- normal UI does not show parent email, Supabase UUID, child names, or tokens
- dashboard loads by `parent_id` first and `user_id` fallback
- verified login reaches Dashboard
- unverified email is blocked
- sign out works

### Branch workflow

Recommended:

- create feature branches from `main`
- keep branches focused
- use names like `docs/<short-description>`, `content/<short-description>`, `ui/<short-description>`, `feature/<short-description>`, or `fix/<short-description>`
- run verification before PR/merge
- do not mix content, auth, database, and deployment changes unless the task requires it

### Deployment stop conditions

Do not deploy if any of these are knowingly broken:

- auth
- verified-email gate
- profile loading / Parent ID reuse
- dashboard loading
- child record display
- journal/history display
- counsellor access control
- privacy masking
- RLS policy expectations
- `scripts/verify-wayfinder.ps1`

If a check fails, stop and report:

- what failed
- suspected cause
- proposed fix or rollback path

## 8. Known issues and risks

| Issue or risk | Current evidence |
|---|---|
| `app.js` is one very large file | `app.js` is about 1600 lines and also contains large base64 image data. |
| Browser Babel/no build pipeline | `index.html` and `counsellor.html` load Babel standalone and `app.js` as `text/babel`; no package/build setup found. |
| No real automated e2e tests | Only static verification script and GitHub Actions checks found. No Playwright/Cypress/browser test suite found. |
| No Sentry/error monitoring | No monitoring integration found. |
| No AI rate limiting | API functions have no rate limiting and CORS is `*`. |
| API endpoints lack auth checks | API functions do not verify Supabase sessions before using AI providers. |
| Incomplete RLS audit | SQL files exist, but live policies were not queried. Counsellor policy must be installed separately. |
| Schema/code mismatch for dyads | Code expects `dyads.id`, `dyads.child_id`, and `user_id,child_id` conflict target; checked-in schema does not. |
| Profile cache columns not in checked-in profile SQL | Code expects `disc_bars`, `disc_image_url`, `insight_*` columns. |
| Reviews persistence model needs review | `reviews.entry_id` is primary key and `user_id` is counsellor user id when saving. Multi-counsellor behavior is unclear. |
| Reviews caching unclear | Saved review notes exist; named "reviews caching" feature is not otherwise clear. |
| Therapist request flow incomplete | Button is an alert only; no table/workflow found. |
| GenAI therapist-vetting decision open | GenAI outputs exist, but no therapist approval workflow exists. |
| Parent-facing AI suggestion boundary | `/api/disc-insight` asks for one specific suggestion, which needs clinical wording review. |
| DISC vision model unknown | `ANTHROPIC_VISION_MODEL` required and TODO says model must be verified. |
| Existing docs are partly stale | README/SETUP still describe older modular structure and local-file workflow. Architecture docs are more current. |

## 9. Open decisions for Rodney

- Who owns/authors the clinical model and final clinical language?
- What are the exact DISC boundaries: reflective lens, licensed assessment, self-scored input, or formal assessment import?
- What are the exact CAB boundaries and approved interpretation rules?
- What are the exact Satir/coping/congruence boundaries?
- What AI reflection wording is approved?
- What AI wording is unacceptable?
- Which business model comes first: counsellor SaaS, parent subscription, institutional licensing, DISC assessment upsell, marketplace, or another path?
- What is the therapist request workflow scope?
- Where is the boundary between GenAI-only reflection and therapist-vetted response?
- Can counsellors see full parent history or only entries explicitly requested/shared?
- Should multiple counsellors be able to review the same entry?
- Should counsellor review notes ever be visible to parents?
- Should DISC assessment be licensed, self-scored, manually entered, or image-extracted from third-party reports?
- Should AI endpoints require Supabase auth and per-user rate limits before production growth?
- Should live SQL migrations be reconciled back into repo SQL as source of truth?

## 10. Verification

### Files inspected

- `AGENTS.md`
- `docs/app-architecture-navigation-review.md`
- `docs/auth-profile-flow.md`
- `docs/partner-collaboration-and-deployment-rules.md`
- `docs/profile-cleanup.sql`
- `docs/codex-task-template.md`
- `index.html`
- `counsellor.html`
- `app.js`
- `supabase.js`
- `content.js`
- `images.js`
- `api/disc-insight.js`
- `api/disc-vision.js`
- `api/counsellor-analysis.js`
- `supabase-schema.sql`
- `supabase-profiles.sql`
- `supabase-counsellor-rls.sql`
- `supabase-add-role.sql`
- `scripts/verify-wayfinder.ps1`
- `.github/workflows/wayfinder-checks.yml`
- `README.md`
- `SETUP.md`
- `vercel.json`
- `deploy-vercel.ps1`
- `setup-github.ps1`

### Checks run during this documentation task

These checks were run after creating this document:

- `git diff --check`
- `node --check supabase.js`
- `powershell -ExecutionPolicy Bypass -File .\scripts\verify-wayfinder.ps1`
- `Select-String -Path .\*.js,.\*.html,.\api\*.js -SimpleMatch -Pattern "profiles.insert","profiles.upsert","service_role","service-role","OPENAI_API_KEY","Authorization","ensure_profile","ai","Claude","GPT","review"`

### Findings from verification

- No functional app files were edited.
- No browser-side `profiles.insert` or `profiles.upsert` was found.
- `ensure_profile` remains present in `supabase.js`.
- Explicit `Authorization: Bearer ...` remains present for `ensure_profile` and authenticated REST reads.
- `node --check supabase.js` passed.
- `scripts/verify-wayfinder.ps1` passed.
- Search found `OPENAI_API_KEY` only in serverless API code.
- Search found `Authorization` in `supabase.js` and `api/counsellor-analysis.js`.
- Search found review-related code in local legacy storage helpers, counsellor review UI, `reviews` DB methods, and docs.
- Search for `ai` is broad and matches many normal words/base64 content; meaningful AI references are in `api/*`, `app.js`, and docs.

### Unknowns

- Actual live Supabase schema and RLS policies.
- Whether `dyads.child_id`, `dyads.id`, and profile DISC/cache columns exist in production.
- Whether `supabase-counsellor-rls.sql` has been run in production.
- Whether Vercel env vars are configured correctly.
- Whether deployed app behavior matches local repo.
- Whether counsellor review persistence works under live RLS.
- Whether AI output wording has been clinically approved.

### Functional-change statement

No app functionality, auth/profile/data logic, SQL, API code, or UI code was changed as part of this task. This task only inspected files, created `docs/current-state-of-wayfinder.md`, and ran verification.
