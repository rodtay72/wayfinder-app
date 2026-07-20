# Vendor Security Review Checklist

**Status:** Readiness checklist only — **not a vendor approval**, **no compliance claim**.

**Branch:** `docs/pr-166-vendor-subprocessor-register`

**Last updated:** 2026-07-20

**Related:** [VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md) · [VENDOR_REVIEW_SOP_DRAFT.md](./VENDOR_REVIEW_SOP_DRAFT.md) · [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md)

Use this checklist **before** enabling or expanding any vendor that may touch Wayfinder data. Complete reviews per [VENDOR_REVIEW_SOP_DRAFT.md](./VENDOR_REVIEW_SOP_DRAFT.md).

---

## 1. Status and scope

This checklist supports HIPAA / SOC 2 **readiness** and **evidence preparation**. Completing it does **not** approve a vendor or imply HIPAA/SOC 2 compliance. **Legal/security/auditor confirmation required** before public positioning.

---

## 2. Pre-review questions

- [ ] What vendor is being reviewed?
- [ ] What feature needs the vendor?
- [ ] What data will be sent?
- [ ] Will parent reflection, Decode, journal, MHP feedback, child names, licence PDFs, images, tokens, Stripe IDs, or billing data be involved?
- [ ] Is the vendor necessary?
- [ ] Can the feature work with less data?
- [ ] Can data remain inside Supabase/Vercel instead?

---

## 3. Privacy and data questions

- [ ] Data categories involved (see [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md))
- [ ] Sensitivity classification (Public / Internal / Confidential / Sensitive / Potential PHI conditional)
- [ ] Potential PHI conditional status — **legal review required** if ambiguous
- [ ] Consent required?
- [ ] Parent-controlled sharing required (MHP flows)?
- [ ] Research use separated from app use?
- [ ] Retention expectations documented?
- [ ] Deletion/export support confirmed?
- [ ] Logging behaviour reviewed — what does vendor log?
- [ ] Subprocessors identified and reviewed?

---

## 4. Security questions

- [ ] MFA/admin controls available and enabled for Wayfinder accounts?
- [ ] Access logs available?
- [ ] Encryption in transit (TLS)?
- [ ] Encryption at rest?
- [ ] Role-based access?
- [ ] Data residency / region options?
- [ ] Incident notification process?
- [ ] Vulnerability disclosure process?
- [ ] Breach notification terms in agreement?
- [ ] Audit/security report availability (SOC 2, ISO, etc.) — **current evidence needed**
- [ ] Backup/recovery for vendor-stored data?
- [ ] API key/secret handling — server-side only; never in browser?

---

## 5. Legal/compliance questions

- [ ] DPA available? — **DPA review required**
- [ ] BAA available if HIPAA applies and PHI is involved? — **legal confirm**
- [ ] SOC 2 report or equivalent available? — **not verified until reviewed**
- [ ] Terms allow intended data use?
- [ ] Subprocessor list available?
- [ ] Data deletion terms clear?
- [ ] Public claim language reviewed — no “HIPAA compliant” / “SOC 2 compliant” without approval?

---

## 6. AI / translation specific checks

- [ ] Does vendor train on submitted data?
- [ ] Can training be disabled?
- [ ] Are prompts/responses retained?
- [ ] Can retention be configured or disabled?
- [ ] Are private reflections sent? — **must be no unless explicitly approved**
- [ ] Is explicit consent required?
- [ ] Is there a non-AI/local alternative?
- [ ] **No private content translation** unless approved by owner + legal + security

**Default:** Block AI/translation for journal, Decode, MHP feedback, and licence content.

---

## 7. Decision outcomes

Record one outcome in the vendor register after review:

| Outcome | Meaning |
| --- | --- |
| **Approved for public/static data only** | Marketing copy, public docs — no user data |
| **Approved for confidential metadata only** | Billing refs, plan keys, non-content operational metadata |
| **Approved for sensitive content only after legal/security review** | Requires signed agreements and design review |
| **Blocked pending DPA/BAA/security evidence** | Cannot proceed until evidence collected |
| **Rejected for Wayfinder private content** | Vendor unsuitable for reflection/MHP data |
| **Not currently used** | No active integration |

Do **not** use “vendor is HIPAA compliant” or “vendor is SOC 2 compliant” as outcomes.

---

## 8. What not to include in review notes

Do **not** store in tickets, docs, or vendor portals:

- Parent emails
- Child names
- Supabase UUIDs
- JWTs / access tokens / refresh tokens
- API keys / service-role keys
- Stripe customer/subscription IDs
- Billing Portal URLs
- Webhook secrets
- Reflection / journal / Decode text
- MHP feedback content
- Licence PDFs / source portrait images
- PHI examples

Use generic categories only (e.g. “journal entry type behaviour_decode”, “billing webhook processed”, “MHP grant created”).

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #166 — initial vendor security review checklist (docs only) |
