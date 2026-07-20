# Admin Access and Offboarding — Readiness Draft

**Status:** Draft admin access and offboarding policy for **HIPAA / SOC 2 readiness** — **evidence preparation** only.

**Branch:** `docs/pr-164-compliance-evidence-security-policy`

**Last updated:** 2026-07-20

**Related:** [SECURITY_POLICY_READINESS_DRAFT.md](./SECURITY_POLICY_READINESS_DRAFT.md) · [COMPLIANCE_EVIDENCE_REGISTER.md](./COMPLIANCE_EVIDENCE_REGISTER.md)

This document:

- Does **not** change runtime permissions or grant/revoke real access in PR #164
- Describes **controls to be reviewed**
- **Legal/security/auditor confirmation required** before treating as operational policy

---

## 1. Status and scope

Wayfinder uses owner/admin-controlled operations for MHP onboarding, billing support boundaries, and production deployment. This draft defines expected admin access hygiene for readiness work.

**No permission changes in this PR.**

---

## 2. Admin access principles

- **Least privilege** — minimum access needed for the role
- **Owner-approved access** — new admin access requires owner approval
- **No shared credentials** — individual named accounts where possible
- **MFA expected** on all admin consoles (see systems table)
- **No production access without need** — time-bounded where feasible
- **No service-role usage** except approved server-side API routes and documented owner admin workflows — never in browser

Internal MHP role value remains `counsellor`; user-facing label remains Mental Health Practitioner (MHP).

---

## 3. Systems in scope

| System | Purpose | Access owner | Sensitive data risk | MFA expected | Review cadence | Offboarding step | Evidence gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GitHub | Source, PRs, Actions, secrets in env (not values in repo) | Owner | Medium — code, workflow config | Yes | Monthly (launch) / quarterly | Remove org/repo access | MFA status not recorded |
| Vercel | Production deploy, env secrets, serverless API | Owner | High — env secrets, API routes | Yes | Monthly / quarterly | Remove team access | MFA status not recorded |
| Supabase | Auth, DB, RLS, Storage | Owner | High — all app data | Yes | Monthly / quarterly | Remove org/project access | MFA status not recorded |
| Stripe | Live billing, webhooks, Customer Portal config | Owner | Medium — billing PII | Yes | Monthly / quarterly | Remove dashboard access | MFA status not recorded |
| Email / auth provider | Verification, reset, invite email | Owner | Medium — email addresses | Yes | Quarterly | Revoke admin if applicable | Provider MFA TBD |
| Support inbox / tools | Parent billing questions | Owner | High if misused — no reflection content | Yes if available | Quarterly | Revoke access | Tool list TBD |
| AI provider admin (if used) | MHP assistive features | Owner | **High** if reflection text sent | Yes | Immediate if enabled | Revoke; review data flows | Usage boundary PR #165+ |
| Domain / DNS | Production domain | Owner | Low | Yes | Quarterly | Remove registrar access | Evidence gap |
| Analytics (if any) | Product analytics | Owner | **Must be none** for reflection/child names | N/A | Confirm none in prod | Disable/remove | **Confirm no analytics on sensitive content** |

---

## 4. Access review cadence

- **Monthly** during active launch period
- **Quarterly** once stable, unless owner decides otherwise
- **Immediate review** after personnel change, vendor change, or suspected incident

Record review outcome as non-sensitive note (e.g. “Q3 access review completed — no changes”) in evidence register — **no account names with secrets**.

---

## 5. Offboarding checklist

When someone with admin access leaves or changes role:

- [ ] Remove GitHub org/repo access
- [ ] Remove Vercel team/project access
- [ ] Remove Supabase org/project access
- [ ] Remove Stripe dashboard access
- [ ] Rotate shared secrets if exposure risk (without recording secret values)
- [ ] Revoke email/support/tool access
- [ ] Verify no local secrets retained on offboarded devices (policy reminder only)
- [ ] Record **non-sensitive** completion note in evidence register

This checklist does not execute automatically in PR #164.

---

## 6. Emergency access / break-glass (draft)

- **Owner approval required** before break-glass use
- **Time-bounded access** — remove when incident resolves
- **Record reason and non-sensitive outcome** — no user content in ticket
- **Remove access after incident**
- **Post-incident review** — link to [PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md](./PRODUCTION_INCIDENT_TRIAGE_AND_RECOVERY_PLAYBOOK.md)

Break-glass procedures are **controls to be reviewed** — not yet operationalised in runtime.

---

## 7. What not to record

In access reviews, offboarding notes, or evidence registers, do **not** record:

- Passwords
- API keys or service-role keys
- JWTs
- Parent emails
- Child names
- Supabase UUIDs
- Stripe customer/subscription IDs
- Reflection or journal content
- PHI samples

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-20 | PR #164 — initial admin access and offboarding readiness draft (docs only) |
