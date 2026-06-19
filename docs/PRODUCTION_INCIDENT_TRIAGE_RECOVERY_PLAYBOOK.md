# Production Incident Triage and Recovery Playbook

**Day 16 — docs-only production operations hardening (Issue #38)**

Step-by-step guide for triaging and recovering from **production incidents** after launch. **Does not change app runtime, workflows, or UI.**

This playbook covers **operational and data-safety events** — auth failures, deployment outages, privacy leaks, journal integrity issues, and similar production problems.

**This playbook does not diagnose children or parents.** Incidents are **not** child/parent diagnostic conclusions. Wayfinder incidents concern system behaviour, data safety, and parent-app operational integrity — not whether a child or parent "is" a type, score, or label.

Read first:

- [docs/24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md)
- [docs/LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md)
- [docs/LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md)
- [docs/CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- GitHub [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — recurring production smoke reminder (**keep open**)

**Production:** [https://wayfinder-modular.vercel.app](https://wayfinder-modular.vercel.app)

**Repo:** `rodtay72/wayfinder-app`

**Last updated:** 2026-06-19

---

## Wayfinder canon during incidents

Wayfinder is **not** child diagnosis, child profiling, parent scoring, or Behaviour → Advice.

Core pathway (product canon — unchanged by incidents):

```
Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action
```

When triaging incidents:

- Describe **what the system did** — not what the child or parent "is"
- Use cautious language: **may**, **might**, **possible**
- Do not frame incidents as proof of child pathology or parent failure
- Operational events ≠ clinical or diagnostic conclusions

**Production baseline:** Production Cycle 1 was owner-confirmed **PASS** and recorded on [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28). Launch candidate remains **conditional** on heartbeat and manual smoke remaining clear. No sensitive evidence is recorded in this playbook.

---

## 1. Incident intake

Capture non-sensitive facts before any fix. Use a GitHub Issue as the intake record.

### Intake checklist

| Field | Record |
|-------|--------|
| **What happened?** | Brief factual description of the operational symptom |
| **Who observed it?** | Operator name or role (e.g. Rodney, Cursor agent, on-call operator) |
| **Time / date / timezone** | e.g. 2026-06-19 14:30 SGT |
| **Production URL** | `https://wayfinder-modular.vercel.app` (or note if preview/staging) |
| **Browser / device** | If relevant to UI-only issues (e.g. mobile Safari) |
| **Expected result** | What should have happened |
| **Actual result** | What happened instead — symptoms only |
| **Non-sensitive evidence** | Pass/Fail, HTTP status from workflow summary, error category, screenshot description — **no PII** |

### Never record in issues, PRs, or docs

- Parent emails
- Child names
- Supabase UUIDs or user IDs
- JWTs, tokens, or secrets
- Reflection or journal content
- Raw workflow response bodies containing sensitive data

Use: severity, pass/fail, date, timezone, and brief non-identifying notes only.

### Intake template (copy to GitHub Issue)

```markdown
## Production incident intake

- **What happened:**
- **Observed by:**
- **Time (with timezone):**
- **Environment:** Production / preview
- **Browser/device (if relevant):**
- **Expected:**
- **Actual:**
- **Severity (initial):** P0 / P1 / P2 / P3
- **Issue #28 affected?** Heartbeat / manual smoke / neither / unknown
- **Non-sensitive evidence:**

**Privacy:** No emails, child names, Supabase IDs, tokens, secrets, or reflection content.
```

---

## 2. Severity levels

| Level | Definition | Examples |
|-------|------------|----------|
| **P0 — Launch stop / data safety** | Production unusable or active data/auth/RLS/privacy/journal integrity risk | Production down; auth broken for verified users; apparent data loss; privacy leak in normal UI; exposed secrets/tokens; RLS bypass suspected |
| **P1 — Major function broken** | Core authenticated parent flow broken | Dashboard will not load; journal save/read fails; email verification gate bypass; Parent ID / Child ID broken; profile/`ensure_profile` path broken |
| **P2 — Important, contained** | Significant issue with workaround or limited blast radius | Non-critical UI regression; widget broken but core flows work; copy error with safety impact if misread |
| **P3 — Non-blocking follow-up** | Documentation drift; polish; operational hygiene | Docs out of date; CI flake; Issue #28 reminder-only update; non-critical copy typo |

During **launch freeze**, P0/P1 stop feature work immediately. P2 deferred unless owner promotes. P3 tracked — no runtime change without approval.

Align with [LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md) §4 and [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) §11.

---

## 3. Stop conditions

**Stop immediately** — do not merge, deploy, or expand scope — if:

- Any **auth, RLS, or email verification** integrity issue
- **Parent ID / Child ID** integrity broken
- **Journal save/read** or Journal Trail broken
- **Dashboard loading** broken for verified users
- **Privacy masking** failure in normal UI
- **Deployment** / production URL down (prolonged outage)
- **Production monitoring false confidence** — treating Issue #28 heartbeat as full authenticated smoke
- **Data safety** uncertainty or suspected corruption/exposure
- Evidence of **exposed secrets, tokens, personal data, child names, email, Supabase IDs, or reflection content**
- Any incident that **could corrupt or expose user data**
- **ALIGN/CAB or PDPA canon** would be weakened by a proposed fix
- **Freeze violated** without explicit approval

When stopped: pause merges, post stop report to the GitHub Issue, escalate to Rodney, do not commit runtime changes without explicit approval and narrow allowlist.

---

## 4. First-response workflow

**Do not start coding immediately.**

| Step | Action |
|------|--------|
| 1 | **Stop** — pause unrelated work; do not stack fixes |
| 2 | **Open or identify** a GitHub Issue dedicated to this incident |
| 3 | **Capture** non-sensitive evidence using §1 intake template |
| 4 | **Classify** severity P0–P3 (§2) |
| 5 | **Check Issue #28** — is public heartbeat affected? Is manual smoke status still valid? Record separately |
| 6 | **Post self-contained report** to the Issue — per [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) §2–§3 |
| 7 | **Escalate to Rodney** for explicit approval before any runtime or data-path changes |
| 8 | **Pause merges** if P0 or P1 |

### Issue #28 check (required when production-affecting)

| Check type | Question |
|------------|----------|
| Public heartbeat | Did latest scheduled or manual workflow run fail? |
| Manual smoke | Does owner-confirmed authenticated smoke still hold? Re-test if incident may affect auth/journal/dashboard/privacy |
| Issue status | **Keep Issue #28 open** — comment with non-sensitive update only; do not close |

Public heartbeat pass does **not** prove auth/journal/dashboard health.

---

## 5. Recovery workflow

### Docs-only fixes

- Proceed through normal path: Issue → self-contained report → branch → PR → merge
- No runtime files unless separate blocker approved

### Runtime fixes (requires explicit approval)

| Rule | Detail |
|------|--------|
| **Approval** | Rodney explicit approval + narrow file allowlist in the Issue |
| **Scope** | One fix per branch; minimal diff |
| **Forbidden without plan** | Auth, RLS, journal save/read, dashboard loading, privacy masking paths |
| **After merge** | Full manual authenticated smoke per [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) §6–§12 |
| **CI** | Wayfinder Checks + guardrails green before merge |

### Rollback / hold guidance

When incident likely caused by a recent merge:

1. **Pause** new feature work and unrelated merges
2. **Do not deploy** additional unrelated changes
3. **Prefer reverting** the smallest responsible change (revert commit or targeted fix branch)
4. **Verify** Vercel production deploy status for latest `main`
5. **Re-run** Issue #28 workflow dispatch after deploy stabilises
6. **Re-run** manual smoke if auth/journal/dashboard/privacy may be affected
7. **Document** recovery in Issue comment and §6 post-incident evidence

Do **not**: disable verification gate, add browser `profiles.insert`/`profiles.upsert`, weaken RLS, or change journal payload/schema without approved high-risk task.

---

## 6. Post-incident evidence

After recovery, record in the GitHub Issue (non-sensitive only):

| Field | Record |
|-------|--------|
| **What was changed?** | Files/PR merged; docs-only vs runtime |
| **What checks passed?** | `git diff --check`, CI, `node --check supabase.js` if relevant |
| **Production checks after recovery** | Heartbeat pass/fail; manual smoke pass/fail/partial; date and operator |
| **Issue #28 status** | **Remains open** — note heartbeat/smoke result only |
| **Launch freeze status** | Remains active unless owner declares otherwise |
| **Follow-up issue required?** | Yes/no — link if new tracking issue opened |
| **Severity at close** | Final P0–P3 classification |
| **Launch candidate impact** | Conditional acceptance unchanged / withdrawn / re-verified |

Update [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) if manual smoke evidence changed — owner confirms only.

### Post-incident report template

```markdown
## Post-incident recovery report

- **Incident issue:**
- **Severity (final):**
- **Changes merged (PR):**
- **Checks passed:**
- **Production verification:** Heartbeat / manual smoke — Pass / Fail / Partial — date:
- **Issue #28:** Remains open — [brief non-sensitive note]
- **Launch freeze:** Active
- **Follow-up issue:**
- **Recommended next action:**

**Privacy:** No emails, child names, Supabase IDs, tokens, secrets, or reflection content.
```

---

## 7. Agent / operator handoff

GitHub Issue and PR comments are the **source of truth** — not chat-only context.

| Rule | Detail |
|------|--------|
| **Self-contained reports** | Every incident task ends with a report the next operator can act on without re-asking Rodney |
| **Report location** | Issue before PR; PR after PR exists — per [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) §2 |
| **Standard fields** | Branch, issue/PR, purpose, files changed, checks, safety, Issue #28 status, blockers, commit/push status, approval needed, next action |
| **Handoff target** | Next operator reads Issue thread + [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) |
| **Duplicate issues** | Consolidate immediately — one incident, one primary Issue |
| **Platform handoff** | OpenClaw/webhook deferred — GitHub comment remains canonical |

### Recommended next operator actions

1. Read this playbook §1–§4 for active incidents
2. Confirm Issue #28 status (heartbeat vs manual smoke)
3. Confirm launch freeze and launch candidate conditional status
4. Continue from latest self-contained report on the Issue — do not restart without reading thread

---

## Related docs

- [24_7_LAUNCH_OPERATIONS_HANDOFF.md](./24_7_LAUNCH_OPERATIONS_HANDOFF.md) — 24/7 ops and reporting (Day 15 / PR #37)
- [LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md](./LAUNCH_FREEZE_GO_NO_GO_PROTOCOL.md) — freeze and go/no-go
- [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) — manual smoke script
- [PLATFORM_SYNC_PRODUCTION_OPS.md](./PLATFORM_SYNC_PRODUCTION_OPS.md) — ops rhythm and escalation
- [LAUNCH_READINESS_EVIDENCE_PACK.md](./LAUNCH_READINESS_EVIDENCE_PACK.md) — smoke evidence ledger
- [LAUNCH_CANDIDATE_SIGN_OFF.md](./LAUNCH_CANDIDATE_SIGN_OFF.md) — conditional launch candidate
- GitHub [Issue #28](https://github.com/rodtay72/wayfinder-app/issues/28) — **keep open**
- GitHub [Issue #38](https://github.com/rodtay72/wayfinder-app/issues/38) — Day 16 incident playbook
