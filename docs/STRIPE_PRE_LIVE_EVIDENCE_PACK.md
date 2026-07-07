# Stripe Pre-Live Evidence Pack

**Status:** Docs-only evidence ledger — **live Stripe is not active**

**Scope:** Owner/operator evidence and remaining pre-live steps before approved live cutover

**Last updated:** 2026-07-07

**Related PR:** #157 (docs only)

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md)
- [STRIPE_FOUNDATION_SETUP_PLAN.md](./STRIPE_FOUNDATION_SETUP_PLAN.md)

---

## 1. Status

| Statement | Current state |
| --- | --- |
| This PR (#157) | **Docs only** — no runtime, API, SQL, UI, or env changes |
| Live Stripe | **Not active** |
| Production Stripe mode | **Test mode** (`sk_test_...`) |
| `STRIPE_ALLOW_LIVE` | **Not set** on Vercel Production |
| Live webhook | **Not configured** |
| Vercel Production env | **Unchanged by this PR** |
| Save gating | **Not introduced** |

Wayfinder remains ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, or generic Behaviour → Advice. Privacy is a **baseline promise across every plan**, not a paid feature.

---

## 2. Evidence summary

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
- **Test mode remains the default** current Production state (`sk_test_...`, guard unset).

Sandbox smoke after PR #156 merge confirms test-mode paths still work end-to-end.

---

## 4. Systems untouched / preserved

This evidence pack and PR #157 do **not** change:

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
- Live Stripe activation
- Vercel Production environment variables
- Stripe Dashboard configuration

Entitlement updates remain **webhook-driven**; browser redirect or Portal return alone must not be treated as proof of plan change.

---

## 5. Remaining pre-live owner tasks

These steps are **owner-controlled** and **not executed in PR #157**:

1. [ ] Review and approve live pricing.
2. [ ] Complete Stripe live account / business readiness.
3. [ ] Create live Stripe Products (intentionally, in live mode).
4. [ ] Create live Stripe Price IDs.
5. [ ] Configure live Customer Portal.
6. [ ] Configure live webhook endpoint.
7. [ ] Record live webhook signing secret securely.
8. [ ] Prepare Vercel Production env var values (placeholders only in docs — real values in secure vault only).
9. [ ] Confirm rollback values and rollback owner.
10. [ ] Assign live cutover smoke-test owner.
11. [ ] Prepare parent/customer support wording for billing questions.
12. [ ] **Rodney explicitly approves live activation.**

---

## 6. Final live cutover checklist

**Do not execute in PR #157.** Use only after §9 owner sign-off and during an approved cutover window.

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

**Future only** — after explicit Rodney approval and live env cutover:

1. [ ] Confirm production app loads before cutover.
2. [ ] Confirm verified parent login works.
3. [ ] Confirm Dashboard loads (Parent ID, children, journal trail, existing widgets).
4. [ ] Confirm Checkout opens live Stripe Checkout with approved live Price ID.
5. [ ] Complete **one controlled live transaction** only after Rodney approval.
6. [ ] Confirm live webhook delivery HTTP 200.
7. [ ] Confirm event `livemode: true`.
8. [ ] Confirm Vercel log outcome `processed`.
9. [ ] Confirm entitlement sync updates expected user only (webhook-driven).
10. [ ] Confirm Billing Portal opens live Customer Portal and returns to app.
11. [ ] Confirm no secrets, parent email, child names, Supabase UUIDs, JWTs, or billing internals are exposed in normal UI.
12. [ ] Confirm rollback remains available (§8).

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

> Live Stripe cutover is blocked until Rodney gives explicit approval after reviewing this evidence pack, the live Stripe Dashboard setup, Vercel Production env values, rollback plan, and smoke-test owner assignment.

Until that approval:

- Production remains on **Stripe test mode**.
- `STRIPE_ALLOW_LIVE` must **not** be set.
- No live webhook endpoint should be pointed at Production.
- No live customer charges should be initiated.

---

## Cross-links

- [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md) — full cutover checklist and operator plan
- [STRIPE_FOUNDATION_SETUP_PLAN.md](./STRIPE_FOUNDATION_SETUP_PLAN.md) — architecture and webhook design
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) — merge and smoke tracking
- [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md) — pricing and privacy baseline

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-07 | PR #157 — initial pre-live evidence pack (docs only) |
