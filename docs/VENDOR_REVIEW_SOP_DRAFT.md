# Vendor Review SOP — Draft

**Status:** Draft standard operating procedure for vendor review — **no vendor approval in this PR**, **no runtime or procurement change**.

**Branch:** `docs/pr-166-vendor-subprocessor-register`

**Last updated:** 2026-07-20

**Related:** [VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md) · [VENDOR_SECURITY_REVIEW_CHECKLIST.md](./VENDOR_SECURITY_REVIEW_CHECKLIST.md) · [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md)

---

## 1. Status and scope

This SOP describes how Wayfinder should review vendors and subprocessors for HIPAA / SOC 2 **readiness**. It does **not**:

- Approve any vendor
- Change existing integrations
- Authorise compliance or vendor compliance claims
- Replace legal counsel

**Agreement status unverified** until owner/legal/security records current evidence.

---

## 2. When this SOP is triggered

- New vendor or tool
- New analytics or monitoring provider
- New AI or translation provider
- New support or helpdesk tool
- New research or export tool
- Changed data flow (new API route, new Storage bucket, new webhook)
- Vendor terms or security posture changes
- Before public HIPAA / SOC 2 positioning

---

## 3. Review steps

| Step | Action | Owner |
| --- | --- | --- |
| **1 — Describe feature/data flow** | Document what the vendor does and what data moves | Engineering / product |
| **2 — Classify data** | Map to [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md) | Engineering + owner |
| **3 — Check minimum necessary** | Can less data be sent? Can Supabase/Vercel suffice? | Engineering |
| **4 — Collect vendor evidence** | DPA, BAA (if needed), SOC 2/security docs, subprocessor list, retention terms — **current evidence needed** | Owner + ops |
| **5 — Legal/security review** | Complete [VENDOR_SECURITY_REVIEW_CHECKLIST.md](./VENDOR_SECURITY_REVIEW_CHECKLIST.md) | Legal/security reviewer |
| **6 — Owner decision** | Approve scope, block, or defer — document outcome | Owner |
| **7 — Update register** | Update [VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md) and [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md) | Owner |
| **8 — Implementation PR only after approval** | No runtime/API/env changes before decision documented | Engineering |
| **9 — Post-launch monitoring/evidence** | Confirm logging behaviour; add to ops FAQ if needed | Ops |

---

## 4. Roles

| Role | Responsibility |
| --- | --- |
| **Owner** | Final decision; records evidence location; MFA on vendor accounts |
| **Engineering** | Data-flow description; minimum-necessary design; no secrets in repo |
| **Legal/security reviewer** | DPA/BAA/PHI scope; terms review; breach notification |
| **Ops/support** | Support-tool boundaries; no sensitive paste into vendor portals |
| **MHP/research owner** | Consent and research separation if research/export tools involved |

---

## 5. Approval rules

- **Owner approval required** for any new vendor touching Confidential or Sensitive data
- **Legal review required** for DPA/BAA and PHI ambiguity
- **Security review required** before any sensitive data flow
- **No implementation** before decision is documented in register
- **No public claims** before legal/security/auditor confirmation
- **No vendor compliance claims** — use “approved for [scope] after review” not “vendor is compliant”

---

## 6. Emergency vendor review

Trigger immediately if:

- Suspected security incident
- Vendor outage affecting parent/MHP access
- Vendor breach notification received
- Unexpected log capture of sensitive content
- Data sent to wrong system

**Actions:**

1. Contain — disable new data flow if possible
2. Owner notification
3. Document **non-sensitive notes only** (outcome categories, timestamps)
4. Cross-link incident playbook: [PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md)
5. Schedule full vendor review after containment

---

## 7. Output template

Copy for each review (store in owner-controlled location — **no secrets or PHI**):

```
Vendor:
Feature / purpose:
Data categories:
Sensitivity:
PHI conditional status: [pending legal / not applicable / conditional]
Agreement evidence: [DPA / BAA / none collected — unverified]
Security evidence: [SOC 2 report / whitepaper / none — unverified]
Approved use:
Prohibited use:
Retention notes: [pending legal review]
Owner decision: [approved scope / blocked / deferred]
Next review date:
Reviewer(s):
```

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #166 — initial vendor review SOP draft (docs only) |
