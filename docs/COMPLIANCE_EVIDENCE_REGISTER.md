# Compliance Evidence Register

**Status:** Working register for HIPAA / SOC 2 **readiness** — not a certification record.

**Last updated:** 2026-07-20

**Parent doc:** [HIPAA_SOC2_READINESS_FOUNDATION.md](./HIPAA_SOC2_READINESS_FOUNDATION.md)

**Policy drafts (PR #164):** [SECURITY_POLICY_READINESS_DRAFT.md](./SECURITY_POLICY_READINESS_DRAFT.md) · [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md) · [ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md](./ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md)

**Rule:** Do not record secrets, parent emails, child names, Supabase UUIDs, JWTs, reflection content, or PHI samples in this register.

---

## How to use

- **Existing evidence** — what Wayfinder already has in repo, ops practice, or platform config
- **Evidence location** — doc, script, SQL file, or runbook path (no secrets)
- **Gap** — what is missing for readiness review
- **Risk** — Low / Medium / High (relative sensitivity)
- **Status** — Open · In progress · Blocked on legal · Blocked on vendor review · Evidence needed · Planned

Do **not** mark any row as compliant. “In progress” is not an attestation.

---

## Register

| Control area | Existing evidence | Evidence location | Gap | Risk | Next action | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Supabase auth | Email/password auth; verified-email gate; no browser profile insert | [auth-profile-flow.md](./auth-profile-flow.md), AGENTS.md, [SECURITY_POLICY_READINESS_DRAFT.md](./SECURITY_POLICY_READINESS_DRAFT.md) | Formal auth policy sign-off | Medium | Owner review draft policy | Owner | In progress |
| RLS | Table policies in SQL migrations | `supabase-*.sql`, AGENTS.md | Coverage matrix: table → policy → role | High | Inventory RLS policies | Engineering | Open |
| Email verification | Blocks unverified workspace access | AGENTS.md, auth flow | Document in security policy | Low | Cross-link complete | Ops | In progress |
| Parent/Child ID masking | Generated IDs in UI; PDPA masking rules | AGENTS.md, product canon, [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md) | Regression checklist for releases | Medium | Add to launch smoke list | Engineering | Open |
| Journal save/read | Stable save/read contracts; ISO timestamps | AGENTS.md | Data-flow diagram | Medium | Diagram in future PR | Engineering | Open |
| MHP sharing consent | Consent copy; grant expiry; parent-controlled grants | Product canon, consent spec, DATA_CLASSIFICATION draft | Persisted consent SQL owner apply | Medium | Complete consent persistence apply | Owner | Evidence needed |
| MHP sharing boundaries | Time-limited grants; ALIGN/CAB non-diagnostic framing | AGENTS.md, product canon | Formal grant audit evidence | Medium | Document grant lifecycle | Engineering | Open |
| Stripe entitlement sync | Webhook-driven sync; live runtime gate | [STRIPE_PRE_LIVE_EVIDENCE_PACK.md](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md) | Automated alert on webhook failures | Medium | Ops daily check | Ops | In progress |
| Stripe webhook failure handling | Post-live monitoring checklist | [POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md](./POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md) | Failed-event replay / escalation SOP | Medium | Expand ops FAQ row | Ops | Open |
| Webhook safety | Mode-matching; idempotency table | `api/_stripe-runtime-mode.js`, PR #148 SQL | Formal webhook incident runbook link | Medium | Cross-link security policy | Ops | In progress |
| Production monitoring | Post-live checklist | POST_LIVE_MONITORING FAQ | Defined response times / SLA | Low | Owner SLA | Owner | Open |
| Production smoke evidence | Launch operator runbook; smoke reminders | [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) | Post-merge smoke cadence record | Low | Continue manual smoke after merges | Owner | In progress |
| Support FAQ / parent support wording | Billing, privacy baseline, compliance wording guard | POST_LIVE_MONITORING FAQ, HIPAA foundation §8 | Train support on readiness wording | Low | PR #164 reminder added | Ops | In progress |
| Parent support wording (HIPAA/SOC 2) | “Do not claim compliance” rule | POST_LIVE_MONITORING FAQ, SECURITY_POLICY draft | Support template review | Medium | Owner review | Owner | In progress |
| Incident response | Triage and recovery playbook | [PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md), SECURITY_POLICY §8 | Scenario matrix complete | Medium | Use security policy linkages | Owner | In progress |
| Breach notification (if HIPAA scope) | Not documented | HIPAA foundation | Legal notification tree | High | Legal addendum | Owner + legal | Blocked on legal |
| Admin MFA status | MFA expected in draft policy | [ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md](./ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md) | Per-system MFA evidence recorded | High | Owner records yes/no per system (no secrets) | Owner | Evidence needed |
| Access review cadence | Monthly/quarterly draft | ADMIN_ACCESS draft §4 | First review recorded | High | Schedule first review | Owner | Open |
| Offboarding checklist | Draft checklist | ADMIN_ACCESS draft §5 | Applied on next personnel change | High | Keep checklist current | Owner | Open |
| Secret management | AGENTS rules; security policy §5 | SECURITY_POLICY draft, AGENTS.md | Secret rotation drill evidence | High | Document rotation procedure test | Owner | Open |
| Data classification | Draft levels and category table | [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md) | Legal sign-off on PHI categories | High | Legal review | Owner + legal | Blocked on legal |
| Retention / deletion | Gaps explicit; no invented periods | DATA_CLASSIFICATION draft §4 | Retention schedule + deletion workflow | High | Legal retention matrix | Owner + legal | Blocked on legal |
| Vendor DPA/BAA review | Vendor table in readiness foundation | HIPAA foundation §7 | Signed status per vendor | High | PR #166 vendor register | Owner + legal | Blocked on vendor review |
| Audit logging | Debug gated; platform logs | AGENTS.md, SECURITY_POLICY §6 | Application audit trail spec | High | PR #165 gap assessment | Engineering | Open |
| Backup / restore test | Supabase Pro platform backups | Supabase | Restore drill evidence | Medium | Schedule restore drill | Owner + ops | Evidence needed |
| Encryption in transit | HTTPS platform defaults | SECURITY_POLICY draft | Document in owner sign-off | Low | Owner confirmation | Owner | In progress |
| Encryption at rest | Supabase/Stripe defaults | Provider docs (external) | Confirm plan settings | Medium | Owner verification | Owner | Open |
| AI / external provider boundary | Grant-scoped assist; block without review | Product canon, DATA_CLASSIFICATION draft | Data flow before any new AI route | High | Block runtime AI expansion | Engineering | Open |
| Language / private content boundary | Static UI toggle; no auto-translation of reflections | [LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md](./LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md) | Release QA when toggle expands | Low | Planned product PR when approved | Product | Planned |

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #163 — starter register aligned with readiness foundation |
| 2026-07-20 | PR #164 — expanded register; linked draft security, classification, admin policy docs |
