# HIPAA / SOC 2 Readiness Foundation

**Status:** Docs-only compliance **preparation** — not legal advice, not a certification, not a product claim.

**Branch:** `docs/pr-163-hipaa-soc2-readiness-foundation`

**Last updated:** 2026-07-20

**Related:** [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md) · [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) · [POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md](./POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md)

**Draft policies (PR #164):** [SECURITY_POLICY_READINESS_DRAFT.md](./SECURITY_POLICY_READINESS_DRAFT.md) · [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md) · [ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md](./ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md)

**Audit trail readiness (PR #165):** [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md) · [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md)

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [partner-collaboration-and-deployment-rules.md](./partner-collaboration-and-deployment-rules.md)

**Privacy rule for this doc:** Do not record parent emails, child names, Supabase UUIDs, JWTs, Stripe IDs, webhook secrets, reflection content, or raw PHI examples in evidence notes.

---

## 1. Purpose and scope

Wayfinder is preparing for **HIPAA / SOC 2 readiness** — a structured map of controls, gaps, evidence, and safe wording so owners, engineers, and support can work toward external review without overstating current status.

This document:

- Describes **compliance preparation** and **controls to be reviewed**
- Identifies likely evidence locations and gaps
- Sets **product wording rules** and **stop conditions**
- **Requires legal/security/auditor confirmation** before any HIPAA or SOC 2 positioning

This document does **not**:

- Provide legal advice
- Constitute HIPAA or SOC 2 certification
- Authorise marketing or in-app claims such as “HIPAA compliant” or “SOC 2 compliant”
- Change runtime, API, SQL, RLS, auth, or deployment behaviour (**no app claim changes in PR #163**)

Wayfinder remains ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, therapy, emergency care, or a clinical platform.

---

## 2. Current Wayfinder protected areas

The following areas are **protected** in current operating rules and must not be weakened during compliance preparation work:

| Area | Current intent |
| --- | --- |
| Supabase auth | Email/password auth; verified email required before app access |
| RLS | Row-level security on parent/MHP data paths |
| Email verification | Gate before workspace access |
| `ensure_profile` | Explicit Bearer RPC; no browser-side `profiles.insert` / `profiles.upsert` |
| Parent ID / Child ID | Generated IDs in normal UI; no child names in standard dashboard surfaces |
| Journal save/read integrity | Existing journal storage contracts preserved |
| Dashboard loading | Loads by `parent_id` with verified session / Bearer token |
| Privacy masking | Normal UI must not show parent email, Supabase UUID, tokens, child names |
| MHP sharing boundaries | Parent-controlled, time-limited, consent-led review sharing only |
| Stripe entitlement sync | Webhook-driven plan sync; no manual entitlement patching in normal support |
| Privacy baseline | No ads; no data-selling; consent-led research only; privacy not paid-only |

Compliance readiness work must **preserve** these boundaries unless an owner-approved, reviewed change explicitly says otherwise.

---

## 3. HIPAA applicability decision tree

HIPAA applicability is **conditional**. Legal review is required before any HIPAA claim or Business Associate positioning.

```
Start
  │
  ├─ Is Wayfinder acting as a covered entity (CE)?
  │     └─ Likely NO for current product framing — Wayfinder is parent reflection /
  │        ALIGN/CAB support, not direct covered healthcare services — unless
  │        product scope changes to offer covered treatment/billing/clinical services.
  │
  ├─ Is Wayfinder acting as a business associate (BA)?
  │     └─ POSSIBLE if Wayfinder handles PHI on behalf of a covered entity or their BA
  │        (e.g. institutional MHP programmes, employer-sponsored programmes, or
  │        integrations where a CE directs use of parent reflection data as PHI).
  │
  ├─ Is parent reflection / journal / Decode content PHI?
  │     └─ DEPENDS ON CONTEXT:
  │          • Identifiability (names, dates, clinical detail in free text)
  │          • Whether data is collected/used **on behalf of** a covered entity
  │          • Purpose (parent self-reflection vs clinical record)
  │        Treat health-adjacent content as **high sensitivity** even when HIPAA may
  │        not apply.
  │
  ├─ Does MHP review support increase sensitivity?
  │     └─ YES — optional Mental Health Practitioner (MHP) review increases
  │        health-adjacent sensitivity. Still not therapy, diagnosis, emergency care,
  │        or crisis support. Boundaries and consent remain essential.
  │
  └─ Before any HIPAA positioning:
        • Legal review required
        • BAA requirements reviewed for Wayfinder and **each vendor/subprocessor**
        • No “HIPAA compliant” language without signed agreements + control validation
```

**Working assumption for engineering:** Design and operate as if reflection and shared review data are sensitive; do not assume HIPAA does or does not apply without legal sign-off.

---

## 4. HIPAA readiness control areas

Checklist of **controls to be reviewed** (not self-attested as complete):

| Control area | Readiness question | Current notes | Gap / review needed |
| --- | --- | --- | --- |
| Data classification | Are data types classified (auth IDs, Parent/Child IDs, reflections, MHP feedback, billing metadata)? | Partial — product canon + AGENTS.md imply sensitivity tiers | Formal classification matrix; PHI vs non-PHI decision per flow |
| Minimum necessary access | Is access limited to what each role needs? | RLS + role separation (`parent`, `counsellor`, admin) | Document minimum necessary per table/API; periodic access review |
| Unique user identification | Can actions be tied to a unique user? | Supabase `user_id` + Wayfinder Parent ID | Admin/support impersonation policy; shared-device guidance |
| Access control | Are auth, RLS, and admin paths controlled? | Auth + RLS + owner-admin gates | Emergency access; break-glass procedure |
| Audit / log review | Can sensitive access be reconstructed? | Application debug gated; platform logs exist; PR #165 gap assessment | Formal audit log requirements; retention; review cadence | [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md) |
| Emergency access procedure | Is break-glass documented and approved? | Not documented in repo | Owner + security procedure |
| Encryption in transit | Is data encrypted in transit? | HTTPS (Vercel/Supabase/Stripe) | Document TLS expectations; certificate pinning N/A for web |
| Encryption at rest | Is data encrypted at rest? | Supabase/Stripe platform defaults | Confirm provider settings; key management ownership |
| Backup / recovery | Can data be restored? | Supabase platform backups (plan-dependent) | RTO/RPO targets; restore test evidence |
| Incident response | Is there an IR playbook? | [Production incident triage doc](./PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md) | HIPAA breach assessment addendum if applicable |
| Breach notification procedure | Who notifies whom, when? | General incident playbook | Legal notification tree if PHI involved |
| Workforce / admin access policy | Who has prod/admin access? | Owner/admin model | Least privilege; offboarding; MFA policy |
| Vendor / subprocessor review | Are vendors assessed? | Informal knowledge | Formal register — see §7 and [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md) |
| BAA review | Which vendors need BAAs if HIPAA applies? | **Not verified** | Legal review per vendor |
| Retention / deletion policy | How long is data kept; can users request deletion? | Partial product copy; no full retention schedule | Legal + product retention matrix |
| Parent consent and sharing boundaries | Is sharing consent-led and bounded? | PARENT_REVIEW_SHARING consent copy; grant expiry | Persisted consent records (PR #101+ track) |
| MHP access boundaries | Is MHP access grant-scoped? | Grant-scoped review sharing | Document MHP workspace rules; AI assist boundaries |

---

## 5. SOC 2 readiness control areas

SOC 2 is an **external audit** readiness map — not self-certification. Map Wayfinder evidence to Trust Services Criteria (TSC) themes:

| TSC theme | Current evidence (starter) | Gap | Owner | Future PR / action |
| --- | --- | --- | --- | --- |
| **Security** | Supabase auth, RLS, no service role in browser, Stripe live gate (`api/_stripe-runtime-mode.js`), guardrail scripts | Formal security policy; access reviews; vulnerability management | Owner + security | PR #164 policy docs; PR #165 audit-log gap assessment ([AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md)) |
| **Availability** | Vercel + Supabase Pro; incident playbook; production smoke runbook | Uptime targets; DR test evidence; status comms | Owner + ops | Ops evidence in register |
| **Confidentiality** | Privacy masking rules; Parent/Child IDs; MHP sharing consent; private licence/portrait storage | Data flow diagrams; subprocessor DPAs | Owner + legal | PR #166 vendor register |
| **Privacy** | PDPA/signup acknowledgement track; no ads/no data-selling; consent-led research framing | Privacy notice completeness; data subject request process | Owner + legal | Consent persistence owner apply |
| **Processing integrity** | Journal save/read contracts; webhook idempotency; entitlement sync RPCs | End-to-end reconciliation tests documented | Engineering | Only if auditor scope includes PI |

**Note:** Processing integrity is included **only if applicable later** — do not claim SOC 2 Type II until an auditor defines scope and opinion.

---

## 6. Evidence register starter

Detailed rows live in [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md).

Summary table (starter):

| Control area | Existing evidence | Evidence location | Gap | Risk | Next action | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Supabase auth | Email/password + verification gate | `docs/auth-profile-flow.md`, AGENTS.md | Formal auth policy doc | Medium | Add to PR #164 security policy pack | Owner | Open |
| RLS | SQL/RLS files + AGENTS rules | `supabase-*.sql`, AGENTS.md | RLS coverage matrix | High | Map tables to policies | Engineering | Open |
| Email verification | Auth gate documented | AGENTS.md, auth flow docs | Support runbook cross-link | Low | FAQ cross-link done in PR #163 | Ops | In progress |
| Parent/Child ID masking | UI rules + dashboard behaviour | AGENTS.md, product canon | Automated UI scan in CI | Medium | Document test checklist | Engineering | Open |
| Journal save/read | Stable contracts | AGENTS.md, journal paths in app | Formal data-flow diagram | Medium | PR #164 diagram | Engineering | Open |
| MHP sharing | Consent copy + grant model | `content.js` canon (reference only) | Persisted consent evidence | Medium | Owner apply consent SQL | Owner | Open |
| Stripe entitlement sync | Webhook + RPC docs | Stripe evidence pack, PR #148–#156 | Live monitoring cadence | Medium | Daily checklist in post-live FAQ | Ops | In progress |
| Webhook safety | Live mode gate + idempotency | `api/_stripe-runtime-mode.js`, webhook handler | Alerting on failed webhooks | Medium | Ops monitoring | Ops | Open |
| Production monitoring | Post-live FAQ + runbook | POST_LIVE_MONITORING FAQ | Formal SLA | Low | Owner defines SLA | Owner | Open |
| Support FAQ | Billing + privacy baseline | POST_LIVE_MONITORING FAQ | Compliance wording guard | Low | PR #163 support rule | Ops | In progress |
| Incident escalation | Incident playbook | PRODUCTION_INCIDENT doc | Breach notification addendum | High | Legal review if PHI scope | Owner + legal | Open |
| Language / private content boundary | Language toggle strategy | LANGUAGE_TOGGLE doc | zh-Hans + reflection boundary tests | Low | Next product PR when approved | Product | Planned |

---

## 7. Vendor / subprocessor readiness

Status is **unknown until reviewed** with current agreements and vendor documentation. Do **not** state vendors are HIPAA-ready unless verified.

| Vendor | Purpose | Data touched | Sensitive / PHI may be involved? | DPA needed | BAA needed if HIPAA applies | SOC 2 report needed | Review status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Supabase** | Auth, Postgres, Storage, RLS | Auth identities, profiles, journal, MHP profiles, licence/portrait objects | Possible — reflection and MHP content | Yes — review | Yes — if HIPAA applies | Yes — for SOC 2 readiness | **Not verified** |
| **Vercel** | Hosting, serverless API routes | Request metadata, env secrets, API payloads in transit | Possible — if logs capture sensitive payloads | Yes — review | Unlikely direct PHI store; confirm | Yes | **Not verified** |
| **Stripe** | Checkout, Billing Portal, webhooks | Billing customer refs, plan status, email (Stripe-side) | Unlikely reflection content; billing PII | Yes — review | Typically no for payment processing; legal confirm | Yes | **Not verified** |
| **OpenAI / AI provider** | Assistive reflection (counsellor/MHP flows if enabled) | Prompt text derived from parent-granted entries | **High** if reflections sent externally | Yes — review | Yes — if HIPAA applies and PHI sent | Yes | **Review before any expansion** |
| **Email provider** (Supabase Auth email) | Verification, password reset, invites | Email addresses, auth tokens in links | PII | Yes — review | If HIPAA applies to auth email | Provider-dependent | **Not verified** |
| **Storage** (Supabase Storage) | MHP licence PDFs, portraits | MHP licence documents, images | Possible identifiers | Covered under Supabase review | If HIPAA applies | Via Supabase | **Not verified** |
| **Analytics** (if any) | Product analytics | Must not include reflection content or child names | Should be none in current canon | N/A unless added | N/A | N/A | **Confirm none in production** |

**Next action:** PR #166 vendor/subprocessor register with contract dates, data processing terms, and owner sign-off columns.

---

## 8. Product wording rules

### Allowed (with review for public-facing marketing)

- “privacy-first”
- “designed with privacy and consent in mind”
- “preparing for HIPAA / SOC 2 readiness review”
- “controls to be reviewed with legal/security/auditor confirmation”

### Not allowed without explicit legal/security/auditor approval

- “HIPAA compliant”
- “SOC 2 compliant”
- “certified”
- “audited” (implying completed compliance audit)
- “fully compliant”
- “medical-grade”
- “clinical platform”
- “secure enough for PHI”

### Wayfinder product framing (unchanged)

- Parent reflection and ALIGN/CAB support — not child diagnosis or behaviour labelling
- MHP review is optional, parent-controlled support — not therapy, diagnosis, emergency care, or crisis support
- Privacy is baseline across all plans

---

## 9. Stop conditions

Stop any build or support action if:

- A change weakens auth, RLS, or email verification
- Service-role key enters browser code or normal UI
- Parent/MHP IDs are exposed unnecessarily in UI, logs, or support tickets
- Journal or reflection content is sent to external services without explicit consent and design review
- Raw child names or reflection content appear in logs, analytics, or monitoring notes
- Support wants to manually patch sensitive records (`user_entitlements`, `stripe_billing_references`, journal rows) outside approved procedures
- Vendors cannot support required privacy/security obligations for the intended data flow
- Compliance language (“HIPAA compliant”, “SOC 2 compliant”, etc.) is added to product, marketing, or support templates without review

Escalate to owner + legal/security before proceeding.

---

## 10. Recommended next PRs

| PR | Scope | Type |
| --- | --- | --- |
| **#163** | HIPAA / SOC 2 readiness foundation, gap register starter, wording rules | Docs only — merged |
| **#164** | Compliance evidence register expansion + draft security/classification/admin policy docs | Docs only — merged |
| **#165** | Audit-log and event-trail gap assessment + proposed event catalog | Docs only — no runtime logging |
| **#166** | Vendor/subprocessor register with DPA/BAA review columns | Docs only |
| **#167** | Audit-log implementation design (docs only) | Before any SQL/API logging |
| **Later** | Implementation gaps (logging, retention automation, etc.) | Only after legal/security/auditor review |

**Product sequencing note:** Simplified Chinese language toggle remains a planned parent-facing feature; owner may parallelise with compliance docs but must not weaken privacy or ALIGN/CAB boundaries.

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #163 — initial HIPAA / SOC 2 readiness foundation (docs only) |
| 2026-07-20 | PR #164 — cross-links to draft security, data classification, and admin access policy docs |
| 2026-07-20 | PR #165 — audit-log gap assessment and event catalog draft cross-links; PR #167 in recommended next PRs |
