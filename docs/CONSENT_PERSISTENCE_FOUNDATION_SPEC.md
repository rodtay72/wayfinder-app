# Consent Persistence Foundation Spec

**PR #101 — docs/spec only (no runtime implementation)**

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [CONSENT_RESEARCH_GOVERNANCE_PLAN.md](./CONSENT_RESEARCH_GOVERNANCE_PLAN.md)
- [RESEARCH_EXPORT_SOP_DATA_DICTIONARY.md](./RESEARCH_EXPORT_SOP_DATA_DICTIONARY.md)
- [auth-profile-flow.md](./auth-profile-flow.md)
- [V0_4_IMPLEMENTATION_CONTRACT.md](./V0_4_IMPLEMENTATION_CONTRACT.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)

---

## 1. Purpose

This spec defines how Wayfinder should **persist parent acknowledgement and consent records safely** before building:

- research-ready check-ins
- questionnaire UI or response storage
- parent AI guidance tied to data use
- research export or transformed dataset pipelines

Wayfinder is **ALIGN/CAB parent-development support**, not child diagnosis, behaviour labelling, scoring, or a Behaviour → Advice tool.

Consent persistence exists to support **parent understanding, data-use transparency, privacy, and choice** — not to shame parents, label children, or gate access in ways that feel punitive.

**Strategic rule:** Do **not** start questionnaire/check-in **storage** until this consent record model is reviewed and a separate owner-approved SQL/runtime PR is merged.

---

## 2. What this PR does not do

