# Data Classification and Retention — Readiness Draft

**Status:** Draft classification and retention **readiness** doc — **evidence preparation** only.

**Branch:** `docs/pr-164-compliance-evidence-security-policy`

**Last updated:** 2026-07-20

**Related:** [HIPAA_SOC2_READINESS_FOUNDATION.md](./HIPAA_SOC2_READINESS_FOUNDATION.md) · [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md) · [SECURITY_POLICY_READINESS_DRAFT.md](./SECURITY_POLICY_READINESS_DRAFT.md) · [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md) · [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md) · [VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md)

This document:

- Does **not** decide final HIPAA applicability
- Does **not** finalise PHI status for all data categories
- **Legal review required** before PHI classification is treated as final
- Does **not** invent retention periods — gaps are explicit

**Do not store PHI examples, parent emails, child names, Supabase UUIDs, JWTs, or reflection content in this doc.**

---

## 1. Status and scope

Wayfinder handles parent reflection, optional MHP review support, and billing metadata. This draft classifies data for **HIPAA / SOC 2 readiness** planning so legal, security, and engineering can align on controls and retention — without product or compliance claims.

Wayfinder is not a clinical platform. MHP review is optional, parent-controlled support — not therapy, diagnosis, emergency care, or crisis support.

---

## 2. Data classification levels

| Level | Description | Handling expectation |
| --- | --- | --- |
| **Public** | Marketing and non-authenticated public copy | May be published; no user data |
| **Internal operational** | Runbooks, non-sensitive ops notes, release process | Staff/agents only; no secrets or user content |
| **Confidential** | Account metadata, billing refs, auth identifiers, generated IDs | Access controlled; masked in normal UI |
| **Sensitive parent/MHP data** | Reflections, Decode content, MHP feedback, licence PDFs | RLS, consent, minimum necessary access |
| **Potential PHI / regulated health data (conditional)** | Health-adjacent content **if** collected/used on behalf of a covered entity or deemed PHI by legal review | **Status pending legal review** — treat as high sensitivity until confirmed |

---

## 3. Wayfinder data categories

| Data category | Examples (generic) | Classification | Who may access | Where stored / likely location | Retention status | Deletion status | Notes / gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Public marketing/app copy | Landing hero, Plans copy, App Version notes | Public | Anyone | Static app (`content.js`), docs | Indefinite for published copy | N/A | ALIGN/CAB non-diagnostic framing required |
| Parent email | Sign-in email | Confidential | Parent; Supabase auth; owner admin only for support | Supabase Auth | **Unknown / partial** | **Workflow needed** | Not shown in normal UI |
| Supabase auth user ID | Technical auth UUID | Confidential | Auth system; server-side admin | Supabase Auth | Platform default | **Workflow needed** | Not shown in normal UI |
| Parent ID / Wayfinder ID | Generated parent identifier | Confidential | Parent; RLS-scoped reads | `profiles` | **Unknown / partial** | **Workflow needed** | Shown in dashboard by design |
| Child ID | Generated child identifier | Confidential | Parent; RLS-scoped reads | `dyads` | **Unknown / partial** | **Workflow needed** | No child names in normal UI |
| Child name if parent enters it | Free text in reflection/register flows | Sensitive parent/MHP data | Parent; MHP if shared via grant | Journal/register payloads | **Unknown / partial** | **Workflow needed** | Data minimisation: avoid names unless necessary |
| Journal / reflection content | Activity journal entries | Sensitive parent/MHP data | Parent; MHP if grant + consent | `journal_entries` | **Unknown / partial** | **Workflow needed** | Core product data |
| Decode content | Behaviour decode structured fields | Sensitive parent/MHP data | Parent; MHP if grant + consent | `journal_entries` | **Unknown / partial** | **Workflow needed** | `entry_type = behaviour_decode` |
| CAB fields | Cognition, affect, behaviour markers | Sensitive parent/MHP data | Parent; MHP if shared | Journal payloads | **Unknown / partial** | **Workflow needed** | Parent-development framing only |
| MHP feedback | Published counsellor/MHP responses | Sensitive parent/MHP data | Parent; authoring MHP | Response storage tables | **Unknown / partial** | **Workflow needed** | Not diagnosis or clinical report |
| MHP profile | Name, title, bio, enquiry fields | Confidential / sensitive | MHP; owner admin; parents see published subset | MHP profile tables | **Unknown / partial** | **Workflow needed** | Publication owner-controlled |
| MHP licence PDF | Registration document upload | Sensitive parent/MHP data | MHP; owner admin review | Supabase Storage (private) | **Unknown / partial** | **Workflow needed** | Not shown to parents |
| MHP portrait / source image | Approved portrait; private source | Confidential / sensitive | Parents see approved portrait only; owner review | Supabase Storage | **Unknown / partial** | **Workflow needed** | Strategy in MHP profile image docs |
| Stripe billing reference metadata | Customer/subscription refs (server-side) | Confidential | Server webhook/sync; owner admin | `stripe_billing_references`, Stripe | **Unknown / partial** | **Workflow needed** | No manual support patching |
| Stripe webhook events | Plan sync payloads (processed server-side) | Confidential | Server; Stripe dashboard | Vercel logs / Stripe | **Unknown / partial** | Log retention TBD | Non-identifying ops notes only |
| Support tickets / notes | Billing/support correspondence | Confidential / sensitive | Support; owner | External support tool | **Unknown / partial** | **Workflow needed** | Must not store reflection content |
| Production logs | Vercel/Supabase platform logs | Confidential | Ops; owner | Vercel, Supabase | **Unknown / partial** | Log retention TBD | No reflection content in notes |
| Application audit logs (future) | Minimised event metadata if implemented | Confidential / sensitive (depends on metadata) | Owner/admin only — **access policy TBD** | Future audit store (not implemented) | **Pending legal/security review** | **Policy needed** | See [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md); never log reflection content, child names, or secrets |
| Research / consent records | Signup privacy acknowledgement; future consent | Confidential / sensitive | Parent; approved research ops | Consent tables (when applied) | **Unknown / partial** | Separate from app-use retention | Consent persistence track |
| Language preference | `wayfinder_preferred_language` | Confidential | Parent device/localStorage | Browser localStorage | Client-side until cleared | User can change/clear | Static UI only; reflections not auto-translated |
| AI prompts / responses (if used) | Grant-scoped assistive text | Sensitive / **potential PHI conditional** | MHP workspace if enabled | Provider-dependent | **Not implemented / TBD** | **Block without review** | No external AI for private content without approved design |

