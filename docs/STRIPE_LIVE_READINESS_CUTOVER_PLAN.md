# Stripe Live Readiness and Cutover Plan

**Status:** Readiness checklist only — **live Stripe is not active**

**Scope:** Documentation for owner/operator cutover planning

**Last updated:** 2026-07-07

**Related PR:** #155 (docs only) · #156 (runtime live-capable gate — **does not activate live**)

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [STRIPE_FOUNDATION_SETUP_PLAN.md](./STRIPE_FOUNDATION_SETUP_PLAN.md)
- [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md)

---

## 1. Status and non-goals

### Current confirmed state (sandbox / test mode)

| Area | Status |
| --- | --- |
| PR #149 webhook runtime | Merged — works in test mode |
| PR #150 webhook `errorCategory` diagnostics | Merged |
| PR #151 sync RPC ambiguity fix | Merged + SQL applied |
| PR #152 parent Checkout buttons on Plans | Merged |
| PR #153 Customer Portal / Manage billing | Merged |
| PR #154 billing scheduled-change copy | Merged |
| PR #155 live-readiness cutover plan (docs) | Merged or in flight — see repo |
| PR #156 Stripe live-runtime safety gate | Runtime PR — **does not activate live** |
| Sandbox Checkout E2E | Verified |
| Webhook processing | Verified (`processed` outcomes) |
| Supabase entitlement sync | Verified |
| `stripe_billing_references` writes | Verified |
| Customer Portal plan updates | Verified (including scheduled downgrade at renewal) |

### What this document is

- A **live-readiness checklist** and **cutover operator plan** for moving from Stripe **sandbox/test mode** to **live Stripe** safely.
- A record of prerequisites, env var separation, smoke tests, rollback, and data safety boundaries.

### What this document is not

- **This PR does not activate live payments.**
- **This PR does not change** app runtime, APIs, SQL, RLS, Vercel environment variables, webhooks, save gating, or billing behaviour.
- **This PR does not** configure live Stripe Dashboard objects.
- **This PR does not** manually edit entitlements or billing rows.

### Product framing (unchanged)

Wayfinder is ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, or generic Behaviour → Advice.

- Privacy is a **baseline promise across every plan**, not a paid feature.
- Connect is optional, parent-controlled MHP review support — not therapy, diagnosis, emergency care, or automatic sharing.
- Entitlement updates remain **webhook-driven**; browser redirect or Portal return alone must not be treated as proof of plan change.

### Important runtime note before live cutover

**PR #156** (runtime live-capable gate, **no activation**) makes Checkout, webhook, and Billing Portal routes able to accept live Stripe **only when both** are set:

```text
STRIPE_SECRET_KEY=sk_live_...
STRIPE_ALLOW_LIVE=true
```

Until an owner-approved Production env cutover sets those values **together with** live `STRIPE_WEBHOOK_SECRET`, live Price IDs, and live webhook endpoint configuration, **Production remains test mode**.

Current default behaviour (unchanged until cutover):

- `STRIPE_SECRET_KEY=sk_test_...` with `STRIPE_ALLOW_LIVE` unset → sandbox/test Checkout, Portal, and webhooks work as today.
- `sk_live_...` without `STRIPE_ALLOW_LIVE=true` → Checkout and Portal return safe “not configured” responses; webhooks return HTTP 503 with `skipped_live_not_enabled` log — **no entitlement sync**.
- Mode-mismatched webhook events (e.g. test key + `livemode: true`) → HTTP 200, `skipped_mode_mismatch`, **no entitlement sync**.

All three server routes share the gate via `api/_stripe-runtime-mode.js`. **PR #156 does not change Vercel env vars, Stripe Dashboard, or SQL.** Do not set `STRIPE_ALLOW_LIVE=true` until explicit owner-approved live cutover.

---

## 2. Live Stripe prerequisites

Use this checklist before any live cutover decision.

### Stripe account and business readiness

- [ ] Stripe account **live mode** access is available (not test mode only).
- [ ] Business / account verification required by Stripe is **completed** for live payments.
- [ ] Payout bank account and business profile are configured as required.
- [ ] Tax / invoicing settings reviewed for Singapore operations (owner/legal review).
- [ ] Support contact and customer-facing billing descriptors reviewed.

### Live catalog (intentional creation)

- [ ] **Live products** created intentionally in Stripe **live mode** (not copied blindly from test).
- [ ] **Live prices** created intentionally for:
  - [ ] Wayfinder Plus monthly
  - [ ] Wayfinder Plus yearly
  - [ ] Wayfinder Connect monthly (if Connect included in launch cutover)
  - [ ] Wayfinder Connect yearly (if Connect included in launch cutover)
