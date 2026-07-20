# Audit-Log Gap Assessment

**Status:** Docs-only **gap assessment** for HIPAA / SOC 2 **readiness** — **not runtime logging**.

**Branch:** `docs/pr-165-audit-log-gap-assessment`

**Last updated:** 2026-07-20

**Related:** [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md) · [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md) · [SECURITY_POLICY_READINESS_DRAFT.md](./SECURITY_POLICY_READINESS_DRAFT.md)

Read first:

- [HIPAA_SOC2_READINESS_FOUNDATION.md](./HIPAA_SOC2_READINESS_FOUNDATION.md)
- [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md)
- [AGENTS.md](../AGENTS.md)

This document:

- Is **not legal advice**
- Is **not** a SOC 2 certification or HIPAA attestation
- Does **not** authorise product compliance claims
- Does **not** implement logging, tables, APIs, or monitoring

**Future implementation requires legal/security/owner review.**

**Privacy rule:** Do not record parent emails, child names, Supabase UUIDs, JWTs, reflection content, webhook secrets, or PHI examples in evidence notes.

---

## 1. Status and scope

PR #165 assesses what audit and event-trail **evidence exists today**, what is **missing**, which events may need a **proposed application audit trail** later, and what **must never be logged**.

No code, SQL, API, env, or schema changes in this PR.

---

## 2. Why audit logging matters

For **readiness** (not as a claim of current completeness):

| Purpose | Readiness use |
| --- | --- |
| Detect inappropriate access | Reconstruct who accessed sensitive admin or grant-scoped paths |
| Reconstruct admin/support events | Owner-admin MHP publication, invite approval, billing support boundaries |
| Support incident response | Link incidents to non-sensitive event categories |
| Support future SOC 2 evidence | Demonstrate control operation over time — **external audit required** |
| Support HIPAA breach assessment | **Only if HIPAA scope later applies** — legal review required |

Platform logs alone are **not** sufficient for a full application audit trail.

---

## 3. Current evidence sources

| Source | What it likely covers | Strength | Limitation | Sensitive data risk | Evidence location / owner |
| --- | --- | --- | --- | --- | --- |
| GitHub Actions / PR history | CI checks, guardrails, merge history | Medium for change control | Not user activity; no runtime events | Low if no secrets in logs | `.github/workflows/`, PR records — Owner |
| Vercel deployment logs | Deploy success/failure, build output | Medium for release trace | Not app-level user actions | Medium if env values leak — must not | Vercel dashboard — Owner |
| Vercel serverless logs | API route errors; Stripe webhook `console.error` entries with minimised fields | Medium for billing ops | Ephemeral; retention vendor-dependent; not structured audit trail | Medium — must not log payloads/secrets | `api/stripe-webhook.js`, `api/create-checkout-session.js` — Engineering |
| Supabase Auth logs | Sign-in/sign-up at platform level (if enabled in dashboard) | Medium for auth platform | Not Wayfinder event schema; access owner-only | Medium — emails may appear in provider logs | Supabase dashboard — Owner |
| Supabase database / RLS | Access control enforcement via policies | High for **control design** | Not an audit log of who read/wrote what | N/A — data store, not log | `supabase-*.sql`, AGENTS.md — Engineering |
| Supabase Storage logs | Object access at platform level (if available) | Low–medium | Not grant-level MHP document audit | Medium for licence/portrait paths | Supabase dashboard — Owner |
| Stripe dashboard events | Checkout, subscription, invoice lifecycle | Medium for billing | Not parent reflection activity; PII in Stripe UI | Medium — billing PII | Stripe dashboard — Owner |
| Stripe webhook processing | Idempotency + outcome in `stripe_webhook_events`; Vercel logs use event type suffix, outcome, plan_key | Medium for billing sync | Not full app audit; no parent_id in webhook table by design | Low in structured log helper if redaction holds | `supabase-pr148-stripe-entitlement-sync-foundation.sql`, `api/stripe-webhook.js` — Engineering |
| Wayfinder guardrail scripts | Auth pattern scans, no browser profile insert | Medium for dev hygiene | Pre-deploy only | Low | `scripts/verify-wayfinder.ps1` — Engineering |
| Launch operator runbook | Manual smoke procedures | Medium for release evidence | Manual, not automated audit | Low if non-identifying | [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) — Owner |
| Post-live monitoring FAQ | Daily checks, support boundaries | Medium for ops | Not tamper-evident audit store | Low if rules followed | [POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md](./POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md) — Ops |
| Support notes / owner manual logs | Ad hoc incident/billing notes | Variable | Inconsistent; high misuse risk | **High** if reflection content pasted | Owner process — Ops |
| Browser `AuthDebug` | Optional debug when `wayfinder_debug_auth=1` | Low — debug only | Can log session metadata if misused; **not audit evidence** | **High** if enabled in production support | `supabase.js` AuthDebug — Engineering |
| Browser localStorage | Language preference only | None for audit | Client-side; not authoritative | Low | Not audit evidence |

