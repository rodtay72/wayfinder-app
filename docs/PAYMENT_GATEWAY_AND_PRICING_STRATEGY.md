# Payment Gateway And Pricing Strategy

## Status

PR #120 planning document.

This is a **docs-only strategy spec** for the next research/payment phase. It does not implement payment runtime, Stripe calls, entitlement tables, SQL/RLS, app gating, consent runtime, or parent-facing App Version notes.

## Product framing to preserve

Wayfinder is not a therapy marketplace, child-diagnosis app, behaviour-labelling app, or generic Behaviour -> Advice parenting app.

Payment must support the core Wayfinder outcome: parent emotional development and alignment capacity. The paid plans should help a parent continue reflecting on where their Cognition, Affect, and Behaviour (CAB) may not yet be aligned with the child's emerging need, then practise awareness, growth, repair, and next action.

The payment model must preserve the core pathway:

Behaviour -> Need -> Parent CAB -> Alignment Check -> Awareness -> Growth -> Navigate / Next Action

Payment gates must never imply that the child is the problem or that Wayfinder sells diagnoses, behaviour fixes, therapy sessions, or automatic professional access.

## Non-goals for PR #120

Do not implement any of the following in this PR:

- Stripe code
- Stripe environment variables
- checkout sessions
- webhook handlers
- Customer Portal runtime
- SQL migrations
- RLS policies
- entitlement tables
- app.js payment gates
- supabase.js payment helpers
- api/* payment endpoints
- content.js pricing copy
- styles.css upgrade UI
- App Version notes
- consent runtime changes
- MHP sharing runtime changes

## Recommended first payment architecture

Use **Stripe Checkout + Stripe Billing + Stripe Customer Portal** as the first payment gateway when runtime payment work begins.

Recommended division of responsibility:

| Layer | Responsibility | Wayfinder rule |
|-------|----------------|----------------|
| Stripe Checkout | Hosted upgrade / subscribe flow for Plus and Connected | Use hosted Checkout first to avoid building custom card collection UI |
| Stripe Billing | Subscription lifecycle, invoices, renewal status, failed-payment states | Treat Stripe as billing source of truth, but Wayfinder entitlement state must be server-verified |
| Stripe Customer Portal | Parent self-service billing management | Let parents manage plan, payment method, invoices, and cancellation in Stripe-hosted UI |
| Wayfinder server/API | Create checkout/portal sessions and receive webhooks | Never expose Stripe secret keys or webhook signing secrets to the browser |
| Wayfinder entitlement layer | Convert billing/trial state into app permissions | Preserve auth, RLS, parent_id, child_id, and journal read integrity |

Explorer should not be a Stripe subscription. Explorer is a no-card, app-level 30-day trial.

## Client-facing plan comparison

Use a feature-benefit comparison table instead of an abstract capability table.

Legend:

- **Unlocked** = available in that plan.
- **Limited** = available with the stated trial/read-only limit.
- **Locked** = not available in that plan.
- **Protected locked** = intentionally unavailable because privacy/control requires it to stay off.

| Features | Wayfinder | Wayfinder Plus | Wayfinder Connected |
|----------|-----------|----------------|---------------------|
| **Try Wayfinder without payment pressure** — parent can experience the ALIGN/CAB pathway before deciding | **Unlocked** — free 30-day Explorer access, no credit card | Included after upgrade | Included after upgrade |
| **Decode a Moment** — turn a confusing child behaviour into a possible need, parent CAB reflection, alignment check, and one next action | **Limited** — 3 saved Decode moments within 30 days | **Unlocked** — unlimited saved Decode moments | **Unlocked** — unlimited saved Decode moments |
| **Read existing saved reflections** — parent keeps access to their own history instead of losing it after trial | **Unlocked** — existing saved entries remain readable after trial/limit | **Unlocked** | **Unlocked** |
| **Unlimited saved Decode moments** — build a continuous record of alignment growth over time | **Locked** after 3 trial saves | **Unlocked** | **Unlocked** |
| **Full Journal Trail** — review past moments, possible needs, CAB patterns, growth capacities, next actions, and repair intentions | **Limited** — read own existing/trial entries; new saves limited | **Unlocked** | **Unlocked** |
| **Relationship Garden** — see relationship development cues and parent-child growth over time | **Locked** or preview-only until runtime decision | **Unlocked** | **Unlocked** |
| **52 Parent Growth Practices / 52 ALIGN Practices** — practise specific parent capacities such as pausing, staying curious, connecting before correcting, and repairing | **Unlocked** — access to practice interface during trial | **Unlocked** | **Unlocked** |
| **Practice save/history/progression** — track what the parent tried, repeated, and developed | **Locked** | **Unlocked** | **Unlocked** |
| **Privacy-safe parent reflection history** — keep a parent-owned developmental record without exposing private identifiers in normal UI | **Limited** — readable existing history | **Unlocked** | **Unlocked** |
| **Billing self-management** — manage subscription, payment method, invoices, or cancellation through Stripe Customer Portal | **Locked** — no billing account needed for free trial | **Unlocked** | **Unlocked** |
| **Published + visible + active MHP selector** — choose an approved professional support option when parent wants review support | **Locked** | **Locked** | **Unlocked** |
| **Selected approved MHP portrait display** — identify the selected professional using only the current approved portrait | **Locked** | **Locked** | **Unlocked** |
| **Parent-controlled MHP sharing/review support** — parent chooses what to share; nothing is sent automatically | **Locked** | **Locked** | **Unlocked** |
| **Automatic sharing to MHPs** — prevents unintended exposure of parent reflections | **Protected locked** — never automatic | **Protected locked** — never automatic | **Protected locked** — parent must choose what to share |
| **Source photo, generated portrait candidates, storage paths, Supabase UUIDs, `photo_url` exposure** — protects portrait/privacy boundaries | **Protected locked** | **Protected locked** | **Protected locked** |
| **Suggested price** | Free for 30 days | S$9.90/month or S$89/year | S$19.90/month or S$199/year |

## Client-facing value proposition

Client-safe positioning:

> Wayfinder is the missing layer between journaling, parenting tips, family organisation, and therapy. It helps a parent decode a real moment without blaming the child, notice the child's possible emerging need, locate their own CAB response, and choose one growth-oriented next action or repair step.

Do **not** claim that Wayfinder is universally better than every parenting, therapy, sleep, or wellness app. Claim that Wayfinder is better for this specific job:

> Helping a parent build alignment capacity in the moments where their child's behaviour may reveal a gap between the child's emerging need and the parent's Cognition, Affect, and Behaviour.

## Comparison with top adjacent apps

This comparison is for client positioning and investor/product narrative. It is not a clinical efficacy claim and does not position Wayfinder as a replacement for therapy, medical advice, crisis care, sleep consultation, or community support.

Representative adjacent apps reviewed for positioning:

| App | Category it represents | What it is good at | Where it stops | Why Wayfinder is better for the Wayfinder job |
|-----|------------------------|--------------------|----------------|-----------------------------------------------|
| **Huckleberry** | Baby/toddler sleep and routine support | Sleep tracking, nap timing, sleep support, and routine prediction | Focuses mainly on child sleep/routine optimisation | Wayfinder helps when the parent asks, "What was happening underneath this behaviour, what happened in me, and what repair/next action should I try?" |
| **BabyCenter** | Pregnancy/baby tracking and parenting information | Stage-based pregnancy/baby content, expert information, and parenting resources | Gives information and tracking, but not a structured parent CAB alignment record | Wayfinder converts a real parent-child moment into possible need, parent CAB, growth capacity, and next action. |
| **Peanut** | Parent community and peer support | Helps mothers/parents ask questions, find support, and connect with others | Support is social/community-led; private reflection may require public or peer disclosure | Wayfinder gives a private, structured, parent-owned reflection path before the parent decides whether to share anything. |
| **Cozi** | Family organisation | Shared calendar, lists, reminders, and household coordination | Solves logistics, not emotional alignment or repair after difficult moments | Wayfinder helps with the relational/emotional layer: how the parent interprets, feels, responds, repairs, and grows. |
| **BetterHelp** | Therapy marketplace / online therapy | Access to licensed therapists and scheduled or message-based therapy support | Therapy is higher-cost, appointment/professional-led, and not intended as a daily parent alignment journal | Wayfinder sits below therapy: daily, lower-friction, parent-led reflection that can prepare clearer topics for professional support when the parent chooses. |

### Bottom-line differentiation

Most adjacent apps help with one of five jobs:

1. **Track the child** — sleep, feeds, development, milestones.
2. **Inform the parent** — tips, articles, stage-based guidance.
3. **Connect the parent** — community, peer support, shared experiences.
4. **Organise the family** — calendars, reminders, logistics.
5. **Access therapy** — professional sessions and clinical support.

Wayfinder's job is different:

> Help the parent reflect on a real moment, identify the possible child need, notice their own CAB response, locate the alignment gap, grow one capacity, and navigate one next action or repair.

That makes Wayfinder stronger as a **parent emotional development subscription** than a simple journal, a tips library, a community feed, a calendar, or a therapy marketplace.

### Client-safe competitor claim examples

Use:

- "Huckleberry helps parents manage sleep timing; Wayfinder helps parents understand and repair difficult relational moments."
- "BabyCenter helps parents know what may be happening developmentally; Wayfinder helps parents notice what may be happening in the parent-child interaction."
- "Peanut gives community support; Wayfinder gives private structured reflection before anything is shared."
- "Cozi organises family life; Wayfinder develops parent alignment capacity."
- "BetterHelp connects people with therapists; Wayfinder helps parents build daily reflection language and can support more focused conversations if they later choose professional help."

Avoid:

- "Wayfinder replaces therapy."
- "Wayfinder diagnoses child behaviour."
- "Wayfinder fixes children faster than other apps."
- "Wayfinder is better than therapy."
- "Wayfinder automatically shares reflections with professionals."

## Pricing rationale

The suggested pricing positions Wayfinder above simple journaling apps and below therapy platforms.

- **Wayfinder / Explorer** removes the credit-card barrier so a parent can experience Decode a Moment, the ALIGN/CAB frame, and the 52 Parent Growth Practices before deciding whether Wayfinder is useful.
- **Wayfinder Plus** is the core business plan. It should carry the main parent development value: unlimited Decode saves, Journal Trail, Relationship Garden, practice history, and privacy-safe reflection continuity.
- **Wayfinder Connected** should price as an added support layer, not as therapy. The additional value is parent-controlled MHP sharing/review support, not automatic professional monitoring or direct clinical care.
- The annual Plus suggestion, S$89/year, is meaningfully lower than 12 monthly payments at S$9.90.
- The annual Connected suggestion, S$199/year, is lower than 12 monthly payments at S$19.90 while still preserving a premium tier for parent-controlled support.

Final prices remain an owner/business decision before Stripe products and prices are created.

## Explorer trial rules

Explorer is a Wayfinder app-level trial, not a Stripe free trial.

Recommended rules:

1. Trial length: 30 calendar days.
2. Credit card: not required.
3. Trial start: first verified parent app access or first verified parent profile activation, not unverified email signup.
4. Decode save limit: 3 saved Decode moments within the 30-day trial.
5. Counted action: saving a Decode moment to the journal as a committed reflection.
6. Not counted: opening the app, reading old entries, opening a practice, viewing practice content, abandoning an unsaved Decode draft, or managing profile details.
7. Trial end: after 30 days, the parent can still read existing saved entries.
8. Limit reached before trial end: the parent can still read existing saved entries and may continue exploring non-save surfaces that are allowed by the trial policy.
9. Upgrade path: Plus unlocks unlimited saved Decode moments and full parent development history.
10. No automatic conversion: because no card is collected for Explorer, the parent must intentionally upgrade.

Preserve this principle: **do not delete, hide, or hold existing saved entries hostage after a trial ends.** New writes can be limited; safe read access to the parent's own history should remain.

## Three saved Decode moment limit

The initial save limit should apply only to **saved Decode moments**.

Do not reinterpret the limit as:

- 3 app logins
- 3 viewed pages
- 3 practice views
- 3 total historical entries
- 3 child records
- 3 MHP interactions
- deletion or hiding of older entries

For future runtime implementation, the entitlement layer should count entries with the Decode/ALIGN entry type only after the save succeeds. If a save fails, it should not consume the limit.

Suggested parent-facing language:

> You have used 2 of your 3 free saved Decode moments. Your saved reflections remain readable. Upgrade to Plus whenever you are ready to continue saving your ALIGN journey.

## 52 Parent Growth Practices positioning

The 52 practices should be positioned as **Parent Growth Practices** or **52 ALIGN Practices**, not as behaviour prescriptions for the child.

They should help parents practise capacities such as:

- pausing before responding
- staying curious
- naming what is happening
- reducing urgency
- connecting before correcting
- offering predictability
- repairing after rupture
- asking instead of assuming

Plan positioning:

| Plan | Practice positioning |
|------|----------------------|
| Wayfinder | Access to the 52-practice interface during the 30-day trial so parents can understand the growth pathway |
| Wayfinder Plus | Full practice access with save/history/progression so practices become part of the parent's development record |
| Wayfinder Connected | Plus practice features, with future parent-controlled option to share selected practice reflections with an MHP |

Practice copy should avoid certainty and diagnosis. It should use phrases such as "try", "notice", "may", "might", "possible", and "what happens when..." rather than "fix", "stop", or "make your child...".

## Entitlement model

This section describes the future entitlement model only. It is not a schema migration.

Recommended future entitlement concepts:

| Concept | Purpose |
|---------|---------|
| `plan_code` | `wayfinder`, `plus`, `connected` |
| `billing_status` | `trial_active`, `trial_expired`, `active`, `past_due`, `canceled`, `comped`, `owner_granted` |
| `trial_started_at` | ISO timestamp for Wayfinder trial start |
| `trial_ends_at` | ISO timestamp for Wayfinder trial end |
| `decode_save_limit` | 3 for Wayfinder trial, unlimited for Plus/Connected |
| `decode_saves_used` | Count of successful saved Decode moments in the trial window |
| `can_read_own_journal` | Should remain true for the parent's own existing entries |
| `can_save_decode` | True while Wayfinder trial has remaining saves or while Plus/Connected is active |
| `can_access_practice_interface` | True for Wayfinder/Plus/Connected according to launch policy |
| `can_save_practice_progress` | Plus/Connected by default |
| `can_use_relationship_garden` | Plus/Connected by default |
| `can_share_with_mhp` | Connected only, parent-controlled |
| `can_manage_billing` | Plus/Connected parents with a Stripe customer/subscription |

Rules:

- The server must be authoritative for entitlement decisions.
- Client UI may display upgrade states, but must not be the source of truth.
- Do not rely on localStorage for paid access.
- Entitlements must be associated with the verified parent account and stable Wayfinder parent_id without weakening Supabase auth or RLS.
- Existing journal read access should not depend on Stripe availability.
- A Stripe outage should not break login, Dashboard loading, own-journal reading, or sign-out.
- Paid-write access may fail closed if billing status cannot be verified, but the UI must explain the issue without exposing technical IDs.

## Stripe object strategy for future runtime

Recommended Stripe catalog:

| Stripe product | Prices |
|----------------|--------|
| Wayfinder Plus | Monthly S$9.90, annual S$89 |
| Wayfinder Connected | Monthly S$19.90, annual S$199 |

Wayfinder free trial should be tracked in Wayfinder entitlement state, not as a Stripe product.

Recommended future server/API shape:

| Future endpoint | Purpose | Guardrail |
|-----------------|---------|-----------|
| `POST /api/create-checkout-session` | Creates hosted Stripe Checkout session for Plus/Connected | Requires verified Wayfinder session; no child or journal content sent to Stripe |
| `POST /api/create-customer-portal-session` | Creates Stripe Customer Portal session | Requires verified Wayfinder session and matching Stripe customer mapping |
| `POST /api/stripe-webhook` | Receives Stripe subscription/invoice events | Verifies Stripe signature server-side before updating entitlements |

Recommended Stripe event handling for future runtime:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

The entitlement update layer should map Stripe subscription state to Wayfinder plan permissions. It should not put raw Stripe state directly into parent-facing UI.

## Stripe privacy and metadata rules

Do not send any of the following to Stripe metadata, Checkout custom fields, or invoice descriptions:

- child names
- child IDs unless explicitly reviewed and justified
- journal text
- Decode moment content
- parent reflections
- MHP private notes
- source photo paths
- generated portrait candidate paths
- approved portrait storage paths
- Supabase UUIDs intended only for internal database use
- JWTs, tokens, anon keys, service keys, webhook secrets, or environment variable names/values

Allowed Stripe-facing data should be minimal and operational:

- selected plan code
- selected billing interval
- Stripe price ID
- non-sensitive internal reconciliation reference approved by technical owner
- customer email only where Stripe Checkout/Billing requires it for receipt and billing account management

Normal Wayfinder UI must not expose Stripe customer IDs, subscription IDs, payment intent IDs, checkout session IDs, webhook event IDs, Supabase UUIDs, storage paths, or `photo_url`.

## Connected plan privacy rules

Connected must preserve the MHP publication and portrait boundaries already established.

Connected does **not** mean:

- automatic sharing with an MHP
- automatic counsellor access to all parent history
- public professional browsing without publication controls
- therapy marketplace positioning
- display of source photos or generated portrait candidates
- exposure of storage paths, Supabase UUIDs, or `photo_url`

Connected means:

- the parent can choose a published + visible + active MHP
- the selector may display only the current selected approved portrait
- the parent chooses what to share
- existing consent/sharing rules must remain explicit
- professional review support is framed as reflective support, not diagnosis or emergency care

## Upgrade UX copy bank

Use calm, non-punitive upgrade language.

### Wayfinder trial active

> You are exploring Wayfinder with 3 saved Decode moments. Your reflections help you notice possible child needs, your CAB response, and one next action.

### One save remaining

> You have 1 free saved Decode moment left. Your saved reflections will remain readable. Upgrade to Plus when you are ready to keep building your ALIGN journey.

### Decode save limit reached

> You have used your 3 free saved Decode moments. Your saved reflections are still here. Upgrade to Plus to continue saving new Decode moments and tracking your growth over time.

### Trial ended

> Your 30-day Wayfinder trial has ended. Your saved entries remain readable. Upgrade to Plus to continue saving Decode moments, practices, and Relationship Garden progress.

### Plus upgrade

> Continue your parent development pathway with unlimited saved Decode moments, your full Journal Trail, Relationship Garden, and 52 Parent Growth Practices.

### Connected upgrade

> Add parent-controlled MHP sharing and review support. Nothing is shared automatically; you choose what to share and with whom.

### Billing management

> Manage your subscription, payment method, invoices, or cancellation securely through Stripe.

## Future build sequence

Recommended sequence after PR #120:

1. **PR #120 — docs/spec only**
   - Add this strategy document.
   - Update current launch status.
   - No runtime, SQL, Stripe code, or App Version.

2. **Payment UX wireframe/copy PR**
   - Draft upgrade surfaces, limit-reached states, and billing-management copy.
   - Prefer docs/content review before implementation.
   - Still no Stripe runtime.

3. **Entitlement schema/RLS proposal PR**
   - Propose SQL and RLS for entitlement state.
   - Include rollback and owner-apply instructions.
   - Do not merge runtime until SQL has been reviewed.

4. **Stripe catalog setup checklist**
   - Owner creates Stripe products/prices in test mode.
   - Record non-secret price IDs in reviewed configuration plan only when ready.
   - Keep secret keys and webhook secrets in Vercel environment variables only.

5. **Server-side Stripe foundation PR**
   - Add checkout session endpoint, customer portal endpoint, and webhook endpoint.
   - Verify webhook signatures.
   - No browser secret exposure.

6. **Entitlement read/display PR**
   - Add safe entitlement read path.
   - Dashboard reads and journal reads must continue to work if Stripe is unavailable.
   - Do not block existing saved-entry reads.

7. **Wayfinder trial + Decode save limit PR**
   - Enforce 30-day / 3-save Wayfinder trial rule.
   - Preserve existing saved entries as readable.
   - Add calm upgrade copy.

8. **Plus unlock PR**
   - Unlimited saved Decode moments.
   - Full Journal Trail.
   - Relationship Garden and practice history/progression gates.

9. **Connected support PR**
   - Parent-controlled MHP selector and sharing support.
   - Preserve published + visible + active rule and selected approved portrait-only display.
   - No automatic sharing.

10. **Production readiness PR / runbook update**
    - Add payment smoke checklist.
    - Add Stripe Dashboard and Customer Portal operational checks.
    - Add rollback plan.

## Future payment smoke checklist

When runtime payment is eventually implemented, verify:

1. Verified parent can still sign in before payment checks run.
2. Unverified email remains blocked.
3. Parent ID / Wayfinder ID is reused.
4. Existing children and Journal Trail entries still load.
5. Wayfinder trial user can save up to 3 Decode moments in trial.
6. Fourth Wayfinder trial Decode save is blocked with calm upgrade copy.
7. Trial-ended Wayfinder user can still read existing saved entries.
8. Plus subscription unlocks unlimited Decode saves.
9. Connected subscription unlocks parent-controlled MHP sharing only.
10. Cancelled/past-due subscriptions degrade safely without hiding existing entries.
11. Stripe Customer Portal opens only for the authenticated parent's own billing account.
12. Browser does not expose Stripe secrets, webhook secrets, JWTs, Supabase UUIDs, storage paths, source photos, generated portrait candidates, or `photo_url`.
13. MHP selector still shows only published + visible + active MHPs.
14. Parent UI still shows only selected current approved MHP portraits.
15. App remains usable on desktop and mobile.

## Open owner decisions before runtime

- Final Plus monthly and annual prices.
- Final Connected monthly and annual prices.
- Whether to show prices in SGD only at launch.
- Tax/GST handling and receipt wording.
- Refund and cancellation policy.
- Whether any founding users receive owner-granted or grandfathered access.
- Whether Plus includes all Relationship Garden history at launch or phases it in.
- Exact Connected review scope and wording for MHP support.
- Whether Customer Portal should allow plan switching immediately or only cancellation/payment method management at first.
- Legal copy for checkout, terms, privacy, and billing support contact.

## Acceptance criteria for PR #120

- `docs/PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md` exists.
- `docs/CURRENT_LAUNCH_STATUS.md` records payment strategy as docs-only / in flight.
- Client-facing plan comparison uses feature-benefit rows with Wayfinder / Wayfinder Plus / Wayfinder Connected columns.
- Competitor comparison explains Wayfinder's differentiation without claiming to replace therapy, medical advice, sleep support, community support, or family logistics apps.
- No runtime files changed.
- No SQL files changed.
- No API files changed.
- No Stripe code added.
- No App Version update added.
- No MHP portrait pipeline rule weakened.
- No auth/profile/journal/dashboard rule weakened.