- [ ] Product naming and descriptions preserve ALIGN/CAB, non-diagnostic, privacy-first framing.
- [ ] Wayfinder Free (`wayfinder`) remains **no-card** — not sold via Stripe Checkout.

### Live Customer Portal

- [ ] Live Customer Portal configuration reviewed separately from test mode (see §8).

### Live webhook planning

- [ ] Live webhook endpoint URL planned (see §5).
- [ ] Live signing secret storage plan agreed (see §6).
- [ ] Required event list matches current webhook runtime (see §5).

### Vercel Production preparation

- [ ] Live env var **values prepared** on paper / secure operator vault — **not changed by this PR**.
- [ ] Preview / test deployments remain clearly separated from Production cutover.

### Rollback before go

- [ ] Known-good **sandbox/test** Production env snapshot documented (placeholders only).
- [ ] Rollback operator and decision owner assigned (see §10).

---

## 3. Live secret key requirement

Live cutover must use a Stripe secret key beginning with:

```text
sk_live_...
```

Rules:

| Rule | Detail |
| --- | --- |
| Test key | `sk_test_...` is for **sandbox/test only** — must not be used for live customer charges |
| Live key storage | Live secret key stored **only** in Vercel **Production** environment variables (and Stripe Dashboard) |
| Never in browser | No Stripe secret in `app.js`, `content.js`, static bundles, or client-visible UI |
| Never in repo | Do not commit real keys, `.env` files with secrets, or screenshots containing keys |
| Never in docs | Use placeholders only in documentation and runbooks |
| Never in logs | Do not log full secret keys in Vercel, Supabase, or support tickets |

Placeholder example for operator notes:

```text
STRIPE_SECRET_KEY=sk_live_...
STRIPE_ALLOW_LIVE=true
```

`STRIPE_ALLOW_LIVE` must be the exact string `true`. Do not set it during sandbox operation or before approved live cutover.

---

## 4. Live Price IDs are separate from sandbox Price IDs

Sandbox Price IDs and live Price IDs are **not interchangeable**.

| Concept | Sandbox / test | Live |
| --- | --- | --- |
| Price IDs | Created in **test mode** | Created in **live mode** |
| Prefix | `price_...` (test objects) | `price_...` (live objects — different IDs) |
| Reuse | **Do not** paste test Price IDs into live Production env | Map live IDs deliberately |

### Required live Price ID mapping (placeholders)

Map to existing plan/interval logic used by `/api/create-checkout-session`:

| Env var | Plan | Interval | Placeholder |
| --- | --- | --- | --- |
| `STRIPE_PRICE_PLUS_MONTHLY` | `wayfinder_plus` | monthly | `price_live_plus_monthly_...` |
| `STRIPE_PRICE_PLUS_YEARLY` | `wayfinder_plus` | yearly | `price_live_plus_yearly_...` |
| `STRIPE_PRICE_CONNECT_MONTHLY` | `wayfinder_connect` | monthly | `price_live_connect_monthly_...` |
| `STRIPE_PRICE_CONNECT_YEARLY` | `wayfinder_connect` | yearly | `price_live_connect_yearly_...` |

Checklist:

- [ ] Each live Price ID verified in Stripe **live mode** Dashboard.
- [ ] Each live price amount matches approved product pricing (Plus S$7.90/mo, S$69/yr; Connect S$29.90/mo, S$299/yr unless owner pricing changed).
- [ ] Webhook price-canonical mapping env vars updated to **live** IDs during cutover only.
- [ ] Customer Portal live catalog exposes only intended live products/prices.
- [ ] Double-check no test `price_...` values remain in Production after cutover.

---

## 5. Live webhook endpoint setup

Document the sequence for operators — **do not perform during PR #155**.

### Endpoint

| Item | Value |
| --- | --- |
| Production URL | `https://wayfinder-modular.vercel.app/api/stripe-webhook` |
| Method | POST only |
| Mode | Create endpoint in Stripe **live mode** (separate from test endpoint) |

### Required subscribed events

Subscribe only to events handled by current runtime:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Do not subscribe to unnecessary events.

### Live / test separation

- [ ] Test webhook endpoint remains in Stripe **test mode** for sandbox QA.
- [ ] Live webhook endpoint created in Stripe **live mode** only.
- [ ] Test signing secret and live signing secret stored separately.
- [ ] Operators can identify which endpoint is which without mixing secrets.

### Pre-cutover verification (test mode baseline)

Before live cutover, confirm sandbox path still works:

- [ ] Fresh sandbox Checkout → webhook `processed` → entitlement sync → billing refs row.

