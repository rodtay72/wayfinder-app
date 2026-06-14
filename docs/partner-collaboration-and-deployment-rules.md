# Partner Collaboration And Deployment Rules

## Purpose

Wayfinder welcomes partner contributions that improve the parent and counsellor experience while preserving the production app. Partners may contribute visual, content, UX, and functional enhancements, but every change must keep the app working and protect existing user records.

This repository is the production source of truth:

- GitHub repo: `rodtay72/wayfinder-app`
- Production app: `wayfinder-modular.vercel.app`
- Local folder: `C:\Users\rodne\Documents\CodeProjects\active\wayfinder-app`

Do not work from the old OneDrive path `C:\Users\rodne\OneDrive\Favorites\Documents\Claude\Projects\wayfinder-app`. It is deprecated and must not be used.

Do not work from `wayfinder_modular` except as a read-only reference.

## Change Risk Levels

### Low-Risk Changes

These are usually safe for partner-led updates:

- `styles.css`
- `content.js`
- documentation files
- UI-only sections in `app.js`

Examples include copy edits, activity wording, visual polish, spacing, typography, empty-state text, and non-sensitive layout improvements.

### Medium-Risk Changes

These changes are allowed, but should be reviewed carefully before merge:

- dashboard widgets
- journal views
- read-only activity/history features
- read-only Dashboard display methods

These changes can affect the parent experience and may touch data rendering. They must not weaken auth, profile loading, privacy, or existing record display.

### High-Risk Changes

These require technical owner review before merge or deployment:

- `supabase.js`
- SQL/RLS files
- auth/profile flow
- `ensure_profile`
- email verification logic
- Parent ID / Child ID generation
- data writes/deletes
- Vercel/Supabase configuration

Do not merge high-risk changes until the auth, profile, dashboard, data, and privacy behavior has been explicitly checked.

## Privacy Rules

Every change must preserve PDPA-safe UI rules.

Normal user-facing UI must not show:

- parent email
- Supabase UUID
- child names
- JWTs
- tokens
- secrets

Normal user-facing UI may show:

- Parent ID / Wayfinder ID
- Child ID
- age
- gender
- role
- non-identifying activity/reflection content

Debug output must never reveal JWTs, refresh tokens, service keys, anon keys, or other secrets.

## Branching Rules

Partners should use feature branches for all changes.

Recommended branch names:

- `feature/<short-description>`
- `content/<short-description>`
- `ui/<short-description>`
- `docs/<short-description>`
- `fix/<short-description>`

Keep branches focused. Avoid mixing visual, content, auth, database, and deployment changes in one branch unless the task truly requires it.

## Verification Before Merge

Run the local verification script before merge:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-wayfinder.ps1
```

Also confirm:

- the app still loads
- verified login still reaches the Dashboard
- unverified email is still blocked
- `ensure_profile` still uses explicit Bearer authentication
- Dashboard reads still use authenticated reads and load by `parent_id` first
- existing child records and journal records still appear
- empty states still appear when no records exist
- normal UI does not show parent email, Supabase UUID, child names, JWTs, tokens, or secrets

## Deployment Rules

Production deploys should happen only after checks pass.

Do not deploy if any of these fail:

- auth
- profile loading
- dashboard loading
- child record display
- journal/history display
- privacy checks
- `scripts/verify-wayfinder.ps1`

If auth, dashboard, profile loading, or privacy checks fail, stop the deployment and report:

- what failed
- where it failed
- suspected cause
- proposed fix or rollback path

## Commit And Review Expectations

Before a PR or direct commit, report:

- files changed
- checks run
- whether auth/profile flow was touched
- whether dashboard read path was touched
- whether data writes/deletes were touched
- whether privacy UI was checked
- deployment recommendation

Do not commit or deploy if the app is knowingly broken.
