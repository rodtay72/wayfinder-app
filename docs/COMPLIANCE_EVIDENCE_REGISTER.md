# Compliance Evidence Register

**Status:** Working register for HIPAA / SOC 2 **readiness** — not a certification record.

**Last updated:** 2026-07-20

**Parent doc:** [HIPAA_SOC2_READINESS_FOUNDATION.md](./HIPAA_SOC2_READINESS_FOUNDATION.md)

**Rule:** Do not record secrets, parent emails, child names, Supabase UUIDs, JWTs, reflection content, or PHI samples in this register.

---

## How to use

- **Existing evidence** — what Wayfinder already has in repo, ops practice, or platform config
- **Evidence location** — doc, script, SQL file, or runbook path (no secrets)
- **Gap** — what is missing for readiness review
- **Risk** — Low / Medium / High (relative sensitivity)
- **Status** — Open · In progress · Blocked on legal · Closed (evidence attached)

Expand rows in **PR #164**; do not treat “In progress” as compliance attestation.

---

## Register

| Control area | Existing evidence | Evidence location | Gap | Risk | Next action | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Supabase auth | Email/password auth; verified-email gate; no browser profile insert | [auth-profile-flow.md](./auth-profile-flow.md), AGENTS.md | Written authentication policy; MFA for admin | Medium | Add security policy section in PR #164 | Owner | Open |
| RLS | Table policies in SQL migrations | `supabase-*.sql`, AGENTS.md | Coverage matrix: table → policy → role | High | Inventory RLS in PR #164 | Engineering | Open |
| Email verification | Blocks unverified workspace access | AGENTS.md, auth flow | Support escalation wording | Low | Cross-link in post-live FAQ | Ops | In progress |
| Parent/Child ID masking | Generated IDs in UI; PDPA masking rules | AGENTS.md, product canon | Regression checklist for releases | Medium | Add to launch smoke list | Engineering | Open |
| Journal save/read | Stable save/read contracts; ISO timestamps | AGENTS.md | Data-flow diagram for reflection lifecycle | Medium | Diagram in PR #164 | Engineering | Open |
| MHP sharing | Consent-led, time-limited grants; ALIGN/CAB boundaries | Product canon, consent spec | Owner-applied consent SQL evidence | Medium | Complete consent persistence apply | Owner | Open |
| Stripe entitlement sync | Webhook-driven sync; live runtime gate | [STRIPE_PRE_LIVE_EVIDENCE_PACK.md](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md) | Automated alert on webhook failures | Medium | Ops daily check | Ops | In progress |
| Webhook safety | Mode-matching; idempotency table | `api/_stripe-runtime-mode.js`, PR #148 SQL | Failed-event replay procedure | Medium | Document in ops FAQ | Ops | Open |
| Production monitoring | Post-live checklist | [POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md](./POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md) | Defined response times | Low | Owner SLA | Owner | Open |
| Support FAQ | Billing, privacy baseline, legacy Plus policy | POST_LIVE_MONITORING FAQ | Compliance wording guard for support | Low | PR #163 support rule | Ops | In progress |
| Incident escalation | Triage and recovery playbook | [PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md) | Breach notification tree if HIPAA scope | High | Legal addendum | Owner + legal | Open |
| Language / private content boundary | Static UI toggle; reflections not auto-translated | [LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md](./LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md) | Release QA for zh-Hans + privacy | Low | Next approved product PR | Product | Planned |
| Encryption in transit | HTTPS for app, API, Supabase, Stripe | Platform defaults | Document TLS expectations in security policy | Low | PR #164 | Owner | Open |
| Encryption at rest | Supabase/Stripe platform encryption | Provider docs (external) | Confirm plan/settings with Supabase | Medium | Owner verification | Owner | Open |
| Backup / recovery | Supabase platform backups | Supabase Pro | Restore test evidence | Medium | Schedule restore drill | Owner + ops | Open |
| Admin / workforce access | Owner-admin model; no public MHP signup | MHP runbooks, AGENTS.md | Access review cadence; offboarding | High | Admin access policy PR #164 | Owner | Open |
| Vendor / subprocessor | Informal vendor list in readiness foundation | [HIPAA_SOC2_READINESS_FOUNDATION.md §7](./HIPAA_SOC2_READINESS_FOUNDATION.md#7-vendor--subprocessor-readiness) | Signed DPA/BAA status per vendor | High | PR #166 register | Owner + legal | Open |
| AI / external LLM use | Grant-scoped counsellor assist; paused paths documented | Counsellor review sharing canon | Data minimisation before any new AI route | High | Block new AI routes without review | Engineering | Open |
| Retention / deletion | Partial product notices | Privacy docs | Full retention schedule + deletion process | Medium | Legal retention matrix | Owner + legal | Open |
| Audit logging | Debug gated; platform logs | AGENTS.md | Application audit trail requirements | High | PR #165 gap assessment | Engineering | Open |

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #163 — starter register aligned with readiness foundation |