---

## 6. Live `STRIPE_WEBHOOK_SECRET`

| Item | Guidance |
| --- | --- |
| Source | Signing secret from the **live-mode** Stripe webhook endpoint (`whsec_...`) |
| Separate from test | Live `whsec_...` ≠ sandbox/test `whsec_...` |
| Vercel variable | Set as `STRIPE_WEBHOOK_SECRET` in **Production** during actual cutover |
| This PR | **Does not change** Vercel env vars |
| Never commit | Real `whsec_...` values must not appear in git, docs, chat, or tickets |

Placeholder:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
```

After cutover, verify:

- [ ] Live webhook deliveries succeed (Stripe Dashboard → live endpoint → recent deliveries).
- [ ] Vercel logs show `[stripe-webhook]` with `livemode: true` and `outcome: processed` (after runtime live gate is deployed).

---

## 7. Vercel Production env var cutover checklist

**This PR does not change these values.** Use during owner-approved cutover only.

### Variables to verify / update (placeholders only)

| Variable | Purpose | Cutover placeholder |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Server Stripe API | `sk_live_...` |
| `STRIPE_ALLOW_LIVE` | Explicit live activation guard (required with live key) | `true` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verify | `whsec_...` (live endpoint) |
| `STRIPE_PRICE_PLUS_MONTHLY` | Plus monthly Checkout / webhook map | `price_...` (live) |
| `STRIPE_PRICE_PLUS_YEARLY` | Plus yearly | `price_...` (live) |
| `STRIPE_PRICE_CONNECT_MONTHLY` | Connect monthly | `price_...` (live) |
| `STRIPE_PRICE_CONNECT_YEARLY` | Connect yearly | `price_...` (live) |
| `APP_BASE_URL` | Checkout / Portal return URLs | `https://wayfinder-modular.vercel.app` |
| `SUPABASE_URL` | Server entitlement sync | unchanged unless separate migration |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook RPC writes | unchanged — **never** expose |
| `SUPABASE_ANON_KEY` | Browser auth reads | unchanged |

### Cutover operator sequence (env only)

1. [ ] Snapshot current **known-good test-mode** Production values (secure vault — placeholders in runbook).
2. [ ] Confirm **PR #156** runtime live gate is merged and deployed (see §1).
3. [ ] Update Production env vars in Vercel Dashboard — **Production scope only** — including `STRIPE_ALLOW_LIVE=true` with `sk_live_...`.
4. [ ] Trigger Production redeploy (or wait for deploy hook) after env changes.
5. [ ] Leave Preview / local test env on `sk_test_...` unless explicitly approved otherwise.
6. [ ] Run production smoke sequence (§9) before announcing live billing.

---

## 8. Customer Portal live configuration checklist

Live Customer Portal must be configured **separately** from test mode.

