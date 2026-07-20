# Vendor / Subprocessor Register

**Status:** Docs-only vendor/subprocessor register for HIPAA / SOC 2 **readiness** — **not legal advice**, **not a certification**, **no vendor compliance claims**.

**Branch:** `docs/pr-166-vendor-subprocessor-register`

**Last updated:** 2026-07-20

**Related:** [VENDOR_SECURITY_REVIEW_CHECKLIST.md](./VENDOR_SECURITY_REVIEW_CHECKLIST.md) · [VENDOR_REVIEW_SOP_DRAFT.md](./VENDOR_REVIEW_SOP_DRAFT.md) · [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md) · [HIPAA_SOC2_READINESS_FOUNDATION.md](./HIPAA_SOC2_READINESS_FOUNDATION.md)

Read first:

- [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md)
- [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md)
- [AGENTS.md](../AGENTS.md)

This document:

- Is **readiness only**
- Does **not** assert that any vendor is HIPAA-ready, SOC 2-ready, or otherwise compliant
- Requires **owner/legal/security review** to verify current agreement and evidence status
- Does **not** change runtime, procurement, or vendor integrations

**Privacy rule:** Do not record parent emails, child names, Supabase UUIDs, JWTs, Stripe IDs, webhook secrets, reflection content, or PHI examples in this register.

---

## 1. Status and scope

Wayfinder uses third-party platforms for auth, hosting, billing, development, and operations. This register lists systems that **may** touch Wayfinder data and documents what evidence is **needed** — not what is **verified**.

Current vendor agreement and evidence status is **unverified** until owner/legal/security review confirms current agreements and documentation.

---

## 2. Vendor review rules

- **Do not rely on assumptions** — verify DPA/BAA/security report status with current documents.
- **Do not state** a vendor is HIPAA-ready or SOC 2-ready unless current agreement/evidence has been reviewed and recorded by owner/legal/security.
- **Do not upload** PHI, parent reflections, child names, journal content, JWTs, API keys, Stripe customer/subscription IDs, webhook secrets, or screenshots with sensitive data into vendor portals unless explicitly reviewed and approved.
- **Do not enable** new analytics, monitoring, AI, translation, or support tools without vendor review per [VENDOR_REVIEW_SOP_DRAFT.md](./VENDOR_REVIEW_SOP_DRAFT.md).
- Use **minimum necessary data** for each vendor purpose.
- Internal MHP role value remains `counsellor`; user-facing label remains Mental Health Practitioner (MHP).

---

## 3. Vendor / system register table

