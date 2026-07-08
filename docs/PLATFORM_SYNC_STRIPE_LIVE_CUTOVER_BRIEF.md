# Platform Sync Brief — Stripe Live Cutover

Cross-platform handoff for post-cutover context. Follows [PLATFORM_SYNC_BRIEF_TEMPLATE.md](./PLATFORM_SYNC_BRIEF_TEMPLATE.md).

**Privacy rule:** No secrets, live Price IDs, customer IDs, subscription IDs, parent emails, child names, Supabase UUIDs, JWTs, webhook secrets, or raw billing identifiers in this brief.

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [STRIPE_PRE_LIVE_EVIDENCE_PACK.md](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md)
- [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)

---

## Brief metadata

- **Date:** 2026-07-08
- **Phase name:** Stripe live cutover evidence and post-cutover handoff
- **Branch name:** `docs/pr-158-stripe-live-cutover-evidence`
- **Owner agent / human:** Rodney + Cursor + ChatGPT review
- **PR link:** [PR #158](https://github.com/rodtay72/wayfinder-app/pull/158)

---

## What changed

- Live Stripe cutover was completed on Vercel Production.
- Production now uses live Stripe runtime configuration:
  - `STRIPE_SECRET_KEY` starts with `sk_live_`
  - `STRIPE_ALLOW_LIVE=true`
  - Live webhook secret set
  - Live Price IDs set
  - Production redeployed
- Live smoke passed using a fresh Free parent account:
  - Production app loaded
  - Verified parent login worked
  - Dashboard loaded
  - Live Checkout opened with correct product/price
  - Controlled live payment completed
  - App return worked
  - Plan display updated
  - Billing Portal opened live Portal
  - Live webhook delivered HTTP 200
  - Event `livemode: true`
  - Vercel webhook outcome: `processed`
  - Entitlement sync affected expected user only
  - Privacy/secret exposure check passed
- Rollback remains available and was not executed.

Full evidence tables: [STRIPE_PRE_LIVE_EVIDENCE_PACK.md — Live cutover result](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md#live-cutover-result).

---

## What did not change

- No runtime/API/SQL/UI/env changes in PR #158.
- Supabase auth unchanged.
- RLS unchanged.
- Email verification unchanged.
- `ensure_profile` unchanged.
- Parent ID / Child ID unchanged.
- Journal save/read unchanged.
- Dashboard loading unchanged.
- Privacy masking unchanged.
- No save gating introduced.
- No manual entitlement edits.
- No manual `stripe_billing_references` edits.
- ALIGN/CAB product framing unchanged.

---

## User-facing summary

Wayfinder live payments are now active. A new Free parent can upgrade through live Stripe Checkout, return to Wayfinder, receive webhook-driven entitlement sync, and manage billing through Stripe Customer Portal.

Existing pre-payment-gateway Plus users, including public Parent ID **P-44947**, may already appear as Plus inside Wayfinder but may not have a linked Stripe live customer/subscription. Those users are a **separate migration/support case** and are **not** a live cutover blocker.

Wayfinder remains ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, or generic Behaviour → Advice.

---

## Consent / privacy impact

Privacy remains a **baseline promise across all plans**. No ads, no data-selling, and no privacy-as-paid-feature framing.

No secrets, live Price IDs, customer IDs, subscription IDs, parent emails, child names, Supabase UUIDs, JWTs, webhook secrets, or raw billing identifiers are recorded in PR #158 docs.

---

## AI capability impact

None. No AI endpoint, prompt, model, counsellor analysis, or research AI behaviour changed.

---

## Research / backend impact

Backend billing is now **live** through Stripe. Entitlement updates remain **webhook-driven**. Browser redirect or Billing Portal return alone must not be treated as proof of plan change.

No manual edits to entitlements or `stripe_billing_references` should be made unless a separate reviewed admin/support procedure is created.

---

## App Version action

- [x] No App Version entry needed in PR #158 because this is docs-only evidence. If owner wants a parent-facing release note later, create a separate UI/content PR.

---

## Test evidence

| Check | Result |
| --- | --- |
| Production app load | Passed |
| Verified parent login | Passed |
| Dashboard load | Passed |
| Live Checkout | Passed |
| Controlled live payment | Passed |
| App return | Passed |
| Plan display update | Passed |
| Billing Portal | Passed |
| Live webhook | HTTP 200, `livemode: true`, `processed` |
| Entitlement sync | Expected user only |
| Privacy/secret exposure check | Passed |
| Rollback | Available, not executed |

**Automated checks (PR #158):**

- `git diff --check`: pass
- `verify-wayfinder.ps1`: pass
- GitHub Wayfinder Guardrails: pass
- GitHub Wayfinder Checks: pass

---

## Open risks

1. Pre-payment-gateway Plus users may not have Stripe live customer/subscription records.
2. **P-44947** is a known legacy Plus/support case, not a cutover blocker.
3. A separate reviewed migration/support procedure is needed before linking or transitioning legacy Plus users.
4. Do not manually patch entitlements or `stripe_billing_references` during normal support.
5. Continue monitoring live webhook deliveries and Vercel logs after cutover.
6. **Billing Portal pages** may remain reachable in the browser after Wayfinder sign-out (Stripe-hosted). Shared-device users should sign out, close the browser window, and clear browser history or site data if needed. See [STRIPE_PRE_LIVE_EVIDENCE_PACK.md — Post-cutover operational findings](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md#post-cutover-operational-findings) (PR #159).

---

## Next action by platform

| Platform | Next action |
| --- | --- |
| ChatGPT | Keep Stripe live cutover context as current state; help plan legacy Plus migration/support procedure next. |
| Cursor | Use this brief as source context for next docs/support PR; do not change auth/RLS/journal/billing runtime unless explicitly instructed. |
| Codex | If asked to review, verify PR #158 remains docs-only and contains no secrets/IDs. |
| Claude Projects | Use this brief for copy/research/socialisation review; preserve ALIGN/CAB and privacy baseline. |
| Claude Code | Reviewer or isolated branch only; no direct production-impact edits without explicit issue allowlist. |
| OpenClaw | Socialise this state across configured agent channels/manual handoff. |
| Human owner | Merge PR #158 after review; then plan separate pre-gateway Plus migration/support decision. |

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-08 | PR #158 — initial platform sync brief for live cutover handoff |
| 2026-07-08 | PR #159 — Billing Portal session safety risk cross-link |
