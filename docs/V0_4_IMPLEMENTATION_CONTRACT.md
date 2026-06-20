# Wayfinder v0.4 Implementation Contract

**Day 1 of 7-day v0.4 product release train — docs-only (Issue #40)**

Turns [GitHub Issue #40](https://github.com/rodtay72/wayfinder-app/issues/40) into exact build slices, release order, feature boundaries, subscription tiers, and technical risk classification **before runtime code starts**.

**This document is the build plan for a working v0.4 release — not more launch hardening.**

Read first:

- [AGENTS.md](../AGENTS.md)
- [docs/WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [docs/AI_CONGRUENCE_ANALYSIS_CONTRACT.md](./AI_CONGRUENCE_ANALYSIS_CONTRACT.md)
- [docs/24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md)
- [docs/PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md)
- GitHub [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — recurring production smoke (**keep open**)

**Production:** [https://wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Contract date:** 2026-06-20

**Target v0.4 window:** 7 calendar days from Issue #40 start (~2026-06-27)

---

## Wayfinder canon (non-negotiable)

Wayfinder is **not** child diagnosis, child profiling, parent scoring, or Behaviour → Advice.

Core pathway:

```
Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action
```

**Fee tiers map to support intensity** — not parent worth, child difficulty, or diagnostic status.

Do **not** create: parent scores, child labels, diagnostic profiles, stage completion, shame-based locks, or clinical tiers framed as parent/child failure.

Use cautious language: **may**, **might**, **possible**, **let's explore**.

---

## 1. v0.4 release objective

Ship a **working production v0.4** that moves beyond launch-hardening into parent-facing and therapist-supported product value while preserving:

- Supabase auth, email verification, `ensure_profile`
- RLS, Parent ID / Child ID identity chain
- Journal save/read compatibility and dashboard loading
- Privacy masking (no email, UUID, child names in normal UI)
- ALIGN/CAB non-diagnostic framing
- [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) production smoke rhythm (**stay open**)

### v0.4 product outcomes (minimum bar)

| # | Outcome | Success signal |
|---|---------|----------------|
| 1 | Parents keep using Decode, Journal Trail, ALIGN reflection | Core flows unchanged or improved; smoke PASS |
| 2 | Parents can select journal/decode records for therapist review | Scoped grant UI + consent copy |
| 3 | Parents grant time-limited, revocable therapist access | 30-day expiry + revoke works |
| 4 | Therapists review **selected records only** | Invite-only role; no full journal browse |
| 5 | AI assists therapist review pack | `/api/counsellor-analysis`; therapist-facing default |
| 6 | Parents discover events and add to calendar | Events MVP + `.ics` / safe links |
| 7 | Paid sessions via safe hosted payment | Stripe Payment Links or equivalent; no card storage |
| 8 | Non-diagnostic research-ready check-ins begin | No validated questionnaire claims |

**Research thesis alignment:** Wayfinder evaluates whether structured digital reflection, optional measurement support, and therapist-guided review can support **Parent Alignment Capacity** without diagnosing the child or scoring the parent.

---

## 2. 7-day build schedule

Operating rule: **small PRs** — issue/plan/report → narrow branch → build → report → commit after approval → PR → merge → production smoke if user-facing.

| Day | Calendar | Deliverable | Type | Risk |
|-----|----------|-------------|------|------|
| **1** | 2026-06-20 | v0.4 Implementation Contract (this doc) | Docs-only | Low |
| **2** | 2026-06-21 | Events Calendar MVP | Runtime UI + content | Low–Med |
| **3** | 2026-06-22 | Research-ready Check-Ins MVP | Runtime UI + content | Low–Med |
| **4** | 2026-06-23 | Parent structured AI guidance (bounded) | Runtime UI + optional API | Med |
| **5** | 2026-06-24 | Invite-only counsellor activation | Schema + RLS + auth routing | **High** |
| **6** | 2026-06-25 | Therapist Review Access MVP (grants) | Schema + RLS + UI | **High** |
| **7** | 2026-06-26–27 | AI therapist review pack + Payment gateway MVP | API + hosted checkout | **High** |

**Buffer rule:** If Day 5–6 slip, ship Days 2–4 + one high-risk vertical slice rather than combining all schema work into one PR.

**Owner decisions before Day 2:** Events tier placement (Tier 0 vs Tier 1); first payment product (events vs therapist review).

---

## 3. Exact PR sequence

One branch, one merge at a time. Each PR posts a self-contained report per [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md).

| PR | Branch (proposed) | Issue | Day | Ships |
|----|-------------------|-------|-----|-------|
| **#40 contract** | `docs/v0-4-implementation-contract` | #40 | 1 | This contract |
| **v0.4.1** | `feature/v0-4-events-calendar-mvp` | TBD (#41 recommended) | 2 | Events Calendar MVP |
| **v0.4.2** | `feature/v0-4-check-ins-mvp` | TBD (#42 recommended) | 3 | Research-ready check-ins |
| **v0.4.3** | `feature/v0-4-parent-ai-guidance-bounded` | TBD (#43 recommended) | 4 | Bounded parent AI guidance |
| **v0.4.4** | `feature/v0-4-counsellor-invite-activation` | TBD (#44 recommended) | 5 | Counsellor invite/role |
| **v0.4.5** | `feature/v0-4-therapist-review-access-mvp` | TBD (#45 recommended) | 6 | Therapist review grants |
| **v0.4.6a** | `feature/v0-4-therapist-ai-review-pack` | TBD (#46 recommended) | 7 | AI therapist pack wiring |
| **v0.4.6b** | `feature/v0-4-payment-hosted-checkout` | TBD (#47 recommended) | 7 | Payment gateway MVP |

**App Version PR:** Include `v0.4.0` entry only in the PR that ships the **first parent-facing v0.4 feature bundle** (likely v0.4.1 or cumulative release PR after Day 7) — not in Day 1 contract PR.

**Platform sync brief:** Required for user-facing, research, consent, AI, and payment PRs.

---

## 4. Subscription and Fee-Tier Function Map

**Principle:** Tiers = **support intensity**, not parent worth, child difficulty, or diagnosis.

| Tier | Working name | Support model | v0.4 ship priority |
|------|--------------|---------------|-------------------|
| **0** | Free / Core | Non-diagnostic self-guided | Keep stable — always on |
| **1** | Guided Self-Practice | Structured self-guided | Days 2–4 |
| **2** | Therapist Review | Therapist-guided premium | Days 5–7 (after grants safe) |
| **3** | Events / Workshops | Paid sessions/bundles | Day 7 payment slice |
| **4** | Research / Partner | Study/institution | **Out of 7-day scope** |
| **Admin** | Clinical Ops | Internal only | Day 5+ |

### Map summary

| Function area | Tier | v0.4 slice | Entitlement storage |
|---------------|------|------------|---------------------|
| Decode, journal, trail, basic ALIGN | 0 | Existing | None |
| Events calendar, check-ins, bounded parent AI | 1 | Days 2–4 | Optional flags later |
| Therapist grants, AI review pack | 2 | Days 5–7 | **Required** — grants table |
| Paid event/workshop registration | 3 | Day 7 | Payment provider + optional entitlement |
| Research export, validated measures | 4 | Deferred | Full governance |
| Counsellor invite, audit, revoke | Admin | Day 5+ | Role + audit |

### Upgrade triggers (non-shaming)

- Parent **chooses** therapist review support → Tier 2
- Parent **registers** for paid workshop → Tier 3
- Institution enrolls study → Tier 4 (separate flow)

**Never:** lock core reflection because of child behaviour, parent "score," or diagnostic label.

### Payment/entitlement design (before Day 7 payment PR)

| Item | MVP rule |
|------|----------|
| Product catalogue | Named products: e.g. `workshop_registration`, `therapist_review_session` |
| Entitlement names | `event_access`, `therapist_review_active` — server-side only |
| Purchase types | One-time session/event first; subscription deferred |
| Expiry | Therapist grants: 30 days; event access: event date + buffer |
| Refunds | Manual owner override; no auto-entitlement without webhook review |
| Secrets | **No payment secrets in browser**; hosted checkout only |
| Card storage | **None in Wayfinder** |

---

## 5. Free / Core functions (Tier 0)

**Included — must remain free and stable:**

| Function | Notes |
|----------|-------|
| Decode a Moment | Existing `behaviour_decode` flow |
| Basic journaling / activity reflection | Journal save/read unchanged |
| Journal Trail | Read existing entries |
| Basic ALIGN Journey | Read-only insights (v0.3.2) |
| Privacy-safe App Version page | Update only when features ship |
| Basic educational content | Non-diagnostic |
| Account sign-up / sign-in / verification | Auth gate preserved |
| Dashboard load (Parent ID, children, activities, reflections) | No regression |
| Sign-out, unverified email block | No regression |

**Excluded from Tier 0 (higher tiers):** therapist review grants, paid events, AI therapist pack, research export.

---

## 6. Guided Self-Practice tier (Tier 1)

**Support model:** Structured self-guided reflection — no diagnosis, no scores.

| Function | v0.4 day | Schema needed? |
|----------|----------|----------------|
| Events / Activities Calendar (curated) | Day 2 | No (content config first) |
| Event detail cards | Day 2 | No |
| Add-to-calendar (`.ics`, safe links) | Day 2 | No |
| Curated activity packs (metadata) | Day 2–3 | No — `ACTIVITY_PRACTICE_CATALOG` docs exist |
| My ALIGN Mirror (if scoped small) | Deferred or Day 4 | Maybe read-only from journal |
| Structured parent AI guidance (bounded) | Day 4 | No schema if session-only; review if persisted |
| Non-diagnostic Wayfinder Check-Ins | Day 3 | Optional — prefer no schema in MVP |

**Upgrade trigger:** Optional — Tier 1 may stay free in v0.4 if owner chooses (see §16).

---

## 7. Therapist Review tier (Tier 2)

**Support model:** Therapist-guided review of **parent-selected** records only — premium after consent infrastructure is safe.

| Function | v0.4 day | Schema needed? |
|----------|----------|----------------|
| Parent selects journal/activity/decode entries | Day 6 | **Yes** — grant scope |
| Parent consent text + grant creation | Day 6 | **Yes** |
| 30-day time-bound access | Day 6 | **Yes** — `expires_at` |
| Parent revoke access | Day 6 | **Yes** |
| Therapist read-only view of granted entries | Day 6 | **Yes** — RLS |
| AI-assisted therapist review pack | Day 7 | Uses existing API; grant-scoped reads |
| Therapist follow-up prompts | Day 7 | Counsellor UI |
| Quarterly progress review | **Out of 7-day scope** | Future slice |

**Excluded:** broad therapist browse of full journal; email delivery of journal content; automatic parent-facing AI verdicts.

---

## 8. Events / Workshops tier (Tier 3)

**Support model:** Paid sessions or bundles — payment-gated registration.

| Function | v0.4 day | Schema needed? |
|----------|----------|----------------|
| Curated onsite/group/workshop listings | Day 2 (display) | No — content first |
| Event detail + registration CTA | Day 7 | Payment link sufficient for MVP |
| Payment-gated registration | Day 7 | Provider-side; optional entitlement row |
| Therapist-led event metadata | Day 2 | Content only |

**Out of scope:** OAuth calendar sync (Google/Microsoft/Yahoo).

**Business decision:** Calendar display may ship Tier 0 free; **paid registration** is Tier 3.

---

## 9. Research / Partner tier (Tier 4)

**Not in 7-day v0.4 scope.** Separate from normal parent subscriptions.

| Function | Status |
|----------|--------|
| Research consent persistence | Deferred — [CONSENT_RESEARCH_GOVERNANCE_PLAN.md](./CONSENT_RESEARCH_GOVERNANCE_PLAN.md) |
| Licensed validated measures | Deferred |
| De-identified exports | Deferred — [RESEARCH_EXPORT_SOP_DATA_DICTIONARY.md](./RESEARCH_EXPORT_SOP_DATA_DICTIONARY.md) |
| Study dashboards | Deferred |

**Day 3 check-ins** are Tier 1-style **non-diagnostic** prompts — not Tier 4 research instruments.

---

## 10. Admin / Clinical Ops functions

**Internal only — not parent-facing subscription tiers.**

| Function | v0.4 day | Schema needed? |
|----------|----------|----------------|
| Invite-only counsellor/therapist approval | Day 5 | **Yes** — role flag |
| Owner/admin approval workflow | Day 5 | **Yes** — audit log preferred |
| Counsellor activation notice (no password email) | Day 5 | Process + existing auth |
| Access expiry enforcement | Day 6 | Grants table |
| Access revocation audit | Day 6 | **Yes** |
| Payment/entitlement admin override | Day 7 | Manual + provider dashboard |

**Rule:** Browser must **not** perform privileged role writes (`profiles.insert`/`upsert` forbidden).

---

## 11. What must never be paywalled

Do **not** put behind payment:

| Category | Examples |
|----------|----------|
| Account safety | Sign-in, verification, password recovery |
| Privacy controls | Masking, debug gate |
| Access revocation | Parent can always revoke therapist grant |
| Delete / withdraw | Where applicable — parent agency |
| Basic reflection / journal access | Core Tier 0 |
| Production support / incident handling | Operational baseline |
| Transparency | Clear notice of what is shared with therapists |
| Consent clarity | Grant consent text always visible before share |

---

## 12. Therapist Review Access MVP

### Parent flow

1. Parent opens share/review flow from Journal Trail or entry detail.
2. Parent selects **one or more** existing journal / activity / `behaviour_decode` entries.
3. Parent reads clear consent text (scope, 30 days, revoke, no email delivery).
4. Parent confirms grant to **one approved counsellor** (by counsellor ID or invite link — no child names in UI).
5. Grant stored with: `parent_id`, `counsellor_id`, `entry_ids[]`, `granted_at`, `expires_at` (+30 days), `revoked_at` nullable.
6. Parent can revoke anytime; therapist access ends immediately on revoke or expiry.

### Therapist flow

1. Invite-only counsellor logs in with own verified account.
2. Counsellor sees **only** active grants: unexpired, unrevoked, entries in scope.
3. No browse of unrelated parent journals or child records.
4. Read-only entry view — no edit parent journal.

### Safety rules

- No journal content sent by email.
- No child names, parent emails, Supabase UUIDs, tokens in normal UI.
- RLS must enforce grant scope server-side — UI-only hiding is insufficient.

### Dependencies

- Day 5 counsellor role activation **before** Day 6 grants.

---

## 13. Invite-only counsellor activation

| Requirement | Implementation note |
|-------------|----------------------|
| User approved as counsellor by owner/admin | Admin flag or `profiles.role` / separate counsellor table — **schema PR** |
| Approved counsellor receives activation notice | Process doc; no password in email |
| Counsellor uses existing credentials | Same Supabase auth; role routing |
| No browser privileged role writes | Server/RPC or admin-only path |
| Parent login flow preserved | Separate counsellor route (`counsellor.html` exists) |

**Risk:** **High** — touches auth/profile/RLS. Narrow PR; explicit owner approval.

---

## 14. AI-assisted therapist review pack

Use existing [`/api/counsellor-analysis`](api/counsellor-analysis.js) where appropriate.

### Therapist-facing output may include

- Selected-entry summary
- Recurring parent CAB pattern (non-diagnostic)
- Progress signals (tentative language)
- Protective factors
- Possible blind spots
- Repair / next-action themes
- Suggested therapist follow-up prompts
- Optional curated activity suggestion

### Rules

| Rule | Detail |
|------|--------|
| Default audience | Therapist-facing |
| Parent-facing | **No** automatic AI verdicts |
| Therapist control | Approve / edit / soften / suppress before any parent summary |
| Prohibited | Diagnosis, child label, parent score, stage-completion score, deterministic claims |
| Language | may, might, possible, could be worth exploring |
| Scope | Only entries within active grant |

Align with [AI_CONGRUENCE_ANALYSIS_CONTRACT.md](./AI_CONGRUENCE_ANALYSIS_CONTRACT.md).

---

## 15. Parent structured AI guidance boundaries

**If included in v0.4 (Day 4) — structured and bounded only.**

### Allowed

- Help parent choose a **next action**
- Help parent explore **one selected moment** through ALIGN/CAB
- Help parent choose an **activity** from curated catalog
- Session-scoped responses with fixed prompt templates

### Forbidden

- Open-ended therapy chatbot
- Diagnosis or child labelling
- Parent score or ranking
- Behaviour → Advice fix framing
- Persistent parent-facing AI profile without review

### Technical preference

- Prefer read-only context from selected entry + catalog metadata
- No new parent-facing AI endpoint without safety review
- Clinically sensitive output remains therapist-vetted path (Tier 2)

---

## 16. Event calendar MVP

| Item | MVP scope |
|------|-----------|
| Parent-facing Events / Activities Calendar | New UI section |
| Event source | Static/curated in `content.js` or config first |
| Event detail cards | Title, date, location (non-identifying), description, CTA |
| Add-to-calendar | `.ics` download + safe `https` calendar links |
| Private data in invites | **None** — no child/journal/reflection content |
| OAuth sync | **Out of scope** |

**Tier decision (owner):** Ship calendar as **Tier 0 free discovery** or **Tier 1** — default recommendation: **Tier 0 display + Tier 3 paid registration**.

---

## 17. Payment gateway MVP

| Item | MVP rule |
|------|----------|
| Provider | Stripe Payment Links or hosted checkout — preferred |
| Card data | **Not stored** in Wayfinder |
| Browser secrets | **None** |
| Webhooks | Server-side only; env vars in Vercel — separate approved PR |
| Entitlements | Optional for MVP — link-only checkout acceptable for first workshop |
| Products (initial) | Paid event/workshop registration **or** premium therapist review session — **one first** |

**Human decision required:** First paid product before Day 7 implementation.

---

## 18. Research-ready check-ins

**Non-diagnostic Wayfinder Check-Ins** — Day 3 slice.

| Allowed | Forbidden |
|---------|-----------|
| Short reflective prompts aligned to ALIGN/CAB | Validated questionnaire administration |
| Optional self-reflection save as journal-compatible entry | Clinical cutoffs |
| "Check-in" framing — may help notice patterns | Parent scores, child labels |
| Cautious language | Diagnostic claims |

Formal validated measures remain out of scope until licensing, ethics, consent persistence, and research storage approved.

---

## 19. App Version v0.4.0 rules

| Rule | Detail |
|------|--------|
| When to add | Only when **parent-facing runtime features** actually ship to production |
| Not in Day 1 | This contract PR does **not** add App Version entry |
| Entry title | `v0.4.0` |
| Copy | Describe only what shipped: therapist review / events / payments / check-ins — no overclaiming |
| Canon | Non-diagnostic; no child/parent labels |
| Location | Existing App Version page (PR #3) |

**Suggested timing:** Single `v0.4.0` entry after Day 7 merge **or** incremental entries per shipped slice if owner prefers — default: **one entry at end** listing all shipped v0.4 features.

---

## 20. Schema / RLS / auth / journal / dashboard risk classification

| Area | Risk | v0.4 touch | Guardrail |
|------|------|------------|-----------|
| **Auth / session** | Critical | Day 5 counsellor routing | No verification bypass; Bearer reads preserved |
| **ensure_profile** | Critical | Minimal | Explicit RPC fetch only |
| **RLS** | Critical | Days 5–6 grants | Counsellor reads grant-scoped only |
| **Parent ID / Child ID** | Critical | Grant FK references | No identity chain change |
| **Journal save/read** | Critical | Share selects existing entries | No payload break |
| **Dashboard loading** | High | New widgets only | `parent_id`-first reads |
| **Privacy masking** | Critical | All new UI | No PII in normal UI |
| **supabase.js** | Critical | Days 5–6 | Separate narrow PRs |
| **api/** | High | Days 4, 7 | Grant scope on counsellor-analysis |
| **SQL / RLS files** | Critical | Days 5–6 | Owner + review required |
| **Payment webhooks** | High | Day 7 | Server-only secrets |
| **content.js / styles / app.js UI** | Low–Med | Days 2–4 | Preferred first slices |

---

## 21. Which features can ship without schema

| Feature | Day | Files (typical) |
|---------|-----|-----------------|
| v0.4 Implementation Contract | 1 | docs only |
| Events Calendar (curated content) | 2 | `content.js`, `app.js`, `styles.css` |
| Event `.ics` / calendar links | 2 | `app.js` |
| Check-ins UI (non-persisted or journal reuse) | 3 | `content.js`, `app.js` |
| Bounded parent AI (session-only) | 4 | `app.js` |
| App Version entry | When features ship | `content.js` |

**Strategy:** Ship Days 2–4 first to deliver parent-facing value while Days 5–6 schema PRs are reviewed.

---

## 22. Which features require schema / RLS

| Feature | Day | Likely artifacts |
|---------|-----|------------------|
| Counsellor role / invite approval | 5 | SQL, RLS, maybe RPC |
| Therapist access grants | 6 | `therapist_access_grants` or equivalent table + RLS |
| Grant revocation / expiry enforcement | 6 | RLS policies + indexes |
| Counsellor scoped entry reads | 6 | RLS on `journal_entries` read via grant |
| Payment entitlements (if not link-only) | 7 | Entitlement table + webhook handler |
| Persisted check-in responses (if chosen) | 3+ | Optional — defer to journal `entry_type` first |

**Rule:** One schema concern per PR where possible; never combine counsellor role + grants + payment in one merge.

---

## 23. Stop conditions

Stop and escalate to Rodney before continuing if:

- Any auth, RLS, email verification, Parent ID / Child ID, journal, dashboard, privacy, or deployment blocker
- Proposed feature introduces parent score, child label, diagnostic profile, or shame-based paywall
- Browser-side `profiles.insert` / `profiles.upsert` suggested
- Journal payload compatibility at risk
- Therapist could browse beyond granted entries
- Journal content would be sent by email
- Payment secrets would appear in browser or repo
- Open-ended parent therapy chatbot proposed
- Validated questionnaire claims in check-ins
- Issue #28 would be closed without approval
- High-risk files touched outside narrow issue allowlist
- Production smoke FAIL after user-facing merge

Follow [PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_RECOVERY_PLAYBOOK.md) for production incidents.

---

## 24. Production smoke expectations

After **each user-facing v0.4 merge:**

| Check | Required |
|-------|----------|
| Verified sign-in | Pass |
| Dashboard loads Parent ID, children, activities, reflections | Pass |
| Journal save → Journal Trail | Pass |
| Sign-out; unverified blocked | Pass |
| No email / UUID / child names in normal UI | Pass |
| Decode + ALIGN Journey if touched | Pass |
| Mobile layout | Pass |
| **New feature smoke** | Pass for shipped slice (events, grants, payment link, etc.) |

| Rhythm | Rule |
|--------|------|
| [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) | **Keep open** — daily heartbeat + manual reminder |
| Reporting | Self-contained report to Issue/PR per 24/7 handoff |
| FAIL | Stop merges; incident playbook; no inventing Pass |

---

## 25. Explicit out-of-scope for 7 days

Unless **separately approved** by Rodney:

- Full Google / Microsoft / Yahoo OAuth calendar sync
- Formal validated questionnaire administration
- Research export pipeline
- Open-ended parent chatbot
- Parent-facing scores, rankings, diagnostic profiles, child labels
- Broad therapist access to all journals
- Journal content sent by email
- Payment entitlement schema without review
- Tier 4 research/partner subscription in parent app
- OpenClaw webhook automation
- DISC persistence fix (track separately)
- Weakening auth / RLS / profile / journal / dashboard / privacy
- Workflow changes (`.github/workflows/*`)
- Multiple high-risk merges in one PR

---

## 26. Recommended next implementation issue after this contract

**Open Issue #41 (recommended title):** `v0.4 Day 2 — Events Calendar MVP`

| Field | Value |
|-------|-------|
| Branch | `feature/v0-4-events-calendar-mvp` |
| Day | 2 |
| Risk | Low–Med |
| Allowed files | `content.js`, `app.js` (Events section), `styles.css` |
| Forbidden | schema, api, supabase, auth, payment |
| Deliverable | Curated events list, detail cards, `.ics` / safe calendar links |
| Tier | Owner decides Tier 0 vs Tier 1 display (default: Tier 0 free display) |
| App Version | Do not add until parent-facing bundle ships |
| Smoke | Full manual smoke + events slice after merge |

**Sequence:** #41 → #42 (check-ins) → #43 (bounded parent AI) → #44 (counsellor invite) → #45 (therapist grants) → #46/#47 (AI pack + payment).

---

## Related docs

- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md)
- [CONSENT_RESEARCH_GOVERNANCE_PLAN.md](./CONSENT_RESEARCH_GOVERNANCE_PLAN.md)
- [QUESTIONNAIRE_MEASURES_FRAMEWORK.md](./QUESTIONNAIRE_MEASURES_FRAMEWORK.md)
- GitHub [Issue #40](https://github.com/rodtay72/wayfinder-app/issues/40)
- GitHub [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — **keep open**
