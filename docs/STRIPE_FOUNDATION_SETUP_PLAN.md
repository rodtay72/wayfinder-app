# Stripe Foundation Setup Plan

**Status:** Planning spec for PR #144 — docs only
**Scope:** Prepare Wayfinder for future Stripe integration without activating payment runtime or entitlement enforcement
**Last updated:** 2026-07-05

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md)
- [supabase-pricing-entitlement-foundation.sql](../supabase-pricing-entitlement-foundation.sql) (PR #143 — applied)
- [supabase-pr146-free-trial-entitlement-correction.sql](../supabase-pr146-free-trial-entitlement-correction.sql) (PR #146 — applied)
- [supabase-pr148-stripe-entitlement-sync-foundation.sql](../supabase-pr148-stripe-entitlement-sync-foundation.sql) (PR #148 — owner apply after merge)

---

## 1. Purpose

PR #144 documents how Wayfinder will integrate Stripe **later**, after entitlement persistence (PR #143) is live. This PR does **not** implement Checkout, webhooks, Customer Portal sessions, feature gates, or deployment changes.

Wayfinder is ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, generic Behaviour → Advice, or a therapy marketplace. Payment copy and integration must preserve that framing.

---

## 2. Current state (post–PR #146)

| Area | Status |
| --- | --- |
| Supabase plan | **Pro** (owner upgraded) |
| Vercel plan | **Pro** (owner upgraded) |
| `user_entitlements` + `usage_counters` | Applied in Supabase |
| PR #146 free-trial SQL | **Applied** — Backfill Policy B |
| Parent default tier | `plan_key = wayfinder`, `subscription_status = free`, `monthly_save_limit = NULL`, 30-day trial via `current_period_start` / `current_period_end` |
| Browser entitlement access | Read-only via RLS + `get_current_user_entitlement()` |
| Plans page | Display-only; no checkout buttons |
| Feature gating / trial-expiry enforcement | **Not active** |
| Journal read access | Unchanged — existing saved reflections remain readable |
| Stripe runtime | **Test-mode only** — PR #145 `/api/create-checkout-session` (`sk_test_...`); **no live Stripe activation** |
| Stripe webhook | **PR #149 in flight (Draft)** — `/api/stripe-webhook.js` calls PR #148 RPCs; test-mode only; owner webhook + E2E smoke pending |
| Stripe Customer Portal / billing UI | **Not active** |
| Stripe billing ID storage | **PR #148** — `stripe_billing_references` (server-only; not on parent-readable `user_entitlements`) |

---

## 3. Adopted pricing model

| Plan | Price | Saves | Progress tracker | MHP review |
| --- | --- | --- | --- | --- |
| **Wayfinder** | Free, no card — 30-day trial | Unlimited during trial; new saves blocked after trial expiry (future enforcement PR) | No | No |
| **Wayfinder Plus** | S$7.90/mo or S$69/yr | Unlimited | Yes | No |
| **Wayfinder Connect** | S$29.90/mo or S$299/yr | Unlimited | Yes | Yes — parent-controlled only; 1 included review request/month |

**Connect is not:** therapy, diagnosis, emergency care, or crisis support.

**Privacy baseline (all plans):** no ads, no data-selling, consent-led research only. Privacy is not a paid feature.

---

## 4. Architecture principle

```text
Stripe (billing source of truth for payments)
    ↓ webhook / trusted server-side sync only
Supabase user_entitlements (Wayfinder app source of truth for access decisions)
    ↓ read-only RPC / RLS SELECT
Parent app (never decides paid access from localStorage or client flags)
```

- **Stripe** owns card data, invoices, and subscription lifecycle in Stripe-hosted UI.
- **Wayfinder** owns entitlement fields the app reads (`plan_key`, `subscription_status`, limits, flags).
- **Browser** never holds Stripe secret keys, webhook secrets, or service-role keys.
- **Entitlement writes** happen only through trusted server-side paths (future webhook handler using service role or SECURITY DEFINER RPC approved in a later SQL PR).

---

## 5. Intended Stripe integration shape

### 5.1 Stripe-hosted Checkout (future)

For **Wayfinder Plus** and **Wayfinder Connect** only:

1. Parent is authenticated in Wayfinder (verified Supabase session).
2. Parent taps upgrade on Plans page (future PR — not PR #144).
3. Browser calls Wayfinder serverless endpoint with Bearer token (no Stripe secret in browser).
4. Server validates parent identity, resolves/creates Stripe Customer server-side.
5. Server creates [Stripe Checkout Session](https://docs.stripe.com/payments/checkout) in `subscription` mode with the correct Price ID.
6. Browser redirects to Stripe-hosted Checkout.
7. On success, Stripe redirects to `APP_BASE_URL` success URL; **entitlement update waits for webhook** (do not trust redirect alone).

Wayfinder Free (`wayfinder`) remains a **no-card** tier — not a Stripe product.

### 5.2 Stripe Customer Portal (future)

For billing self-service:

1. Authenticated parent requests portal session from serverless endpoint.
2. Server creates [Billing Portal Session](https://docs.stripe.com/customer-management/portal-deep-dive) for the stored `stripe_customer_id`.
3. Parent manages payment method, invoices, cancellation, or plan changes on Stripe-hosted pages.
4. Entitlement updates flow through webhooks only.

### 5.3 Serverless API only

All Stripe SDK usage stays in Vercel serverless functions under `api/`, following existing patterns ([`api/_supabase-admin.js`](../api/_supabase-admin.js), [`api/mhp-generate-portrait.js`](../api/mhp-generate-portrait.js)).

Never import Stripe secret key into `app.js`, `supabase.js`, or static browser bundles.

---

## 6. Proposed future API endpoints

### 6.1 `api/create-checkout-session.js`

**PR #145 complete (merged):** Test-mode Checkout Session creation is implemented server-side on main. Requires `sk_test_...` and test Price IDs on preview/test deployments. Returns `{ url }` for Stripe-hosted Checkout. Owner preview + production smoke **PASS**. **No entitlement writes, no webhook, no UI checkout buttons, no gating.**

**Method:** POST
**Auth:** `Authorization: Bearer <supabase_access_token>` — verify session server-side before creating Checkout.

**Request body (conceptual):**

```json
{
  "planKey": "wayfinder_plus",
  "interval": "monthly"
}
```

**Behaviour:**

- Reject non-parent roles.
- Map `planKey` + `interval` → env Price ID (`STRIPE_PRICE_PLUS_MONTHLY`, etc.).
- Resolve Wayfinder user via token → `auth.users.id` → `profiles.parent_id` (Wayfinder ID for logs only; not parent-facing).
- Lookup or create Stripe Customer; persist `stripe_customer_id` server-side (future column — see §9).
- Set Checkout Session `client_reference_id` or metadata with **server-owned** internal reference (see §8).
- Return `{ url }` for browser redirect.

**Must not:** accept raw email as sole identity key; expose secret key; write entitlements directly from this handler (webhook owns activation).

### 6.2 `api/create-billing-portal-session.js`

**Method:** POST
**Auth:** Bearer token required.

**Behaviour:**

- Verify parent session.
- Require existing `stripe_customer_id` on entitlement/billing record.
- Create Portal Session; return `{ url }`.

### 6.3 `api/stripe-webhook.js`

**PR #149 in flight (Draft):** Test-mode webhook handler implemented server-side. **POST only**, no CORS, no browser auth. Requires `STRIPE_WEBHOOK_SECRET`, `sk_test_...`, price env vars, and Supabase service role. Verifies `Stripe-Signature` on **raw body** (`export const config = { api: { bodyParser: false } }`). Calls PR #148 RPCs (`claim_stripe_webhook_event`, `mark_stripe_webhook_event_outcome`, `sync_parent_entitlement_from_stripe`) via service role. Idempotency: claim → process → mark outcome; **release claim** via service-role DELETE on retryable failure (HTTP 500). Livemode events skipped with 200. No Stripe SDK — `node:crypto` + `fetch` only.

**Method:** POST
**Auth:** Stripe signature verification via `STRIPE_WEBHOOK_SECRET` — **no** Bearer token; raw body required for signature check.

**Behaviour:**

- Verify `Stripe-Signature` header on raw body before JSON parse.
- Idempotent event processing via `claim_stripe_webhook_event` + outcome marking.
- Price-canonical plan mapping from env Price IDs; metadata cross-check only.
- Map subscription/price → `user_entitlements` update via `sync_parent_entitlement_from_stripe`.
- Never log full card details, journal content, parent reflection text, Stripe IDs, or metadata values.

**Handled events (test mode):**

| Event | Action |
| --- | --- |
| `checkout.session.completed` | Link customer/subscription; initial entitlement sync if subscription mode |
| `customer.subscription.created` | Map price → plan; set active entitlement row |
| `customer.subscription.updated` | Plan change, renewal period, status transitions |
| `customer.subscription.deleted` | Downgrade to Wayfinder expired (no journal deletion) |
| `invoice.payment_succeeded` | Confirm active/trialing period |
| `invoice.payment_failed` | Set `past_due`; do not hide existing saves |

**Owner setup (after PR #149 merge):** Stripe Dashboard test-mode webhook → `https://wayfinder-modular.vercel.app/api/stripe-webhook`; copy signing secret to Vercel `STRIPE_WEBHOOK_SECRET`. Mandatory E2E: PR #145 Checkout → complete test payment → verify entitlement sync.

---

## 7. Proposed Vercel environment variables

Document only in PR #144 — set in Vercel Dashboard when runtime PR deploys.

| Variable | Purpose | Browser exposure |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Stripe API (server only) | **Never** |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | **Never** |
| `STRIPE_PRICE_PLUS_MONTHLY` | Price ID for Plus monthly | **Never** |
| `STRIPE_PRICE_PLUS_YEARLY` | Price ID for Plus yearly | **Never** |
| `STRIPE_PRICE_CONNECT_MONTHLY` | Price ID for Connect monthly | **Never** |
| `STRIPE_PRICE_CONNECT_YEARLY` | Price ID for Connect yearly | **Never** |
| `APP_BASE_URL` | Checkout/Portal success/cancel URLs (e.g. `https://wayfinder-modular.vercel.app`) | Public origin only |
| `SUPABASE_URL` | Already used by API routes | Anon URL is public; service use server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook entitlement writes (server only) | **Never** |

Existing public vars (`SUPABASE_ANON_KEY`) remain unchanged. Do not add Stripe publishable key until Checkout Elements are needed; first launch uses **redirect Checkout** (hosted page).

---

## 8. Safe metadata and identity mapping

### 8.1 Rules

- Do **not** rely on email alone for entitlement updates (email can change; invites differ).
- Primary identity chain: Stripe Customer ↔ stored `stripe_customer_id` ↔ `auth.users.id` ↔ `user_entitlements.user_id`.
- Use verified Supabase session on Checkout/Portal **creation**; use Stripe subscription/customer IDs on **webhook** reconciliation.
- Do **not** expose Supabase UUIDs, JWTs, refresh tokens, anon keys, service keys, or Stripe secrets in normal parent UI.
- Parent-facing UI may show **Wayfinder ID** (`profiles.parent_id`) where already permitted — not billing tokens.

### 8.2 Allowed Stripe metadata (subject to legal/privacy review)

| Field | Example | Notes |
| --- | --- | --- |
| `wayfinder_plan_key` | `wayfinder_plus` | Internal plan code |
| `wayfinder_user_id` | auth user UUID | Server reconciliation only; not shown in UI |
| `wayfinder_parent_id` | `P-XXXXX` | Optional; Wayfinder ID for support logs |
| `checkout_purpose` | `subscription_upgrade` | Non-sensitive |

### 8.3 Forbidden in Stripe metadata

- Child names or child IDs
- Journal / Decode / CAB reflection content
- MHP source photo paths, portrait storage paths, `photo_url`
- Research participation notes
- Service-role keys, webhook secrets, JWTs

Stripe Customer **email** may exist for Stripe billing communications — that is Stripe's billing record, not Wayfinder's entitlement key.

---

## 9. Schema additions (PR #148 — SQL foundation)

PR #148 adds server-only Stripe sync persistence. **Owner apply required** after merge.

**Parent-readable `user_entitlements` (PR #143 + PR #146 unchanged except):**

- `last_entitlement_sync_at timestamptz` — non-identifying sync timestamp only
- **No** `stripe_customer_id` or `stripe_subscription_id` on this table (privacy: authenticated SELECT must not expose Stripe billing IDs)

**Server-only `stripe_billing_references`:**

| Column | Purpose |
| --- | --- |
| `user_id` | PK → `auth.users.id` |
| `stripe_customer_id` | Stripe Customer for Portal / re-subscribe |
| `stripe_subscription_id` | Active subscription ID (cleared on lapse) |
| `created_at` / `updated_at` | Audit |

RLS enabled; **no** grants to `anon` or `authenticated`.

**Server-only `stripe_webhook_events`:**

| Column | Purpose |
| --- | --- |
| `stripe_event_id` | PK — idempotency |
| `event_type` | Stripe event type |
| `livemode` | Reject live events in test-mode phase |
| `outcome` | `claimed`, `processed`, `duplicate`, `skipped`, `failed` |
| `processed_at` | Timestamp |

No raw Stripe JSON, email, metadata blobs, journal/CAB/child data.

**RPCs (service_role EXECUTE only):**

- `claim_stripe_webhook_event(text, text, boolean)` → boolean
- `mark_stripe_webhook_event_outcome(text, text)` → void (`processed`, `skipped`, `failed`)
- `sync_parent_entitlement_from_stripe(uuid, text, text, text, text, timestamptz, timestamptz, boolean)` → entitlement row

`sync_parent_entitlement_from_stripe` allowed plan/status pairs: `wayfinder_plus`/`wayfinder_connect` + `trialing`|`active`|`past_due`|`canceled`; `wayfinder` + `expired` only (post-paid lapse). Rejects `free` and invalid combinations.

Browser remains **SELECT-only** on `user_entitlements` via existing RLS; no browser EXECUTE on sync RPCs.

**Webhook runtime (`api/stripe-webhook.js`)** — **PR #149 in flight (Draft)** after PR #148 SQL owner-applied.

---

## 10. Webhook event handling (PR #149 runtime — in flight)

All handlers must be **idempotent** and **signature-verified**. Implemented in [`api/stripe-webhook.js`](../api/stripe-webhook.js).

| Event | Intended action |
| --- | --- |
| `checkout.session.completed` | Link customer/subscription to user; initial entitlement sync if subscription mode |
| `customer.subscription.created` | Map price → plan; set active entitlement row |
| `customer.subscription.updated` | Plan change, renewal period, status transitions (`active`, `past_due`, etc.) |
| `customer.subscription.deleted` | Downgrade entitlement per §11 — **do not delete user data or journal rows** |
| `invoice.payment_succeeded` | Confirm active period; refresh `current_period_start` / `current_period_end` |
| `invoice.payment_failed` | Set `subscription_status = past_due` (or similar); **do not** hide existing saved reflections |

On unknown or duplicate events: log safely, return 200 after idempotent no-op where appropriate.

---

## 11. Entitlement mapping (webhook → `user_entitlements`)

### 11.1 Wayfinder Plus — active (monthly or yearly)

| Field | Value |
| --- | --- |
| `plan_key` | `wayfinder_plus` |
| `subscription_status` | `active` |
| `core_parent_app_access` | `true` |
| `monthly_save_limit` | `NULL` (unlimited) |
| `progress_tracker_enabled` | `true` |
| `mhp_review_enabled` | `false` |
| `included_mhp_reviews_per_month` | `0` |
| `current_period_start` / `current_period_end` | From Stripe subscription period |

### 11.2 Wayfinder Connect — active (monthly or yearly)

| Field | Value |
| --- | --- |
| `plan_key` | `wayfinder_connect` |
| `subscription_status` | `active` |
| `core_parent_app_access` | `true` |
| `monthly_save_limit` | `NULL` (unlimited) |
| `progress_tracker_enabled` | `true` |
| `mhp_review_enabled` | `true` |
| `included_mhp_reviews_per_month` | `1` |
| `current_period_start` / `current_period_end` | From Stripe subscription period |

### 11.3 Cancelled / lapsed / incomplete / unpaid

| Stripe-ish state | Suggested `subscription_status` | Entitlement behaviour (sync) | Data / read access |
| --- | --- | --- | --- |
| Subscription canceled at period end | `canceled` then revert at period end | At end: revert to Wayfinder Free fields (§11.4) | **Existing saved reflections remain readable** |
| Payment failed / past due | `past_due` | Keep paid plan flags until grace policy defined in enforcement PR | **Do not hide existing saves** |
| Incomplete checkout | (no change) | No entitlement upgrade until `checkout.session.completed` + subscription active | — |
| Unpaid / expired | `expired` | Revert to Wayfinder Free (§11.4) | **Do not delete rows** |

**Write/gating behaviour** when lapsed (e.g. block *new* saves after trial expiry or paid lapse) is deferred to a **separate enforcement PR** — not PR #144 or PR #146.

### 11.4 Revert to Wayfinder read-only (post-paid lapse)

When a paid subscription ends, revert to read-only Wayfinder — **do not grant a fresh 30-day trial**.

| Field | Value |
| --- | --- |
| `plan_key` | `wayfinder` |
| `subscription_status` | `expired` |
| `monthly_save_limit` | `NULL` |
| `progress_tracker_enabled` | `false` |
| `mhp_review_enabled` | `false` |
| `included_mhp_reviews_per_month` | `0` |
| `current_period_start` / `current_period_end` | Clear or leave ended; do not start a new Free trial window |

Clear or null `stripe_subscription_id` as appropriate; retain `stripe_customer_id` for Portal re-subscribe.

---

## 12. Product copy guardrails (ALIGN)

Payment and upgrade UI (future) must **not** imply:

- the child is the problem;
- payment improves the child;
- Connect is therapy, diagnosis, emergency, or crisis support;
- MHP review is automatic upon payment;
- privacy is unlocked by paying.

Preferred framing:

```text
Every Wayfinder plan is privacy-first. The difference is how much you can save, revisit, track your parent growth, and — only if you choose — share for Mental Health Professional review support.
```

---

## 13. Non-goals — PR #144 and this planning phase

PR #144 explicitly does **not**:

- Implement Stripe Checkout, Customer Portal, or webhook endpoints
- Add live checkout or “Manage billing” buttons
- Activate entitlement enforcement or trial-expiry save blocking
- Change journal save/read, dashboard loading, or existing reflection visibility
- Modify Supabase auth, RLS, `ensure_profile`, email verification, Parent/Child IDs
- Change MHP licence privacy, MHP publication rules, or active-membership journal-read gates
- Add Stripe secrets to repo, browser code, or normal UI
- Change Vercel deployment config (document variables only)

---

## 14. Recommended future build sequence (after PR #144)

1. **Owner:** Create Stripe Products + Prices (Plus/Connect monthly/yearly); store Price IDs in Vercel env.
2. **SQL PR #148:** `stripe_billing_references`, `stripe_webhook_events`, sync RPC — **merged and applied**.
3. **Runtime PR #149:** `api/stripe-webhook.js` + idempotency — **in flight (Draft)**; test-mode only.
4. **Runtime PR:** `create-billing-portal-session` (future).
5. **UX PR:** Plans page upgrade CTAs + success/cancel routes (still no client-side secrets).
6. **Enforcement PR:** Trial-expiry save blocking, progress tracker, MHP review gates — with read-access preservation for existing entries.

---

## 15. Owner checklist (pre-runtime)

- [ ] Stripe account in correct region/currency (SGD)
- [ ] Products: Wayfinder Plus, Wayfinder Connect
- [ ] Prices: S$7.90/mo, S$69/yr, S$29.90/mo, S$299/yr
- [ ] Webhook endpoint URL planned: `https://wayfinder-modular.vercel.app/api/stripe-webhook`
- [ ] Vercel env vars set (secrets server-only)
- [ ] Test mode smoke before live keys
- [ ] Legal/privacy review of checkout copy and Stripe metadata policy

---

## 16. References

- [Stripe Checkout subscriptions](https://docs.stripe.com/payments/checkout/build-subscriptions)
- [Stripe Billing subscription lifecycle](https://docs.stripe.com/billing/subscriptions/overview)
- [Stripe subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe Customer Portal](https://docs.stripe.com/customer-management/portal-deep-dive)
- Wayfinder: [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md)
- Wayfinder: [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md) — live cutover checklist (docs only; live not active)

---

**End of Stripe Foundation Setup Plan (PR #144 — docs only)**
