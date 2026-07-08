# Stripe Pre-Live Evidence Pack

**Status:** Docs-only evidence ledger — **live Stripe cutover completed and smoke-tested**

**Scope:** Owner/operator evidence before and after approved live cutover

**Last updated:** 2026-07-08

**Related PR:** #157 (pre-live evidence, merged) · #158 (live cutover evidence record, docs only)
Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md)
- [STRIPE_FOUNDATION_SETUP_PLAN.md](./STRIPE_FOUNDATION_SETUP_PLAN.md)

---

## 1. Status

| Statement | Current state (post-cutover) |
| --- | --- |
| Live Stripe | **Active** on Vercel Production |
| Production key mode | `STRIPE_SECRET_KEY` starts with `sk_live_` |
| Live guard | `STRIPE_ALLOW_LIVE=true` |
| Live webhook | Configured |
| Live Price IDs | Set on Production |
| Save gating | **Not introduced** |
| Privacy baseline | Unchanged — baseline across every plan |
| Auth / RLS / journal / dashboard | Unchanged |

Wayfinder remains ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, or generic Behaviour → Advice.

**PR #158** records live cutover evidence only — no runtime, API, SQL, UI, or env changes.

---

## 2. Evidence summary (historical — pre-live, completed)

**Status:** Pre-live sandbox evidence from post-PR #156 smoke. **Superseded by live cutover** — see [Live cutover result](#live-cutover-result).

Post-**PR #156** sandbox smoke on Vercel Production (test mode). No real secrets, Price IDs, webhook secrets, customer IDs, parent emails, child names, Supabase UUIDs, JWTs, or raw billing identifiers are recorded here.
| Area | Evidence |
| --- | --- |
| Vercel Production key mode | `STRIPE_SECRET_KEY` starts with `sk_test_` |
| Live guard | `STRIPE_ALLOW_LIVE` not set |
| Live webhook | Not configured |
| Live Stripe | Not active |
| Checkout | Plus Checkout opened |
| Test card payment | Completed |
| App return | Successful |
| Plan display | Updated |
| Billing Portal | Opened and returned |
| Webhook delivery | HTTP 200 |
| Webhook mode | `livemode: false` |
| Vercel log outcome | `processed` |

**Prior merged work (context):**

- **PR #155** — live-readiness cutover checklist (docs only).
- **PR #156** — shared Stripe runtime safety gate across Checkout, webhook, and Billing Portal; live-capable only when `STRIPE_SECRET_KEY=sk_live_...` **and** exact `STRIPE_ALLOW_LIVE=true`.

---

## 3. Runtime readiness evidence

PR #156 introduced `api/_stripe-runtime-mode.js` and wired the two-step live safety gate into all server-side Stripe entry points:

| Route | Live-capable behaviour (behind guard only) |
| --- | --- |
| `POST /api/create-checkout-session` | Accepts `sk_live_...` only when `STRIPE_ALLOW_LIVE=true` |
| `POST /api/stripe-webhook` | Processes `livemode: true` events only when live key + guard are set |
| `POST /api/create-billing-portal-session` | Same guard as Checkout |

**Guard rules:**

- Live mode requires **both** `STRIPE_SECRET_KEY=sk_live_...` and exact `STRIPE_ALLOW_LIVE=true`.
- `sk_live_...` without the guard → Checkout and Portal return safe “not configured” responses; webhook returns HTTP 503 with `skipped_live_not_enabled` — **no entitlement sync**.
- Mode-mismatched webhook events (e.g. test key + `livemode: true`) → HTTP 200, `skipped_mode_mismatch`, **no entitlement sync**.
- **Test mode remains the default** current Production state (`sk_test_...`, guard unset) — **historical; Production is now live.**

Sandbox smoke after PR #156 merge confirmed test-mode paths worked end-to-end before cutover.

---

## Live cutover result

**Recorded:** PR #158 (docs only). Owner-approved live cutover completed on Vercel Production. No secrets, live Price IDs, webhook secrets, customer IDs, subscription IDs, parent emails, child names, Supabase UUIDs, JWTs, or raw billing identifiers are recorded below.

### Vercel Production cutover

