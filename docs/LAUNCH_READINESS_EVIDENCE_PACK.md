# Launch Readiness Evidence Pack

**Day 10 — final launch readiness evidence ledger**

Single owner-facing document for **parent app launch** go/no-go. This pack does **not** authorise research enrolment or declare research launch ready.

**Production:** [https://wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Local repo:** `C:\Users\rodne\Documents\CodeProjects\active\wayfinder-app`

**Pack last updated:** 2026-06-18

**Evidence rules:** Do not invent evidence. Record only what is explicitly verified. Do not record parent emails, Supabase UUIDs, child names, JWTs, tokens, secrets, or reflection content in this pack.

---

## Evidence status key

| Status | Meaning |
|--------|---------|
| **Confirmed** | Explicitly verified — merge on `main`, or owner/agent stated result |
| **Pending / To verify** | Not yet confirmed in production by owner manual test |
| **Failed** | Owner recorded a failed manual or automated check |
| **Not applicable** | Out of scope for parent app launch evidence |
| **To verify** | Owner must check GitHub or production UI and fill in |

---

## 1. Purpose and scope

### What this pack creates

One consolidated place for Rodney (product owner) and agents to see:

- what Days 0–9 completed on `main`
- what automation has verified (public URL heartbeat only)
- what **remains manual** and must be owner-verified
- what is **blocked** vs **non-blocking** for launch
- whether Wayfinder is **launch-ready** for the parent app

### What this pack does not do

- Does **not** change app runtime, UI, auth, journal, schema, or workflows
- Does **not** invent manual test results
- Does **not** replace authenticated production testing
- Does **not** declare research launch ready ([RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md](./RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md) is separate)

### App launch vs research launch

| Scope | This pack | Day 7 research plan |
|-------|-----------|---------------------|
| Parent app on production | **Yes** | No |
| Research enrolment / export / consent persistence | No | **Yes** |

### Wayfinder canon (non-negotiable)

Wayfinder is **not** child diagnosis, child profiling, parent scoring, or a generic Behaviour → Advice tool.

Core pathway:

```
Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action
```

Use cautious language in all product and evidence notes: **may**, **might**, **possible**, **let's explore**.

---

## 2. Launch deadline and current priority

| Item | Value |
|------|-------|
| Launch window | ~7 days from 2026-06-18 (~2026-06-25) per [AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md) |
| **Day 10 priority** | Final launch readiness evidence pack — consolidation and owner sign-off |
| Not the priority | New features, runtime changes, workflow behaviour changes, or more research governance docs |
| Safety rule | Production safety outranks convenience |

---

## 3. Source of truth

| Resource | Location |
|----------|----------|
| GitHub repo | `rodtay72/wayfinder-app` |
| Local folder | `C:\Users\rodne\Documents\CodeProjects\active\wayfinder-app` |
| Production app | `https://wayfinder-modular.vercel.app` |
| Launch snapshot | [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) |
| Ops plan | [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) |
| Agent handoff | [AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md) |
| **This evidence pack** | [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) |

**Deprecated — do not use:**

- OneDrive: `C:\Users\rodne\OneDrive\Favorites\Documents\Claude\Projects\wayfinder-app`
- `wayfinder_modular` except read-only reference
- Old cloned copies or stale snapshots

---

## 4. Completed Day 0–Day 9 ledger

Merge facts **Confirmed** from `main` history. Per-day production smoke is **not** claimed unless recorded in §8.

| Day | Deliverable | Merge | Evidence type | Status |
|-----|-------------|-------|---------------|--------|
| 0 | Agent ops — PR template, issue template, CODEOWNERS, guardrail workflows, ops docs | PR #5 | Automation + docs | **Confirmed** merged |
| 1 | Research AI Capability Map | PR #7 | Docs-only | **Confirmed** merged |
| 2 | Activity Practice Taxonomy (`ACTIVITY_PRACTICE_CATALOG`; `ACTIVITIES` unchanged) | PR #9 | Metadata docs | **Confirmed** merged |
| 3 | Questionnaire Measures Framework | PR #11 | Docs-only | **Confirmed** merged |
| 4 | AI Congruence Analysis Contract | PR #13 | Docs-only | **Confirmed** merged |
| 5 | Consent + Research Governance Plan | PR #15 | Docs-only | **Confirmed** merged |
| 6 | Research Export SOP + Data Dictionary | PR #17 | Docs-only | **Confirmed** merged |
| 7 | Research Launch Readiness + Study Operations Plan | PR #19 | Docs-only | **Confirmed** merged |
| 8 | Platform Sync + Production Ops + Agent Handoff Brief | PR #21 | Docs-only | **Confirmed** merged |
| 9 | Production Smoke Reminder workflow | PR #23 | GitHub Actions workflow | **Confirmed** merged |

---

## 5. Production URL and monitoring status

| Check | Status | Evidence / notes |
|-------|--------|------------------|
| Production URL | **Confirmed** | `https://wayfinder-modular.vercel.app` |
| Workflow on `main` | **Confirmed** | `.github/workflows/production-smoke-reminder.yml` (PR #23) |
| Triggers | **Confirmed** | `workflow_dispatch` + daily schedule `0 22 * * *` UTC |
| Public heartbeat scope | **Confirmed** | Unauthenticated GET only — see §7 limits |

### Critical limit (read before go/no-go)

The production smoke reminder workflow performs a **public URL heartbeat only**.

It does **not** prove:

- auth / sign-in / session health
- Supabase connectivity or RLS behaviour
- dashboard loading
- journal save/read
- Journal Trail behaviour

**Authenticated app testing remains manual.** Owner must complete §8–§14 before declaring launch-ready.

---

## 6. GitHub branch protection / required checks status

**Do not assume GitHub settings from repo files alone.** Owner verifies in GitHub → Settings → Branches / Rulesets.

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| Branch protection on `main` | **To verify** | | | |
| Required status check: Wayfinder Checks | **To verify** | | | From `wayfinder-checks.yml` |
| Required status check: wayfinder-guardrails-check | **To verify** | | | From `wayfinder-guardrails.yml` on PRs |
| CODEOWNERS review required | **To verify** | | | [WAYFINDER_AGENT_OPERATING_SYSTEM.md](./WAYFINDER_AGENT_OPERATING_SYSTEM.md): not enforceable until branch protection enables it |
| Required PR reviews before merge | **To verify** | | | |
| Production smoke reminder required on merge | **Not applicable** | | | Reminder workflow; not a merge gate unless owner configures |

---

## 7. Production Smoke Reminder workflow evidence

| Field | Status | Verified by | Date | Notes |
|-------|--------|-------------|------|-------|
| Workflow file merged (PR #23) | **Confirmed** | Git history | 2026-06-18 | On `main` |
| Manual `workflow_dispatch` on `main` succeeded | **Confirmed** | Rodney | 2026-06-18 | Owner confirmed successful manual run |
| First scheduled cron run | **Pending / To verify** | | | Owner confirms when observed |
| Reusable issue `production-watch` upsert | **Pending / To verify** | | | Title: `Production smoke reminder — manual checklist` |
| Step summary includes manual checklist | **Confirmed** | Workflow definition | | See workflow on `main` |
| Auto-merge / auto-rollback / login test | **Not applicable** | | | Explicitly not implemented |

**Privacy:** Do not paste workflow response bodies, tokens, or authenticated URLs into this pack.

---

## 8. Manual smoke-test checklist and result fields

**Default for all rows: Pending / To verify.** Day 9 public heartbeat success does **not** substitute for these checks.

| # | Check | Status | Verified by | Date | Notes |
|---|-------|--------|-------------|------|-------|
| 1 | Verified user can sign in | **Pending / To verify** | | | |
| 2 | Dashboard loads Parent ID, children, past activities, reflections | **Pending / To verify** | | | |
| 3 | Journal save appears in Journal Trail | **Pending / To verify** | | | |
| 4 | Sign-out works; unverified email blocked | **Pending / To verify** | | | |
| 5 | No parent email or Supabase UUID in normal UI | **Pending / To verify** | | | |
| 6 | Decode a Moment and ALIGN Journey still usable if touched | **Pending / To verify** | | | |
| 7 | Mobile layout readable | **Pending / To verify** | | | |

Optional desktop row (same session as #7):

| Check | Status | Verified by | Date | Notes |
|-------|--------|-------------|------|-------|
| Desktop layout readable | **Pending / To verify** | | | |

---

## 9. Auth / profile / email verification evidence fields

CI guardrails confirm auth **patterns exist in repo** — that is not production behaviour proof.

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| Supabase email verification gate before app access | **Pending / To verify** | | | See [auth-profile-flow.md](./auth-profile-flow.md) |
| `ensure_profile` via explicit Bearer fetch (no browser `profiles.insert`/`profiles.upsert`) | **Pending / To verify** | | | CI scans patterns on `main` — manual prod test still required |
| Password recovery path works | **Pending / To verify** | | | |
| Unverified email blocked from app access | **Pending / To verify** | | | |
| Parent ID / Wayfinder ID reused for same auth user | **Pending / To verify** | | | |

---

## 10. Dashboard loading evidence fields

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| Dashboard loads after verified sign-in | **Pending / To verify** | | | |
| Parent ID / Wayfinder ID displayed | **Pending / To verify** | | | |
| Children / dyads listed | **Pending / To verify** | | | |
| Past activities visible when records exist | **Pending / To verify** | | | |
| Recent reflections visible when records exist | **Pending / To verify** | | | |
| Reads use verified session / Bearer; `parent_id` first | **Pending / To verify** | | | |

---

## 11. Journal save/read evidence fields

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| New journal entry saves without error | **Pending / To verify** | | | |
| Saved entry readable after refresh | **Pending / To verify** | | | |
| Activity journal compatibility preserved | **Pending / To verify** | | | |
| `behaviour_decode` entry saves if Decode a Moment used | **Pending / To verify** | | | |

---

## 12. Journal Trail evidence fields

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| Saved entry appears in Journal Trail | **Pending / To verify** | | | |
| Trail ordering / display acceptable | **Pending / To verify** | | | |

---

## 13. Privacy masking evidence fields

Normal UI must not show parent email, Supabase UUID, child names, JWTs, or secrets.

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| No parent email in normal UI | **Pending / To verify** | | | |
| No Supabase UUID in normal UI | **Pending / To verify** | | | |
| No child names in normal UI | **Pending / To verify** | | | |
| Debug IDs only behind `wayfinder_debug_auth` gate | **Pending / To verify** | | | Optional check |

---

## 14. Mobile / desktop evidence fields

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| Mobile layout readable and usable | **Pending / To verify** | | | |
| Desktop layout readable and usable | **Pending / To verify** | | | |

---

## 15. Agent socialisation status

| Asset | Status | Notes |
|-------|--------|-------|
| [AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md) | **Confirmed** on `main` | PR #21 |
| [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) | **Confirmed** on `main` | PR #21 |
| [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) | **Confirmed** on `main` | Living snapshot |
| PR template + agent issue template | **Confirmed** on `main` | Day 0, PR #5 |
| Platform sync brief template + PR comment bot | **Confirmed** on `main` | Day 0 + Day 8 ops |
| Production smoke reminder workflow | **Confirmed** on `main` | PR #23 |
| Cross-platform webhook (OpenClaw) | **Not applicable** | Deferred — see §16 |
| Manual handoff between platforms | **Confirmed** process | Owner + agents use docs and PR/issue templates |

---

## 16. OpenClaw blocked status

| Item | Status | Notes |
|------|--------|-------|
| OpenClaw / external webhook socialisation | **Blocked / Deferred** | No secrets configured; listed in [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) deferred |
| Impact on parent app launch | **Non-blocking** | Manual copy/handoff remains required |

---

## 17. Known launch risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Manual smoke §8–§14 not yet recorded as Confirmed | High until owner fills | Complete manual production test; update this pack |
| Public heartbeat ≠ authenticated health | Medium | Do not treat Day 9 workflow as full smoke pass |
| Branch protection / CODEOWNERS may be partial | Medium | Owner verifies §6 |
| Owner-dependent merge and smoke path | Medium | Documented in ops plan |
| Research governance docs exist; research features unimplemented | Low for app launch | Keep research launch separate |
| Consent persistence not implemented | Low for app launch | Deferred; not required for current parent app scope |
| DISC profile persistence/display fix deferred | Low | Track as follow-up |
| Single reusable `production-watch` issue depends on workflow + label | Low | Owner verifies §7 scheduled run |

---

## 18. Launch blockers (parent app launch)

A blocker applies when owner marks **Failed** on a critical manual check, heartbeat **Failed** when verified, or an open **P0** production incident exists.

| Blocker | Current status | Owner action |
|---------|----------------|--------------|
| Production public URL down (heartbeat Failed) | **None recorded** | Update if heartbeat fails |
| Auth gate broken (§9 Failed) | **None recorded** | Manual test |
| Dashboard / journal / trail broken (§10–12 Failed) | **None recorded** | Manual test |
| Privacy leak in normal UI (§13 Failed) | **None recorded** | Manual test |
| Open P0 incident | **None recorded** | Owner declaration |

**Launch hold recommendation:** While §8–§14 remain **Pending / To verify**, do not mark app **launch-ready** in §20 — complete manual evidence first.

### Research launch blockers (separate — not app launch blockers)

Per [RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md](./RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md) §22: consent persistence, export tooling, ethics/IRB, etc. These **do not block** parent app launch unless owner explicitly ties them together.

---

## 19. Non-blocking follow-ups

| Item | Status |
|------|--------|
| Consent persistence | Deferred |
| Mandatory research consent governance UI | Deferred |
| Questionnaire UI, scoring, response storage | Deferred |
| Research export code / CSV / API | Deferred |
| AI research pipeline expansion | Deferred |
| OpenClaw webhook socialisation | Deferred |
| Weekly guardrail summary workflow | Deferred |
| DISC profile persistence/display fix | Deferred |
| HIPAA / security-readiness audit (readiness review only) | Deferred |
| Post-merge smoke auto-trigger on merge | Partial (PR template + sync brief only) |
| Update [AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md) Day 8–9 status rows | Follow-up docs tidy |

---

## 20. Go / no-go decision table (parent app launch)

**Go** only when owner marks Pass on all critical rows. Partial automation (§7 heartbeat) alone is **insufficient**.

| # | Criterion | Pass | Owner sign-off |
|---|-----------|------|----------------|
| 1 | Days 0–9 deliverables merged on `main` | ☐ | |
| 2 | Public URL heartbeat Confirmed (§7 manual dispatch) | ☐ | Rodney confirmed 2026-06-18 |
| 3 | Full manual smoke checklist Confirmed (§8) | ☐ | |
| 4 | Auth / profile / email verification Confirmed (§9) | ☐ | |
| 5 | Dashboard loading Confirmed (§10) | ☐ | |
| 6 | Journal save/read Confirmed (§11) | ☐ | |
| 7 | Journal Trail Confirmed (§12) | ☐ | |
| 8 | Privacy masking Confirmed (§13) | ☐ | |
| 9 | Mobile / desktop Confirmed (§14) | ☐ | |
| 10 | No open P0/P1 production incident | ☐ | |
| 11 | ALIGN/CAB canon preserved in shipped product | ☐ | Qualitative owner review |
| 12 | Research launch explicitly out of scope for this decision | ☐ | |

**Decision (owner selects one):**

- [ ] **Go** — parent app launch-ready
- [ ] **No-go** — block launch; document blockers in §18
- [ ] **Conditional go** — launch with documented follow-ups in §19

**Current automated evidence alone:** **Not sufficient for Go** — manual §8–§14 still Pending.

---

## 21. Final owner sign-off section

| Field | Value |
|-------|-------|
| **Decision** | Go / No-go / Conditional go |
| **Date** | |
| **Signed by** | |
| **Conditions / follow-ups** | |
| **Next review date** | |
| **Notes** | |

Owner signature confirms manual evidence in §8–§14 was verified in production (without recording PII in this pack).

---

## 22. Stop conditions

Stop launch promotion and escalate if:

- Any §8–§14 check is marked **Failed**
- Public heartbeat moves to **Failed** on verified run
- Evidence in this pack would require inventing results — stop and re-test manually
- ALIGN/CAB or PDPA canon would be weakened by shipping
- Auth, RLS, profile integrity, or journal compatibility is at risk
- Production is unstable or open P0 incident exists
- Research launch is conflated with app launch without explicit owner decision

Do not fill **Confirmed** without explicit verification. Do not record emails, UUIDs, child names, tokens, secrets, or reflection content in this pack.

---

## Related docs

- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md)
- [AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md)
- [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) — owner manual check script (Issue #26)
- [RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md](./RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md) — research go/no-go (separate)