**Do not overstate** platform logs as a complete SOC 2 or HIPAA audit trail.

---

## 4. Current known gaps

| Gap | Notes |
| --- | --- |
| No formal application audit-log table | `stripe_webhook_events` is billing idempotency only — not a general audit trail |
| No documented Wayfinder event schema | [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md) is **proposed** only |
| No audit retention policy | Pending legal/security review |
| Access-review evidence cadence not fully operationalised | Draft in admin policy; first review not recorded |
| No formal admin action trail | Owner-admin MHP publish/invite actions not in dedicated audit store |
| No formal MHP grant access audit report | Grant create/revoke/access not centrally logged |
| No formal parent export/delete request audit | Process not documented |
| No formal incident-to-audit linkage process | Incident playbook exists; audit correlation gap |
| No explicit log redaction policy in code | Stripe webhook minimises; browser debug uncontrolled if enabled |
| No restore drill evidence | Gap in evidence register |
| No vendor log retention review | PR #166 |
| No audit trail for future AI/data-sharing actions | Block until design review |

---

## 5. Proposed future audit-log principles

**No implementation in PR #165.** Principles for later design review:

- **Minimum necessary event metadata** — event type, outcome, actor role, generated IDs where needed
- **Never log reflection content** — journal, Decode, CAB free text, MHP feedback body
- **Never log child names**
- **Never log JWTs, passwords, API keys, service-role keys, webhook secrets**
- **Never log Stripe customer/subscription IDs in support notes**; server-side storage only with RLS/admin policy if ever needed
- **Prefer generated Parent ID / Child ID or hashed references** where actor/target identification is required
- **Separate operational logs from product reflection data**
- **Allowlisted event types only** — see event catalog draft
- **Retention and deletion** — apply after legal review
- **Third-party monitoring** — no export to external tools without vendor DPA/BAA and redaction review

---

## 6. Event categories to consider later

