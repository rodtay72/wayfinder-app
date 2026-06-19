# Launch Candidate Sign-Off

**Day 14 — docs-only launch candidate governance (Issue #33)**

Records the current production build and documentation state as the **launch candidate** for the Wayfinder parent app. **Does not change app runtime, workflows, or UI.**

Read first:

- [docs/LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md)
- [docs/LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md)
- [docs/LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md)
- [docs/CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- GitHub [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — recurring production smoke reminder (**keep open**)

**Production:** [https://wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Last updated:** 2026-06-19

---

## Wayfinder canon (non-negotiable)

Wayfinder is **not** child diagnosis, child profiling, parent scoring, or Behaviour → Advice.

Core pathway:

```
Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action
```

Use cautious language: **may**, **might**, **possible**, **let's explore**.

---

## 1. Launch candidate identity

| Field | Value |
|-------|-------|
| **Production URL** | `https://wayfinder-modular.vercel.app` |
| **GitHub repo** | `rodtay72/wayfinder-app` |
| **Source of truth** | `main` branch — production deploy reflects latest merged `main` |
| **Launch candidate baseline** | Production build from `main` after launch readiness chain through Day 13 (PR #32) |
| **Acceptance rule** | Launch candidate status is **conditional** — accepted only while [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) and owner manual authenticated smoke show **no blocker** |

### Conditional acceptance (non-negotiable)

This launch candidate is **not** an unconditional public-launch declaration.

Status **may be withdrawn** if:

- Issue #28 public heartbeat moves to **Failed** on a verified run
- Owner manual authenticated smoke (evidence pack §8–§14) **Failed** or regresses after a production-impacting merge
- Any launch blocker appears in evidence pack §18 or freeze protocol §2

Re-verify manual smoke after any user-facing or high-risk merge per [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) §6–§12.

---

## 2. Completed launch readiness chain

All items **Confirmed** merged on `main`:

| Day | Deliverable | Merge | Issue |
|-----|-------------|-------|-------|
| 10 | Launch Readiness Evidence Pack | PR #25 | — |
| 11 | Launch Operator Runbook | PR #27 | #26 |
| 12 | Production Smoke Evidence (owner manual smoke all good) | PR #30 | #28 |
| 13 | Launch Freeze and Go/No-Go Protocol | PR #32 | #31 |
| 14 | Launch Candidate Sign-Off (this document) | PR #35 | #33 |
| 15 | 24/7 Launch Operations Handoff | Pending merge | #36 |

---

## 3. Go / no-go sign-off fields

Evidence sourced from [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) §7–§21. Do not invent results.

| Field | Status |
|-------|--------|
| **Public heartbeat** | **Confirmed** — manual dispatch + scheduled run 2026-06-18 (Issue #28; HTTP 200 public GET only) |
| **Owner manual smoke** | **Confirmed all good** — Rodney, 2026-06-19 (Issue #28 thread; evidence pack §8–§14) |
| **Launch blockers present?** | **No** — per evidence pack §18 (as of 2026-06-19 baseline) |
| **Decision** | [x] **Go** (launch candidate accepted — **conditional**) · [ ] No-Go · [ ] Hold |
| **Sign-off owner** | Rodney |
| **Sign-off date** | 2026-06-19 |
| **Notes / non-blocking follow-ups** | Evidence pack §6 branch protection rows may remain **To verify** in GitHub; §19 deferred items (consent persistence, research tooling, OpenClaw, DISC fix, etc.) remain non-blocking for parent app launch candidate |

### Decision meaning

| Decision | When |
|----------|------|
| **Go (conditional)** | Launch readiness chain complete; baseline manual smoke and heartbeat **Confirmed**; no recorded blocker — **subject to ongoing Issue #28 and manual smoke remaining clear** |
| **No-Go** | Any critical manual check **Failed**; heartbeat **Failed** with prolonged outage; open P0; privacy leak |
| **Hold** | Owner pauses launch candidate promotion pending re-smoke or blocker resolution |

**Evidence note:** Public heartbeat (§7 evidence pack) and owner manual smoke (§8–§14) are **separate**. Issue #28 heartbeat pass does **not** replace manual authenticated validation.

---

## 4. Non-negotiable freeze reminders

During launch freeze ([LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md)):

### Forbidden unless explicitly approved

- New features or product scope expansion
- UI polish or copy experiments unrelated to a production blocker
- Research tooling, export code, or consent persistence implementation
- AI implementation or new AI calls
- Questionnaire implementation or response storage
- Schema, RLS, SQL, or API changes
- Runtime refactors (`app.js`, `supabase.js`, `api/*`, HTML entry points)
- Deployment or Vercel/Supabase config changes
- Workflow behaviour changes (`.github/workflows/*`)
- Package/build-system migrations

### Allowed

- Production blockers only (auth, journal, dashboard, privacy, deployment, data safety)
- Docs evidence updates (launch status, evidence pack, runbook, protocol, this sign-off)
- Smoke evidence recording — owner-confirmed only; no invented pass/fail
- Critical safety fixes — minimal diff; owner merge; full manual smoke after merge

### Ongoing rules

- **[Issue #28 stays open](https://github.com/rodtay72/wayfinder-app/issues/28)** as recurring `production-watch` production smoke reminder — do **not** close
- Record only **non-sensitive** evidence — no parent emails, Supabase IDs, child names, tokens, secrets, or reflection content
- **No App Version entry** unless user-facing behaviour actually changed
- One branch, one merge at a time during freeze

---

## 5. Stop conditions

Stop launch candidate promotion and escalate to Rodney if:

- Any auth, RLS, or email verification blocker
- Parent ID / Child ID integrity broken
- Journal save/read or Journal Trail broken
- Dashboard loading broken for verified users
- Privacy masking failure in normal UI (email, Supabase UUID, child names, tokens visible)
- Deployment / production URL down (heartbeat **Failed** with prolonged outage)
- Production monitoring false confidence (treating Issue #28 heartbeat as full authenticated smoke pass)
- Data safety uncertainty or open P0 production incident
- Evidence would require inventing manual results
- ALIGN/CAB or PDPA canon would be weakened by shipping
- Issue #28 is closed without owner approval (recurring reminder must stay open)

When stopped: update evidence pack, pause merges, follow [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) incident steps, and do not ask agents to mark Pass without owner verification.

---

## Related docs

- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md)
- [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md)
- [LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md)
- [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md)
- GitHub [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — recurring production smoke reminder — **keep open**
- GitHub [Issue #33](https://github.com/rodtay72/wayfinder-app/issues/33) — Day 14 launch candidate sign-off (PR #35)
- [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) — Day 15 24/7 ops handoff (Issue #36)
