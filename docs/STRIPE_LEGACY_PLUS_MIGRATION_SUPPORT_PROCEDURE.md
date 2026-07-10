# Stripe Legacy Plus Migration Support Procedure

**Status:** Reviewed support procedure (docs only) — **no migration implemented in this document**

**Scope:** How Wayfinder handles pre-payment-gateway Plus users who may have Wayfinder Plus entitlement without a linked live Stripe customer/subscription in `stripe_billing_references`

**Last updated:** 2026-07-10

**Related PR:** #160 (docs only)

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [STRIPE_PRE_LIVE_EVIDENCE_PACK.md](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md)
- [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md)
- [PLATFORM_SYNC_STRIPE_LIVE_CUTOVER_BRIEF.md](./PLATFORM_SYNC_STRIPE_LIVE_CUTOVER_BRIEF.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)

**Privacy rule:** Do not record parent emails, Stripe customer IDs, subscription IDs, Supabase UUIDs, child names, JWTs, webhook secrets, Portal URLs, or live Price IDs in support notes or this procedure.

---

## 1. Status

| Statement | Current state |
| --- | --- |
| Live Stripe on Production | **Active** |
| New Free parent subscription path | Live Checkout + webhook sync |
| Webhook-driven entitlement sync | **Active** |
| Legacy Plus users | May have Wayfinder Plus entitlement **without** linked Stripe billing reference |
| Known public example | Parent ID **P-44947** |
| Live cutover blocker? | **No** |
| Auth/RLS bug if Portal blocked? | **No** — “No billing account found yet.” is expected when no `stripe_billing_references` row exists |

Wayfinder remains ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, or generic Behaviour → Advice. Privacy is a **baseline promise across every plan**, not a paid feature.

