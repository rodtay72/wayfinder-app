# Security Policy — Readiness Draft

**Status:** Draft security policy for **HIPAA / SOC 2 readiness** and **evidence preparation** only.

**Branch:** `docs/pr-164-compliance-evidence-security-policy`

**Last updated:** 2026-07-20

**Related:** [HIPAA_SOC2_READINESS_FOUNDATION.md](./HIPAA_SOC2_READINESS_FOUNDATION.md) · [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md) · [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md) · [ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md](./ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md) · [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md) · [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md)

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [partner-collaboration-and-deployment-rules.md](./partner-collaboration-and-deployment-rules.md)

This document:

- Is **not legal advice**
- Is **not** a SOC 2 certification or HIPAA attestation
- Does **not** authorise any product claim
- Describes **controls to be reviewed** — **legal/security/auditor confirmation required** before public compliance positioning

Wayfinder remains ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, therapy, emergency care, or a clinical platform.

---

## 1. Status and scope

This draft supports Wayfinder’s **compliance preparation** work started in PR #163. It records security expectations for owners, engineers, and support without changing runtime permissions or deployment configuration.

**No product claim changes in PR #164.**

---

## 2. Protected Wayfinder systems

The following systems and behaviours are **protected** under current operating rules:

| System / behaviour | Protection intent |
| --- | --- |
| Supabase auth | Verified email/password identity for workspace access |
| Supabase RLS | Row-level access control on parent/MHP data paths |
| Email verification | Gate before app workspace access |
| `ensure_profile` | Server RPC only; explicit Bearer token; no browser `profiles.insert` / `profiles.upsert` |
| Parent ID / Child ID | Generated IDs in normal UI; masking rules in AGENTS.md |
| Journal save/read | Stable contracts; ISO timestamps for writes |
| Dashboard loading | Loads by `parent_id` with verified session / Bearer token |
| MHP sharing grants | Parent-controlled, consent-led, time-limited review access |
| Stripe webhook entitlement sync | Webhook-driven plan sync; live runtime safety gate |
| Private MHP licence / portrait storage | Supabase Storage; not shown to parents in normal flows |
| Vercel production deployment | Serverless API routes; env secrets in platform config only |

Compliance readiness work must not weaken these without owner-approved, reviewed change.

---

## 3. Access control principles

**Controls to be reviewed:**

- **Least privilege** — each role and admin account receives only the access needed for its function
- **Unique named accounts** — no shared personal admin accounts where avoidable
- **Owner/admin access only when needed** — production and Supabase service-role usage limited to approved workflows
- **No service-role key in browser** — service role remains server-side / admin tooling only
- **No manual entitlement patching in normal support** — `user_entitlements` changes outside approved procedures are prohibited
- **No manual `stripe_billing_references` patching in normal support** — billing linkage via reviewed Stripe flows only
- **Parent-controlled sharing only** — Mental Health Practitioner (MHP) review access requires parent consent and grant scope; internal role remains `counsellor`

See [ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md](./ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md) for admin-system detail.

---

## 4. Authentication expectations

- **Email verification required** before workspace access
- **Admin/owner accounts** should use strong, unique passwords
- **MFA should be enabled wherever available** for GitHub, Supabase, Vercel, Stripe, email, and other admin consoles
- **MFA status** should be recorded in [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md) later — **without storing secrets or screenshots of codes**

Authentication policy does not change Supabase auth implementation in this PR.

---

## 5. Secrets handling

| Rule | Detail |
| --- | --- |
| Never paste secrets into GitHub, Cursor, ChatGPT, support notes, docs, logs, or screenshots | Includes service-role keys, Stripe live keys, webhook secrets, JWTs |
| Never expose service-role keys in browser code | AGENTS.md and guardrail checks enforce this |
| Never store Stripe webhook secrets or live keys in repo | Vercel env only |
| Use platform secret managers | Vercel, Supabase, Stripe dashboards as applicable |
| Rotate secrets if exposed | Treat exposure as incident; follow incident runbooks |

---

## 6. Logging and monitoring expectations

Monitoring notes and support tickets must **avoid**:

- Parent emails
- Supabase UUIDs
- JWTs
- Stripe customer/subscription IDs
- Webhook secrets
- Billing Portal URLs
- Child names
- Reflection / journal / Decode content
- PHI examples

Record only **non-identifying outcome categories** (e.g. “webhook processed”, “dashboard load failed for verified user”, “Plans page unavailable”).

**Application audit-log requirements are not yet fully implemented.** PR #165 gap assessment: [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md). Proposed event catalog: [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md). **No runtime logging in PR #165** — implementation requires legal/security/owner review.

Cross-link: [POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md](./POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md)

---

## 7. Vulnerability and change management readiness

- **One branch / one PR** — focused changes; reviewable diffs
- **Guarded files require explicit review** — `supabase.js`, SQL/RLS, auth, Stripe runtime, journal save/read (per AGENTS.md)
- **Checks must pass** — `git diff --check`, `verify-wayfinder.ps1`, guardrail workflows where applicable
- **Production smoke after user-facing/runtime merges** — [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md)
- **Security-impacting PRs require owner review** — auth, RLS, billing, privacy masking, data writes
- **No emergency production changes without post-incident documentation** — record non-sensitive outcome in incident playbook

---

## 8. Incident response linkages

Use existing runbooks:

- [PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md)
- [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md)
- [POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md](./POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md)

Escalate and document (non-sensitive notes only) for:

| Scenario | Initial action |
| --- | --- |
| Suspected secret exposure | Rotate affected secrets; owner notification; no secrets in tickets |
| Suspected wrong-parent data exposure | Stop related deploy; owner + engineering review; RLS check |
| Suspected RLS break | Halt feature rollout; SQL/RLS review; no manual data “fixes” without procedure |
| Webhook repeated failure | Check Vercel/Stripe dashboards; non-identifying log categories; ops FAQ |
| Support request involving raw IDs or manual data patching | Refuse manual patch; use approved procedures; escalate owner |
| Possible PHI exposure if HIPAA scope later applies | Owner + legal notification tree — **not yet documented** |

---

## 9. Open gaps

| Gap | Next action | Owner |
| --- | --- | --- |
| Formal admin MFA evidence | Record MFA enabled per system in evidence register | Owner |
| Access review cadence | [ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md](./ADMIN_ACCESS_AND_OFFBOARDING_POLICY_DRAFT.md) | Owner |
| Application audit-log requirements | [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md); PR #167 design doc | Engineering |
| Breach notification tree if HIPAA scope applies | Legal addendum | Owner + legal |
| Vendor DPA/BAA review | PR #166 vendor register | Owner + legal |
| Retention/deletion process | [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md) | Owner + legal |
| Restore drill evidence | Schedule Supabase restore test; record outcome | Owner + ops |

---

## 10. Stop conditions

Stop any build, deploy, or support action if:

- Service-role key reaches browser code or normal UI
- Auth, RLS, or email verification is weakened
- Parent/MHP/Child identifiers are exposed unnecessarily
- Journal or reflection content appears in logs or support notes
- Raw PHI examples are stored in docs or tickets
- Product copy claims HIPAA or SOC 2 compliance (or “certified”, “audited”, “fully compliant”)
- Support wants manual sensitive-record patches outside approved procedures

Escalate to owner + legal/security before proceeding.

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #164 — initial security policy readiness draft (docs only) |
| 2026-07-20 | PR #165 — cross-links to audit-log gap assessment and event catalog draft |