| Check | Result |
| --- | --- |
| `STRIPE_SECRET_KEY` starts with `sk_live_` | Yes |
| `STRIPE_ALLOW_LIVE=true` | Yes |
| Live webhook secret set | Yes |
| Live Price IDs set | Yes |
| Production redeployed | Yes |

### Live smoke (Production)

| Check | Result |
| --- | --- |
| Production app loads | Yes |
| Verified parent login works | Yes |
| Dashboard loads | Yes |
| Live Checkout opens | Yes |
| Product / price correct | Yes |
| Controlled live payment completed | Yes |
| App return works | Yes |
| Plan display updated | Yes |
| Billing Portal opens live Portal | Yes |
| Live webhook delivered HTTP 200 | Yes |
| Event `livemode` | `true` |
| Vercel log outcome | `processed` |
| Entitlement sync — expected user only | Yes |
| Privacy / secret exposure check | Passed |

**Smoke account:** Fresh Free parent account used for live cutover smoke.

**Separate support case (not a cutover blocker):** Existing pre-payment-gateway Plus account **P-44947** is a separate migration/support decision. Future pre-gateway paid-user migration must follow a **separate reviewed support/admin procedure**. Do **not** manually edit entitlements or `stripe_billing_references` as part of routine ops.

### Rollback

| Check | Result |
| --- | --- |
| Rollback still available | Yes |
| Rollback executed | No |

Rollback guidance remains in §8 and [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md) §10.

---

## Post-cutover operational findings

### Billing Portal session safety (PR #159)

**Finding:** Stripe-hosted Billing Portal session URLs are sensitive and may remain usable briefly after Wayfinder logout because the page is hosted by Stripe. Wayfinder logout should **not** be represented as revoking an already-open Stripe Portal tab. Users should close Stripe billing tabs when finished, especially on shared devices.

**This does not automatically prove a Wayfinder auth/RLS/account-linking bug.** Wayfinder must still only create a Billing Portal session for the currently signed-in verified parent with a linked Stripe customer (`stripe_billing_references.stripe_customer_id`).

**Support rules:**

- Never paste or store Billing Portal session URLs.
- Never use a Billing Portal URL as proof of the currently signed-in Wayfinder user.
- Verify billing state from webhook-synced entitlement and Stripe records.
- Do **not** manually edit entitlements or `stripe_billing_references`.
- **P-44947** remains a legacy pre-payment-gateway Plus migration/support case.

**P-44947 fresh-session Manage Billing test:** **Passed (expected).** Billing Portal did **not** open from inside Wayfinder — no Stripe Portal session URL was issued. Server requires a linked billing reference; legacy Plus without a gateway-linked customer receives a safe “no billing account” response. Manage Billing may still appear for legacy Plus entitlement display; Portal creation correctly blocked until a reviewed migration procedure links billing.