**PHI status:** Categories marked “potential PHI conditional” require **legal review** — do not treat as non-PHI or as confirmed PHI in product copy.

---

## 4. Retention readiness

| Topic | Current status |
| --- | --- |
| Final retention periods | **Not defined in this PR** — legal review required |
| Deletion workflow | **Needed** — parent request process not fully documented |
| Parent export request process | **Needed** |
| Research retention vs app-use retention | **Must be separated** — consent-led research only |
| MHP licence retention rule | **Gap** — owner + legal |
| Logs retention | **Gap** — platform defaults only; application audit logs not implemented |
| Application audit log retention | **Not defined** — pending legal/security review | See AUDIT_LOG_GAP_ASSESSMENT §4 |
| AI retention if introduced | **Gap** — block until policy exists |
| External vendor retention | **Not verified per vendor** — review against data category | See [VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md) §5 — **do not invent retention periods** |

Do not publish retention periods to parents until legal review confirms wording.

---

## 5. Data minimisation rules

- Avoid names in reflections unless truly necessary for the parent’s practice
- Do not store PHI examples in docs, tickets, or evidence registers
- **No private reflection translation by default** — language toggle is static UI only; saved journal/Decode text stays in language entered
- **No external AI or translation services** for private parent/MHP content without approved consent, design review, and vendor review per [VENDOR_REVIEW_SOP_DRAFT.md](./VENDOR_REVIEW_SOP_DRAFT.md)
- **No analytics** containing child names, reflection content, or journal text
- Privacy is baseline across all plans — not paid-only

---

## 6. Open gaps

- Retention schedule (legal)
- Deletion request process (legal + product)
- Export request process (legal + product)
- MHP licence retention rule (legal + owner)
- Logs retention alignment with providers (ops)
- Application audit log retention and export/deletion policy (legal + engineering) — see [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md)
- External vendor retention per data category (legal + owner) — see [VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md)
- Research retention policy (legal + research ops)
- AI retention and subprocessor boundaries if introduced (engineering + legal)

Track in [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md).

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #164 — initial data classification and retention readiness draft (docs only) |
| 2026-07-20 | PR #165 — application audit logs data category; cross-links to audit-log gap assessment |
| 2026-07-20 | PR #166 — external vendor retention note; cross-link to vendor register |