| Vendor / system | Purpose in Wayfinder | Data touched | Sensitivity | Potential PHI involvement | DPA needed | BAA needed if HIPAA applies | SOC 2 / security report needed | Current evidence location | Review status | Owner | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Supabase** | Auth, Postgres, Storage, RLS, `ensure_profile` RPC | Auth identities, profiles, journal, dyads, MHP profiles, licence/portrait objects, consent records | High | **Conditional** — reflection/Decode/MHP content may be health-adjacent | Yes — DPA review required | Yes — if HIPAA applies and vendor handles PHI | Yes — for SOC 2 readiness evidence | Owner account; Supabase dashboard (external); no signed docs in repo | **Not verified** | Owner + legal | Collect current DPA, subprocessor list, security docs; confirm Pro plan settings |
| **Vercel** | Hosting, serverless API routes (Stripe webhook, checkout, portal) | Request metadata, env secrets, API payloads in transit, deployment logs | Medium–High | **Conditional** — if logs capture sensitive payloads | Yes — DPA review required | Unlikely direct PHI store; legal confirm | Yes | Owner account; Vercel dashboard (external); no signed docs in repo | **Not verified** | Owner + legal | Confirm log retention; verify no reflection content in serverless logs |
| **Stripe** | Checkout, Billing Portal, webhooks, entitlement sync | Billing customer refs, plan status, email (Stripe-side), webhook event metadata | Medium | Unlikely reflection content; billing PII | Yes — DPA review required | Typically no for payment processing; **legal confirm** | Yes | Owner Stripe dashboard; [STRIPE_PRE_LIVE_EVIDENCE_PACK.md](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md) | **Not verified** | Owner + legal | Collect DPA; confirm data processing terms; no raw IDs in docs |
| **GitHub** | Source control, CI, issue tracking, PR history | Code, non-sensitive ops docs, deployment metadata | Low–Medium | Unlikely PHI in repo if rules followed | Yes — review | Unlikely unless PHI stored in issues | Optional for readiness | GitHub repo; Actions logs | **Needs owner review** | Owner | Confirm no secrets/PHI in issues; MFA on org accounts |
| **OpenAI / AI provider** | Assistive reflection (MHP flows if enabled); planning tools | Prompt text derived from parent-granted entries if implemented | **High** | **High** if reflections sent externally | Yes — DPA review required | Yes — if HIPAA applies and PHI sent | Yes | **Not currently used in production runtime** for private content | **Blocked until vendor evidence** | Owner + legal + engineering | Block private-content AI until review; see AI vendor boundary row in evidence register |
| **Email provider / Supabase Auth email** | Verification, password reset, auth emails | Email addresses, auth tokens in links | Medium | PII; **conditional** if HIPAA applies to auth email | Yes — review (via Supabase or separate) | If HIPAA applies — legal confirm | Provider-dependent | Supabase Auth config (external) | **Not verified** | Owner + legal | Confirm email provider subprocessor terms |
| **Domain / DNS provider** | Domain routing to Vercel | DNS records, registrar account metadata | Low | Unlikely | Review if PII in WHOIS | Unlikely | Optional | Owner registrar account (external) | **Needs owner review** | Owner | Record provider name; confirm MFA |
| **Support inbox / helpdesk tool** | Parent billing/support correspondence | Support emails, billing context | Medium | Possible if staff paste sensitive content | Yes — if formal tool adopted | If HIPAA applies and PHI in tickets | Yes — if tool stores user content | **Not confirmed in repo** — informal email assumed | **Not verified** | Owner + ops | Confirm whether formal helpdesk exists; train no sensitive paste |
| **Analytics provider** | Product analytics | Must not include reflection content or child names | N/A if none | Should be none per product canon | N/A unless added | N/A | N/A | **Not currently used** per product canon | **Not currently used** | Owner | Confirm no analytics SDK in production before any claim |
| **Monitoring / error tracking provider** | Error tracking, APM | Request metadata, stack traces, possible payloads | Medium–High | **High** if request bodies captured | Yes — if added | If HIPAA applies and sensitive metadata logged | Yes | **Not currently used** as dedicated third-party APM | **Not currently used** | Owner + engineering | Block until vendor review; see AUDIT_LOG_GAP_ASSESSMENT |
| **Cursor / code assistant tools** | Development assistance | Code snippets, docs, non-production context | Medium | Possible if devs paste sensitive data | Review for enterprise terms | If HIPAA scope and PHI pasted | Optional | Local IDE / cloud agent (external) | **Needs security review** | Engineering + owner | Do not paste reflection content, logs, or secrets into AI tools |
| **ChatGPT / AI planning tools** | Product/compliance planning, ops drafting | Docs, runbooks, non-sensitive summaries | Low–Medium | Possible if staff paste sensitive data | Review terms of use | If PHI pasted into prompts | Optional | External AI product (external) | **Needs security review** | Owner + ops | Use non-identifying summaries only; see POST_LIVE_MONITORING FAQ |
| **Local development machines** | Engineering, owner testing | Full app data in dev/staging if used | High | **Conditional** — dev DB access | N/A (internal) | Internal policy if HIPAA applies | N/A | Developer devices | **Needs owner review** | Engineering + owner | Device security, no production secrets on shared machines |
| **Browser / localStorage** | Client-side language preference, debug flags | `wayfinder_preferred_language`, debug toggles | Low | Unlikely PHI if keys scoped correctly | N/A — client environment | N/A | N/A | Parent browser | **Not a vendor** — client-side | Product | Not audit evidence; see DATA_CLASSIFICATION draft |
| **Future translation provider** | Private saved content translation (not planned) | Reflection/Decode text if misconfigured | **High** | **High** if private content sent | Yes — if added | Yes — if HIPAA applies | Yes | **Not currently used** | **Blocked until vendor evidence** | Owner + legal + product | Static UI toggle only until approved; see LANGUAGE_TOGGLE strategy |

