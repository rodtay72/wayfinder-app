# Launch Freeze and Go/No-Go Protocol

**Day 13 — docs-only launch freeze operations (Issue #31)**

Defines how Wayfinder stays stable during the final launch window. **Does not change app runtime, workflows, or UI.**

Read first:

- [AGENTS.md](../AGENTS.md)
- [docs/WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [docs/LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md)
- [docs/LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md)
- [docs/CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- GitHub [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — recurring production smoke reminder (**keep open**)

**Production:** [https://wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Last updated:** 2026-06-19

---

## Wayfinder canon during freeze

Wayfinder is **not** child diagnosis, child profiling, parent scoring, or Behaviour → Advice.

Core pathway:

```
Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action
```

Use cautious language: **may**, **might**, **possible**, **let's explore**.

---

## 1. Launch freeze rule

### Freeze purpose

Reduce launch risk by making explicit what **must not change** during the final launch window unless Rodney explicitly approves.

### Forbidden during freeze (unless explicitly approved)

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

### Allowed during freeze

- **Production blockers only** — auth, journal save/read, dashboard loading, privacy leak, deployment failure, data safety
- **Docs evidence updates** — launch status, evidence pack, operator runbook, this protocol
- **Smoke evidence recording** — owner-confirmed results only; no invented pass/fail
- **Critical safety fixes** — minimal diff; owner merge; full manual smoke after merge

### Freeze merge rule

- **One branch, one merge at a time**
- No stacked risky PRs during freeze
- Every merge during freeze requires: CI green, owner review, manual authenticated smoke if user-facing or high-risk paths touched
- **No App Version entry** unless user-facing behaviour actually changed

### Public heartbeat vs manual validation (non-negotiable)

| Check type | What it proves | During freeze |
|------------|----------------|---------------|
| Issue #28 public heartbeat | Production URL responds (GET) | Helpful signal — **not** full health |
| Owner manual authenticated smoke | Sign-in, dashboard, journal, trail, privacy, mobile | **Required** after user-facing or blocker fixes |

---

## 2. Go / no-go criteria

### Go (launch may proceed / remain live)

All must be true:

| # | Criterion |
|---|-----------|
| 1 | Production public load is healthy (Issue #28 heartbeat pass or owner confirms URL loads) |
| 2 | Owner-confirmed manual authenticated smoke remains **green** (see [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) §8–§14) |
| 3 | Sign-in, dashboard, child context, Decode a Moment, journal save/read, Journal Trail, privacy masking, and mobile quick check have **no known launch-blocking issue** |
| 4 | No unresolved blocker in: auth, RLS, email verification, journal, dashboard, privacy masking, Parent ID, Child ID, deployment, or production monitoring |
| 5 | ALIGN/CAB canon preserved — no child/parent diagnosis or scoring framing shipped |
| 6 | No open P0 production incident |

**Current baseline (Day 12 / PR #30):** Owner manual smoke recorded **all good** on [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28), 2026-06-19. Re-verify after any production-impacting merge.

**Day 13 / PR #32 complete:** Launch freeze protocol merged. **Day 14 / PR #35 complete:** Launch candidate recorded in [LAUNCH_CANDIDATE_SIGN_OFF.md](./LAUNCH_CANDIDATE_SIGN_OFF.md) (Issue #33) — **conditional** on Issue #28 and manual smoke remaining clear. **Day 15 / PR #37 complete:** 24/7 ops handoff in [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) (Issue #36). **Day 16:** Incident playbook in [PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md) (Issue #38). **Production Cycle 1:** Owner-confirmed PASS on Issue #28 (non-sensitive reference).

### No-go (hold launch or pause merges)

Any of:

- Manual authenticated smoke **Failed** or regressed after a merge
- Public heartbeat **Failed** with prolonged outage
- Auth gate, journal save/read, or dashboard broken for verified users
- Privacy leak in normal UI (email, Supabase UUID, child names, tokens visible)
- Open P0 or unresolved P1 in auth, RLS, journal, dashboard, Parent ID, Child ID, deployment, or data safety
- Freeze violated without approval (runtime/schema/workflow change merged silently)

### Conditional go

Owner explicit decision only — documented follow-ups in evidence pack §19; no silent risk acceptance.

---

## 3. Daily SGT launch rhythm

Singapore Time (SGT, UTC+8). Adjust if owner timezone differs.

Scheduled public heartbeat: **22:00 UTC daily** (= **06:00 SGT** next calendar day).

| SGT window | Action | Owner / agent |
|------------|--------|---------------|
| **06:00–08:00** | Review [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) and latest workflow run — public heartbeat only | Owner |
| **08:00–09:00** | Read [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md); confirm no unapproved in-flight runtime work | Owner |
| **09:00–12:00** | Merge window (if needed) — freeze rules apply; one merge max | Owner merges |
| **After any merge** | Manual authenticated smoke per [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) §6–§12 | Owner |
| **12:00–13:00** | Update evidence pack if smoke run; record **non-sensitive** results only | Owner |
| **18:00–19:00** | Optional manual dispatch of Production Smoke Reminder workflow before owner offline block | Owner |
| **End of day** | Confirm Issue #28 still open; no P0/P1 open | Owner |

**Evidence rules:** Record pass/fail/date and **all good**-style notes only. Do **not** record emails, Supabase IDs, child names, tokens, secrets, or reflection content.

---

## 4. Incident triage

Full playbook: [PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md) (Issue #38). Incidents are **operational/data-safety events** — not child/parent diagnostic conclusions.

### Severity during freeze

| Level | Examples | Action |
|-------|----------|--------|
| **P0 — Launch blocker** | Production down; auth broken; data loss risk; privacy leak in normal UI | **Stop all feature work.** Pause merges. Owner triage immediately. |
| **P1 — Major** | Dashboard/journal save fails; verification gate bypass; Parent ID / Child ID broken | **Stop feature work.** Blocker fix branch only. Full manual smoke after fix. |
| **P2 — Moderate** | UI regression; non-critical widget; copy typo | **Defer** during freeze unless owner promotes to blocker |
| **P3 — Low** | Docs drift; CI flake; Issue #28 reminder only | Track; no runtime change without approval |

### Launch blocker categories (stop feature work)

Stop non-blocker work immediately if any are open:

- Auth / email verification / session
- Journal save/read or Journal Trail
- Dashboard loading or child context display
- Privacy masking (PDPA UI)
- Parent ID / Child ID integrity
- Deployment / production URL down
- RLS / data safety uncertainty
- Production monitoring false confidence (treating heartbeat as full smoke pass)

### Non-blockers (defer during freeze)

- Research governance docs (already complete)
- OpenClaw / webhooks
- DISC display fix
- Consent persistence
- Questionnaire UI
- UI polish without safety impact

### Escalation

1. Classify P0–P3
2. Comment on [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) or linked ops issue — **no PII**
3. Pause merges if P0/P1
4. Fix on isolated branch; owner merge only
5. Re-run manual smoke; update evidence pack
6. Do **not** close Issue #28 (recurring reminder)

See also [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) §11–§14.

---

## 5. Future agent instructions during freeze

Before recommending **any** change during launch freeze, agents must read:

1. [AGENTS.md](../AGENTS.md)
2. [docs/WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
3. [docs/LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md)
4. [docs/LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md)
5. [docs/CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
6. **This protocol** — [LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md)
7. [docs/LAUNCH_CANDIDATE_SIGN_OFF.md](./LAUNCH_CANDIDATE_SIGN_OFF.md) — Day 14 launch candidate (Issue #33, PR #35)
8. [docs/24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) — Day 15 24/7 ops and reporting (Issue #36, PR #37)
9. [docs/PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md) — Day 16 incident triage and recovery (Issue #38)
10. GitHub [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — do **not** close

### Agent must

- Default to **no runtime changes** during freeze
- Propose docs-only or blocker-fix scope with explicit allowlist
- Preserve public heartbeat vs manual authenticated validation distinction
- Preserve ALIGN/CAB non-diagnostic framing
- Stop and report if freeze, canon, or safety rules conflict
- Never invent smoke evidence — owner confirms only
- Never record PII or secrets in issues, PRs, or docs

### Agent must not

- Merge to `main` without owner approval
- Touch high-risk files without explicit issue allowlist
- Close Issue #28
- Treat Issue #28 heartbeat pass as authenticated smoke pass
- Add features, research tooling, AI calls, schema work, or workflow changes during freeze without explicit approval

### Stop conditions

Stop and escalate to Rodney when:

- Freeze would be violated
- Auth, journal, dashboard, or privacy integrity uncertain
- Evidence would require inventing manual results
- ALIGN/CAB or PDPA canon would be weakened

---

## Related docs

- [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) — owner evidence and go/no-go ledger
- [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) — manual smoke script
- [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) — incident and ops rhythm
- [AGENT_HANDOFF_BRIEF.md](./AGENT_HANDOFF_BRIEF.md) — agent handoff rules
- [LAUNCH_CANDIDATE_SIGN_OFF.md](./LAUNCH_CANDIDATE_SIGN_OFF.md) — Day 14 launch candidate sign-off (Issue #33, PR #35)
- [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) — Day 15 24/7 ops handoff (Issue #36, PR #37)
- [PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md) — Day 16 incident triage and recovery (Issue #38)

**Issue #28:** Recurring `production-watch` production smoke reminder — **keep open.**