- [ ] Portal enabled in Stripe **live mode**.
- [ ] Branding and business information reviewed (customer-facing, non-clinical).
- [ ] Return URL behaviour compatible with app (`/?billing=return` on production origin).
- [ ] Cancellation behaviour reviewed (entitlement lapse → webhook → `wayfinder` / `expired` path).
- [ ] Plan switching / price updates reviewed:
  - [ ] Upgrades may apply per Stripe rules.
  - [ ] Downgrades / interval changes may schedule at **next renewal** — app copy (PR #154) already explains current plan stays until Stripe confirms.
- [ ] Allowed products/prices in live Portal match intended live catalog only.
- [ ] Connect → Plus downgrade behaviour understood (subscription schedule / future phase).
- [ ] No privacy feature monetised or framed as paid-only in Portal copy.
- [ ] Connect disclaimer remains accurate: parent-controlled, not therapy/diagnosis/emergency/crisis, nothing automatic.

---

## 9. Production smoke test sequence (future live cutover)

Run only when Rodney explicitly approves live activation.

1. [ ] Confirm Production deploy healthy **before** payment cutover (dashboard, auth, journal).
2. [ ] Verified parent can sign in; unverified email still blocked.
3. [ ] Dashboard loads — Parent ID, children, activities, reflections.
4. [ ] Parent ID / Child ID display unchanged; no Supabase UUID or email in normal UI.
5. [ ] Journal Trail readable; existing saves unchanged.
6. [ ] Plans page loads; privacy baseline copy visible.
7. [ ] Checkout opens **live** Stripe Checkout with correct live product/price naming.
8. [ ] Complete **one controlled live transaction** with real payment method (owner-approved test account only).
9. [ ] Stripe live webhook received → `processed` (not skipped).
10. [ ] Supabase entitlement sync updates **expected user only** (`plan_key`, `subscription_status`, `last_entitlement_sync_at`).
11. [ ] `stripe_billing_references` row written server-side (no manual insert).
12. [ ] Plans page reflects entitlement after refresh (webhook source of truth).
13. [ ] Manage billing opens live Customer Portal.
14. [ ] Portal plan update / scheduled downgrade: current plan remains until Stripe applies future phase; copy still accurate.
15. [ ] No parent email, Supabase UUID, child names, JWTs, tokens, Stripe secrets, or raw billing internals in normal UI.
16. [ ] Sign out / sign in still works.
17. [ ] Rollback path confirmed available (§10).

Do **not** retry old failed sandbox webhook events during live smoke.

---

## 10. Rollback plan back to sandbox / test

If live collection must be paused:

1. [ ] Decision recorded — owner operator + Rodney approval.
2. [ ] Revert Vercel **Production** env vars to documented **sandbox/test** values (`sk_test_...`, test `whsec_...`, test `price_...` IDs) if intentional stop of live collection.
3. [ ] Redeploy Production after env revert.
4. [ ] Disable or pause **live** Stripe webhook endpoint in Dashboard if needed to stop live deliveries.
5. [ ] Do **not** manually edit `user_entitlements` unless separate reviewed admin/support procedure exists.
6. [ ] Do **not** manually edit `stripe_billing_references` rows.
7. [ ] Do **not** casually delete Stripe live customers/subscriptions — preserve audit trail.
8. [ ] If rollback occurs after real customer payment, handle subscription/customer communication **outside** code changes (support process).
9. [ ] Re-run production smoke (auth, dashboard, journal, Plans display) after rollback.
10. [ ] Confirm sandbox Checkout path still works if test env restored.

---

## 11. Data safety notes

- Stripe live customer IDs, subscription IDs, price IDs, and webhook payloads remain **server-side / database-side** as designed (`stripe_billing_references`, webhook RPCs).
- Never expose Stripe secrets, service-role keys, or webhook signing secrets in browser code, normal UI, or public docs.
- Never bypass RLS or write entitlements from the browser.
- Never manually patch user entitlements or billing rows as part of normal cutover or rollback.
- Preserve existing flow: Checkout/Portal creation → Stripe → webhook → `sync_parent_entitlement_from_stripe`.
- Preserve auth, `ensure_profile`, email verification, and dashboard read paths.
- Keep **test mode** and **live mode** Stripe objects, env vars, and mental model separate.
- Treat all billing identifiers as sensitive operational data — share only on need-to-know secure channels.

---

## 12. What must remain unchanged

Live cutover must **not** weaken:

| System | Requirement |
| --- | --- |
| Supabase auth | Unchanged |
| RLS | Unchanged |
| Email verification gate | Unchanged |
| `ensure_profile` / explicit Bearer paths | Unchanged |
| Parent ID / Child ID logic | Unchanged |
| Journal save/read | Unchanged |
| Dashboard loading | Unchanged |
| Privacy masking in normal UI | Unchanged |
| Deployment safety | App must remain deployable |
| ALIGN/CAB canon | Non-diagnostic, non-blaming language |
| Privacy baseline | Included in every plan — not a paid tier |
| Save gating | Not introduced as part of Stripe live cutover |
| MHP runtime / portrait privacy boundaries | Unchanged |

---

## 13. Launch decision gate

**Live Stripe activation must not proceed until all are true:**

- [ ] Live Stripe products and prices reviewed and created in **live mode**
- [ ] Live Price IDs mapped to env vars (placeholders verified → real values in Vercel only at cutover)
- [ ] Vercel Production env var values prepared and **double-checked**
- [ ] Approved runtime PR deployed to accept `sk_live_...` and process livemode webhooks
- [ ] Live webhook endpoint configured with correct events
- [ ] Live `STRIPE_WEBHOOK_SECRET` recorded securely
- [ ] Live Customer Portal configured and reviewed
- [ ] Rollback plan understood (§10)
- [ ] Production smoke test owner assigned (§9)
- [ ] Support / customer communication plan ready for billing questions
- [ ] **Rodney explicitly approves live activation**

Until then: **remain on sandbox/test mode** (`sk_test_...`).

---

## Cross-links

- [STRIPE_FOUNDATION_SETUP_PLAN.md](./STRIPE_FOUNDATION_SETUP_PLAN.md) — architecture, env vars, webhook design
- [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md) — pricing, privacy baseline, monetised value
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) — merge / smoke tracking

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-07 | PR #155 — initial live-readiness and cutover checklist (docs only) |