**This PR (#160) does not implement migration code, SQL, API changes, manual data edits, or Stripe Dashboard changes.**

---

## 2. Definition: legacy Plus user

A **legacy Plus user** is a parent account where:

1. Wayfinder shows **Plus** (or Connect) entitlement in the app, **and**
2. The account does **not** have a linked live Stripe customer/subscription in `stripe_billing_references`, **and**
3. **Billing Portal cannot open** from inside Wayfinder because there is no billing reference (server returns a safe “no billing account” response).

**Migrated classification rule:** Do **not** classify a user as migrated unless a **webhook-synced** Stripe billing reference exists in `stripe_billing_references` (created/updated through normal webhook processing — not manual support edits).

---

## 3. Non-negotiable safety rules

- Do **not** manually edit `user_entitlements` during routine support.
- Do **not** manually insert or update `stripe_billing_references`.
- Do **not** paste or store Stripe Portal session URLs.
- Do **not** use Billing Portal access as proof of identity.
- Do **not** create Stripe Dashboard subscriptions manually unless a **separate reviewed admin procedure** exists and metadata/linkage is proven safe.
- Do **not** expose Stripe customer IDs, subscription IDs, live Price IDs, parent emails, child names, Supabase UUIDs, JWTs, or webhook secrets in docs or support notes.
- Billing state must be verified using **webhook-synced entitlement** and **Stripe records** (operator tools — not pasted into tickets).
- Parent reflection history and **journal records must not be changed** as part of billing migration.

Entitlement updates remain **webhook-driven**; browser redirect or Portal return alone must not be treated as proof of plan change.

---

## 4. Current P-44947 evidence

| Item | Record |
| --- | --- |
| Account type | Legacy pre-payment-gateway Plus |
| Fresh-session Manage Billing test | **Passed (expected)** |
| Billing Portal from Wayfinder | Did **not** open |
| Portal session URL issued | **No** |
| Server requirement | `stripe_billing_references.stripe_customer_id` before Portal creation |
| Manage Billing button | May appear due to Plus entitlement display |
| Portal creation | Correctly **blocked** without billing reference |
| Classification | Migration/support case — **not** a live cutover blocker |

Full post-cutover context: [STRIPE_PRE_LIVE_EVIDENCE_PACK.md — Post-cutover operational findings](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md#post-cutover-operational-findings).

---

## 5. Recommended default support stance

**For now (default):**

- Keep legacy Plus access **unchanged**.
- Do **not** disrupt the parent’s access.
- Do **not** force downgrade to Free.
- Do **not** manually link billing.
- Tell the parent that their **current Plus access remains active**, but billing management is **not yet connected** to Stripe.
- Offer a reviewed migration path **only after** this procedure is approved and any migration UI/flow is implemented in a separate PR.

---

## 6. Parent-facing support wording

Use wording like:

> Your current Wayfinder Plus access remains active. Because your account was set up before live Stripe billing was connected, billing management is not yet linked to Stripe. Your reflection history and Wayfinder access are unchanged. We will guide you through a safe Stripe billing setup when the migration path is ready.

**Avoid wording that implies:**

- the child is the issue
- privacy depends on payment
- the parent must immediately pay again
- Wayfinder lost the subscription
- support will manually patch billing IDs

---

## 7. Approved migration options

### Option A — Grandfather temporarily (default)

- Keep Plus entitlement as-is.
- No Billing Portal.
- No Stripe customer/subscription linkage.
- Use this as the **default** until a migration flow exists.

### Option B — Parent-initiated Stripe migration (future build)

Requires a **separate implementation PR**. Not available in PR #160.

- Build a safe “Activate Stripe billing” or “Move billing to Stripe” path for legacy Plus users.
- Parent must be signed in and email-verified.
- Checkout must be created by Wayfinder API (`POST /api/create-checkout-session`), not manually in Stripe Dashboard.
- Checkout must include `wayfinder_user_id` metadata and `client_reference_id`.
- Webhook must create/update `stripe_billing_references` via existing RPCs.
- Billing Portal should open **only after** webhook sync confirms Stripe customer/subscription linkage.
- Parent chooses monthly/yearly through approved live Price IDs (env-configured — never hard-coded in docs).

### Option C — Admin-assisted migration (future reviewed procedure only)

**Not allowed for routine support yet.**

- Only if a **separate reviewed support/admin procedure** exists beyond this document.
- Must define exact metadata requirements.
- Must prove webhook can resolve the user safely (`wayfinder_user_id`, profile match).
- Must include owner approval, rollback, and audit notes.

---

## 8. Explicitly rejected approaches

Do **not**:

- Manually paste customer/subscription IDs into Supabase.
- Manually edit entitlements to force a migration.
- Create Stripe subscriptions in Dashboard without proven metadata/linkage.
- Tell the parent to create a new account.
- Delete or recreate parent profile.
- Change Parent ID or Child ID.
- Alter journal entries.
- Bypass email verification.
- Weaken RLS or service-role boundaries.

---

## 9. Future implementation recommendation

The safest later implementation is a **Wayfinder-controlled legacy migration Checkout**:

1. Detect legacy Plus/Connect entitlement **without** `stripe_billing_references`.
2. Show “Move billing to Stripe” or “Activate billing management” on Plans (copy review required — ALIGN/CAB, non-blaming).
3. Let parent choose monthly/yearly.
4. Call `create-checkout-session` with a documented migration purpose in metadata.
5. Include `wayfinder_user_id` and `wayfinder_plan_key` metadata (existing checkout patterns).
6. Wait for webhook sync (`livemode: true`, outcome `processed`).
7. Show Billing Portal **only after** linked billing reference exists.

This must be a **separate PR** after PR #160 is merged and owner approves building the flow.

---

## 10. Stop conditions

**Stop and escalate** if:

- Parent ID does not match expected account.
- Parent email or identity is uncertain.
- Stripe shows an active subscription but Wayfinder has no safe mapping.
- Webhook logs show `unresolvable_user_id`.
- Stripe customer/subscription belongs to another parent.
- Support is asked to paste Portal URLs or raw billing IDs.
- Any migration would require manual `user_entitlements` or `stripe_billing_references` edits.
- Any action would affect journal save/read, Parent ID, Child ID, auth, RLS, or privacy masking.

---

## 11. Support checklist

Before responding to a legacy Plus parent:

- [ ] Confirm parent is signed in and email-verified.
- [ ] Confirm visible Parent ID (e.g. P-44947 pattern — public Wayfinder ID only).
- [ ] Confirm current Wayfinder plan display on Plans/Dashboard.
- [ ] Confirm Billing Portal result (blocked without billing reference is **expected** for legacy Plus).
- [ ] Do **not** request or paste Stripe Portal URLs.
- [ ] Do **not** record raw billing IDs in tickets or docs.
- [ ] If no linked billing reference exists, classify as **legacy Plus**.
- [ ] Use parent-facing support wording (§6).
- [ ] Do **not** change account data.
- [ ] Escalate if parent has proof of payment that is not reflected in Wayfinder.

---

## Cross-links

- [STRIPE_PRE_LIVE_EVIDENCE_PACK.md](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md) — live cutover and P-44947 evidence
- [STRIPE_LIVE_READINESS_CUTOVER_PLAN.md](./STRIPE_LIVE_READINESS_CUTOVER_PLAN.md) — cutover and rollback operator plan
- [STRIPE_FOUNDATION_SETUP_PLAN.md](./STRIPE_FOUNDATION_SETUP_PLAN.md) — webhook and billing architecture
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) — merge and blocker tracking

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-10 | PR #160 — initial legacy Plus migration/support procedure (docs only) |
