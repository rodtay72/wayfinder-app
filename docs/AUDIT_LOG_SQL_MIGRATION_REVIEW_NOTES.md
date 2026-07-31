# Audit Log SQL Migration Review Notes

**Status:** Migration file in repo for review — **not applied** to Supabase production.

**SQL file:** [../supabase-pr172-audit-logs-foundation.sql](../supabase-pr172-audit-logs-foundation.sql)

**Branch track:** PR #172 — `audit_logs` SQL migration draft (not applied)

**Last updated:** 2026-07-31

**Related:** [AUDIT_LOG_SQL_RLS_PROPOSAL.md](./AUDIT_LOG_SQL_RLS_PROPOSAL.md) · [AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md](./AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md) · [AUDIT_LOG_IMPLEMENTATION_DESIGN.md](./AUDIT_LOG_IMPLEMENTATION_DESIGN.md)

This document makes **no** HIPAA, SOC 2, ISO, or GAICC **certification** claim.

---

## 1. Status

- Migration file **added to the repository** for owner/security/Supabase review.
- **Not applied** to Supabase production in PR #172.
- **No runtime emitters**, API routes, or RPC functions in this PR.
- **No support/admin audit view** or grants.
- **No parent or MHP** read access policies.
- **No compliance or certification claim.**

---

## 2. What this migration creates

- `public.audit_logs` with metadata-only columns per [AUDIT_LOG_SQL_RLS_PROPOSAL.md](./AUDIT_LOG_SQL_RLS_PROPOSAL.md)
- Check constraints on `outcome`, `event_category`, non-empty `event_type`, jsonb object shape
- Indexes on time, type, category, role, outcome, correlation, resource, child (masked)
- **RLS enabled** with **deny-by-default** — **no allow policies** in this draft

---

## 3. What this migration does not do

- Does **not** log any events yet
- Does **not** create browser insert access
- Does **not** create service-role API routes or reference service role in app code
- Does **not** create `SECURITY DEFINER` RPC
- Does **not** expose support UI or `audit_log_support_view`
- Does **not** alter auth, journal, Stripe, MHP sharing, or parent runtime
- Does **not** apply to production automatically when PR merges

---

## 4. Privacy exclusions

**Never store** in `audit_logs` (no columns for these; future inserts must enforce):

- Journal body, Decode text, activity CAB text
- MHP feedback body, child names, parent emails
- AI prompt/response content
- Stripe webhook payload body
- JWT, session token, password
- Secrets, env values, raw billing portal URLs
- Raw IP unless separately approved (use `ip_region_or_prefix` only)

---

## 5. Review checklist before Supabase apply

- [ ] Owner explicit approval for staging and/or production apply
- [ ] Security review
- [ ] Supabase / RLS review
- [ ] Privacy review (no private content columns)
- [ ] Backup and rollback plan documented
- [ ] Staging dry-run if available
- [ ] Confirm **no policies** grant `SELECT`/`INSERT` to parent or MHP roles
- [ ] Confirm **no runtime code** depends on table until emitters are approved
- [ ] Post-apply verification queries in SQL file header

---

## 6. Rollback note

- Drop indexes first if needed for a empty table rollback.
- `DROP TABLE public.audit_logs` only if **empty** or after security/legal review if populated.
- Do **not** run rollback without owner approval.
- If rows exist, export and review before deletion.

---

## 7. Next PR after this

**PR #173** (proposed) should be either:

- Migration review / **staging dry-run evidence** (docs only), or
- **Server-side audit emitter** design for high-value billing/admin events (still no broad client insert)

**No runtime emitters** until migration apply decision is clear and RLS insert path is reviewed.

Insertion route: [AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md](./AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md) — hybrid phased, **server-side first**.

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-31 | PR #172 — initial migration review notes |
