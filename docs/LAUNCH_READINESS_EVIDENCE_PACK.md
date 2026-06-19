# Launch Readiness Evidence Pack

**Day 10 — final launch readiness evidence ledger**

Single owner-facing document for **parent app launch** go/no-go. This pack does **not** authorise research enrolment or declare research launch ready.

**Production:** [https://wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Local repo:** `C:\Users\rodne\Documents\CodeProjects\active\wayfinder-app`

**Pack last updated:** 2026-06-19

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
| First scheduled cron run | **Confirmed** | GitHub Actions | 2026-06-18 | Public heartbeat pass only — Issue #28 schedule run; HTTP 200 |
| Reusable issue `production-watch` upsert | **Confirmed** | GitHub Actions | 2026-06-18 | Issue #28 — `Production smoke reminder — manual checklist` |
| Step summary includes manual checklist | **Confirmed** | Workflow definition | | See workflow on `main` |
| Auto-merge / auto-rollback / login test | **Not applicable** | | | Explicitly not implemented |

**Privacy:** Do not paste workflow response bodies, tokens, or authenticated URLs into this pack.

---

## 8. Manual smoke-test checklist and result fields

### Owner manual production smoke record (GitHub Issue #28)

| Field | Value |
|-------|-------|
| **Production smoke test** | Owner-confirmed **all good** |
| **Source** | Rodney manual production smoke confirmation, recorded on [GitHub Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) |
| **Date** | 2026-06-19 |
| **Scope checked** | Production load; sign-in / dashboard; child context; Decode a Moment; journal save/read; Journal Trail; privacy masking; mobile quick check |
| **Limitation** | Manual owner-confirmed validation — **not** automated authenticated testing |

**Issue #28 remains open** as the recurring `production-watch` reminder issue. This pack records owner evidence only — do not close Issue #28.

This section is **separate from** the public URL heartbeat automation in §7 (same Issue #28 thread may show both; they are different evidence types).

| # | Check | Status | Verified by | Date | Notes |
|---|-------|--------|-------------|------|-------|
| 1 | Verified user can sign in | **Confirmed** | Rodney | 2026-06-19 | all good — Issue #28 |
| 2 | Dashboard loads Parent ID, children, past activities, reflections | **Confirmed** | Rodney | 2026-06-19 | all good — Issue #28 |
| 3 | Journal save appears in Journal Trail | **Confirmed** | Rodney | 2026-06-19 | all good — Issue #28 |
| 4 | Sign-out works; unverified email blocked | **Confirmed** | Rodney | 2026-06-19 | all good — Issue #28 |
| 5 | No parent email or Supabase UUID in normal UI | **Confirmed** | Rodney | 2026-06-19 | all good — Issue #28 |
| 6 | Decode a Moment and ALIGN Journey still usable if touched | **Confirmed** | Rodney | 2026-06-19 | all good — Issue #28 |
| 7 | Mobile layout readable | **Confirmed** | Rodney | 2026-06-19 | all good — Issue #28 |

Optional desktop row (same session as #7):

| Check | Status | Verified by | Date | Notes |
|-------|--------|-------------|------|-------|
| Desktop layout readable | **Confirmed** | Rodney | 2026-06-19 | all good — Issue #28 |

---

## 9. Auth / profile / email verification evidence fields

CI guardrails confirm auth **patterns exist in repo** — that is not production behaviour proof.

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| Supabase email verification gate before app access | **Confirmed** | Rodney | 2026-06-19 | all good |
| `ensure_profile` via explicit Bearer fetch (no browser `profiles.insert`/`profiles.upsert`) | **Confirmed** | Rodney | 2026-06-19 | all good |
| Password recovery path works | **Confirmed** | Rodney | 2026-06-19 | all good |
| Unverified email blocked from app access | **Confirmed** | Rodney | 2026-06-19 | all good |
| Parent ID / Wayfinder ID reused for same auth user | **Confirmed** | Rodney | 2026-06-19 | all good |

---

## 10. Dashboard loading evidence fields

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| Dashboard loads after verified sign-in | **Confirmed** | Rodney | 2026-06-19 | all good |
| Parent ID / Wayfinder ID displayed | **Confirmed** | Rodney | 2026-06-19 | all good |
| Children / dyads listed | **Confirmed** | Rodney | 2026-06-19 | all good |
| Past activities visible when records exist | **Confirmed** | Rodney | 2026-06-19 | all good |
| Recent reflections visible when records exist | **Confirmed** | Rodney | 2026-06-19 | all good |
| Reads use verified session / Bearer; `parent_id` first | **Confirmed** | Rodney | 2026-06-19 | all good |

---

## 11. Journal save/read evidence fields

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| New journal entry saves without error | **Confirmed** | Rodney | 2026-06-19 | all good |
| Saved entry readable after refresh | **Confirmed** | Rodney | 2026-06-19 | all good |
| Activity journal compatibility preserved | **Confirmed** | Rodney | 2026-06-19 | all good |
| `behaviour_decode` entry saves if Decode a Moment used | **Confirmed** | Rodney | 2026-06-19 | all good |

---

## 12. Journal Trail evidence fields

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| Saved entry appears in Journal Trail | **Confirmed** | Rodney | 2026-06-19 | all good |
| Trail ordering / display acceptable | **Confirmed** | Rodney | 2026-06-19 | all good |

---

## 13. Privacy masking evidence fields

Normal UI must not show parent email, Supabase UUID, child names, JWTs, or secrets.

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| No parent email in normal UI | **Confirmed** | Rodney | 2026-06-19 | all good |
| No Supabase UUID in normal UI | **Confirmed** | Rodney | 2026-06-19 | all good |
| No child names in normal UI | **Confirmed** | Rodney | 2026-06-19 | all good |
| Debug IDs only behind `wayfinder_debug_auth` gate | **Not applicable** | | | Not tested in this smoke pass |

---

## 14. Mobile / desktop evidence fields

| Item | Status | Verified by | Date | Notes |
|------|--------|-------------|------|-------|
| Mobile layout readable and usable | **Confirmed** | Rodney | 2026-06-19 | all good |
| Desktop layout readable and usable | **Confirmed** | Rodney | 2026-06-19 | all good |

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
| Manual smoke §8–§14 not yet recorded as Confirmed | **Resolved** | Owner confirmed all good — 2026-06-19 |
| Public heartbeat ≠ authenticated health | Medium | Do not treat scheduled heartbeat (Issue #28) as substitute for manual §8–§14 |
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

**Launch hold recommendation:** Manual §8–§14 **Confirmed** by owner (2026-06-19, all good). §6 branch protection rows remain **To verify** if not yet checked in GitHub.

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
| 1 | Days 0–9 deliverables merged on `main` | ☑ | |
| 2 | Public URL heartbeat Confirmed (§7) | ☑ | Rodney confirmed 2026-06-18 (dispatch + schedule) |
| 3 | Full manual smoke checklist Confirmed (§8) | ☑ | Rodney — all good — 2026-06-19 |
| 4 | Auth / profile / email verification Confirmed (§9) | ☑ | Rodney — all good — 2026-06-19 |
| 5 | Dashboard loading Confirmed (§10) | ☑ | Rodney — all good — 2026-06-19 |
| 6 | Journal save/read Confirmed (§11) | ☑ | Rodney — all good — 2026-06-19 |
| 7 | Journal Trail Confirmed (§12) | ☑ | Rodney — all good — 2026-06-19 |
| 8 | Privacy masking Confirmed (§13) | ☑ | Rodney — all good — 2026-06-19 |
| 9 | Mobile / desktop Confirmed (§14) | ☑ | Rodney — all good — 2026-06-19 |
| 10 | No open P0/P1 production incident | ☑ | Rodney — all good — 2026-06-19 |
| 11 | ALIGN/CAB canon preserved in shipped product | ☑ | Rodney — 2026-06-19 |
| 12 | Research launch explicitly out of scope for this decision | ☑ | |

**Decision (owner selects one):**

- [x] **Go** — parent app launch-ready
- [ ] **No-go** — block launch; document blockers in §18
- [ ] **Conditional go** — launch with documented follow-ups in §19

**Evidence note:** Authenticated manual validation (§8–§14) is **Confirmed** separately from public URL heartbeat (§7). Issue #28 public heartbeat pass does **not** replace owner manual confirmation recorded in §8.

---

## 21. Final owner sign-off section

| Field | Value |
|-------|-------|
| **Decision** | Go |
| **Date** | 2026-06-19 |
| **Signed by** | Rodney |
| **Conditions / follow-ups** | §6 branch protection still To verify in GitHub if not yet checked; §19 non-blocking items remain deferred |
| **Next review date** | After next user-facing merge to production |
| **Notes** | Manual production smoke: all good (Rodney, 2026-06-19), recorded on GitHub Issue #28. Public heartbeat on Issue #28 is separate automation only (§7). Issue #28 stays open as recurring reminder. |

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
- GitHub [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — recurring `production-watch` reminder (public heartbeat + manual checklist prompt); **keep open**; owner manual smoke recorded in §8
- [RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md](./RESEARCH_LAUNCH_READINESS_STUDY_OPERATIONS_PLAN.md) — research go/no-go (separate)
