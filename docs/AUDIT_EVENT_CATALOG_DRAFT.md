# Audit Event Catalog — Draft

**Status:** **Proposed** event catalog for future audit-trail design — **no implementation**, **no compliance claim**.

**Branch:** `docs/pr-165-audit-log-gap-assessment`

**Last updated:** 2026-07-20

**Parent doc:** [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md)

All events below have status **proposed**. **Implementation requires legal/security/owner review.**

---

## 1. Status and scope

This catalog names events Wayfinder **may** record later as minimised metadata. It does not:

- Create database tables
- Emit runtime events
- Define retention periods
- Assert HIPAA or SOC 2 readiness completion

Internal MHP role value remains `counsellor`; user-facing label remains Mental Health Practitioner (MHP).

---

## 2. Event naming convention

Use dot-separated names:

`domain.action_or_state`

Examples:

- `auth.email_verification_required`
- `auth.email_verified`
- `profile.ensure_profile_success`
- `journal.entry_created`
- `journal.entry_read`
- `decode.entry_created`
- `mhp.share_grant_created`
- `mhp.share_grant_expired`
- `mhp.share_grant_revoked`
- `mhp.share_grant_accessed`
- `mhp.feedback_submitted`
- `mhp.feedback_read`
- `owner.invite_request_approved`
- `owner.invite_request_rejected`
- `owner.mhp_profile_published`
- `owner.mhp_profile_suspended`
- `billing.checkout_started`
- `billing.checkout_failed`
- `billing.webhook_processed`
- `billing.webhook_skipped`
- `billing.webhook_failed`
- `billing.portal_session_created`
- `privacy.acknowledgement_saved`
- `consent.research_opt_in_recorded`
- `consent.research_opt_out_recorded`
- `settings.language_changed`
- `support.legacy_plus_case_reviewed`
- `ai.assist_request_created` — **future only; blocked pending review**
- `data.export_request_received`
- `data.deletion_request_received`

---

## 3. Event catalog table

