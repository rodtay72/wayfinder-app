# Audit Log Staging Readiness and Environment Decision

**Status:** PR #174 — governance/readiness decision only; docs only.

**Decision date:** 2026-08-01

**Related:** [AUDIT_LOG_MIGRATION_APPLY_CHECKLIST.md](./AUDIT_LOG_MIGRATION_APPLY_CHECKLIST.md) · [AUDIT_LOG_SQL_MIGRATION_REVIEW_NOTES.md](./AUDIT_LOG_SQL_MIGRATION_REVIEW_NOTES.md) · [AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md](./AUDIT_LOG_IMPLEMENTATION_DECISION_MEMO.md) · [../supabase-pr172-audit-logs-foundation.sql](../supabase-pr172-audit-logs-foundation.sql)

This document records a cyberrisk-management readiness decision. It does not establish that operational cyberrisk testing has been completed and makes no HIPAA, SOC 2, ISO, GAICC, or other compliance or certification claim.

---

## 1. Decision

Wayfinder will use the **staging readiness and environment decision** path before any audit-log SQL apply.

At the time of this decision:

- Wayfinder is managed by a **single owner-operator**.
- No separate Wayfinder Supabase staging project or persistent staging branch has been verified.
- No formal operational cyberrisk testing programme has been completed.
- The PR #172 `audit_logs` migration remains in the repository only.
- The migration has not been approved for production apply.
- No runtime audit-log emitters, API routes, RPCs, support views, or browser insert paths are authorised by this decision.

This is an explicit readiness record, not evidence that the technical control has been tested or is operating in production.

---

## 2. Current operating model

Until responsibilities are delegated or independently reviewed, the single owner-operator currently holds the following roles:

| Responsibility | Current owner |
| --- | --- |
| Environment decision | Owner-operator |
| SQL apply approval | Owner-operator |
| Manual SQL execution | Owner-operator or explicitly authorised technical operator |
| Rollback decision | Owner-operator |
| Evidence review | Owner-operator |
| Security/privacy escalation | Owner-operator, with external specialist review when required |

This concentration of responsibilities is a known operational risk. It must not be described as independent review, separation of duties, external assurance, or completed operational testing.

---

## 3. Environment finding

Repository review did not verify a separate staging Supabase environment.

The absence of repository evidence does not prove that no external Supabase project exists. Before any staging apply, the owner must verify the Supabase organisation/project list and record only a safe environment label and Pass/Fail result. Do not record project URLs, API keys, service-role keys, JWTs, tokens, database passwords, or private identifiers in repository documentation.

**Current environment decision:**

- Staging availability: **Not verified**
- Staging SQL apply approval: **Not granted**
- Production SQL apply approval: **Not granted**
- PR #172 migration state: **Repository draft only; not applied**

---

## 4. Operational cyberrisk testing status

The following must remain recorded as **not yet completed** unless supported by dated evidence:

- isolated staging migration dry-run;
- post-apply RLS and policy verification;
- direct privilege verification for `anon` and `authenticated`;
- rollback rehearsal;
- database restore drill;
- formal access review;
- audit-event generation and retrieval testing;
- security monitoring effectiveness testing;
- incident-response exercise involving audit evidence.

Planning documents, SQL review notes, checklists, and migration drafts are governance/readiness evidence. They are not substitutes for operational test evidence.

---

## 5. Preconditions before changing to a staging dry-run

All of the following are required before the PR #172 migration may be applied to staging:

- [ ] A separate staging Supabase project or approved persistent staging branch is verified.
- [ ] The environment is confirmed not to contain live parent, child, journal, Decode, MHP, billing, or private reflection data.
- [ ] The owner gives explicit approval for **staging only**.
- [ ] The exact SQL file and commit SHA are recorded.
- [ ] Security, privacy, and Supabase/RLS review are complete.
- [ ] Rollback ownership and steps are documented.
- [ ] The evidence location is owner-controlled.
- [ ] Evidence is restricted to Pass/Fail and non-identifying notes.
- [ ] No runtime dependency on `audit_logs` exists.

If any item is incomplete, do not apply the migration.

---

## 6. Production boundary

Production apply remains prohibited until:

1. an isolated staging dry-run has passed, when staging is available;
2. the checks in [AUDIT_LOG_MIGRATION_APPLY_CHECKLIST.md](./AUDIT_LOG_MIGRATION_APPLY_CHECKLIST.md) are complete;
3. rollback responsibility is clear;
4. no launch-critical instability exists in auth, RLS, dashboard, journal, MHP, privacy, or billing flows; and
5. the owner gives a separate, explicit production approval.

Approval for a staging apply must never be interpreted as approval for production.

---

## 7. Scope exclusions

PR #174 must not:

- apply SQL to Supabase staging or production;
- modify `supabase-pr172-audit-logs-foundation.sql`;
- add runtime emitters;
- add an audit insert/read API;
- add a `SECURITY DEFINER` RPC;
- add parent or MHP audit-log access;
- add a support/admin audit view;
- instrument journal or Decode flows;
- add broad browser-side inserts;
- alter Supabase auth, RLS, email verification, `ensure_profile`, Parent ID, Child ID, journal save/read, dashboard loading, MHP sharing, Stripe, or deployment configuration.

---

## 8. Privacy and evidence rules

Do not place any of the following in cyberrisk evidence, logs, screenshots, tickets, or repository documents:

- parent email or child name;
- Supabase UUID or raw technical identity;
- JWT, session token, password, API key, webhook secret, or service-role key;
- journal, Decode, CAB, MHP feedback, or AI prompt/response content;
- Stripe payloads, customer/subscription identifiers, or Billing Portal URLs;
- database row contents containing user or operational data.

Use environment labels, dates, roles, commit references, and Pass/Fail outcomes only.

---

## 9. Relationship to cyberrisk management and ethical AI

This decision primarily supports **cyberrisk management governance** by establishing ownership, environment separation, apply controls, rollback responsibility, and evidence boundaries.

It does not establish an ethical-generative-AI programme. Future AI audit metadata may support traceability, but AI ethics also requires separate controls for consent, data minimisation, human oversight, bias and cultural review, prompt/model versioning, non-diagnostic language, and suppression of unsafe or insufficiently supported outputs.

---

## 10. Next safe step

The next safe action is to verify whether a separate Supabase staging environment exists or should be established. Until that decision is completed:

- keep the migration unapplied;
- retain deny-by-default design;
- do not create runtime logging paths;
- do not instrument journal or Decode;
- do not make compliance, certification, or operational-testing claims.

---

## Document history

| Date | Change |
| --- | --- |
| 2026-08-01 | PR #174 — recorded single-operator staging readiness and environment decision; docs only; no SQL apply or runtime change |
