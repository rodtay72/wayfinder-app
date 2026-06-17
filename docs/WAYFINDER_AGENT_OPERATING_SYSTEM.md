# Wayfinder Agent Operating System

## Status

Day 0 automation layer for safe continuous agent work while `main` stays protected and every phase remains a working app.

Read first:

- [AGENTS.md](../AGENTS.md)
- [docs/WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [docs/partner-collaboration-and-deployment-rules.md](./partner-collaboration-and-deployment-rules.md)

## Platform roles

| Platform | Role |
|----------|------|
| **ChatGPT** | Master planner and research architect |
| **Cursor** | Primary planner, builder, and debugger |
| **Codex** | Independent code reviewer and parallel PR worker |
| **Claude Projects** | Research and copy reviewer |
| **Claude Code** | PR reviewer or isolated branch work only |
| **OpenClaw** | Socialisation bridge when configured |

## Production rule

**One branch, one merge at a time.**

- Branch from latest clean `main`.
- Keep `main` deployable at all times.
- Do not stack unmerged risky branches.
- Merge only after PR checks, review, Vercel preview, and declared test evidence.

**Agents may create branches and open PRs. Agents must not merge production changes to `main`.** Only the human owner merges after review, checks, and smoke-test evidence.

Production app: `wayfinder-modular.vercel.app`

## 24/7 agent work rules

1. **Plan first** for non-trivial product, UX, copy, or multi-file work.
2. **Agent mode** for scoped implementation within an approved allowlist.
3. **Debug mode** for layout, runtime, or browser-specific bugs with evidence.
4. **Never commit** without explicit human approval unless the issue explicitly authorises auto-commit.
5. **Never merge to `main`** unless the issue explicitly authorises merge and the human owner has approved.
6. **Stop and report** when scope, canon, or guardrails conflict.
7. Update [docs/CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) after user-facing merges.

## Static React / Babel guardrail

Wayfinder is a **static React/Babel app**. Preserve this unless explicitly approved otherwise.

Do **not**:

- add `import` / `export` to browser scripts
- introduce TypeScript
- add Vite, Next.js, Webpack, or another build system
- migrate script loading in HTML entry points
- run `node --check app.js`

Browser script load order (parent portal): `styles.css` → React UMD → ReactDOM UMD → Babel → Supabase → `content.js` → `images.js` → `supabase.js` → `app.js`.

## ALIGN / CAB guardrail

Core pathway:

Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action

Do **not**:

- diagnose or label the child
- score or type the parent
- frame stage completion or relationship as fixed/solved
- reduce Wayfinder to Behaviour → Advice

Use cautious language: may, might, possible, let's explore.

## Privacy / auth / data guardrails

Preserve unless explicitly approved:

- Supabase email verification gate before app access
- `ensure_profile` via explicit `Authorization: Bearer` fetch (never browser `profiles.insert` / `profiles.upsert`)
- Dashboard reads by `parent_id` first with verified session / Bearer token
- PDPA-safe UI: no parent email, Supabase UUID, child names, JWTs, or secrets in normal UI
- ISO timestamps for Supabase writes: `new Date().toISOString()`

### Platform sync brief privacy

Sync briefs, PR descriptions, and agent handoffs must **not** include:

- raw user data or reflection content from production
- parent emails, child names, or Supabase UUIDs
- JWTs, refresh tokens, API keys, or other secrets
- screenshots of authenticated sessions unless redacted

Use phase names, branch names, file lists, and cautious product summaries only.

### Manual review triggers in `app.js`

CODEOWNERS does not cover all of `app.js`. If a PR touches these areas, require human review:

- `AuthScreen`, verification gate, password recovery
- Profile load / `ensure_profile` call path
- Journal save / read
- Dashboard data loading
- Parent ID / Child ID display logic
- Privacy masking and debug UI gates

## App Version workflow

For **parent-facing** releases, add or update an entry at the top of `WAYFINDER_APP_VERSIONS` in `content.js` before merge.

For **internal / docs-only** PRs, declare in the PR description: **No App Version entry needed**.

Viewing the App Version page is **not** consent.

## GitHub automation (Day 0)

| Asset | Purpose |
|-------|---------|
| `.github/PULL_REQUEST_TEMPLATE.md` | Required PR checklist |
| `.github/ISSUE_TEMPLATE/agent_task.yml` | Agent task intake |
| `.github/CODEOWNERS` | High-risk path review |
| `.github/workflows/wayfinder-guardrails.yml` | Extended CI guardrails |
| `.github/workflows/platform-sync-brief.yml` | PR sync-brief reminder |
| `.github/workflows/wayfinder-checks.yml` | Existing baseline checks (unchanged) |

`.github/CODEOWNERS` is version-controlled, but it is **not enforceable until** a GitHub branch protection rule or ruleset is configured with **Require review from Code Owners** on `main`.

Day 0 workflows:

- do **not** auto-commit to `main`
- do **not** auto-merge PRs
- do **not** push changes back to branches
- do **not** require external secrets (Slack, Discord, OpenClaw webhooks deferred)
- platform sync is PR comment / template / reminder only

## Stop conditions

Stop work and ask for human review when:

- `main` is dirty or production is unstable
- checks fail and cannot be fixed within scope
- high-risk files are touched without approval
- ALIGN/CAB or PDPA canon would be weakened
- auth, RLS, profile integrity, or journal compatibility is at risk
- production smoke test fails after merge

## 7-day release cadence

Daily target loop:

1. Pick one focused phase from the backlog.
2. Open agent issue with allowlist and acceptance tests.
3. Branch from clean `main`.
4. Plan → build/debug within scope.
5. Open PR; complete template and platform sync brief if required.
6. Vercel preview + local browser test.
7. Merge one PR; run production smoke test; update launch status.

## Required checks before merge

```bash
git diff --check
node --check supabase.js
rg -n '^\s*(import|export)\b' app.js content.js images.js supabase.js
rg -n 'profiles\.(insert|upsert)' app.js supabase.js api/
```

On Windows, also run `scripts/verify-wayfinder.ps1` when available.
