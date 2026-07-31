# Audit Log Implementation Decision Memo

**Status:** **Decision memo only** — no implementation in PR #171.

**Branch track:** PR #171 — audit-log implementation decision memo (docs only)

**Last updated:** 2026-07-31

**Related:** [AUDIT_LOG_IMPLEMENTATION_DESIGN.md](./AUDIT_LOG_IMPLEMENTATION_DESIGN.md) · [AUDIT_LOG_SQL_RLS_PROPOSAL.md](./AUDIT_LOG_SQL_RLS_PROPOSAL.md) · [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md) · [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md)

Read first: [AGENTS.md](../AGENTS.md) · [SECURITY_POLICY_READINESS_DRAFT.md](./SECURITY_POLICY_READINESS_DRAFT.md) · [VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md)

This memo is **not legal advice** and makes **no** HIPAA, SOC 2, ISO, or GAICC **certification** claim.

---

## 1. Status

- **Decision memo only.** No code, SQL, API, RPC, or runtime logging in PR #171.
- **No SQL migration** added or applied.
- **No RLS** applied.
- **No API routes** or **Supabase RPCs** created.
- **No logging vendor** introduced.
- **No compliance or certification claim.**

Future work remains blocked until this memo is merged and the owner **explicitly approves** a scoped implementation PR (e.g. PR #172 migration draft).

---

## 2. Decision needed

Wayfinder must choose how metadata-only audit events will be **inserted** after the table and RLS exist (see [AUDIT_LOG_SQL_RLS_PROPOSAL.md](./AUDIT_LOG_SQL_RLS_PROPOSAL.md)).

| Option | Summary |
| --- | --- |
| **A** | Server-side API route validates allowlisted fields; inserts using **service role** server-only |
| **B** | Restricted Supabase **SECURITY DEFINER** RPC validates and inserts |
| **C** | **Hybrid phased approach** — server-side first for high-value events; client-originated metadata later via reviewed RPC or API-mediated pattern |

This memo compares A, B, and C and records a **recommended direction**.

---

## 3. Decision criteria

| Criterion | Why it matters |
| --- | --- |
| Protection of `service_role` key | Must never reach browser (AGENTS.md) |
| Browser exposure risk | Minimise arbitrary client insert surface |
| RLS clarity | Deny-by-default table; explicit write paths |
| Validation strength | Allowlisted event types; no private text fields |
| Testability | CI/staging tests for deny/allow paths |
| Ease of rollout | Fits static app + existing Vercel API patterns |
| Rollback safety | Can disable emitters without breaking journal/auth |
| Compatibility with static app / Vercel API | Checkout, webhook, portal already server-side |
| Minimisation of private data | Metadata-only; never-log list enforced |
| Future SOC 2 / HIPAA / ISO / GAICC **readiness evidence** | Traceability without over-claiming |
| Operational simplicity for owner | Fewer high-risk surfaces to monitor early |

---

## 4. Option A — server-side API route

**Description:**

- Approved runtime paths (or a thin client call) send **minimal** audit payloads for **allowlisted** events only.
- Vercel/API handler validates event type, category, outcome, and metadata shape against [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md).
- Handler uses **service role server-side only** to insert into `audit_logs`.
- Browser never receives or stores service role.
- Central validation in one codebase; natural fit for events already on server paths (Stripe webhook, checkout, billing portal, owner-admin actions).

**Risks:**

- API route must be **hardened** (auth, rate limits, payload size caps).
- Must prevent **spam/noisy** client-triggered events if client can call the route.
- Strict **allowlist** — reject unknown `event_type` and any private text fields.
- Must not accept journal/Decode/CAB/MHP feedback/AI/Stripe body fields.

---

## 5. Option B — restricted Supabase RPC

**Description:**

- Controlled **SECURITY DEFINER** function validates event type/category/outcome/metadata.
- Inserts metadata-only row into `audit_logs`.
- No arbitrary browser `INSERT` on the table.
- Can be strongly schema-bound in PostgreSQL.

**Risks:**

- RPC surface may be **callable by authenticated clients** if grants are too broad.
- **GRANT** mistakes and SECURITY DEFINER bugs are **high impact**.
- Validation logic in SQL may be **harder to maintain** alongside JS app rules.
- Requires careful Supabase review per [AUDIT_LOG_SQL_RLS_PROPOSAL.md](./AUDIT_LOG_SQL_RLS_PROPOSAL.md) §5–§6.

---

## 6. Option C — hybrid phased approach

**Recommended direction** unless a strong reason favors a single option upfront.

| Phase | Scope |
| --- | --- |
| **2A — Server-side first** | Server-originated **high-value** events only via API (service role server-only): Stripe webhook verified/rejected; checkout session requested/created; checkout return success/cancelled; billing portal requested/blocked/created; MHP invite approval/token generation (no token value in log); admin/support high-risk actions |
| **2B — Client metadata later** | After 2A stable: client-originated **metadata-only** events via **API-mediated** or **tightly scoped RPC** — e.g. sign-in/out outcomes if safe; journal/decode **created** (not body); MHP share consent/revoke metadata |
| **2C — Read path later** | Masked `audit_log_support_view`, audit-of-audit access logging |

**Why hybrid:**

- Avoids a **broad client insert surface** on day one.
- Keeps **service role** on server for the highest-risk billing/admin paths.
- Starts with events that already touch **Vercel API** — lower friction, higher accountability value.
- **Defers** journal/decode read/write instrumentation until write path and RLS are proven.
- Preserves **privacy** and **readiness** alignment without claiming compliance.

---

## 7. Recommendation

**Adopt Option C — hybrid phased approach**, beginning with **server-side / server-originated events only** (Phase 2A).

**Do not:**

- Begin with browser-originated **arbitrary** audit inserts.
- Instrument journal/decode **reads/writes** first.
- Create support view or grants until table, RLS, and write path are reviewed.
- Add an **external logging vendor** without [VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md) review.

Option A alone is acceptable for **Phase 2A**; Option B may supplement **Phase 2B** only after security review. Do not expose service role to the browser.

---

## 8. First implementation candidate after memo

**Proposed next PR (after owner approval):** **PR #172 — `audit_logs` SQL migration draft** (not production-applied until reviewed).

PR #172 guardrails (proposal):

- Actual `.sql` migration file **only if owner explicitly approves** scope.
- **No runtime emitters** in the same PR unless separately approved.
- Create `audit_logs` table per [AUDIT_LOG_SQL_RLS_PROPOSAL.md](./AUDIT_LOG_SQL_RLS_PROPOSAL.md).
- Enable RLS **deny-by-default**.
- **No** parent/MHP `SELECT` or broad `INSERT` policies.
- **No** support view grants beyond proposal unless reviewed.
- Staging dry-run before production apply.

Phase 2A emitters would be a **later** PR after migration is reviewed on staging.

---

## 9. Privacy exclusions

**Never log:**

- Journal body, Decode text, activity CAB text
- Child names, parent emails
- MHP feedback text
- AI prompt/response content
- Stripe webhook payload body
- Auth token, JWT, password
- Raw IP unless legally/security approved
- Secrets, env values, billing portal URLs with session secrets

Event names must not imply private content is stored (see event catalog draft).

---

## 10. Standards / readiness alignment

This decision supports **readiness alignment** (not certification) for:

- GAICC / ISO AI governance readiness
- ISO/IEC 42001, ISO/IEC 23894, ISO/IEC 27001
- SOC 2 Trust Services Criteria readiness
- HIPAA Security Rule audit-control readiness (if scope applies later)
- PDPA/GDPR privacy-by-design (data minimisation)

**But:**

- No compliance claim, certification claim, or legal conclusion.
- External auditor and legal review required before positioning.

---

## 11. Decision record

| Field | Value |
| --- | --- |
| **Decision** | **Option C — hybrid phased approach; server-side high-value events first (Phase 2A)** |
| **Date** | 2026-07-31 |
| **Status** | **Proposed** — owner approval required before implementation |
| **Blocked until** | PR #171 merged **and** owner explicitly approves PR #172 migration scope (and any emitter PRs separately) |

---

## 12. Open questions

- Final **event allowlist** for Phase 2A first ship
- First migration: **CHECK constraint** vs **lookup table** for `event_type`
- Hashed UUID strategy — need for a **pepper** secret server-side
- Who may access **support view** and under what audit-of-audit rules
- **Retention class** per event category
- Exact **tests** required before production SQL apply
- Whether **staging Supabase** is available for migration dry-run
- Rate limits for any future client-mediated audit API

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-31 | PR #171 — initial implementation decision memo (docs only) |
