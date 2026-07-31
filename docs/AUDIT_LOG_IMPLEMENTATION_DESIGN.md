# Audit Log Implementation Design

**Status:** **Design only** — future implementation requires owner approval, security review, and Supabase/RLS review.

**Branch track:** PR #169 — audit-log implementation design (docs only)

**Last updated:** 2026-07-31

**Related:** [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md) · [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md) · [AUDIT_LOG_SQL_RLS_PROPOSAL.md](./AUDIT_LOG_SQL_RLS_PROPOSAL.md) (PR #170 Phase 1 proposal — **does not apply SQL/RLS**) · [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md) · [HIPAA_SOC2_READINESS_FOUNDATION.md](./HIPAA_SOC2_READINESS_FOUNDATION.md) · [SECURITY_POLICY_READINESS_DRAFT.md](./SECURITY_POLICY_READINESS_DRAFT.md) · [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md) · [VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md)

Read first: [AGENTS.md](../AGENTS.md) · [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)

This document:

- Is **not legal advice**
- Is **not** HIPAA, SOC 2, ISO, or GAICC **certification**
- Does **not** implement logging, SQL, API routes, RLS changes, or monitoring vendors
- Preserves Wayfinder as **parent reflection / ALIGN–CAB support** — not diagnosis, therapy, emergency, or crisis care

**Privacy rule:** Do not record parent emails, child names, reflection content, tokens, or webhook bodies in design evidence notes.

---

## 1. Status and scope

- **Design only.** No runtime implementation in PR #169.
- **No SQL, API, auth, RLS, Stripe, or journal payload changes** in this PR.
- **No compliance or certification claims.**
- **No application audit-log table or emitters exist today** unless separately implemented in a future PR — platform logs and billing idempotency tables are not a substitute (see gap assessment).
- Future implementation requires **owner approval**, **security review**, **privacy review**, **Supabase/RLS review**, and **legal review** where HIPAA/SOC 2 positioning is used.

---

## 2. Purpose

Audit logging should support **readiness-aligned** operational needs:

| Goal | Notes |
| --- | --- |
| Security monitoring | Detect abuse, repeated failures, forbidden role access |
| Accountability | Actor/action/resource/outcome trace without private content |
| Incident investigation | Correlation IDs and coarse outcomes — not reflection bodies |
| Privacy-preserving evidence | Metadata-only events for future auditor/legal review |
| MHP sharing accountability | Grant create/revoke/access/expiry — not shared reflection text |
| Entitlement/billing traceability | Checkout, webhook verification, entitlement updates — not Stripe payload bodies |
| Admin/owner action traceability | Invite approval, publication status — minimise colleague PII |
| Future SOC 2 / HIPAA / ISO **readiness evidence** | Control mapping only — **external audit required** before claims |

**Audit logs are not:**

- product analytics or parent scoring;
- child behaviour scoring or profiling;
- research export or clinical inference;
- a substitute for ALIGN/CAB parent-development framing in the product.

---

## 3. Standards alignment map

| Framework | Relevance to audit-log design | Wayfinder design response | Claim boundary |
| --- | --- | --- | --- |
| GAICC / ISO/IEC 42001 AI governance **readiness** | Accountability, traceability, human oversight for AI features | Metadata-only `ai_*` events; block prompt/response logging; separate security logs from model data | **Readiness alignment only; not certification; not legal conclusion.** |
| ISO/IEC 23894 AI risk management **readiness** | Risk treatment evidence for AI boundaries | `ai_feature_blocked`, `ai_safety_boundary_applied`; no training on private reflections | **Readiness alignment only; not certification; not legal conclusion.** |
| ISO/IEC 27001 information security **readiness** | Logging, access control, incident support | Append-only design, least-privilege read, auditable access to logs | **Readiness alignment only; not certification; not legal conclusion.** |
| SOC 2 Trust Services Criteria **readiness** | Security, confidentiality, processing integrity themes | Event catalog, RLS proposal, retention questions, monitoring design | **Readiness alignment only; not certification; not legal conclusion.** |
| HIPAA Security Rule audit controls **readiness** | Audit control **if** HIPAA scope applies later | Minimum necessary metadata; no PHI in logs; BAA/vendor review before positioning | **Readiness alignment only; not certification; not legal conclusion.** |
| PDPA / GDPR privacy-by-design support | Data minimisation, purpose limitation | No reflection content; retention/deletion policy before implementation | **Readiness alignment only; not certification; not legal conclusion.** |

---

## 4. Design principles

- **Minimum necessary event metadata** — allowlisted fields only.
- **No private reflection content** in logs (journal, Decode, activity CAB, MHP feedback body).
- **No child names.**
- **No raw parent emails** in routine audit logs.
- **No raw Supabase UUIDs** in support-facing views unless security-approved; prefer masked Parent ID / Child ID or hashed references.
- **No secrets/tokens** (JWT, passwords, service-role key, Stripe secrets, webhook secrets).
- **Actor / action / resource / outcome / time** pattern for every event.
- **Immutable append-only** storage preferred; no in-place edits of audit rows.
- **Least-privilege read access** — parents and MHPs do not read raw audit logs.
- **Retention defined before implementation** — legal/security review required.
- **Separate security logs from research data** and from product reflection storage.
- **No default export** of audit logs to third parties without vendor review ([VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md)).
- **Audit log access is itself auditable** (access events logged).

---

## 5. Event data model design

**Proposed fields — not implemented in PR #169.**

| Field | Purpose |
| --- | --- |
| `event_id` | Unique event identifier (UUID or ULID) |
| `event_time` | ISO timestamp (UTC) |
| `actor_user_id_hash` or internal actor reference | Non-reversible or controlled reference — not email |
| `actor_role` | e.g. parent, counsellor (internal MHP role), owner_admin, system |
| `actor_parent_id_masked` | Wayfinder Parent ID or masked form when applicable |
| `actor_counsellor_id_masked` | MHP reference when applicable |
| `event_type` | Allowlisted name (see §6 and event catalog draft) |
| `event_category` | Coarse grouping (auth, journal, billing, …) |
| `resource_type` | e.g. journal_entry, share_grant, entitlement |
| `resource_id_hash_or_masked` | Entry/grant id hashed or internal id — not content |
| `child_id_masked` | When relevant — not child name |
| `outcome` | success / failure / blocked |
| `failure_reason_code` | Allowlisted code — not stack traces with PII |
| `request_context` | Coarse user agent/device class only — no fingerprinting |
| `ip_region_or_prefix` | Regional/prefix only unless security/legal approves full IP |
| `session_reference_hash` | Correlation — not JWT |
| `correlation_id` | Cross-service trace id |
| `metadata_json_minimal` | Small allowlisted key bag |
| `created_at` | Insert time (may equal `event_time`) |

**Explicitly excluded fields (never store):**

- Journal body, Decode text, activity CAB text
- Child names, parent email
- MHP free-text feedback
- AI prompt/response content
- Stripe webhook payload body
- Auth token/JWT/password
- Raw IP (unless specifically approved)
- Secret/env values, Portal URLs with secrets

Align naming with [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md) (dot notation) and implementation snake_case aliases in §6 where useful for engineers.

---

## 6. Event categories

For **every** event below: **log metadata only**; **no private text**; **no child name**; **no prompt/response body**.

Internal MHP role remains `counsellor`; parent-facing label remains Mental Health Practitioner (MHP).

### Auth / account

| Event type (proposed) | Metadata only |
| --- | --- |
| `sign_in_success` | outcome, actor_role, coarse context |
| `sign_in_failure` | outcome, failure_reason_code (allowlisted) |
| `sign_out` | outcome, actor_role |
| `email_verification_sent` | outcome — no email |
| `email_verified` | outcome, actor_role |
| `password_recovery_requested` | outcome — no email |
| `password_reset_completed` | outcome |

### Profile / identity

| Event type | Metadata only |
| --- | --- |
| `ensure_profile_success` | parent_id_masked, role, outcome |
| `ensure_profile_failure` | error_code, outcome |
| `parent_profile_loaded` | outcome |
| `counsellor_profile_loaded` | outcome |

### Child / dyad

| Event type | Metadata only |
| --- | --- |
| `child_created` | child_id_masked, outcome |
| `child_updated` | child_id_masked, outcome |
| `child_deleted_or_archived` | if supported later |
| `child_switch_context` | child_id_masked, outcome |

### Journal

| Event type | Metadata only |
| --- | --- |
| `journal_entry_created` | entry_type, child_id_masked, outcome |
| `journal_entry_read` | entry_type, child_id_masked, outcome |
| `journal_entry_updated` | if supported later |
| `journal_entry_deleted` | if supported later |
| `decode_entry_created` | entry_type behaviour_decode, child_id_masked, outcome |
| `journal_trail_loaded` | outcome, count bucket optional |

### MHP sharing

| Event type | Metadata only |
| --- | --- |
| `mhp_share_preview_opened` | grant/share reference masked, outcome |
| `mhp_share_consent_given` | outcome |
| `mhp_share_created` | grant reference, child_id_masked, outcome |
| `mhp_share_revoked` | grant reference, outcome |
| `mhp_share_expired` | grant reference, outcome |
| `mhp_feedback_viewed_by_parent` | outcome — no feedback text |
| `mhp_review_opened_by_mhp` | grant scope, outcome — no entry content |

### Billing / entitlement

| Event type | Metadata only |
| --- | --- |
| `checkout_session_requested` | plan_key, interval, outcome |
| `checkout_session_created` | plan_key, outcome — no session URL |
| `checkout_return_success` | plan_key, outcome |
| `checkout_return_cancelled` | outcome |
| `stripe_webhook_received` | event category suffix, outcome |
| `stripe_webhook_verified` | event type allowlisted, outcome |
| `stripe_webhook_rejected` | failure_reason_code, outcome |
| `entitlement_updated` | plan_key, outcome — no Stripe customer id in support logs |
| `billing_portal_requested` | outcome |
| `billing_portal_blocked_legacy` | outcome, reason code |
| `billing_portal_session_created` | outcome — no Portal URL |

### Admin / owner

| Event type | Metadata only |
| --- | --- |
| `admin_queue_viewed` | queue type, outcome |
| `mhp_invite_request_approved` | request_type, outcome |
| `mhp_invite_token_generated` | outcome — no token value |
| `mhp_publication_status_changed` | status, outcome |
| `support_action_performed` | action category, outcome |

### Security / privacy

| Event type | Metadata only |
| --- | --- |
| `rls_denied` | resource_type, outcome |
| `unauthorized_access_attempt` | outcome, failure_reason_code |
| `forbidden_role_access` | outcome |
| `suspicious_repeated_failure` | category, count bucket |
| `privacy_masking_applied` | context — no masked content |
| `export_requested` | future |
| `export_completed` | future |

### AI / future

| Event type | Metadata only |
| --- | --- |
| `ai_feature_invoked` | feature id, outcome — no prompt/response |
| `ai_feature_blocked` | reason code, outcome |
| `ai_safety_boundary_applied` | boundary id, outcome |
| `ai_output_saved_only_with_parent_action` | outcome — no model output text |

Catalog detail and dot-notation aliases: [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md).

---

## 7. RLS and access model proposal

**Design only — no RLS changes in PR #169.**

- `audit_logs` (or equivalent) should be **write-only** from restricted **server-side** paths or reviewed database functions.
- **Browser clients must not** insert arbitrary audit rows unless a **security-approved RPC** is designed and reviewed.
- **Parents** must not read raw audit logs.
- **MHPs** must not read raw audit logs.
- **Owner/admin/support** read access must be role-limited, masked, and documented in admin policy.
- **Service-role key** must never be exposed to the browser.
- **Reading audit logs** should generate **access events** (who viewed audit data, when, coarse scope).

Preserve existing Supabase auth, email verification, `ensure_profile`, Parent/Child ID chain, journal save/read, dashboard loading, and privacy masking.

---

## 8. Retention and deletion design

- **Retention period** requires legal/security review — not set in this PR.
- Private reflections and audit logs have **different** retention needs; audit logs must **not** contain reflection content, simplifying deletion complexity for log stores.
- **User deletion requests** require policy: delete/anonymise account data while preserving **minimal** security audit evidence only if legally permitted.
- **No retention rule implemented** in PR #169.

See [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md).

---

## 9. Alerting and monitoring design

**Future only** — no monitoring vendor in this PR.

Candidate alerts (metadata-only signals):

- Repeated auth failures
- Forbidden role access
- MHP access outside valid share window
- Stripe webhook verification failure
- Unexpected entitlement changes
- Admin high-risk action
- Journal read volume anomaly (bucketed — not content)
- Audit-log write failure

Third-party APM/log aggregation requires [VENDOR_SECURITY_REVIEW_CHECKLIST.md](./VENDOR_SECURITY_REVIEW_CHECKLIST.md) before adoption.

---

## 10. Evidence and review workflow

Before any runtime phase:

1. Audit event catalog review (owner + engineering)
2. Privacy review (no reflection content rule)
3. Security review (RLS, write paths, secrets)
4. RLS review (Supabase)
5. Owner approval
6. Legal review if HIPAA/SOC 2 positioning is used
7. External auditor review **before** SOC 2 claims
8. BAA/vendor review **before** HIPAA positioning

Evidence ledger: [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md).

---

## 11. Implementation phases

Each phase requires a **separate approved PR**.

| Phase | Scope |
| --- | --- |
| **0** | Design only — **PR #169 (this doc)** |
| **1** | SQL/RLS **proposal** only — no runtime — [AUDIT_LOG_SQL_RLS_PROPOSAL.md](./AUDIT_LOG_SQL_RLS_PROPOSAL.md) (PR #170) |
| **2** | Server-side logging primitives (reviewed RPC or API) |
| **3** | Auth/billing/MHP event instrumentation |
| **4** | Journal/decode **metadata-only** instrumentation |
| **5** | Monitoring/alerting (vendor review if external) |
| **6** | Evidence review and auditor/legal readiness |

---

## 12. Non-goals

- No parent scoring or child behaviour scoring
- No therapy/diagnosis inference from logs
- No research data export via audit store
- No private reflection logging
- No AI prompt/response logging
- No new logging/monitoring **vendor** without review
- No HIPAA, SOC 2, ISO, or GAICC **compliance claim**

---

## 13. Open questions

- Exact retention duration per event category
- Full IP vs regional/prefix logging default
- Hashed UUID strategy and key rotation
- Supabase table layout and RLS policies
- Owner/admin/support role model for log viewers
- Incident-response owner for audit-log failures
- External auditor evidence format requirements
- HIPAA applicability and BAA needs for processors
- Whether audit logs should be encrypted or partitioned separately from application data
- Mapping snake_case runtime names to catalog dot notation

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-31 | PR #169 — initial audit-log implementation design (docs only) |
| 2026-07-31 | PR #170 — Phase 1 SQL/RLS proposal cross-link |
