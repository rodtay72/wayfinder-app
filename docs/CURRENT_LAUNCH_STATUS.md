# Current Launch Status

Living snapshot for agents and owners. Update after user-facing merges and production smoke tests.

**Production:** [wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Last updated:** 2026-06-18

**Last verified merge:** PR #15 — Consent + Research Governance Plan (Day 5)

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

## In flight

| Branch / phase | Summary | Status |
|----------------|---------|--------|
| `docs/research-export-sop-data-dictionary` | Day 6: Research Export SOP + Data Dictionary (docs-only) | Built locally — pending commit/PR |

## Deferred / not started

- Consent persistence (Phase 5C/D / 6C — see governance and export plans)
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
