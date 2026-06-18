# Agent Handoff Brief

Short, agent-readable source of truth. **Read this before starting any Wayfinder task.**

**Production:** [wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Last updated:** 2026-06-18 (Day 8)

---

## 1. Current launch deadline and priority

| Item | Value |
|------|-------|
| Launch window | **7 days** from 2026-06-18 (~2026-06-25) |
| Current priority | **Operational continuity** — platform sync, handoffs, repeatable production checks |
| Not the priority | More research governance docs unless explicitly assigned |
| Core principle | Reduce coordination friction while preserving production safety |
| Safety rule | **Production safety outranks convenience.** No agent touches high-risk files without explicit approval. |

---

## 2. Completed Day 0–Day 7 sequence

| Day | Deliverable | Merge | Status |
|-----|-------------|-------|--------|
| 0 | Agent ops — PR template, issue template, CODEOWNERS, guardrail workflows, ops docs | PR #5 | Merged and smoke-tested |
| 1 | Research AI Capability Map | PR #7 | Merged and smoke-tested |
| 2 | Activity Practice Taxonomy (`ACTIVITY_PRACTICE_CATALOG`; `ACTIVITIES` unchanged) | PR #9 | Merged and smoke-tested |
| 3 | Questionnaire Measures Framework | PR #11 | Merged and smoke-tested |
| 4 | AI Congruence Analysis Contract | PR #13 | Merged and smoke-tested |
| 5 | Consent + Research Governance Plan | PR #15 | Merged and smoke-tested |
| 6 | Research Export SOP + Data Dictionary | PR #17 | Merged and smoke-tested |
| 7 | Research Launch Readiness + Study Operations Plan | PR #19 | Merged and smoke-tested |

---

## 3. Active next focus

| Phase | Branch | Scope |
|-------|--------|-------|
| **Day 8 (in flight)** | `ops/platform-sync-production-ops` | Platform sync + production ops docs — handoff, checks, escalation, continuity |
| **Day 9 (recommended)** | TBD after approval | Production monitoring / smoke-test **reminder** workflow in GitHub Actions — separate approval required |

Day 8 does **not** add monitoring code, runtime changes, or 24/7 staffed coverage. It creates the operating system for handoff and production continuity.

---

## 4. Current source of truth repo

| Resource | Location |
|----------|----------|
| GitHub repo | `rodtay72/wayfinder-app` |
| Production app | `wayfinder-modular.vercel.app` |
| Local folder | `C:\Users\rodne\Documents\CodeProjects\active\wayfinder-app` |
| Launch snapshot | [docs/CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) |
| Ops plan | [docs/PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) |

**Deprecated — do not use:**

- OneDrive path: `C:\Users\rodne\OneDrive\Favorites\Documents\Claude\Projects\wayfinder-app`
- `wayfinder_modular` except as read-only reference

---

## 5. Required first-read files

Read in this order before starting work:

1. **This brief** — [docs/AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md)
2. [AGENTS.md](../AGENTS.md)
3. [docs/WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
4. [docs/WAYFINDER_AGENT_OPERATING_SYSTEM.md](./WAYFINDER_AGENT_OPERATING_SYSTEM.md)
5. [docs/CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
6. Task-specific docs listed in the agent issue allowlist

For ops and handoff work, also read [docs/PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md).

---

## 6. Non-negotiable Wayfinder canon

Wayfinder is **not**:

- a child-diagnosis app
- a child-profiling app
- a parent-scoring app
- a generic Behaviour → Advice tool

Wayfinder **is** a parent emotional development pathway. Core pathway:

```
Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action
```

Official ALIGN mapping: **A**wareness · **L**ocate · **I**ntegrate · **G**rowth · **N**avigate

The phrase *"My child did something and I don't know why"* must **never** mean *"the child is the problem."* It means:

> The child's behaviour may be revealing a moment where the parent's Cognition, Affect, and Behaviour (CAB) is not aligned with the child's emerging need.

Use cautious language: **may**, **might**, **possible**, **let's explore**.

Do not diagnose or label the child. Do not blame or shame the parent.

---

## 7. Protected / high-risk areas

Do **not** edit without explicit issue allowlist and human approval:

| Category | Paths / areas |
|----------|---------------|
| Database / API | `supabase.js`, `api/*`, `*.sql`, RLS files |
| HTML entry points | `index.html`, `counsellor.html`, `verify.html` |
| Deployment | `vercel.json`, Vercel/Supabase config |
| Build system | `package.json`, `package-lock.json`, Babel/script loading |
| Auth / profile | AuthScreen, verification gate, password recovery, `ensure_profile` call path, session logic |
| Identity | Parent ID / Child ID generation and display |
| Data integrity | Journal save/read, dashboard loading |
| Verification script | `scripts/verify-wayfinder.ps1` |

If a PR touches `app.js`, require human review of auth/profile, journal save/read, dashboard loading, and privacy masking sections even when CODEOWNERS does not cover the whole file.

---

## 8. Safe low-risk areas

| Risk | Typical paths | Notes |
|------|---------------|-------|
| **Low** | `styles.css`, `content.js`, docs, UI-only sections in `app.js` | Copy, layout, empty states, visual polish |
| **Medium** | Dashboard widgets, journal views, read-only display methods, behaviour decode display cards | Must not weaken auth reads, privacy masking, or journal compatibility |
| **Docs-only** | `docs/*` when in issue allowlist | No runtime impact; still preserve ALIGN/CAB framing |

---

## 9. Current agent / platform roles

| Platform | Role |
|----------|------|
| **ChatGPT** | Master planner and research architect; cross-platform context |
| **Cursor** | Primary planner, builder, and debugger |
| **Codex** | Independent code reviewer and parallel PR worker |
| **Claude Projects** | Research and copy reviewer |
| **Claude Code** | PR reviewer or isolated branch work only |
| **OpenClaw** | Socialisation bridge when configured (webhooks deferred — manual handoff until approved) |
| **Human owner (Rodney)** | Merge authority, production smoke test, launch status updates, escalation decisions |

**Agents may create branches and open PRs. Agents must not merge to `main`.**

---

## 10. Standard branch naming

| Prefix | Use |
|--------|-----|
| `feature/` | Product, UI, content changes |
| `docs/` | Documentation-only |
| `ops/` | Operations and handoff docs (Day 8) |
| `fix/` | Targeted bug fixes |
| `automation/` | GitHub automation (Day 9+ — separate approval) |

**Rule:** One branch, one merge at a time. Branch from latest clean `main`.

---

## 11. Standard PR workflow

1. Confirm agent issue with allowlist, forbidden files, and acceptance tests.
2. Branch from clean `main`.
3. **Plan first** for non-trivial product, UX, copy, or multi-file work.
4. Implement **only** within the issue allowlist.
5. Open PR; complete [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md).
6. Complete [docs/PLATFORM_SYNC_BRIEF_TEMPLATE.md](./PLATFORM_SYNC_BRIEF_TEMPLATE.md) if user-facing, research-related, consent/privacy-related, or AI-related.
7. Wait for CI (`wayfinder-checks`, `wayfinder-guardrails`) and Vercel preview if UI touched.
8. **Human owner merges** after review and declared test evidence.
9. Post-merge: production smoke test; update [docs/CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) if user-facing release shipped.
10. Fill the handoff summary template (§15 below) and share across platforms.

---

## 12. Standard checks

Run before requesting merge:

```bash
git diff --name-only
git diff --check
node --check supabase.js
```

Forbidden browser-side profile writes:

```bash
rg -n 'profiles\.(insert|upsert)' app.js supabase.js api/
```

Auth/profile patterns (must remain present unless explicitly approved):

```bash
rg -n 'ensure_profile|Authorization|Bearer' supabase.js app.js api/
```

Static React / Babel guardrail:

```bash
rg -n '^\s*(import|export)\b' app.js content.js images.js supabase.js
```

**Do not run** `node --check app.js` — Wayfinder is a static React/Babel app.

On Windows, also run when available:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File ./scripts/verify-wayfinder.ps1
```

CI runs overlapping checks via `.github/workflows/wayfinder-checks.yml` and `.github/workflows/wayfinder-guardrails.yml`.

---

## 13. Manual smoke checklist

Run after every **user-facing** merge (human owner). Docs-only merges may skip unless production was already unstable.

1. Verified user can sign in.
2. Dashboard loads Parent ID, children, past activities, reflections.
3. Journal save appears in Journal Trail.
4. Sign-out works; unverified email blocked.
5. No parent email or Supabase UUID in normal UI.
6. Decode a Moment and ALIGN Journey still usable if touched.
7. Mobile layout readable.

---

## 14. What agents must never do

- Merge to `main` without explicit human owner approval
- Touch high-risk files outside the issue allowlist
- Add browser-side `profiles.insert` or `profiles.upsert`
- Weaken Supabase auth, RLS, email verification gate, or `ensure_profile` Bearer fetch
- Change journal save/read, dashboard loading, or Parent ID / Child ID logic without approval
- Add AI calls, export code, consent persistence, or questionnaire implementation without approval
- Change deployment config, schema, or HTML script loading without approval
- Paste production user data, reflection content, parent emails, child names, Supabase UUIDs, JWTs, tokens, or secrets into issues, PRs, or sync briefs
- Commit without explicit human approval unless the issue explicitly authorises auto-commit
- Add App Version entries for internal/docs-only work
- Frame the child as the problem or the parent as a fixed type/score
- Silently resolve conflicts between instructions and guardrails — stop and report instead

---

## 15. Handoff summary template

Copy and fill after completing work. Share in the agent issue, PR comment, or cross-platform channel.

```markdown
## Wayfinder handoff summary

- **Date:**
- **Agent / platform:**
- **Branch:**
- **PR link:**
- **Day / phase:**

### Files changed
(list paths; confirm allowlist compliance: yes/no)

### What changed
(plain-language summary)

### What did not change
(e.g. auth, RLS, journal save/read, dashboard loading, schema)

### Checks run
- [ ] git diff --name-only
- [ ] git diff --check
- [ ] node --check supabase.js
- [ ] profiles.insert/upsert scan clean
- [ ] ensure_profile/Bearer scan present
- [ ] import/export scan clean (if JS touched)
- [ ] scripts/verify-wayfinder.ps1 (if available)

### Smoke test
- Result: pass / fail / not applicable (docs-only)
- Notes:

### App Version needed?
- [ ] Yes — entry added in content.js
- [x] No — internal/docs-only

### Safety confirmations
- [ ] ALIGN/CAB canon preserved
- [ ] Auth / privacy / journal integrity preserved
- [ ] No secrets or user data in this summary

### Open risks / blockers

### Next action by platform
| Platform | Next action |
|----------|-------------|
| ChatGPT | |
| Cursor | |
| Codex | |
| Claude Projects | |
| Claude Code | |
| OpenClaw | |
| Human owner | |

### Owner action required
- [ ] Review PR
- [ ] Merge
- [ ] Production smoke test
- [ ] Update CURRENT_LAUNCH_STATUS.md
```

---

## Related docs

- [docs/PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) — launch ops rhythm, incidents, escalation
- [docs/WAYFINDER_AGENT_OPERATING_SYSTEM.md](./WAYFINDER_AGENT_OPERATING_SYSTEM.md) — Day 0 automation rules
- [docs/PLATFORM_SYNC_BRIEF_TEMPLATE.md](./PLATFORM_SYNC_BRIEF_TEMPLATE.md) — per-PR cross-platform brief