This PR (#101) does **not**:

- change app runtime behaviour
- apply SQL or create database tables
- add consent UI
- persist signup acknowledgement (currently checkbox-only at signup)
- store questionnaire or check-in responses
- enable research export jobs
- expand AI/data-use processing
- modify auth, `ensure_profile`, RLS, journal save/read, dashboard loading, Parent ID / Child ID generation, MHP/counsellor flows, or payment

This document is a **foundation spec** for a future implementation sequence.

---

## Implementation status

| Phase | Status |
|-------|--------|
| PR #101 — Foundation spec | Complete — this document |
| PR #102 — SQL/RLS contract | [`supabase-consent-records.sql`](../supabase-consent-records.sql) — **owner-applied only** |
| Future runtime PR | Not started — `supabase.js` reads/writes, UI, graceful dashboard degradation |
| Revocation RPC / UPDATE policy | Deferred — later PR after owner decides revocation UX (§11) |

§4 proposed record shape and §6 RLS requirements are **implemented in the SQL contract (PR #102)** for table/grants/policies only. No app behaviour changes until SQL is owner-applied and a runtime PR merges.

---

## 3. Consent types to separate

These consent/acknowledgement types must remain **distinct**. They must **not** be collapsed into one vague “I agree”.

| Consent type | Purpose (summary) | Notes |
|--------------|-------------------|--------|
| **Signup privacy / data-use acknowledgement** | Parent confirms they have read the signup privacy/data-use notice before account creation. | Today: UI checkbox only, **not persisted**. Future: may persist after verified auth/profile exists. |
| **Optional research consent** | Separate opt-in for participation in governed research use of transformed/de-identified data. | Must remain **optional** unless owner explicitly approves a mandatory model in a later phase. |
| **Optional future questionnaire / check-in consent** | Permission for structured check-in or measure responses that may be used beyond ordinary in-app reflection. | Distinct from everyday journal activity; gating required before response storage. |
| **Optional therapist / MHP sharing consent** | Per-grant or per-flow consent when a parent shares selected reflections with a Mental Health Professional. | Related to existing grant/consent copy in review sharing; future persistence must not weaken per-entry scope. |
| **Optional event / payment terms acknowledgement** | Terms specific to paid events, registrations, or facilitator-hosted sessions when applicable. | Separate from core app privacy notice. |

Each type should have its own:

- `consent_type` value
- versioned notice text (`consent_version` + snapshot)
- acceptance/decline/revocation lifecycle
- feature gating rules (see §8)

---

## 4. Proposed consent record shape

**Implemented in SQL contract (PR #102)** — [`supabase-consent-records.sql`](../supabase-consent-records.sql). Owner-applied in Supabase; not yet wired to runtime.

| Field | Type (proposed) | Notes |
|-------|-----------------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Supabase auth user (technical identity) |
| `parent_id` | text | App-facing Wayfinder / Parent ID when available |
| `consent_type` | text | e.g. `signup_privacy`, `research_opt_in`, `questionnaire_check_in`, `mhp_sharing`, `event_payment_terms` |
| `consent_version` | text | e.g. `2026-06-1` — matches notice version shown |
| `consent_status` | text | `accepted` / `declined` / `revoked` / `superseded` |
| `consent_text_snapshot` | text | Exact notice text parent saw (immutable once written) |
| `accepted_at` | timestamptz | ISO timestamp when accepted; null if never accepted |
| `revoked_at` | timestamptz | ISO timestamp when revoked; null if not revoked |
| `source_page` | text | e.g. `signup`, `settings`, `review_share`, `check_in_intro` |
| `created_at` | timestamptz | ISO insert time |
| `updated_at` | timestamptz | ISO last status change |

**Timestamp rule:** All writes use `new Date().toISOString()` (or DB `now()` returning timestamptz). Never store locale date strings.

**Immutability:** Historical snapshots should not be edited in place. A new version or `superseded` record replaces prior meaning; do not overwrite `consent_text_snapshot` on old rows.

---

## 5. Privacy and data minimisation

Consent records should store **consent facts only**:

- Store consent snapshot/version and status — not journal reflection text, decode content, child names, or CAB fields.
- Do **not** store child names in consent records.
- Do **not** store parent email in consent records if Parent ID / `user_id` is sufficient for linkage.
- Normal parent UI must **not** expose Supabase UUID, email, tokens, or child names from consent rows.
- Parent ID may be stored as app-facing identity for audit and support if useful.

Consent is **not** a child-risk label, diagnosis field, or behaviour score.

---

## 6. RLS design requirements (future SQL PR)

**Implemented in SQL contract (PR #102)** for SELECT/INSERT own rows only. UPDATE/revocation deferred.

| Requirement | Detail |
|-------------|--------|
| Parent read own records | Authenticated parent can `SELECT` only their own consent rows (`user_id = auth.uid()` or equivalent safe join via profile). |
| Parent create own acknowledgement | Insert allowed only for current user through controlled path (RPC or constrained insert policy). |
| No historical snapshot edits | Parents cannot `UPDATE` `consent_text_snapshot` or backdate `accepted_at` on old rows. |
| Revocation | Status change to `revoked` via controlled RPC or policy that sets `revoked_at` and `updated_at` in ISO form. |
| No public reads | No `anon` select on consent table. |
| No anon writes | No anonymous consent creation. |
| Admin/service audit | Service role or owner-approved admin path may audit for compliance/support — not exposed in normal UI. |
| No weakening | Must not weaken existing auth, profile, journal, dyad, or dashboard RLS. |

Align with [auth-profile-flow.md](./auth-profile-flow.md): browser must not `profiles.insert` / `profiles.upsert`; consent writes should follow the same high-trust patterns as other protected writes.

---

## 7. Runtime design requirements (future PR)

Future runtime PR should:

1. **Persist signup privacy acknowledgement** only after verified auth and profile are available (post–email verification / `ensure_profile`), not before identity is stable.
2. **Never block login or dashboard** due to non-critical consent fetch failure — show friendly notice and retry.
3. **Never break journal save/read or dashboard loading** if consent fetch/write fails — degrade gracefully.
4. **Separate fetch from critical path** where possible; cache last-known consent state in memory for gating UI only.
5. **App Version entry** only when a parent-visible UX change ships — not for internal SQL/RLS PRs alone.

Use cautious copy: consent helps parents understand data use; it is not a shame gate.

---

## 8. Research / check-in gating

| Feature class | Gating rule |
|---------------|-------------|
| **Research-ready check-ins** | Must **not** store responses until relevant consent path is implemented, reviewed, and owner-approved. |
| **Non-research self-reflection check-ins** | May exist as in-app parent development prompts only if responses stay in ordinary journal/reflection storage and are **not** flagged for research/export without separate consent. |
| **Questionnaire measures** | No response storage until questionnaire consent type + governance from [QUESTIONNAIRE_MEASURES_FRAMEWORK.md](./QUESTIONNAIRE_MEASURES_FRAMEWORK.md) is satisfied. |
| **Research export / transformed datasets** | Requires research consent + [RESEARCH_EXPORT_SOP_DATA_DICTIONARY.md](./RESEARCH_EXPORT_SOP_DATA_DICTIONARY.md) governance — out of scope until explicit later PRs. |
| **MHP sharing** | Continues to use existing per-grant consent copy until/unless persisted consent records align with grant flow without broadening scope. |

Do **not** imply HIPAA compliance or clinical certification through consent UI.

---

## 9. Migration / backward compatibility

- **Existing users** may have **no** consent records when persistence launches.
- Runtime must handle missing records **gracefully** — friendly empty state, not errors or lockout.
- Do **not** lock existing users out of dashboard/journal without an **owner-approved transition plan** (e.g. one-time re-acknowledgement banner with clear skip/defer rules if owner chooses).
- Signup checkbox history cannot be reconstructed — first persisted record starts at go-live for new behaviour.

---

## 10. Manual smoke checklist (future implementation)

After a future consent persistence runtime + SQL PR merges, verify:

- [ ] Verified parent can sign in.
- [ ] Dashboard loads Parent ID, children, past activities, reflections.
- [ ] Journal save/read still works.
- [ ] Consent record can be created **only** for the current authenticated user.
- [ ] Consent records do not expose email, Supabase UUID, child names, or tokens in normal UI.
- [ ] Existing users without records see a **friendly** state (not blank screen or hard block).
- [ ] Consent fetch failure does not break dashboard or journal.
- [ ] Revocation (if implemented) updates status without deleting historical snapshot rows.
- [ ] No `profiles.insert` / `profiles.upsert` added in browser code.

---

## 11. Open owner decisions

Rodney must decide before runtime/SQL implementation:

1. **Which consent types are mandatory at signup?** (privacy/data-use only vs additional types)
2. **Is research consent optional?** (recommended: yes, unless legal review says otherwise)
3. **Should missing signup acknowledgement require re-acknowledgement for existing users?** If yes, what deferral/grace rules apply?
4. **What notice text becomes consent version v1?** (signup PDPA copy, research notice, etc.)
5. **What is the revocation UX?** (settings page, email request, in-app toggle per consent type)
6. **Which features are gated by which consent type?** (check-ins, questionnaires, AI analysis expansion, export)

---

## Related docs

| Doc | Role |
|-----|------|
| [CONSENT_RESEARCH_GOVERNANCE_PLAN.md](./CONSENT_RESEARCH_GOVERNANCE_PLAN.md) | Broader governance roadmap |
| [RESEARCH_EXPORT_SOP_DATA_DICTIONARY.md](./RESEARCH_EXPORT_SOP_DATA_DICTIONARY.md) | Export field rules |
| [V0_4_IMPLEMENTATION_CONTRACT.md](./V0_4_IMPLEMENTATION_CONTRACT.md) | Release train boundaries |
| [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) | Living implementation status |

**Next step after this spec merges:** Owner review of §11 decisions, then a separate SQL + runtime PR (not bundled with questionnaire/check-in storage).
