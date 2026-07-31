# Audit Log SQL/RLS Proposal

**Status:** **Proposal only** — no SQL applied, no migration file, no runtime.

**Branch track:** PR #170 — audit-log SQL/RLS proposal (docs only)

**Last updated:** 2026-07-31

**Phase:** **Phase 1** from [AUDIT_LOG_IMPLEMENTATION_DESIGN.md](./AUDIT_LOG_IMPLEMENTATION_DESIGN.md) (PR #169) — SQL/RLS proposal only, no runtime.

**Design sources:**

- [AUDIT_LOG_IMPLEMENTATION_DESIGN.md](./AUDIT_LOG_IMPLEMENTATION_DESIGN.md)
- [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md)
- [AUDIT_LOG_GAP_ASSESSMENT.md](./AUDIT_LOG_GAP_ASSESSMENT.md)

Read first: [AGENTS.md](../AGENTS.md) · [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md)

This document is **not legal advice** and makes **no** HIPAA, SOC 2, ISO, or GAICC **certification** claim.

---

## 1. Status and scope

- **Proposal only.** No database changes in PR #170.
- **No SQL applied** to Supabase or any environment.
- **No migration file added** to the repository.
- **No runtime instrumentation**, API routes, RPCs, or functions created.
- **No RLS policies applied** in production.
- Requires **owner approval**, **Supabase review**, **security review**, **privacy review**, and **legal/auditor review** before any implementation PR.

---

## 2. Design source

PR #170 implements **Phase 1** of the PR #169 phased plan:

| Phase | PR | Scope |
| --- | --- | --- |
| 0 | #169 | Implementation design (merged) |
| **1** | **#170 (this doc)** | **SQL/RLS proposal only** |
| 2+ | Future | Runtime emitters, instrumentation, monitoring — separate approved PRs |

Event fields and categories align with PR #169 §5–§6. Event names align with [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md).

---

## 3. Proposed table: `audit_logs`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PRIMARY KEY | Default `gen_random_uuid()` at implementation time |
| `event_time` | `timestamptz NOT NULL` | When the action occurred (UTC) |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | Insert time |
| `event_type` | `text NOT NULL` | Allowlisted name — see §4 |
| `event_category` | `text NOT NULL` | Coarse category — see §4 |
| `actor_role` | `text NOT NULL` | e.g. parent, counsellor, owner_admin, system |
| `actor_user_ref_hash` | `text NULL` | Hashed or opaque actor reference — not email |
| `actor_parent_id_masked` | `text NULL` | Wayfinder Parent ID or masked form |
| `actor_counsellor_id_masked` | `text NULL` | MHP reference when applicable |
| `resource_type` | `text NULL` | e.g. journal_entry, share_grant |
| `resource_ref_hash` | `text NULL` | Hashed or internal reference — not content |
| `child_id_masked` | `text NULL` | When relevant — not child name |
| `outcome` | `text NOT NULL` | `success`, `failure`, or `blocked` |
| `failure_reason_code` | `text NULL` | Allowlisted code only |
| `request_context` | `jsonb NULL` | Coarse device/browser class — no fingerprinting |
| `ip_region_or_prefix` | `text NULL` | Region/prefix unless legal/security approves full IP |
| `session_ref_hash` | `text NULL` | Correlation — not JWT |
| `correlation_id` | `text NULL` | Cross-service trace |
| `metadata` | `jsonb NOT NULL DEFAULT '{}'::jsonb` | Minimal allowlisted keys — validated at insert |

**Proposed constraints (at implementation time):**

- `event_type` must match an **allowlist** (§4).
- `outcome` IN (`success`, `failure`, `blocked`).
- **No columns** for journal body, Decode text, CAB text, child names, parent email, JWT, Stripe payload bodies, or AI prompt/response.
- `metadata` size and keys limited by application validation (future RPC/API).
- `request_context` must not store raw user-agent strings with identifying detail unless reviewed.

---

## 4. Proposed event type allowlist

**Not implemented in PR #170.** Strategy options:

| Approach | Pros | Cons |
| --- | --- | --- |
| `CHECK` constraint on `event_type` | Simple MVP | Schema change to add events |
| PostgreSQL `ENUM` | Strong typing | Migrations to extend |
| Lookup table `audit_event_types` | Catalog metadata, admin tooling | Extra join; more objects |

**Recommendation for MVP:** `text` + **CHECK constraint** or small lookup table populated from approved catalog — choose after owner review. Prefer lookup table **only if** admin tooling needs descriptions/retention class per event.

**Categories** (for `event_category`):

- `auth`
- `profile`
- `child_dyad`
- `journal`
- `mhp_sharing`
- `billing_entitlement`
- `admin_owner`
- `security_privacy`
- `ai_future`

Allowlisted `event_type` values must come from [AUDIT_EVENT_CATALOG_DRAFT.md](./AUDIT_EVENT_CATALOG_DRAFT.md) and PR #169 §6 after owner sign-off.

---

## 5. Proposed RLS posture

- **RLS enabled** on `audit_logs` (deny-by-default).
- **Browser / authenticated parent** — no `SELECT`, no arbitrary `INSERT`.
- **MHP (`counsellor` role)** — no `SELECT`, no arbitrary `INSERT`.
- **Owner/admin/support** — read via **restricted masked view** or **server-side function** only; not direct wide table access from client.
- **Inserts** only through reviewed **server-side API** (service role, server-only) or **controlled `SECURITY DEFINER` RPC** that validates allowlisted fields.
- **`service_role`** remains **server-only** — never exposed to browser (per AGENTS.md).
- **Reading audit logs** must generate **access audit events** in a future phase.

No RLS policies are applied in this PR.

---

## 6. Proposed insert pattern

| Option | Description |
| --- | --- |
| **A — Server-side API route** | Vercel/API handler validates event, inserts with service role. |
| **B — Restricted Supabase RPC** | `SECURITY DEFINER` function validates allowlist and inserts metadata-only row. |

| Criterion | Option A | Option B |
| --- | --- | --- |
| Security | Service role never in browser; central validation | RPC surface must be tightly scoped |
| Complexity | API deployment + secrets handling | SQL function + RLS + grants |
| Browser exposure risk | Low if no client insert | Low if RPC args are minimal and rate-limited |
| Testability | HTTP/integration tests | SQL/RLS unit tests |
| RLS clarity | Table deny-all; writes bypass via service role | Table deny-all; writes via definer RPC |

**Recommendation:** Prefer **server-side API** or **tightly constrained RPC** — **not** arbitrary browser inserts. Final choice requires Supabase/security review.

---

## 7. Proposed masked support view

Future object (design name): **`audit_log_support_view`**

**May expose:**

- `event_time`, `event_type`, `event_category`
- `actor_role`
- Masked Parent ID / Child ID where relevant
- `outcome`, `failure_reason_code`
- `correlation_id`
- Minimal `metadata` keys approved for support

**Must not expose:**

- Raw Supabase user UUID
- Parent email, child name
- Journal / Decode / CAB / MHP feedback text
- Stripe payload or customer identifiers in support-visible form
- AI prompt/response
- JWT, session tokens, secrets
- Full IP unless explicitly approved

View definition and grants are **proposal only** — see §11 sketch.

---

## 8. Indexing proposal

Review storage and query patterns before implementation. Candidate indexes:

- `event_time` (DESC for recent events)
- `event_type`
- `event_category`
- `actor_role`
- `outcome`
- `correlation_id`
- `(resource_type, resource_ref_hash)` where used
- `child_id_masked` if support queries by child context (hashed/masked only)

Avoid over-indexing high-volume tables until volume is understood.

---

## 9. Retention proposal placeholder

**No retention rule implemented in PR #170.**

Design placeholders (require legal/security sign-off):

| Class | Illustrative horizon | Notes |
| --- | --- | --- |
| High-volume operational | e.g. 90 days | Auth success noise — policy TBD |
| Security / billing / admin | e.g. 1 year | Incident and entitlement trace |
| Longer retention | Only if legally justified | Document in retention matrix |

Options: partition by month, scheduled anonymise/delete job, or archive to cold storage — **future PR only**.

See [DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md](./DATA_CLASSIFICATION_AND_RETENTION_DRAFT.md).

---

## 10. Privacy and compliance boundaries

- **Readiness alignment only** for GAICC/ISO AI governance, ISO/IEC 42001, 23894, 27001, SOC 2, and HIPAA Security Rule audit controls — **not certification**.
- **No PHI** or private reflection body in audit rows.
- **No default research use** of audit logs.
- Audit logs are **security and accountability evidence**, not product analytics or parent/child scoring.

---

## 11. Proposed SQL sketch

**Draft only — do not apply.** Not a migration file. Do not run against production without reviewed migration PR.

```sql
-- DRAFT ONLY — DO NOT APPLY (PR #170 proposal)

-- create table public.audit_logs (
--   id uuid primary key default gen_random_uuid(),
--   event_time timestamptz not null,
--   created_at timestamptz not null default now(),
--   event_type text not null,
--   event_category text not null,
--   actor_role text not null,
--   actor_user_ref_hash text null,
--   actor_parent_id_masked text null,
--   actor_counsellor_id_masked text null,
--   resource_type text null,
--   resource_ref_hash text null,
--   child_id_masked text null,
--   outcome text not null,
--   failure_reason_code text null,
--   request_context jsonb null,
--   ip_region_or_prefix text null,
--   session_ref_hash text null,
--   correlation_id text null,
--   metadata jsonb not null default '{}'::jsonb,
--   constraint audit_logs_outcome_check
--     check (outcome in ('success', 'failure', 'blocked'))
--   -- constraint audit_logs_event_type_check ... allowlist TBD
-- );

-- alter table public.audit_logs enable row level security;

-- Deny-by-default: no policies granting SELECT/INSERT to authenticated parent or counsellor.
-- Future: policy for service role or SECURITY DEFINER insert path only (review required).

-- create or replace view public.audit_log_support_view as
--   select
--     id,
--     event_time,
--     event_type,
--     event_category,
--     actor_role,
--     actor_parent_id_masked,
--     child_id_masked,
--     outcome,
--     failure_reason_code,
--     correlation_id,
--     metadata  -- must be pre-redacted at insert; view does not add content
--   from public.audit_logs;
-- Revoke direct SELECT on audit_logs from authenticated; grant SELECT on view to owner role only — TBD.

-- create index if not exists audit_logs_event_time_idx on public.audit_logs (event_time desc);
-- create index if not exists audit_logs_event_type_idx on public.audit_logs (event_type);
-- create index if not exists audit_logs_correlation_id_idx on public.audit_logs (correlation_id);
```

---

## 12. Testing plan for future implementation

**Future PR only** (after migration approved):

- Migration dry-run on staging
- RLS deny tests: parent `SELECT` / `INSERT` on `audit_logs` fail
- RLS deny tests: counsellor `SELECT` / `INSERT` fail
- Insert validation rejects forbidden metadata keys and oversize payloads
- Metadata exclusion tests (no reflection-shaped keys)
- Support view masking tests (no raw UUID/email)
- Rollback plan documented before production apply

---

## 13. Open questions

- Server API vs Supabase RPC for inserts (§6)
- Hashed UUID strategy and key rotation for `actor_user_ref_hash` / `resource_ref_hash`
- Final retention duration per category
- Partial IP / prefix vs no IP default
- Exact owner/admin role source in Supabase vs application
- Support view access workflow and audit-of-audit
- Event allowlist storage: CHECK vs lookup table
- Table partitioning by `event_time`
- Encryption-at-rest beyond platform default
- Legal requirement for immutable retention on billing/security events

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-31 | PR #170 — initial SQL/RLS proposal (docs only) |
