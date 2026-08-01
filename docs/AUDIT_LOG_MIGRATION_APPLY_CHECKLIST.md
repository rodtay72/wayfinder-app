# Audit Log Migration Apply Checklist and Dry-Run Evidence

**Status:** **Checklist and evidence template only** — docs-only PR #173.

**SQL source:** [../supabase-pr172-audit-logs-foundation.sql](../supabase-pr172-audit-logs-foundation.sql) (merged with PR #172)

**Related:** [AUDIT_LOG_SQL_MIGRATION_REVIEW_NOTES.md](./AUDIT_LOG_SQL_MIGRATION_REVIEW_NOTES.md) · [AUDIT_LOG_SQL_RLS_PROPOSAL.md](./AUDIT_LOG_SQL_RLS_PROPOSAL.md) · [AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md](./AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md)

**Last updated:** 2026-07-31

This document makes **no** HIPAA, SOC 2, ISO, or GAICC **certification** claim. It does **not** authorise applying SQL to Supabase by merging this PR.

---

## 1. Status

- This file is a **checklist only** for a future owner-approved Supabase apply.
- PR #172 migration exists in the repository (`public.audit_logs` foundation, RLS enabled, explicit `REVOKE` from `anon` and `authenticated`, **no** `CREATE POLICY`).
- **Not applied** to Supabase production or staging by PR #173.
- **No runtime emitters** in this track.
- **No API routes** or **RPC** for audit insert or read.
- **No support view** (`audit_log_support_view` or equivalent).
- **No compliance or certification claim.**

---

## 2. Preconditions before staging apply

Complete **all** items before running the migration SQL in **staging** (if a staging Supabase project exists):

- [ ] **Owner explicit approval** for staging apply (and separate approval before any production apply)
- [ ] **Security review** of [supabase-pr172-audit-logs-foundation.sql](../supabase-pr172-audit-logs-foundation.sql) and [AUDIT_LOG_SQL_MIGRATION_REVIEW_NOTES.md](./AUDIT_LOG_SQL_MIGRATION_REVIEW_NOTES.md)
- [ ] **Supabase / RLS review** — confirm deny-by-default posture; no parent/MHP allow policies in this file
- [ ] **Privacy review** — confirm metadata-only columns; no journal/Decode/CAB/MHP feedback/AI/Stripe private payload columns
- [ ] **Backup and rollback plan** documented (see §6)
- [ ] Confirm **no runtime dependency** — app, API, and browser code must not require `audit_logs` until a later reviewed emitter PR
- [ ] Confirm **no private-content columns** in table definition
- [ ] Confirm **no policies** grant parent or MHP `SELECT`, `INSERT`, `UPDATE`, or `DELETE` on `public.audit_logs`

---

## 3. Staging dry-run steps

Apply SQL **only** to **staging** when preconditions (§2) are satisfied. Do **not** apply from CI or browser code. Run manually in Supabase SQL Editor (or approved migration path).

1. Record commit SHA or tag of [supabase-pr172-audit-logs-foundation.sql](../supabase-pr172-audit-logs-foundation.sql) used.
2. Execute the full migration file once.
3. Run verification queries:

```sql
select to_regclass('public.audit_logs');
select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass;
select count(*) from pg_policies where schemaname = 'public' and tablename = 'audit_logs';
```

4. **Expected results:**

| Check | Expected |
| --- | --- |
| `to_regclass('public.audit_logs')` | Non-null (table exists) |
| `relrowsecurity` | `true` (RLS enabled) |
| Policy count | `0` (zero policies until a later reviewed PR) |

5. **Grants (where possible):** Confirm direct table privileges for browser/API roles are revoked — migration includes:

```sql
revoke all on table public.audit_logs from anon;
revoke all on table public.audit_logs from authenticated;
```

Optional confirmation (staging only; record **Pass/Fail** in evidence — do not paste sensitive output):

```sql
-- Review in SQL Editor only; do not export row data into docs.
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'audit_logs'
  and grantee in ('anon', 'authenticated');
```

Expected: no effective `SELECT`/`INSERT`/`UPDATE`/`DELETE`/`TRUNCATE`/`REFERENCES`/`TRIGGER` grants to `anon` or `authenticated` after successful revoke (subject to Supabase default grants — escalate any unexpected grant to owner/security).

6. Fill §5 evidence template for **staging** dry-run.

---

## 4. Production apply go / no-go

**Do not apply** to production if **any** of the following is true:

- Staging dry-run **failed** or was **not completed** when staging is available
- **Rollback** steps are not clear or owner has not approved rollback ownership
- **Owner** is unavailable to approve production apply and post-apply sign-off
- **Launch-critical instability** is present (auth, dashboard, journal, billing, or MHP flows impaired)
- **Any SQL review concern** remains open (RLS, privacy, grants, indexes, or scope creep vs PR #172 file)

Production apply requires **separate owner approval** from staging apply and a completed §5 evidence record for staging (when staging exists).

---

## 5. Post-apply evidence template

Copy this block per apply event. Store completed copies in owner-controlled evidence (not in public repo if they contain operational detail beyond Pass/Fail).

| Field | Value |
| --- | --- |
| **Date/time (UTC)** | |
| **Environment** | staging / production |
| **Who applied** | Role or name (no parent email) |
| **SQL file / commit** | e.g. `supabase-pr172-audit-logs-foundation.sql` @ `<git sha>` |
| **`to_regclass('public.audit_logs')`** | Pass / Fail |
| **`relrowsecurity` = true** | Pass / Fail |
| **Policy count = 0** | Pass / Fail |
| **`anon`/`authenticated` revoke check** | Pass / Fail / N/A |
| **Notes** | Non-identifying only |

**Evidence rules:**

- **No screenshots** containing private data, dashboard content, or SQL Editor result rows with user content
- **No table row contents** in evidence
- **Do not record** parent email, child name, Supabase UUID, JWT, token, secret, webhook secret, or reflection text

---

## 6. Rollback checklist

- [ ] **Owner approval** required before any rollback
- [ ] Confirm whether `public.audit_logs` contains **any rows**
- **If table is empty:** may drop indexes then `DROP TABLE public.audit_logs` per owner-approved runbook (reverse order of creation if needed)
- **If table is populated:** **stop** — conduct **security and legal review** before deletion or truncation; do not drop without explicit approval and retention assessment
- [ ] Document rollback date/time and outcome in owner evidence (Pass/Fail only in shared docs)

---

## 7. Next step after successful apply

Only after staging (and production, if approved) verification passes:

1. **Server-side high-value event emitter** design and implementation in a **separate reviewed PR** — per [AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md](./AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md) (Option C hybrid, **server-side first**).
2. **Do not** instrument journal or Decode flows first.
3. **Do not** add broad browser-side insert into `audit_logs`.
4. INSERT/SELECT paths, `SECURITY DEFINER` RPC, service-role API routes, and support views remain **future PRs** with their own RLS and privacy review.

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-31 | PR #173 — migration apply checklist and dry-run evidence template (docs only) |