| Category | Example event | Why useful | Suggested metadata only | Must not log | Risk | Future owner |
| --- | --- | --- | --- | --- | --- | --- |
| Auth / verification | Email verification completed | Access gate evidence | `outcome`, `actor_role` | email, tokens | Medium | Engineering |
| Profile | `ensure_profile` success | Profile integrity | `parent_id`, `role`, `outcome` | Supabase UUID, email | Medium | Engineering |
| Dashboard access | Load success/failure category | Ops troubleshooting | `outcome`, `error_code` | reflection data, tokens | Low | Engineering |
| Journal | Entry created | Activity trace | `entry_type`, `child_id`, `outcome` | title/body/CAB text | High | Engineering |
| Decode | Entry saved | Decode usage | `entry_type`, `child_id`, `outcome` | behaviour/CAB content | High | Engineering |
| Child ID | Dyad created | Child record trace | `child_id`, `outcome` | child name | Medium | Engineering |
| MHP sharing | Grant created/expired/revoked | Consent boundary | `grant_status`, `child_id`, `mhp_reference` | shared content | High | Engineering |
| MHP sharing | Grant accessed | Access reconstruction | `grant_id`, `outcome` | entry content | High | Engineering |
| MHP feedback | Submitted/read | Workflow trace | `response_status`, `outcome` | feedback text | High | Engineering |
| Owner admin | Invite approved/rejected | Admin accountability | `request_type`, `outcome` | colleague email in long-term log | Medium | Owner |
| MHP licence | Upload/review status | Compliance prep | `document_status`, `outcome` | PDF content | High | Owner |
| MHP profile | Published/suspended | Public visibility | `profile_status`, `outcome` | licence PDF | Medium | Owner |
| Billing | Checkout started | Billing funnel ops | `plan_key`, `interval`, `outcome` | Stripe session URL, customer ID | Medium | Engineering |
| Billing | Webhook processed/skipped/failed | Entitlement sync | `event_type`, `outcome`, `plan_key` | raw payload, secrets | Medium | Engineering |
| Billing | Portal session created | Support boundary | `outcome`, `error_code` | Portal URL | Medium | Engineering |
| Legacy Plus | Support case reviewed | Deferred migration ops | `case_category`, `outcome` | personal details | Medium | Owner |
| Privacy | Acknowledgement saved | Consent evidence | `consent_version`, `outcome` | reflection content | Low | Engineering |
| Consent / research | Opt-in/out recorded | Research governance | `consent_type`, `outcome` | reflection content | Medium | Owner + legal |
| Settings | Language changed | Preference trace | `language_code`, `outcome` | translated private content | Low | Product |
| AI assist (future) | Request created | External data boundary | `model_id`, `grant_scope`, `outcome` | prompt/response text | **High** | Engineering + legal |
| Data subject | Export/delete request | GDPR/PDPA readiness | `request_type`, `outcome` | exported content in log | High | Owner + legal |

Full proposed names: [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md).

---

## 7. Sensitive fields never to log

Explicit **never log** list:

- Passwords and OTPs
- API keys and Supabase **service-role key**
- JWTs, access tokens, refresh tokens
- Stripe secret keys and webhook secrets
- Billing Portal URLs
- Parent emails in routine application audit logs
- Child names
- Reflection / journal / Decode content
- CAB free text and behaviour narrative
- MHP feedback content
- Licence PDFs or extracted licence fields at scale
- Raw portrait/source image bytes or URLs with long-lived secrets
- PHI examples or clinical narrative
- Raw Stripe webhook payloads in long-term logs (unless reviewed and minimised)
- Full Supabase UUIDs in parent-facing or support-visible logs where Parent ID suffices

---

## 8. Suggested future audit schema (conceptual only)

**Not a SQL migration.** Do not copy into production without review.

| Field | Purpose |
| --- | --- |
| `event_id` | Unique event identifier |
| `occurred_at` | ISO timestamp |
| `actor_type` | e.g. parent, mhp, owner_admin, system |
| `actor_reference` | Generated Parent ID or controlled admin reference — not email |
| `actor_role` | e.g. parent, counsellor (internal), admin |
| `event_type` | Allowlisted name from catalog |
| `target_type` | e.g. journal_entry, share_grant, mhp_profile |
| `target_reference` | Child ID, grant id, entry id — not content |
| `outcome` | success, failure, denied, skipped |
| `source` | web_app, api_route, webhook, owner_admin |
| `request_reference` | Correlation id — not JWT |
| `metadata_json_minimised` | Small allowlisted keys only |
| `retention_classification` | Pending legal review |

---

## 9. Implementation stop conditions

Stop future audit-log **implementation** if:

- Logging captures journal/reflection/Decode content
- Logging captures child names
- Logging captures secrets or tokens
- Service-role key appears in browser
- RLS is bypassed for audit views without reviewed owner/admin policy
- Logs are sent to third-party monitoring without vendor/DPA/BAA review
- Audit data becomes visible to parents or MHPs without explicit design
- Product copy adds compliance claims

---

## 10. Recommended next PRs

| PR | Scope |
| --- | --- |
| **#165** (this) | Audit-log gap assessment + event catalog draft — docs only |
| **#166** | Vendor/subprocessor register |
| **#167** | Audit-log implementation **design** — docs only |
| **Later** | SQL/API implementation — only after legal/security/owner review |
| **Separate** | Language toggle runtime — only if no private content translation |

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #165 — initial audit-log gap assessment (docs only) |
