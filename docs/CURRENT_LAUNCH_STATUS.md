# Current Launch Status

Living snapshot for agents and owners. Update after user-facing merges and production smoke tests.

**Production:** [wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Last updated:** 2026-06-29

**Last verified merge:** PR #120A — payment/pricing strategy spec (docs-only, merge `43d0d6c`)

**Next proposed PR:** PR #121 — mobile PWA install compatibility hardening

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
| Parent Feedback Library | Parent dashboard keeps published counsellor feedback accessible after mark-as-read clears the unread notice | PR #69 |

## Issue #71 — Mental Health Professional onboarding / invite (launch notes)

**Status:** **Owner smoke passed / ready to close Issue #71** — handoff runbook: [MHP_OWNER_HANDOFF_RUNBOOK.md](./MHP_OWNER_HANDOFF_RUNBOOK.md); closure checklist: [ISSUE_71_MHP_PRODUCTION_SMOKE_CLOSURE_CHECKLIST.md](./ISSUE_71_MHP_PRODUCTION_SMOKE_CLOSURE_CHECKLIST.md) (C6f owner smoke pass recorded)

| Item | Status |
|------|--------|
| MHP onboarding / invite flow | **Owner smoke passed** — ready to close Issue #71 |
| Account enablement | **Owner/admin controlled** — no public MHP signup |
| MHP profile publication / membership activation | **Guarded** — draft / pending review unless owner explicitly activates |
| Parent invite | Parent signup link share only |
| MHP colleague invite | Admin-mediated request only — no automatic account creation |
| Mobile install identities | Separate **Wayfinder Parent** and **Wayfinder MHP** home-screen names and icons |
| Production smoke / closure | **PASS** — see [ISSUE_71_MHP_PRODUCTION_SMOKE_CLOSURE_CHECKLIST.md](./ISSUE_71_MHP_PRODUCTION_SMOKE_CLOSURE_CHECKLIST.md) |
| Practitioner selector (PR #95) | Merged — MHP/practitioner wording and display fallback |
| Practitioner selector names (C6d) | Owner SQL applied and verified — safe MHP name fields in `list_available_counsellors()` |
| Practitioner selector complete only (C6e) | Owner SQL applied and verified — incomplete MHP rows hidden; completed profiles only |
| Android icon cache on some devices | **Non-blocking follow-up** — PR #121 hardens manifest install metadata; owner Android re-test pending — see [PWA_INSTALL_COMPATIBILITY_AUDIT.md](./PWA_INSTALL_COMPATIBILITY_AUDIT.md) |

## Parent App Version page (PR #100)

- App Version notes scoped to **parent/client-visible UI/UX only** — MHP/admin/internal ops entries removed from the parent page.
- **v0.4.2** Relationship Garden release note added (PR #99 garden evidence fix).
- **v0.4.3** Privacy acknowledgement record (PR #103 — merged).
- **v0.4.4** Login branding and parent install icon refresh (PR #111 — merged).
- **v0.4.5** MHP approved portrait in parent review-sharing selector (PR #118 — merged).
- MHP onboarding (former v0.4.1), security-readiness, and future-research planning notes remain in ops/docs only, not on the parent App Version page.

## MHP Portrait Pipeline — Production Checkpoint

**Status:** End-to-end pipeline **complete on main** (PR #106–PR #118). Treat this as a **privacy/production boundary** — future agents must not weaken it without explicit owner approval.

| PR | Delivers |
|----|----------|
| **#106** | Private image storage contract — table + bucket planning ([MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md), [supabase-mhp-profile-image-storage.sql](../supabase-mhp-profile-image-storage.sql)) |
| **#107** | MHP private source photo upload to `professional-profile-image-sources` |
| **#110** | Owner/admin private source photo review on `/admin.html` |
| **#113** | Owner manual approved portrait upload to `professional-profile-portraits` |
| **#114 / #115 / #116** | Owner AI sketch **candidate** generation + OpenAI hotfix + monochrome graphite prompt tuning |
| **#117** | Explicit **current** approved portrait via `selected_at` (`owner_select_mhp_approved_portrait`) |
| **#118** | Parent display of **selected approved portrait only** via `POST /api/list-available-mhps` (server-signed URL) |

**Production rules (non-negotiable):**

- **Source photo** remains **private** — MHP + owner/admin review only; never parent/client-visible.
- **Generated sketch** remains **candidate-only** — not authoritative; not shown to parents until saved as approved by owner.
- **Manual approved upload** is the **trusted production fallback** when AI likeness is poor.
- **Parent display** uses the **current selected approved portrait** only (`approved_portrait` + `approved` + `selected_at is not null`) for **published + visible + active** MHPs.
- **`photo_url` is not used** for the new portrait display path.
- Parent/client UI must **not** expose storage paths, Supabase UUIDs, source photos, generated candidates, or unselected approved portrait history.

**Owner ops reference:** [MHP_OWNER_HANDOFF_RUNBOOK.md](./MHP_OWNER_HANDOFF_RUNBOOK.md) — § Owner-approved MHP portrait workflow.

**Strategy + do-not-regress:** [MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md) — § Production checkpoint principles; § Do not regress.

## Payment & entitlement strategy (PR #120A)

**Status:** Docs-only spec **merged on main** (PR #120A) — **no payment runtime yet**.

**Primary doc:** [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md)

**Key product rule (PR #120A revision):** Privacy is **baseline across every plan** — not a paid or limited feature. Monetisation focuses on reflection depth, Journal Trail, Relationship Garden, practice progression, ALIGN/CAB pattern visibility, and optional parent-controlled MHP review support (Connected).

**Plans (spec only):**

| Plan | Role | Suggested price |
|------|------|-----------------|
| Wayfinder | 30-day no-card trial; 3 saved Decode moments | Free |
| Wayfinder Plus | Main parent development subscription | S$9.90/mo or S$89/yr |
| Wayfinder Connected | Parent-controlled MHP review layer | S$19.90/mo or S$199/yr |

**Stripe direction (future runtime only):** Checkout + Billing + Customer Portal; internal no-card trial until parent chooses Plus/Connected.

**Also documented in PR #120A roadmap (spec only, no runtime):** Simplified Chinese UI toggle (`en` / `zh-Hans`); personal profiling revamp; research consent; corporate/workshop support; facilitator module; self-read relationship learning bytes.

**Explicit non-goals for PR #120A:** Stripe code, webhooks, entitlement gates, SQL, App Version entry, auth/journal/MHP portrait changes.

## In flight

| Branch / phase | Summary | Status |
|----------------|---------|--------|
| Issue #52 parent/counsellor feedback workflow | Per-entry counsellor response flow, parent mark-read flow, counsellor response status badges, and Parent Feedback Library merged and owner-verified through PR #69 | Monitoring / verified |
| Issue #71 MHP onboarding / invite | Owner smoke **PASS** (C6f); C6d/C6e SQL owner-applied and verified; ready to close Issue #71 | Ready to close |
| PR #101 consent persistence foundation | Spec merged — [CONSENT_PERSISTENCE_FOUNDATION_SPEC.md](./CONSENT_PERSISTENCE_FOUNDATION_SPEC.md) | Complete |
| PR #102 consent persistence SQL/RLS | SQL contract — [supabase-consent-records.sql](../supabase-consent-records.sql); owner must apply in Supabase | Complete (merge) — owner apply pending |
| PR #103 signup privacy acknowledgement | Runtime persistence for `signup_privacy` only — dashboard banner, `supabase.js` helpers, App Version v0.4.3 | Complete (merged) |
| PR #104 MHP owner publication SQL | Owner-admin publish contract — [supabase-mhp-owner-publish-contract.sql](../supabase-mhp-owner-publish-contract.sql); published-only parent selector | Complete (merge) — owner apply pending |
| PR #105 owner admin MHP review page | `/admin.html` review queue + [supabase-mhp-owner-admin-review-rpc.sql](../supabase-mhp-owner-admin-review-rpc.sql); no parent App Version change | Complete (merged) — owner SQL apply pending |
| PR #106 MHP profile image strategy | [MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md) + [supabase-mhp-profile-image-storage.sql](../supabase-mhp-profile-image-storage.sql); planning only — no upload/generation UI | Complete (merged) — owner SQL apply pending |
| PR #107 MHP private source photo upload | Source photo upload + signed preview — [supabase-mhp-profile-image-upload-policies.sql](../supabase-mhp-profile-image-upload-policies.sql); no parent App Version change | Complete (merged) |
| PR #108 counsellor blank page hotfix | Remove orphan JSX block before source photo section | Complete (merged) |
| PR #109 published MHP source photo upload | Allow private source photo upload when profile is published (not tied to profile draft edit) | Complete (merged) — owner smoke passed |
| PR #110 owner admin source photo preview | Owner/admin temporary signed preview of private MHP source photo on `/admin.html` — [supabase-mhp-owner-image-review-rpc.sql](../supabase-mhp-owner-image-review-rpc.sql); no parent App Version change | Complete (merged) |
| PR #111 login branding and install icons | Wayfinder logo on all login pages; parent brown + MHP green PWA icons; App Version v0.4.4; no auth/runtime/data changes | Complete (merged) |
| PR #112 PWA install icon separation | Separate manifest `id`/`scope` per portal; versioned manifest icon paths; fixes MHP showing parent brown icon after Add to Home Screen | Complete (merged) |
| PR #113 owner approved portrait upload | Owner/admin upload approved private portrait to `professional-profile-portraits` + metadata; no parent App Version change | Complete (merged) |
| PR #114 owner AI sketch portrait generation | Server-side OpenAI sketch from private source photo; generated + approve-to-approved flow; no parent App Version change | Complete (merged) — smoke fix in PR #115 |
| PR #115 OpenAI image response_format hotfix | Remove unsupported `response_format` param from `/api/mhp-generate-portrait`; no parent App Version change | Complete (merged) |
| PR #116 monochrome graphite portrait prompt | Tune server-side OpenAI prompt for black-and-white photorealistic pencil sketch; no parent App Version change | Complete (merged) |
| PR #117 current approved portrait selection | Explicit `selected_at` current approved portrait via owner RPC; no parent/client display | Complete (merged) |
| PR #118 parent MHP portrait display | Parent review-sharing selector shows selected approved portrait via server-signed URL API | Complete (merged) |
| PR #119 MHP portrait pipeline checkpoint | Docs-only production checkpoint so agents do not weaken portrait/privacy model | Complete (merged) |
| PR #120A payment/pricing strategy revision | Privacy-baseline plan table + Stripe/entitlement spec + future roadmap; docs only | Complete (merged) |
| PR #121 PWA install compatibility hardening | Manifest/HTML install metadata for Android Chrome/OEM; audit doc; no auth/journal/runtime changes | In flight |
| `feature/facilitator-hosted-events` | Issue #45: DB-backed facilitator-hosted events + graceful degradation until SQL applied | Merged to main |

## Deferred / not started

- **Consent SQL apply (PR #102)** — **owner must apply** [supabase-consent-records.sql](../supabase-consent-records.sql) in Supabase SQL Editor before PR #103 runtime works in production
- **MHP owner admin SQL apply (PR #104 + PR #105)** — owner must apply publication contract and review-list RPC before `/admin.html` works in production
- **MHP profile image SQL apply (PR #106 + PR #107)** — owner must apply image table + upload storage policies before source upload works in production
- **MHP portrait pipeline (PR #106–PR #118)** — **complete on main** — see **MHP Portrait Pipeline — Production Checkpoint** above; owner must still apply required SQL in Supabase where not yet applied
- **Payment / entitlement runtime** — **not started** — strategy spec merged in [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md) (PR #120A)
- **MHP public profile directory UI** — not implemented (review-sharing selector portrait only; no public directory browse)
- **Research consent** — not implemented
- **Questionnaire/check-in consent and response storage** — not implemented
- **Consent revocation UX** — not implemented
- **AI/data-use expansion** — not implemented
- Mandatory research consent governance (runtime)
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
11. Parent Feedback Library: read/published counsellor feedback remains visible and reopenable from the parent dashboard after unread notice clears.
12. MHP portrait pipeline (after PR #118): owner `/admin.html` shows **Current approved portrait**; parent review-sharing selector shows selected approved portrait only; source/generated/history portraits and storage paths not visible to parents; journal/dashboard and MHP portal unchanged.
13. PWA install (after PR #121): fresh Android install from `/index.html` and `/counsellor.html` shows correct separate icons/names; no outdated-install warning on retest after removing old shortcuts — see [PWA_INSTALL_COMPATIBILITY_AUDIT.md](./PWA_INSTALL_COMPATIBILITY_AUDIT.md).

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