Parent-facing safety copy added on Plans (PR #159): before opening Portal and after return from billing.

---

## 4. Systems untouched / preserved

This evidence pack and PR #157 / PR #158 do **not** change:

- Supabase auth
- RLS
- Email verification
- `ensure_profile`
- Parent ID / Child ID generation and display rules
- Journal save/read
- Dashboard loading
- Privacy masking in normal UI
- Save gating (none introduced)
- Manual entitlement edits
- Manual `stripe_billing_references` edits
- SQL / schema
- Live Stripe activation (cutover was owner-controlled Vercel/Stripe action — PR #158 records evidence only)
- Vercel Production environment variables (PR #158 docs only)
- Stripe Dashboard configuration

Entitlement updates remain **webhook-driven**; browser redirect or Portal return alone must not be treated as proof of plan change.

---

## 5. Remaining pre-live owner tasks

**Status:** **Completed** at live cutover. Historical checklist — do not re-execute unless rolling back to test mode and re-cutting over.

1. [x] Review and approve live pricing.
2. [x] Complete Stripe live account / business readiness.
3. [x] Create live Stripe Products (intentionally, in live mode).
4. [x] Create live Stripe Price IDs.
5. [x] Configure live Customer Portal.
6. [x] Configure live webhook endpoint.
7. [x] Record live webhook signing secret securely.
8. [x] Prepare Vercel Production env var values (secure vault — not in repo).
9. [x] Confirm rollback values and rollback owner.
10. [x] Assign live cutover smoke-test owner.
11. [x] Prepare parent/customer support wording for billing questions.
12. [x] **Rodney explicitly approves live activation.**
---

## 6. Final live cutover checklist

**Status:** **Executed** at live cutover. Placeholders below — real values live in Vercel Production and secure operator vault only.
Future Production cutover requires (placeholders only):

```text
STRIPE_SECRET_KEY=sk_live_...
STRIPE_ALLOW_LIVE=true
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PLUS_MONTHLY=price_...
STRIPE_PRICE_PLUS_YEARLY=price_...
STRIPE_PRICE_CONNECT_MONTHLY=price_...
STRIPE_PRICE_CONNECT_YEARLY=price_...
APP_BASE_URL=https://wayfinder-modular.vercel.app
```

Operator sequence (summary — full detail in [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md)):

1. [ ] Confirm PR #156 runtime gate is deployed on Production.
2. [ ] Snapshot known-good **test-mode** Production env values for rollback.
3. [ ] Update Vercel Production env vars (Production scope only).
4. [ ] Redeploy Production after env changes.
5. [ ] Run post-live smoke sequence (§7).
6. [ ] Do **not** set `STRIPE_ALLOW_LIVE=true` without `sk_live_...` and approved live webhook/Price ID setup.

---

## 7. Post-live smoke sequence

**Status:** **Completed** — see [Live cutover result](#live-cutover-result). Historical checklist retained for rollback/re-cutover reference.

1. [x] Confirm production app loads before cutover.
2. [x] Confirm verified parent login works.
3. [x] Confirm Dashboard loads (Parent ID, children, journal trail, existing widgets).
4. [x] Confirm Checkout opens live Stripe Checkout with approved live Price ID.
5. [x] Complete **one controlled live transaction** only after Rodney approval.
6. [x] Confirm live webhook delivery HTTP 200.
7. [x] Confirm event `livemode: true`.
8. [x] Confirm Vercel log outcome `processed`.
9. [x] Confirm entitlement sync updates expected user only (webhook-driven).
10. [x] Confirm Billing Portal opens live Customer Portal and returns to app.
11. [x] Confirm no secrets, parent email, child names, Supabase UUIDs, JWTs, or billing internals are exposed in normal UI.
12. [x] Confirm rollback remains available (§8).
---

## 8. Rollback readiness

If live collection must pause after cutover:

- [ ] Revert Vercel Production env vars to documented **known-good test-mode** values (`sk_test_...`, test `whsec_...`, test `price_...` IDs).
- [ ] Remove or do not set `STRIPE_ALLOW_LIVE` during test-mode rollback.
- [ ] Disable or pause live webhook endpoint in Stripe Dashboard if needed.
- [ ] Do **not** manually edit entitlements unless a separate reviewed admin/support procedure exists.
- [ ] Do **not** manually edit `stripe_billing_references`.
- [ ] Do **not** delete live Stripe customers/subscriptions casually.
- [ ] Preserve auditability (Stripe Dashboard, Vercel logs, idempotency table).
- [ ] Handle any real payment or customer communication **outside** code changes.

Full rollback operator detail: [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md) §10.

---

## 9. Owner sign-off gate

**Status:** **Approved and cutover completed.** Historical gate text retained for audit trail.

> Live Stripe cutover was approved by Rodney after reviewing this evidence pack, live Stripe Dashboard setup, Vercel Production env values, rollback plan, and smoke-test owner assignment.

Production is now on **live Stripe**. Rollback remains available per §8 if live collection must pause.
---

## Cross-links

- [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md) — full cutover checklist and operator plan
- [STRIPE_FOUNDATION_SETUP_PLAN.md](./STRIPE_FOUNDATION_SETUP_PLAN.md) — architecture and webhook design
- [PLATFORM_SYNC_STRIPE_LIVE_CUTOVER_BRIEF.md](./PLATFORM_SYNC_STRIPE_LIVE_CUTOVER_BRIEF.md) — cross-platform post-cutover handoff (PR #158)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) — merge and smoke tracking
- [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md) — pricing and privacy baseline
---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-07 | PR #157 — initial pre-live evidence pack (docs only) |
| 2026-07-08 | PR #158 — live cutover result recorded; pre-live evidence marked completed; platform sync brief added |
| 2026-07-08 | PR #159 — Billing Portal session safety finding; P-44947 Manage Billing test recorded |