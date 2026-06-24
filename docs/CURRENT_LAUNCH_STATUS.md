# Current Launch Status

Living snapshot for agents and owners. Update after user-facing merges and production smoke tests.

**Production:** [wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Last updated:** 2026-06-24

**Last verified merge:** PR #67 — counsellor response status badges; parent feedback mark-as-read flow fixed and owner-verified after PR #64 / #66 SQL applies

**Launch freeze:** Active — see [docs/LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md)

**v0.4 release train:** Active — 7-day product release — see [docs/V0_4_IMPLEMENTATION_CONTRACT.md](./V0_4_IMPLEMENTATION_CONTRACT.md) (Issue #40)

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
| Launch Operator Runbook | Day 11 docs-only manual pre-launch and launch-day checks | PR #27 |
| Production Smoke Evidence | Day 12 owner manual smoke recorded (all good) — Issue #28 | PR #30 |
| Launch Freeze and Go/No-Go Protocol | Day 13 docs-only launch freeze operations — Issue #31 | PR #32 |
| Launch Candidate Sign-Off | Day 14 launch candidate accepted (conditional) — Issue #33 | PR #35 |
| 24/7 Launch Operations Handoff | Day 15 GitHub as 24/7 operating centre — Issue #36 | PR #37 |
| Production Incident Triage and Recovery Playbook | Day 16 incident triage and recovery — Issue #38 | PR #39 |
| v0.4 Implementation Contract | v0.4 Day 1 build plan and tier map — Issue #40 | PR #41 |
| v0.4 Day 2 Events Listing | Parent Events Listing and add-to-calendar flow verified on main | PR #43 |
| Parent feedback mark-as-read fix | Issue #52 parent read receipt flow fixed; SQL hotfixes applied manually and owner verified | PR #64, PR #66 |
| Parent feedback error copy | Parent-facing mark-read failure copy clarified to refer to read status/dashboard notice only | PR #65 |
| Counsellor response status badges | Counsellor workspace shows Pending response, Draft saved, Published, Revoked, and Status unavailable badges on parent-approved entries | PR #67 |

## In flight

| Branch / phase | Summary | Status |
|----------------|---------|--------|
| Issue #52 parent/counsellor feedback workflow | Per-entry counsellor response flow, parent mark-read flow, and counsellor response status badges merged and owner-verified through PR #67 | Monitoring / verified |
| `feature/facilitator-hosted-events` | Issue #45: DB-backed facilitator-hosted events + graceful degradation until SQL applied | Merged to main |

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
8. Events Listing page reachable (Dashboard → Events); event cards display; add-to-calendar privacy-safe (.ics contains logistics only).
9. Parent counsellor feedback: published feedback opens, mark-as-read succeeds, read receipt records, dashboard unread notice clears, and feedback remains readable.
10. Counsellor workspace: parent-approved entries show response status badges (Pending response, Draft saved, Published, Revoked, or Status unavailable) without exposing private identifiers or hidden response content.

## Agent ops notes

- **Launch freeze active** — [docs/LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md)
- One branch, one merge at a time.
- Use `.github/PULL_REQUEST_TEMPLATE.md` for every PR.
- High-risk paths require CODEOWNERS review once branch protection is enabled.
- Platform sync brief required for user-facing, research, consent, or AI changes.
- Production smoke reminder workflow (`.github/workflows/production-smoke-reminder.yml`) runs daily at 22:00 UTC (06:00 SGT) and via manual dispatch — public URL heartbeat only; auth/journal/dashboard checks remain manual.
- [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — recurring `production-watch` reminder — **keep open**
- Launch readiness evidence pack: [docs/LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) — owner manual smoke **Confirmed** (Rodney, 2026-06-19, all good) on Issue #28; public heartbeat separate
- Launch operator runbook: [docs/LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) — manual smoke script (Issue #26)
- Launch candidate sign-off: [docs/LAUNCH_CANDIDATE_SIGN_OFF.md](./LAUNCH_CANDIDATE_SIGN_OFF.md) — Day 14 (Issue #33, PR #35); **conditional** on Issue #28 and manual smoke remaining clear
- 24/7 launch operations handoff: [docs/24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) — Day 15 (Issue #36, PR #37); GitHub as operating centre; always-post-report rule
- Production incident playbook: [docs/PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md) — Day 16 (Issue #38, PR #39); triage, recovery, and handoff for operational/data-safety events
- **v0.4 implementation contract:** [docs/V0_4_IMPLEMENTATION_CONTRACT.md](./V0_4_IMPLEMENTATION_CONTRACT.md) — Day 1 complete (Issue #40, PR #41)
- **v0.4 Day 2:** Activity-based hosted sessions MVP (Issue #42) — parent browse + add-to-calendar only; facilitator hosting is future counsellor-portal workflow (not in parent app)
- **Production Cycle 1:** Owner-confirmed PASS recorded on Issue #28 (non-sensitive reference only)