**Agreement status:** All rows above are **unverified** unless owner/legal/security records current evidence outside this repo.

---

## 4. Data-flow sensitivity notes

- **Parent reflection and Decode content** are sensitive parent/MHP data — highest care for any external flow.
- **MHP feedback** is sensitive — not diagnosis or clinical report; still health-adjacent.
- **MHP licence PDFs and source portrait images** are sensitive — owner-admin review only.
- **Stripe billing data** is billing PII — separate from parent reflection content; still confidential.
- **Logs and support notes** must not contain child names or reflection content — see [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md).
- **Future AI or translation tools** are high sensitivity if private content is sent externally.
- **Static UI language toggle** (planned) is lower risk because private saved reflections are **not** auto-translated per [LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md](./LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md).

Wayfinder remains ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, or a clinical platform.

---

## 5. Agreement evidence needed

For each vendor category, the following evidence **may** be required — **do not claim these exist unless verified**:

| Evidence type | Notes |
| --- | --- |
| **DPA** (Data Processing Agreement) | Required for processors handling personal data — **DPA review required** |
| **BAA** (Business Associate Agreement) | Required **if HIPAA applies** and vendor handles PHI — **legal confirm** |
| **SOC 2 report or bridge letter** | For SOC 2 readiness evidence collection — **current evidence needed** |
| **Security whitepaper** | Supplementary control description |
| **Subprocessor list** | Who the vendor uses downstream |
| **Data retention documentation** | How long vendor retains each category |
| **Incident notification terms** | Timelines and contact paths |
| **Data deletion/export process** | Parent request and vendor deletion support |
| **Regional data processing information** | Residency and transfer mechanisms |
| **Admin/MFA controls** | Owner account security posture |
| **Log retention settings** | Platform log defaults vs Wayfinder needs |

Store verified evidence in owner-controlled secure storage — **not in the public repo** unless redacted and approved.

---

## 6. Review cadence

- **Initial review** before any public HIPAA / SOC 2 positioning.
- **Review before** any new data-sharing integration (AI, translation, analytics, monitoring, support chat).
- **Review after** vendor or product plan change (e.g. Supabase/Vercel tier change).
- **Quarterly review** during launch period or before SOC 2 audit prep — owner decides final cadence.
- **Emergency review** after suspected incident, vendor breach notification, or unexpected log capture.

Use [VENDOR_REVIEW_SOP_DRAFT.md](./VENDOR_REVIEW_SOP_DRAFT.md) and [VENDOR_SECURITY_REVIEW_CHECKLIST.md](./VENDOR_SECURITY_REVIEW_CHECKLIST.md).

---

## 7. High-risk future vendor actions

**Blocked pending review:**

- Sending journal/reflection/Decode content to external AI
- Sending MHP feedback to external AI
- Adding analytics to journal or Decode pages
- Adding error monitoring that captures request bodies
- Adding translation provider for private saved content
- Adding support chat that records user content
- Uploading raw logs to AI tools
- Exporting parent data to external research tools without consent/governance

---

## 8. Stop conditions

Stop vendor onboarding or expanded use if:

- Vendor asks for raw data samples containing reflection content or child names
- Product wants to send private content to third-party tools without consent/design review
- Vendor cannot provide needed DPA/BAA/security evidence for intended use
- Support wants to paste sensitive logs into AI tools or vendor portals
- Any vendor integration would weaken auth, RLS, email verification, or journal privacy
- Compliance copy starts claiming HIPAA/SOC 2 compliance before legal/security/auditor confirmation

Escalate to owner + legal/security.

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #166 — initial vendor/subprocessor register (docs only; all statuses unverified) |
