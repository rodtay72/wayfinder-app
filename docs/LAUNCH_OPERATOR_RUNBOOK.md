# Launch Operator Runbook

**Day 11 — docs-only operator guide (Issue #26)**

Step-by-step guide for Rodney to perform **final pre-launch** and **launch-day** checks. Use when tired or under time pressure.

**This runbook does not change app runtime, workflows, or UI.**

Read first: [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) — record results there after each check.

During **launch freeze**, also read [LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md) (Issue #31), [LAUNCH_CANDIDATE_SIGN_OFF.md](./LAUNCH_CANDIDATE_SIGN_OFF.md) (Issue #33), and [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) (Issue #36).

---

## 1. Purpose and scope

### What this runbook is

- A **manual operator script** for parent app launch readiness
- Ordered checks: repo hygiene → GitHub → public heartbeat → authenticated production smoke
- Instructions to update the evidence pack with **your** results only

### What this runbook is not

- Not feature work, workflow changes, or UI changes
- Not a substitute for [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) incident playbooks
- Not research launch authorisation ([RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md](./RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md) is separate)

### Wayfinder canon (preserve while operating)

Wayfinder is **not** child diagnosis, child profiling, parent scoring, or Behaviour → Advice.

Core pathway:

```
Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action
```

### Critical limit

**Public URL heartbeat does not prove** auth, Supabase, dashboard, journal, session, or Journal Trail health. **Authenticated app testing remains manual** (§6–§12).

### Privacy while testing

Do **not** paste into GitHub issues, PRs, or evidence notes:

- parent emails
- Supabase UUIDs
- child names
- JWTs, tokens, or secrets
- reflection or journal content

Use: Pass / Fail / Pending, date, and brief non-identifying notes only.

---

## 2. Source of truth and production URL

| Item | Value |
|------|-------|
| GitHub repo | `rodtay72/wayfinder-app` |
| Local repo | `C:\Users\rodne\Documents\CodeProjects\active\wayfinder-app` |
| Production URL | [https://wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app) |
| Evidence ledger | [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) |
| Launch snapshot | [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) |

**Do not use:** OneDrive stale checkout, `wayfinder_modular`, old clones, stale snapshots.

---

## 3. Pre-launch local repo hygiene

Run from local repo before launch-day merges or final smoke.

```powershell
cd C:\Users\rodne\Documents\CodeProjects\active\wayfinder-app
git checkout main
git pull origin main
git status --short
```

**Pass when:**

- [ ] On `main` (or intentional launch branch only)
- [ ] Working tree clean (no uncommitted runtime changes)
- [ ] Latest pull succeeded

**If fail:** Stop. Resolve uncommitted or divergent state before launch. See §22.

Optional local syntax check (does not replace production smoke):

```powershell
node --check supabase.js
git diff --check
```

---

## 4. GitHub PR / checks hygiene

Before merging any last-minute PR:

- [ ] One branch, one merge — no stacked risky merges ([AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md))
- [ ] PR template completed
- [ ] CI green: **Wayfinder Checks**, **wayfinder-guardrails-check** (if on PR)
- [ ] No high-risk files touched without explicit review (`supabase.js`, `api/*`, `*.sql`, HTML entry points)
- [ ] **No App Version entry** unless user-facing behaviour actually changed
- [ ] Platform sync brief completed if user-facing / research / consent / AI related

After merge to `main`:

- [ ] Vercel production deploy succeeded (GitHub commit status or Vercel dashboard)
- [ ] Proceed to §5 then §6–§12 on production

Branch protection (verify once in GitHub Settings → Branches / Rulesets):

- [ ] Document result in evidence pack §6 — do not assume from repo files alone

---

## 5. Production Smoke Reminder workflow check

**Scope:** Public GET only — not authenticated app health.

### Manual dispatch (recommended before launch smoke)

1. GitHub → **Actions** → **Production Smoke Reminder** → **Run workflow** → branch `main`
2. Open the workflow run → **Summary**
3. Confirm heartbeat **pass** or note **fail** (HTTP code, response time in summary only)

**Pass when:**

- [ ] Workflow run completed
- [ ] Step summary shows heartbeat result recorded
- [ ] You understand summary checklist is a **reminder** — not auto-pass of §6–§12

**Optional:** Confirm reusable issue `Production smoke reminder — manual checklist` (`production-watch` label) updated on scheduled runs.

**Do not** treat green heartbeat as Go. Update evidence pack §7 only with what you observed.

---

## 6. Manual authenticated smoke-test script

Use a **verified test parent account** in a normal browser (incognito optional for second pass).

**Environment:** Production URL only — not localhost unless explicitly testing a preview.

### Session setup

- [ ] Open [https://wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)
- [ ] Use verified credentials only — never record credentials in the evidence pack

### Core path (complete §7–§12 in order)

| Step | Section | Done |
|------|---------|------|
| Sign in | §7 | [ ] |
| Dashboard | §8 | [ ] |
| Journal save/read | §9 | [ ] |
| Journal Trail | §10 | [ ] |
| Privacy scan | §11 | [ ] |
| Mobile / desktop | §12 | [ ] |
| Sign out + unverified gate | §7 | [ ] |

**Overall result (you fill):** Pass / Fail / Partial — date: _______

Record in [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) §8–§14. **Do not let agents pre-fill Pass.**

---

## 7. Auth and email verification check script

| # | Check | Pass | Fail | Notes |
|---|-------|------|------|-------|
| 1 | Sign in with verified parent account succeeds | [ ] | [ ] | |
| 2 | Unverified account shows verification-required screen (test separately if available) | [ ] | [ ] | |
| 3 | Sign out works | [ ] | [ ] | |
| 4 | After sign-out, protected app areas not accessible without sign-in | [ ] | [ ] | |
| 5 | Password recovery entry reachable (smoke only — do not record email content) | [ ] | [ ] | |
| 6 | Parent ID / Wayfinder ID appears after profile load (no Supabase UUID in normal UI) | [ ] | [ ] | |

Reference: [auth-profile-flow.md](./auth-profile-flow.md)

**If any Fail:** Stop launch. See §16.

Update evidence pack §9.

---

## 8. Dashboard loading check script

After verified sign-in:

| # | Check | Pass | Fail | Notes |
|---|-------|------|------|-------|
| 1 | Dashboard loads without persistent error state | [ ] | [ ] | |
| 2 | Parent ID / Wayfinder ID visible | [ ] | [ ] | |
| 3 | Children section loads (or friendly empty state if no records) | [ ] | [ ] | |
| 4 | Past activities visible when records exist | [ ] | [ ] | |
| 5 | Recent reflections visible when records exist | [ ] | [ ] | |
| 6 | No parent email or Supabase UUID in normal dashboard UI | [ ] | [ ] | |

**If any Fail:** Stop launch. See §18.

Update evidence pack §10.

---

## 9. Journal save/read check script

| # | Check | Pass | Fail | Notes |
|---|-------|------|------|-------|
| 1 | Open journal / activity flow and complete a minimal save | [ ] | [ ] | Use non-identifying test content |
| 2 | Save completes without error | [ ] | [ ] | |
| 3 | Refresh page — entry still readable | [ ] | [ ] | |
| 4 | If Decode a Moment exists and was touched recently: save still works | [ ] | [ ] | Optional if in scope |

**If any Fail:** Stop launch. See §17.

Update evidence pack §11.

---

## 10. Journal Trail check script

| # | Check | Pass | Fail | Notes |
|---|-------|------|------|-------|
| 1 | Saved entry from §9 appears in Journal Trail | [ ] | [ ] | |
| 2 | Trail list order / display acceptable | [ ] | [ ] | |

**If Fail:** Stop launch. See §17.

Update evidence pack §12.

---

## 11. Privacy masking check script

Scan **normal UI** during §7–§10 (do not enable debug unless intentionally testing debug gate).

| # | Check | Pass | Fail | Notes |
|---|-------|------|------|-------|
| 1 | No parent email visible | [ ] | [ ] | |
| 2 | No Supabase UUID visible | [ ] | [ ] | |
| 3 | No child names visible | [ ] | [ ] | |
| 4 | No JWT / token strings visible | [ ] | [ ] | |

**If any Fail:** Treat as P1 privacy incident. Stop launch. Escalate per [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) §11–§13.

Update evidence pack §13.

---

## 12. Mobile and desktop quick check

| # | Check | Pass | Fail | Notes |
|---|-------|------|------|-------|
| 1 | Mobile viewport: layout readable; core navigation usable | [ ] | [ ] | |
| 2 | Desktop: layout readable; core navigation usable | [ ] | [ ] | |
| 3 | Decode a Moment / ALIGN Journey usable if touched in this release | [ ] | [ ] | Optional |

Update evidence pack §14.

---

## 13. Evidence pack update instructions

After §5–§12, update [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md):

1. Set **Confirmed** only for checks you personally passed today (with date and "Rodney" in Verified by).
2. Set **Failed** for any failed check — document in Notes without PII.
3. Leave untouched rows as **Pending / To verify**.
4. Complete §20 go/no-go checkboxes and §21 owner sign-off when ready.
5. If launch candidate status applies, confirm [LAUNCH_CANDIDATE_SIGN_OFF.md](./LAUNCH_CANDIDATE_SIGN_OFF.md) §3 remains valid — conditional on Issue #28 and manual smoke staying clear.
6. Do **not** invent HTTP codes or pass/fail for checks you did not run.

**Launch-ready means:** §8–§14 manual rows Confirmed + §21 signed — not heartbeat alone.

---

## 14. What counts as Go / No-go / Conditional go

| Decision | When |
|----------|------|
| **Go** | All critical manual checks §7–§12 Pass; evidence pack §20 rows checked; no open P0/P1; ALIGN/CAB canon preserved |
| **No-go** | Any critical Fail; privacy Fail; auth/journal/dashboard broken; open P0 |
| **Conditional go** | Minor non-blocking issue with documented follow-up in evidence pack §19 — owner explicit choice only |

**Not sufficient for Go:**

- Public heartbeat pass alone (§5)
- CI green alone
- Docs complete alone without manual §7–§12

Research launch remains **out of scope** unless separately approved.

---

## 15. What to do if heartbeat fails

1. **Pause merges** until cause known ([PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) §14).
2. Check Vercel deploy status for latest `main` commit.
3. Open production URL in browser — confirm public page behaviour.
4. Re-run workflow dispatch after deploy stabilises.
5. Update evidence pack §7 with **Failed** and date.
6. If prolonged outage: treat as P0; consider Vercel rollback (owner action — no auto-rollback in workflow).
7. **Do not** merge risky fixes under time pressure without review.

Heartbeat fail does **not** automatically mean auth/journal broken — still run §7–§12 when site returns if safe.

---

## 16. What to do if auth fails

1. **Stop launch** — No-go until resolved.
2. Classify **P1** minimum ([PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) §11).
3. Check recent merges for touches to auth/profile paths (`app.js` auth sections, `supabase.js` — owner review).
4. Verify Supabase auth / email verification status in Supabase dashboard (no secrets in GitHub issues).
5. Fix on isolated branch; full §6–§12 re-test after merge.
6. Update evidence pack §9 and §18.

**Do not:** disable verification gate, add browser `profiles.insert`/`profiles.upsert`, or weaken RLS without explicit approved task.

---

## 17. What to do if journal save/read fails

1. **Stop launch** — No-go until resolved.
2. Classify **P1**.
3. Check recent merges for journal save/read or dashboard changes.
4. Test one minimal save in production; note error behaviour in evidence pack (no reflection content).
5. Fix on isolated branch; re-run §9–§10 after merge.
6. Update evidence pack §11–§12.

**Do not:** change journal payload compatibility or Supabase schema without approved high-risk task.

---

## 18. What to do if dashboard fails

1. **Stop launch** — No-go if dashboard will not load for verified user.
2. Classify **P1**.
3. Check session / Bearer reads and recent merges affecting dashboard loading.
4. Confirm `parent_id`-first read path still works (owner technical review).
5. Fix on isolated branch; re-run §8 and full §6 after merge.
6. Update evidence pack §10.

Empty states (no children / no activities) are **Pass** if UI is friendly and not erroring.

---

## 19. What not to do during launch

- Do **not** merge multiple risky PRs at once
- Do **not** touch `supabase.js`, `api/*`, `*.sql`, or deployment config under pressure without review
- Do **not** skip manual smoke because heartbeat passed
- Do **not** invent or delegate Pass results in the evidence pack
- Do **not** record PII, tokens, or journal content in GitHub or docs
- Do **not** auto-merge, auto-rollback, or run unapproved workflow changes
- Do **not** declare research launch ready from app launch Go
- Do **not** add App Version entry without user-facing behaviour change
- Do **not** frame child or parent as diagnosis, score, or Behaviour → Advice fix

---

## 20. Post-launch monitoring rhythm

During **launch freeze**, follow daily SGT rhythm in [LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md) §3.

Daily (or after any user-facing merge):

| When | Action |
|------|--------|
| Morning | Read [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md); review open PRs |
| After merge | Production smoke §6–§12 if user-facing; update launch status if shipped |
| Automated | Production Smoke Reminder schedule 22:00 UTC — review Actions summary |
| Issue | Reusable `production-watch` issue — manual checklist reminder only |
| End of day | Handoff summary to agents ([AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md) §15) |

Off-hours: monitor-only — no merges unless P0 and owner approves ([PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) §10).

---

## 21. Handoff message template for agents

Copy after launch checks or incident:

```markdown
## Launch operator handoff

- **Date:**
- **Operator:** Rodney
- **Production URL:** https://wayfinder-modular.vercel.app
- **Launch decision:** Go / No-go / Conditional go
- **Heartbeat (§5):** Pass / Fail / Not run
- **Manual smoke (§6–§12):** Pass / Fail / Partial / Not run
- **Evidence pack updated:** Yes / No — LAUNCH_READINESS_EVIDENCE_PACK.md
- **Open blockers:**
- **Next owner action:**
- **Agent next action:**

**Privacy:** No emails, UUIDs, child names, tokens, secrets, or reflection content in this message.
```

---

## 22. Stop conditions

**Stop launch promotion and escalate** if:

- Any §7–§12 check Fail
- Privacy masking Fail (§11)
- Heartbeat Fail with prolonged outage (§15)
- Evidence would require inventing results
- `main` dirty or production unstable
- ALIGN/CAB or PDPA canon would be weakened
- Uncertainty about auth, RLS, journal, or dashboard integrity

When stopped: update evidence pack, pause merges, use [PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md) for incident triage/recovery and [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) incident steps, and do not ask agents to mark Pass without your verification.

---

## Related docs

- [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md)
- [AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md)
- [LAUNCH_CANDIDATE_SIGN_OFF.md](./LAUNCH_CANDIDATE_SIGN_OFF.md) — Day 14 launch candidate sign-off (Issue #33, PR #35)
- [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) — Day 15 24/7 ops handoff and reporting (Issue #36, PR #37)
- [PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md) — Day 16 incident triage and recovery (Issue #38)
