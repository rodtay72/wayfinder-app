# Post-Live Monitoring and Support FAQ

**Status:** Docs-only post-live operations and support guide

**Scope:** Daily monitoring, Stripe webhook checks, billing support FAQ, legacy Plus policy reminder, language toggle planning pointer

**Last updated:** 2026-07-10

**Related PR:** #161 (docs only)

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md)
- [STRIPE_PRE_LIVE_EVIDENCE_PACK.md](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md)
- [STRIPE_LEGACY_PLUS_MIGRATION_SUPPORT_PROCEDURE.md](./STRIPE_LEGACY_PLUS_MIGRATION_SUPPORT_PROCEDURE.md)
- [LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md](./LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md)

**Privacy rule:** Do not record parent emails, child names, Supabase UUIDs, JWTs, Stripe customer/subscription IDs, live Price IDs, webhook secrets, Portal URLs, event IDs, or reflection content in monitoring notes or support tickets.

---

## 1. Current production state

| Area | Status |
| --- | --- |
| Live Stripe on Production | **Active** |
| Live Checkout / webhook / Billing Portal smoke | **Passed** |
| Billing Portal shared-device safety copy | Live (PR #159) |
| Legacy Plus support procedure | [STRIPE_LEGACY_PLUS_MIGRATION_SUPPORT_PROCEDURE.md](./STRIPE_LEGACY_PLUS_MIGRATION_SUPPORT_PROCEDURE.md) (PR #160, merged) |
| Legacy Plus migration **implementation** | **Deferred** |
| Privacy | Baseline across **all** plans — not a paid feature |
| Save gating | **Not introduced** |
| Auth, RLS, email verification, `ensure_profile` | Protected |
| Parent ID / Child ID | Protected |
| Journal save/read, dashboard loading | Protected |

Wayfinder remains ALIGN/CAB parent-development support — not child diagnosis, behaviour labelling, or generic Behaviour → Advice.

---

## 2. Daily post-live monitoring checklist

Use **non-identifying notes only**. Complements [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) §6–§12 (authenticated smoke remains required after user-facing merges).

- [ ] Production site loads.
- [ ] Verified parent sign-in works.
- [ ] Dashboard loads.
- [ ] Journal Trail loads.
- [ ] Decode / reflection save and read still work.
- [ ] Plans page loads.
- [ ] Checkout opens only for valid signed-in verified parent.
- [ ] Webhook deliveries show HTTP 200 where expected.
- [ ] Vercel logs show no repeated checkout/webhook failures.
- [ ] Notes contain **no** secrets, parent emails, Stripe IDs, Supabase UUIDs, JWTs, child names, or reflection content.
- [ ] Billing Portal session safety understood: on shared devices, sign out, close browser window, clear history/site data if needed.

---

## 3. Stripe webhook monitoring checklist

Record only **non-sensitive summaries**:

| Field | Allowed |
| --- | --- |
| Date/time checked | Yes |
| Event type (generic) | Optional |
| Outcome category | `processed` / `skipped` / `duplicate` / `failed` only |
| Event IDs, customer IDs, subscription IDs, emails, Portal URLs | **No** |

**Escalate if:**

- repeated webhook failures
- invalid signature
- repeated `unresolvable_user_id`
- mode mismatch after live cutover
- unknown live Price ID
- entitlement not updating after confirmed Checkout

Verify billing state from webhook-synced entitlement — not from browser redirect or Portal return alone.

---

## 4. Billing support FAQ

### Q: I paid but my plan has not updated yet.

**A:** Stripe confirmation may take a moment. Ask the parent to refresh Plans after a few minutes. If it still does not update, support should check webhook outcome categories in operator logs **without** recording raw Stripe IDs in tickets.

### Q: I cancelled Checkout.

**A:** No changes were made. The parent can try again when ready.

### Q: Why does Billing Portal remain accessible after I sign out?

**A:** Stripe billing is hosted by Stripe in the browser. Wayfinder sign-out does not automatically close an open Stripe billing page. On shared devices, return to Wayfinder, sign out, close the browser window, and clear browser history or site data if needed.

### Q: Why can I see Plus but Manage Billing says there is no billing account?

**A:** This may happen for **legacy Plus** accounts set up before live Stripe billing was connected. Current Plus access remains unchanged. Billing migration is **deferred** until a safe Wayfinder-controlled path is implemented. See [STRIPE_LEGACY_PLUS_MIGRATION_SUPPORT_PROCEDURE.md](./STRIPE_LEGACY_PLUS_MIGRATION_SUPPORT_PROCEDURE.md). Known public example: Parent ID **P-44947**.

### Q: Is privacy only for paid users?

**A:** No. Privacy is a **baseline promise across all plans**. Wayfinder does not sell data or use ads.

### Q: Is Connect therapy or emergency support?

**A:** No. Connect is optional, parent-controlled Mental Health Professional review support. It is not therapy, diagnosis, emergency care, or crisis support.

### Q: Should support manually link my Stripe account?

**A:** No. Manual billing linkage is **not allowed**. Billing linkage must happen only through reviewed Wayfinder-controlled processes (future migration Checkout — separate implementation PR).

---

## 5. Legacy Plus current policy

- Legacy Plus **migration implementation is deferred**.
- **Grandfather** existing legacy Plus access (default).
- Do **not** force downgrade to Free.
- Do **not** manually link billing.
- Do **not** manually edit `user_entitlements` or `stripe_billing_references`.
- Do **not** ask the parent to create a new account.
- **P-44947** remains the known public example — not a live cutover blocker.

Full procedure: [STRIPE_LEGACY_PLUS_MIGRATION_SUPPORT_PROCEDURE.md](./STRIPE_LEGACY_PLUS_MIGRATION_SUPPORT_PROCEDURE.md).

---

## 6. Language toggle planning status

From [LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md](./LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md) — **post-live planning update (PR #161):**

- **Simplified Chinese (`zh-Hans`)** remains the priority additional language.
- Language toggle is **planned**, not part of live billing stabilisation.
- **First runtime implementation** should translate **static UI/product copy only**.
- Do **not** translate saved journal entries, Decode reflections, child names, MHP feedback text, research exports, or Stripe-hosted receipts/invoices.
- **No external translation API** for private parent content.
- Language preference is **not** a paid feature.
- Preserve ALIGN/CAB meaning and non-diagnostic language in both English and zh-Hans.
- **Recommended next build** after launch polish: language toggle foundation for static copy (separate runtime PR).

---

## 7. Support escalation rules

**Escalate and stop** if:

- user identity is uncertain
- parent asks support to handle raw Stripe IDs or Portal URLs
- billing appears linked to the wrong parent
- webhook shows `unresolvable_user_id`
- any support action would affect auth, RLS, Parent ID, Child ID, journal save/read, dashboard loading, privacy masking, or `stripe_billing_references`
- parent reports payment proof but Wayfinder has no safe mapping

---

## 8. What not to do

Do **not**:

- paste Stripe Portal URLs
- record emails, Supabase UUIDs, JWTs, child names, reflection content, Stripe customer/subscription IDs, live Price IDs, or webhook secrets
- manually patch entitlements
- manually patch `stripe_billing_references`
- change Stripe Dashboard subscriptions for migration
- promise a billing migration date
- imply child diagnosis or therapy
- say privacy is paid-only

---

## Cross-links

- [LAUNCH_OPERATOR_RUNBOOK.md](./LAUNCH_OPERATOR_RUNBOOK.md) — manual authenticated smoke scripts
- [PLATFORM_SYNC_STRIPE_LIVE_CUTOVER_BRIEF.md](./PLATFORM_SYNC_STRIPE_LIVE_CUTOVER_BRIEF.md) — cross-platform handoff
- [STRIPE_PRE_LIVE_EVIDENCE_PACK.md](./STRIPE_PRE_LIVE_EVIDENCE_PACK.md) — live cutover evidence

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-10 | PR #161 — initial post-live monitoring and support FAQ (docs only) |
| 2026-07-11 | PR #162 — parent-facing Plans/Dashboard copy polish; see [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) |
