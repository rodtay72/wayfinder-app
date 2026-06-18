# Current Launch Status

Living snapshot for agents and owners. Update after user-facing merges and production smoke tests.

**Production:** [wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Last updated:** 2026-06-18

**Last verified merge:** PR #25 — Launch Readiness Evidence Pack (Day 10)

## Released on main

| Version / area | Summary | Merge |
|----------------|---------|-------|
| v0.3.2 | Your ALIGN Journey read-only insights | PR #2 |
| App Version page | Parent-facing release notes page | PR #3 |
| PDPA signup notice | Signup-only privacy/data-use acknowledgement checkbox (not persisted) | PR #4 |
| Agent ops (Day 0) | PR template, issue template, CODEOWNERS, guardrail workflows, ops docs | PR #5 |
| Research + AI Capability Map | Issue #6 docs-only research architecture | PR #7 |
| Activity Practice Taxonomy | Issue #8 metadata-only (`ACTIVITY_PRACTICE_CATALOG`; `ACTIVITIES` unchanged) | PR #9 |
| Questionnaire Measures Framework | Day 3 docs-only research architecture with item vetting governance | PR #11 |
| AI Congruence Analysis Contract | Day 4 docs-only AI governance contract | PR #13 |
| Consent + Research Governance Plan | Day 5 docs-only consent and research governance | PR #15 |
| Research Export SOP + Data Dictionary | Day 6 docs-only export SOP and data dictionary | PR #17 |
| Research Launch Readiness + Study Operations Plan | Day 7 docs-only research launch readiness and study ops | PR #19 |
| Platform Sync + Production Ops | Day 8 docs-only handoff brief and production ops plan | PR #21 |
| Production Smoke Reminder workflow | Day 9 public URL heartbeat + manual smoke reminder issue | PR #23 |
| Launch Readiness Evidence Pack | Day 10 docs-only owner go/no-go evidence ledger | PR #25 |

## In flight

| Branch / phase | Summary | Status |
|----------------|---------|--------|
| `docs/launch-operator-runbook` | Day 11: Launch operator runbook (Issue #26, docs-only) | In flight |

## Deferred / not started

- Consent persistence (Phase 7D / 5C–5D — see governance plans)
- Mandatory research consent governance
- Questionnaire UI, scoring, or response storage in app
- DISC profile persistence/display fix
- HIPAA / security-readiness audit (readiness review only — not a compliance claim)
- OpenClaw / external webhook socialisation

## Production smoke checklist (after user-facing merge)

1. Verified user can sign in.
2. Dashboard loads Parent ID, children, past activities, reflections.
3. Journal save appears in Journal Trail.
4. Sign-out works; unverified email blocked.
5. No parent email or Supabase UUID in normal UI.
6. Decode a Moment and ALIGN Journey still usable if touched.
7. Mobile layout readable.

## Agent ops notes

- One branch, one merge at a time.
- Use `.github/PULL_REQUEST_TEMPLATE.md` for every PR.
- High-risk paths require CODEOWNERS review once branch protection is enabled.
- Platform sync brief required for user-facing, research, consent, or AI changes.
- Production smoke reminder workflow (`.github/workflows/production-smoke-reminder.yml`) runs daily at 22:00 UTC and via manual dispatch — public URL heartbeat only; auth/journal/dashboard checks remain manual.
- Launch readiness evidence pack: [docs/LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) — owner go/no-go ledger; manual production evidence required before launch-ready.
- Launch operator runbook: [docs/LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) — step-by-step manual pre-launch and launch-day checks (Issue #26).
