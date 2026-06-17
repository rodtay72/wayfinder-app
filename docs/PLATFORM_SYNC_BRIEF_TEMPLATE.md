# Platform Sync Brief Template

Copy this brief into the PR description, a linked doc, or your cross-platform handoff channel when a change is user-facing, research-related, consent/privacy-related, or AI-related.

**Privacy rule:** Do not paste raw user data, reflection content, parent emails, child names, Supabase UUIDs, JWTs, tokens, or secrets into this brief.

---

## Brief metadata

- **Date:**
- **Phase name:**
- **Branch name:**
- **Owner agent / human:**
- **PR link:**

## What changed

Summarise the functional or copy change in plain language.

## What did not change

List protected areas confirmed untouched, for example:

- auth / profile flow
- Supabase schema / RLS
- journal save/read
- dashboard loading
- Parent ID / Child ID generation

## User-facing summary

What might parents or counsellors notice? Use cautious language.

## Consent / privacy impact

None / Describe. Note PDPA, signup notice, reflection privacy, or data-use implications.

## AI capability impact

None / Describe. Note new AI endpoints, prompts, or counsellor analysis changes.

## Research / backend impact

None / Describe. Note future research, analytics, or server-side behaviour.

## App Version action

- [ ] Entry added or updated in `content.js` (`WAYFINDER_APP_VERSIONS`)
- [ ] No App Version entry needed (internal/docs-only)

## Test evidence

- Local browser test:
- Vercel preview:
- Checks run:

## Open risks

List anything still uncertain or needing follow-up.

## Next action by platform

| Platform | Next action |
|----------|-------------|
| ChatGPT | |
| Cursor | |
| Codex | |
| Claude Projects | |
| Claude Code | |
| OpenClaw | |
| Human owner | Production smoke test after merge; update `docs/CURRENT_LAUNCH_STATUS.md` if shipped |

---

Internal/docs-only PRs may skip this brief if the PR template declares no socialisation needed.