| Event name | Trigger | Actor | Target | Allowed metadata | Forbidden metadata | Sensitivity | Required before implementation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `auth.email_verification_required` | Unverified user hits gate | parent/mhp | auth_session | `outcome`, `actor_role` | email, tokens | Medium | Legal/security review |
| `auth.email_verified` | Verification completes | parent/mhp | auth_user | `outcome`, `actor_role` | email, tokens | Medium | Legal/security review |
| `profile.ensure_profile_success` | Profile RPC succeeds | parent/mhp | profile | `parent_id`, `role`, `outcome` | Supabase UUID, email | Medium | Owner + engineering |
| `profile.ensure_profile_failed` | Profile RPC fails | parent/mhp | profile | `error_code`, `outcome` | tokens, email | Medium | Owner + engineering |
| `journal.entry_created` | Journal save succeeds | parent | journal_entry | `entry_type`, `child_id`, `outcome` | title, body, CAB text | High | Legal/security review |
| `journal.entry_read` | Entry loaded in trail/dashboard | parent | journal_entry | `entry_type`, `child_id`, `outcome` | content | High | Legal/security review |
| `journal.entry_updated` | Entry edited/resaved | parent | journal_entry | `entry_type`, `child_id`, `outcome` | content | High | Legal/security review |
| `journal.entry_deleted` | Entry removed if supported | parent | journal_entry | `entry_type`, `child_id`, `outcome` | content | High | Legal/security review |
| `decode.entry_created` | Decode save succeeds | parent | journal_entry | `entry_type`, `child_id`, `outcome` | behaviour/CAB content | High | Legal/security review |
| `child.dyad_created` | New Child ID registered | parent | dyad | `child_id`, `outcome` | child name | Medium | Engineering |
| `mhp.share_grant_created` | Parent grants review access | parent | share_grant | `grant_status`, `child_id`, `entry_count`, `mhp_reference` | entry content, consent body | High | Legal/security review |
| `mhp.share_grant_expired` | Grant TTL reached | system | share_grant | `grant_id`, `outcome` | shared content | High | Engineering |
| `mhp.share_grant_revoked` | Parent revokes grant | parent | share_grant | `grant_id`, `outcome` | shared content | High | Engineering |
| `mhp.share_grant_accessed` | MHP opens granted entry | mhp | share_grant | `grant_id`, `entry_type`, `outcome` | entry content | High | Legal/security review |
| `mhp.feedback_submitted` | MHP publishes response | mhp | feedback | `response_status`, `outcome` | feedback text | High | Legal/security review |
| `mhp.feedback_read` | Parent marks/read feedback | parent | feedback | `response_status`, `outcome` | feedback text | High | Engineering |
| `owner.invite_request_approved` | Owner approves colleague invite | owner_admin | invite_request | `request_type`, `outcome` | colleague email in long-term store | Medium | Owner |
| `owner.invite_request_rejected` | Owner rejects request | owner_admin | invite_request | `request_type`, `outcome` | colleague email | Medium | Owner |
| `owner.mhp_profile_published` | MHP profile goes live | owner_admin | mhp_profile | `profile_status`, `outcome` | licence PDF, raw portrait | Medium | Owner |
| `owner.mhp_profile_suspended` | MHP profile suspended | owner_admin | mhp_profile | `profile_status`, `outcome` | — | Medium | Owner |
| `mhp.licence_upload_status` | Licence PDF upload/review state change | mhp/owner | licence_doc | `document_status`, `outcome` | PDF content | High | Owner + legal |
| `billing.checkout_started` | Checkout session created | parent | subscription | `plan_key`, `interval`, `outcome` | Stripe session URL, customer ID | Medium | Engineering |
| `billing.checkout_failed` | Checkout start fails | parent | subscription | `plan_key`, `error_code`, `outcome` | raw Stripe error payload | Medium | Engineering |
| `billing.webhook_processed` | Webhook sync succeeds | system | entitlement | `event_type`, `plan_key`, `outcome` | raw payload, Stripe IDs | Medium | Engineering |
| `billing.webhook_skipped` | Webhook skipped (mode mismatch etc.) | system | entitlement | `event_type`, `outcome`, `error_category` | payload | Medium | Engineering |
| `billing.webhook_failed` | Webhook processing fails | system | entitlement | `event_type`, `outcome`, `error_category` | payload, secrets | Medium | Engineering |
| `billing.portal_session_created` | Billing Portal opened | parent | billing | `outcome`, `error_code` | Portal URL | Medium | Engineering |
| `privacy.acknowledgement_saved` | Signup privacy ack stored | parent | consent_record | `consent_version`, `outcome` | — | Low | Owner |
| `consent.research_opt_in_recorded` | Research consent if implemented | parent | consent_record | `consent_type`, `outcome` | reflection content | Medium | Owner + legal |
| `consent.research_opt_out_recorded` | Research opt-out | parent | consent_record | `consent_type`, `outcome` | — | Medium | Owner + legal |
| `settings.language_changed` | Parent changes UI language | parent | preference | `language_code`, `outcome` | translated reflection content | Low | Product |
| `support.legacy_plus_case_reviewed` | Legacy Plus support review | owner | support_case | `case_category`, `outcome` | parent email, Stripe IDs | Medium | Owner |
| `ai.assist_request_created` | AI assist invoked | mhp | ai_request | `model_id`, `grant_scope`, `outcome` | prompt/response text | **High** | **Blocked** — legal/security |
| `data.export_request_received` | Parent requests export | parent | data_request | `request_type`, `outcome` | exported content | High | Owner + legal |
| `data.deletion_request_received` | Parent requests deletion | parent | data_request | `request_type`, `outcome` | deleted content | High | Owner + legal |

---

## 4. Metadata minimisation examples

| Instead of… | Log… |
| --- | --- |
| Stripe subscription ID | `plan_key` + `outcome` |
| Reflection title/body | `entry_type` + `child_id` + `outcome` |
| Child name | `child_id` only |
| Shared journal text | `grant_status` + `entry_count` |
| Translated UI string content | `language_code` only |
| Raw provider error JSON | `error_code` + `outcome` |
| Parent email | `parent_id` where necessary |
| MHP full name in audit row | `mhp_reference` / Wayfinder ID |

---

## 5. Open questions

- Which events are in scope for a future **SOC 2** audit opinion?
- Which events are **required if HIPAA applies**?
- Who may **view** application audit logs (owner only? security role?)?
- How long are audit logs **retained**? — pending legal review
- How are audit logs **exported for review** without exposing sensitive content?
- What **RLS/admin controls** protect audit log tables?
- Are **platform logs** (Vercel/Supabase/Stripe) sufficient for some controls?
- Which **vendor logs** exist and under what retention?

Track answers in [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md).

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #165 — initial proposed event catalog (docs only) |
