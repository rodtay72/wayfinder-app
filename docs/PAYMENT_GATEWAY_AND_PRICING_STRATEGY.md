# Payment Gateway and Pricing Strategy

**Status:** Revised draft spec for PR #120A  
**Scope:** Docs only  
**Last updated:** 2026-06-28

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md)

---

## Revision note

This revised version updates the earlier PR #120 payment strategy draft.

The key correction is that **privacy is no longer treated as a paid or limited feature**. Privacy is a baseline Wayfinder promise across every plan.

The monetised value is not privacy. The monetised value is:

- saved reflection depth;
- full Journal Trail;
- Relationship Garden;
- practice save/history/progression;
- ALIGN/CAB pattern and progression visibility;
- optional parent-controlled MHP review support.

This document also adds future roadmap direction for:

- Simplified Chinese language toggle;
- personal profiling tool revamp;
- research consent capability;
- corporate/workshop support;
- facilitator module;
- self-read relationship learning bytes.

PR #120A remains documentation-only.

---

## 1. Purpose

This document defines the first payment, trial, pricing, entitlement, privacy, and client-facing positioning strategy for Wayfinder.

PR #120A is intentionally documentation-only. It must not introduce runtime payment logic, SQL migrations, Stripe API calls, webhook endpoints, entitlement gates, App Version copy, or UI changes.

The goal is to agree the product, privacy, and technical direction before implementation.

---

## 2. Product framing to preserve

Wayfinder is not a therapy marketplace, child-diagnosis app, behaviour-labelling app, or generic Behaviour → Advice parenting app.

Wayfinder helps parents recognise where their Cognition, Affect, and Behaviour are not yet aligned with the child's emerging need.

The payment model should therefore price Wayfinder as a parent emotional development and reflection pathway:

```text
Behaviour -> Need -> Parent CAB -> Alignment Check -> Awareness -> Growth -> Navigate / Next Action
```

The subscription must not imply:

- the child is the problem;
- a child behaviour diagnosis is being sold;
- parent blame or parent diagnosis is being sold;
- therapy sessions are being sold;
- MHP access is automatically included or automatically triggered;
- a parent's private journal is shared by default;
- research participation happens without consent;
- corporate or workshop participation gives anyone access to private parent reflections by default.

---

## 3. Privacy-first baseline promise

Privacy is included in every Wayfinder plan.

Wayfinder should be positioned as:

```text
Privacy-first. Consent-led. No ads. No selling parent data. No gimmicks.
```

### Baseline rules across all plans

Every plan must preserve:

- private parent reflection space;
- no advertising model;
- no sale of parent or child data;
- no dark-pattern engagement gimmicks;
- no child diagnosis or child labelling;
- no parent diagnosis or fixed parent type;
- no automatic sharing with MHPs, facilitators, corporate partners, researchers, or third parties;
- parent consent before any research use, sharing, review support, or group/workshop participation;
- parent-controlled sharing where a sharing feature exists;
- existing saved entries remain readable after trial expiry.

### Compliance posture

Wayfinder's intended privacy posture is designed to support PDPA, GDPR, and HIPAA-aware privacy controls, including:

- consent;
- purpose limitation;
- data minimisation;
- privacy by design and by default;
- controlled access;
- role-based permissions;
- separation of billing data from parent reflections;
- no unnecessary exposure of parent email, Supabase UUIDs, child names, storage paths, tokens, or secrets in normal UI;
- parent control over research participation and sharing.

Public legal wording should avoid unsupported absolute claims such as "fully compliant" until reviewed by counsel.

Preferred public wording:

```text
Wayfinder is designed with a privacy-first architecture aligned to PDPA, GDPR, and HIPAA-sensitive principles, including consent, purpose limitation, privacy by design, and controlled sharing.
```

---

## 4. Recommended plan structure

Wayfinder should launch with three client-facing plan names:

1. Wayfinder
2. Wayfinder Plus
3. Wayfinder Connected

For internal planning, `Wayfinder` corresponds to the free Explorer-style trial entitlement.

### Plan basics

| Plan | Client-facing role | Suggested price | Payment requirement |
| --- | --- | --- | --- |
| Wayfinder | Safe entry point to try the ALIGN pathway | Free for 30 days | No credit card required |
| Wayfinder Plus | Main parent development subscription | S$9.90/month or S$89/year | Card required at upgrade |
| Wayfinder Connected | Parent-controlled MHP support layer | S$19.90/month or S$199/year | Card required at upgrade |

### Client-facing feature entitlement table

This table is intended for client-facing pricing pages and sales decks. Each row describes the parent benefit first, then shows whether the feature is locked, limited, or unlocked.

| Features | Wayfinder | Wayfinder Plus | Wayfinder Connected |
| --- | --- | --- | --- |
| Decode a Moment: understand what a difficult child moment may be signalling, what happened in the parent's CAB, and what next action may restore alignment | Unlocked during trial | Unlocked | Unlocked |
| 30-day guided start: try the core Wayfinder pathway without payment pressure | Unlocked | Unlocked | Unlocked |
| Privacy-first reflection space: private parent reflections, no child-labelling, no parent diagnosis, and no normal UI exposure of sensitive technical identifiers | Unlocked | Unlocked | Unlocked |
| No ads, no data-selling, no gimmicks: Wayfinder does not monetise attention or sell parent/child data | Unlocked | Unlocked | Unlocked |
| Parent consent for research, sharing, or review support: research participation and any sharing pathway require parent choice | Unlocked | Unlocked | Unlocked |
| Save Decode reflections: preserve insights from difficult moments instead of losing them after the day passes | Limited: 3 saved Decode moments within 30 days | Unlocked: unlimited saves | Unlocked: unlimited saves |
| Read existing saved entries: keep access to reflections already saved, even after the free trial ends | Unlocked | Unlocked | Unlocked |
| Full Journal Trail: revisit reflections over time to notice recurring needs, CAB patterns, growth edges, and repair intentions | Locked or limited to trial/saved allowance | Unlocked | Unlocked |
| Reflection history depth: return to more saved parent reflections and develop them over time | Limited to trial/saved allowance | Unlocked | Unlocked |
| Relationship Garden: view the parent-child relationship as a living growth pattern rather than isolated incidents | Locked | Unlocked | Unlocked |
| 52 Parent Growth Practices / 52 ALIGN Practices interface: practise small parent capacities such as pausing, staying curious, connecting before correcting, or repairing after rupture | Unlocked during trial as guided access | Unlocked | Unlocked |
| Practice save/history/progression: track which practices have been tried and how parent capacity is developing | Locked | Unlocked | Unlocked |
| ALIGN/CAB pattern and progression view: notice recurring child needs, parent CAB responses, possible misalignments, growth capacities, and next actions | Locked or limited | Unlocked | Unlocked |
| Growth capacity tracking: see recurring growth edges such as reducing urgency, offering predictability, connecting before correcting, or repairing after rupture | Locked | Unlocked | Unlocked |
| Continue without losing past reflections: upgrade from existing saved moments rather than starting again | Unlocked | Unlocked | Unlocked |
| Published + visible + active MHP selector: choose from professionals approved for parent-side visibility | Locked | Locked | Unlocked |
| Selected approved MHP portrait display: show only the current approved portrait selected by owner/admin | Locked | Locked | Unlocked |
| Parent-controlled MHP sharing/review support: choose what to share, when to share it, and with whom | Locked | Locked | Unlocked |
| No automatic sharing: private reflections are not shared simply because a parent pays or upgrades | Unlocked | Unlocked | Unlocked |
| Portrait privacy protection: source photos, AI-generated candidates, older approved portrait history, storage paths, Supabase UUIDs, and `photo_url` are not parent-facing | Unlocked | Unlocked | Unlocked |
| Billing self-service through Stripe Customer Portal: manage payment method, invoices, and subscription changes once payment runtime exists | Locked | Unlocked after payment runtime is built | Unlocked after payment runtime is built |

### Parent-facing explanation of plan differences

Use this explanation in sales, parent onboarding, and pricing discussion:

```text
Every Wayfinder plan is privacy-first. The difference between plans is not whether your reflections are protected. They are. The difference is how much you can save, revisit, track, and, only if you choose, share for professional reflection support.
```

---

## 5. Pricing rationale

### Positioning

Wayfinder should sit above simple journaling apps but below therapy platforms.

The pricing should communicate that Wayfinder is:

- deeper than a blank journal;
- more structured than a habit tracker;
- safer and more reflective than generic parenting tips;
- not priced like therapy or a session marketplace;
- privacy-first and parent-controlled;
- consent-led for research, MHP review, workshop, or corporate support features.

### Wayfinder Plus

Recommended first price:

- S$9.90/month
- S$89/year

Annual value:

- Monthly equivalent of annual plan: about S$7.42/month
- Approximate saving vs monthly: about 25%

Rationale:

Plus is the main subscription. The price should be accessible enough for parents to use Wayfinder as an ongoing growth companion, while still reflecting the structured ALIGN/CAB pathway, saved reflection history, Journal Trail, Relationship Garden, and 52 Parent Growth Practices.

### Wayfinder Connected

Recommended first price:

- S$19.90/month
- S$199/year

Annual value:

- Monthly equivalent of annual plan: about S$16.58/month
- Approximate saving vs monthly: about 17%

Rationale:

Connected adds a higher-trust, higher-support layer, not a therapy marketplace. The price reflects extra product complexity around parent-controlled sharing, published + active MHP selection, review support, privacy expectations, and MHP presentation rules. It must not imply unlimited therapist messaging, clinical care, diagnosis, emergency support, or automatic sharing.

---

## 6. Client-facing competitive positioning

### Important note on comparison language

Do not claim that Wayfinder is universally better than every app. The safer and stronger claim is:

```text
Wayfinder is better for the specific parent-development job of turning a real difficult moment into a privacy-safe ALIGN reflection, parent CAB awareness, growth practice, repair intention, and next action.
```

This preserves the Wayfinder canon and avoids overclaiming against apps that are built for different jobs.

### Top five adjacent app benchmarks

| Adjacent app | What it is strong at | Where it stops for Wayfinder's use case | Why Wayfinder is stronger for this parent-development use case |
| --- | --- | --- | --- |
| Kinedu | Baby/child development support, personalised daily activities, milestone tracking, expert content, and live classes/courses | The centre of gravity is child development and milestones. It does not primarily help the parent decode a difficult relational moment through child need vs parent CAB | Wayfinder starts from the real parent-child moment: behaviour -> possible need -> parent CAB -> alignment check -> growth -> next action. It is built around parent alignment capacity, not milestone tracking |
| BabySparks | Early development through meaningful play, video-based activities, and developmental milestones | The main value is activity guidance for child development. It is not designed as a privacy-safe parent emotional development trail | Wayfinder is stronger when the question is not "What activity should I do?" but "What happened in me, what might my child have needed, and how do I repair or respond next time?" |
| The Happy Child | Research-based parenting lessons and tips offered as a free parenting education app | Education and tips can be helpful, but they may not convert a parent's own moment into a saved ALIGN/CAB reflection with a growth trail | Wayfinder turns insight into the parent's own structured reflection history: Decode moment, possible need, CAB, misalignment, growth capacity, next action, and repair intention |
| Parenting Hero / How To Talk | Practical communication tools and story-guided advice for common parent-child situations | It is closer to immediate skill advice. Wayfinder should avoid becoming a generic Behaviour -> Advice tool | Wayfinder keeps the reflective step before advice: it asks what need may be emerging, what the parent's cognition/affect/behaviour did, and what capacity the parent is growing |
| Day One | A mature general journaling app for capturing life moments across devices and media | It is a general journal, not a parent-child alignment pathway. It can store memories, but it does not supply Wayfinder's ALIGN structure, CAB lens, growth practices, or Connected sharing rules | Wayfinder is purpose-built for privacy-safe parent reflection: it gives structure, not just a blank page, and connects saved reflections to parent growth practices and optional parent-controlled MHP review |

### Client deck positioning line

```text
Most parenting apps either teach tips, track child development, or store journal entries. Wayfinder is different: it helps a parent decode a real moment through the child's possible need and the parent's CAB, then turn that insight into growth, repair, and a next action.
```

### Client-safe advantage claims

- Stronger than a generic journal because it gives a structured ALIGN pathway, not a blank page.
- More reflective than a tips app because it starts with the parent's real moment, not generic advice.
- More parent-development focused than child milestone apps because the outcome is parent alignment capacity, not child compliance.
- More privacy-controlled than a therapy marketplace because private reflections are not automatically shared and Connected requires parent choice.
- More commercially accessible than therapy because Plus is priced as ongoing parent development, while Connected is a support layer rather than clinical care.

### Competitor reference pages consulted

These references are for positioning only and do not add runtime scope to PR #120A.

- Kinedu: https://www.kinedu.com/
- BabySparks: https://babysparks.com/
- The Happy Child: https://www.humanimprovement.org/the-happy-child-app
- Parenting Hero / How To Talk: https://how-to-talk.com/apps/
- Day One: https://dayoneapp.com/

---

## 7. Free trial strategy

### Recommended first-launch approach

Wayfinder should be implemented as an internal no-card trial entitlement, not as a Stripe subscription.

Reasons:

- no credit card is required;
- there is no automatic conversion into paid billing;
- parents can experience the product without feeling trapped by payment setup;
- billing records are not created before a parent chooses to pay;
- the product limits are clear: 30 days and 3 saved Decode moments.

Stripe should begin only when a parent actively chooses Plus or Connected.

### Trial start rule

The 30-day trial should start at first verified parent app access, after email verification and profile availability.

Do not start the trial merely on unverified sign-up. This avoids burning trial time before the parent can safely access the app.

### Trial limit

Wayfinder allows 3 saved Decode moments during the trial.

The limit should count only successfully saved Decode moments, not:

- drafts;
- abandoned Decode flows;
- failed save attempts;
- browsing 52 practices;
- reading existing saved entries;
- viewing upgrade screens.

### Trial end behaviour

When the free trial expires:

- new Decode saves should be blocked until upgrade;
- existing saved entries remain readable;
- the upgrade prompt should be supportive, not punitive;
- no entry should be deleted because a trial ended;
- no MHP sharing should be introduced automatically;
- no research participation should be introduced automatically;
- no corporate/workshop sharing should be introduced automatically.

Recommended future conceptual state name:

```text
wayfinder_expired_readonly
```

This is conceptual only for PR #120A. No schema or runtime logic is introduced in this PR.

---

## 8. 52 Parent Growth Practices positioning

The 52 practices should be positioned as Parent Growth Practices or ALIGN Practices, not generic tips.

Wayfinder:

- can access the practice interface during the 30-day trial;
- can preview the value of structured parent growth;
- should not promise full practice history, progression, or saved practice tracking.

Plus and Connected:

- unlock full 52 Parent Growth Practices;
- include save/history/progression;
- support privacy-safe reflection history;
- connect practice selection to emerging parent capacities, not child labels.

Preferred framing:

```text
A practice is not a fix for the child. It is a small capacity the parent is growing so their CAB can meet the child's possible need with more alignment.
```

---

## 9. Entitlement model

### Core entitlement principle

Billing status and product access should be separated.

Stripe should be the billing source of truth for paid subscriptions. Wayfinder should maintain its own server-side entitlement state for app access decisions.

The browser should never decide paid access from localStorage or client-only flags.

### Conceptual entitlement fields

| Field | Purpose |
| --- | --- |
| `plan_code` | `wayfinder`, `plus`, or `connected` |
| `entitlement_status` | `trialing`, `active`, `past_due`, `canceled`, `expired`, `readonly` |
| `trial_started_at` | Trial start timestamp, likely first verified app access |
| `trial_ends_at` | Trial end timestamp |
| `decode_save_limit` | `3` for Wayfinder trial; unlimited for Plus/Connected |
| `decode_saves_used` | Count of successful saved Decode moments during trial |
| `journal_read_allowed` | Preserve read access to existing saved entries |
| `journal_write_allowed` | Controls new Decode saves / future journal writes |
| `growth_practices_access` | `preview`, `full`, or `full_with_history` |
| `relationship_garden_access` | `none` or `full` |
| `align_pattern_access` | `none`, `basic`, or `full` |
| `mhp_selector_enabled` | Connected only |
| `mhp_sharing_enabled` | Connected only and parent-controlled |
| `research_participation_status` | Future consent state such as `not_asked`, `declined`, or `opted_in`; not a payment entitlement |
| `preferred_language` | Future UI language preference such as `en` or `zh-Hans`; not a payment entitlement |
| `stripe_customer_id` | Future server-owned billing mapping |
| `stripe_subscription_id` | Future server-owned subscription mapping |
| `current_period_end` | Paid billing period reference from Stripe |
| `last_entitlement_sync_at` | Last successful webhook/API reconciliation |

This is not a SQL proposal for PR #120A. It is a product/technical contract for later implementation.

---

## 10. Stripe architecture recommendation

### Recommended gateway

Use Stripe Checkout + Stripe Billing + Stripe Customer Portal for the first payment implementation.

Recommended future architecture:

```text
Parent chooses Plus or Connected
-> Wayfinder authenticated serverless endpoint creates Stripe Checkout Session
-> Parent completes Stripe-hosted Checkout
-> Stripe sends webhook events to Wayfinder webhook endpoint
-> Wayfinder verifies webhook signature
-> Wayfinder maps Stripe customer/subscription to parent entitlement
-> Parent app reads entitlement from Wayfinder/Supabase server-side state
-> UI unlocks only the allowed features
```

For billing self-management:

```text
Parent opens Manage Billing
-> Wayfinder authenticated endpoint creates Stripe Customer Portal Session
-> Parent manages payment method, invoices, cancellation, or subscription changes in Stripe-hosted portal
-> Stripe sends webhook events
-> Wayfinder updates entitlement state
```

### Products and prices

| Stripe Product | Price | Interval | Wayfinder plan |
| --- | --- | --- | --- |
| Wayfinder Plus | S$9.90 | monthly | `plus` |
| Wayfinder Plus | S$89 | yearly | `plus` |
| Wayfinder Connected | S$19.90 | monthly | `connected` |
| Wayfinder Connected | S$199 | yearly | `connected` |

Wayfinder free trial should not be a paid Stripe product for first launch.

### Stripe metadata and privacy

Keep Stripe metadata minimal.

Allowed in Stripe metadata, subject to later review:

- non-sensitive internal plan code;
- non-sensitive checkout purpose;
- a server-owned account reference if needed for reconciliation.

Do not put these in Stripe metadata:

- child names;
- child IDs unless explicitly reviewed;
- journal content;
- Decode content;
- CAB reflections;
- parent email unless Stripe requires it for customer billing communication;
- Supabase UUIDs in parent-facing contexts;
- JWTs, refresh tokens, anon keys, service keys, or secrets;
- MHP source photo paths;
- generated portrait candidate paths;
- approved portrait storage paths;
- `photo_url`;
- private source photo filenames or object paths;
- research participation notes;
- corporate/workshop participation details.

### Webhook events to consider later

A future implementation should reconcile at least these Stripe events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Webhook handling must be idempotent and signature-verified.

---

## 11. Privacy and safety rules

Payment implementation must preserve all existing Wayfinder privacy rules.

### Parent reflection privacy

Payment state must not expose:

- parent email in normal app UI;
- Supabase UUIDs in normal app UI;
- child names;
- raw child identifiers unnecessarily;
- journal text;
- Decode details;
- CAB reflections;
- MHP private data;
- research consent records in normal app UI unless intentionally shown to the parent;
- workshop/corporate participation metadata in normal app UI unless intentionally shown to the parent;
- tokens or secrets.

### Research privacy

Research capability must be opt-in and consent-based.

Default state:

```text
No research participation.
```

Parent action required:

```text
Parent explicitly consents to research participation, with clear scope, purpose, and withdrawal path.
```

Research capability must not:

- be bundled invisibly into payment;
- require participation as a condition of basic app use unless legally and ethically reviewed;
- expose raw child names;
- expose parent emails in research exports unless explicitly approved and consented;
- expose journal text or Decode entries without explicit scope and consent;
- use parent reflections for third-party advertising;
- sell parent or child data.

### Connected plan privacy

Connected does not mean automatic sharing.

Default state:

```text
No sharing.
```

Parent action required:

```text
Parent chooses what to share, with whom, and when.
```

### Corporate/workshop privacy

Corporate and workshop support must not give employers, facilitators, or cohort organisers default access to private parent reflections.

Default state:

```text
No employer, facilitator, or corporate access to individual private parent journals.
```

Any group reporting must be:

- aggregated where possible;
- non-identifying;
- consent-based;
- purpose-limited;
- reviewed before runtime implementation.

### MHP portrait rules

Connected may display only the selected current approved MHP portrait on the parent side.

Never expose to parents:

- private source photo;
- AI-generated candidate-only sketch;
- older approved portrait history;
- storage paths;
- Supabase UUIDs;
- `photo_url`;
- internal portrait moderation state.

### No clinical claims

Upgrade and plan copy must not say or imply:

- Wayfinder diagnoses the child;
- Wayfinder diagnoses the parent;
- Wayfinder replaces therapy;
- MHP review is emergency support;
- Connected provides guaranteed clinical care;
- paying will fix the child's behaviour;
- corporate workshops are clinical treatment;
- facilitators provide therapy unless separately qualified, contracted, consented, and approved.

---

## 12. Upgrade UX copy

### Wayfinder trial active

```text
You are exploring Wayfinder with 3 saved Decode moments during your 30-day trial.
Use this space to notice what your child's behaviour may have been signalling, what happened in your CAB, and what you might try next.
```

### Privacy reassurance near pricing

```text
Privacy is included in every Wayfinder plan. We do not sell parent data, we do not run ads, and we do not use gimmicks to keep parents scrolling. Parent reflections stay private by default. Research, professional review, or sharing pathways require parent consent.
```

### Save limit reached

```text
You have used your 3 Wayfinder saves.
Your saved reflections remain readable. To keep saving Decode moments and build your Journal Trail, upgrade to Wayfinder Plus.
```

Primary CTA: `Upgrade to Plus`  
Secondary CTA: `Review my saved reflections`

### Trial expired

```text
Your Wayfinder trial has ended.
Your saved reflections are still here. Upgrade when you are ready to continue saving Decode moments, tracking patterns, and growing your ALIGN practice.
```

Primary CTA: `Continue with Plus`  
Secondary CTA: `View saved reflections`

### Plus upgrade prompt

```text
Continue your ALIGN journey with unlimited saved Decode moments, your full Journal Trail, Relationship Garden, and the complete 52 Parent Growth Practices.
```

CTA: `Start Wayfinder Plus`

### Connected upgrade prompt

```text
Add parent-controlled MHP review support when you want another trusted lens. You choose what to share, when to share it, and which published active MHP can review it.
```

CTA: `Explore Connected`

---

## 13. Future roadmap additions

These roadmap items are valid future directions but are not part of PR #120A runtime scope.

### 13.1 Simplified Chinese language toggle

**Priority:** same strategic priority as the payment gateway.

Goal: allow parents to switch the parent-facing interface between **English** and **简体中文 (Simplified Chinese)**.

Recommended internal language codes: `en`, `zh-Hans`.

Initial principle: translate product UI, guidance copy, plan copy, upgrade copy, and self-read content. Do **not** automatically translate private parent journal entries or Decode reflections unless a later consent-based translation design is approved.

Privacy and safety:

- Do not send parent reflections to external translation services without explicit approval and consent.
- Do not automatically translate journal entries or Decode content.
- Do not change journal save/read logic.
- Do not change parent_id, child_id, Supabase auth, RLS, or email verification.
- Keep ALIGN/CAB language cautious, non-diagnostic, and non-blaming in both languages.

Recommended first phases:

1. Translation strategy spec.
2. Static UI copy dictionary.
3. Header/settings language toggle.
4. Parent-facing copy translation.
5. Later review of journal/reflection translation, only if privacy and consent rules are approved.

### 13.2 Personal profiling tool revamp

Goal: revamp the profiling experience into a **living parent developmental reflection profile**.

The profile must not create fixed parent types, child labels, parent diagnoses, or behaviour diagnoses.

The profile may show: recurring CAB patterns; recurring child needs noticed; recurring misalignments; current growth edge; emerging strengths; current practice; repair habits; next-action patterns.

Acceptable example: `Current alignment challenge: urgency vs child need for predictability.`

Unacceptable examples: `You are a controlling parent.` / `Your child is oppositional.`

### 13.3 Research capability and consent framework

Goal: support future research work without weakening Wayfinder's privacy-first promise.

Research must be opt-in, consent-based, purpose-limited, and separable from payment access. Must not be hidden inside plan purchase or become an advertising/data-sale model.

### 13.4 Corporate/workshop support

Goal: support corporate or workshop programmes while preserving individual parent privacy.

Corporate support must not turn Wayfinder into an employer surveillance tool. Any group reporting must be aggregated, non-identifying, consent-based, and purpose-limited.

### 13.5 Facilitator module

Goal: support trained facilitators on a freelance or non-full-time basis for Wayfinder workshops.

Framing: workshop support and facilitation layer, **not** a therapy marketplace. No automatic access to private parent reflections. No payout/payment runtime until legal, tax, ops, and payment review is complete.

### 13.6 Self-read informative bytes

Goal: short, parent-friendly relationship learning bytes connected to ALIGN/CAB — not generic parenting tips or clinical advice.

Possible themes: repair after rupture; connection before correction; transitions and predictability; co-regulation; parent urgency; child need for agency; sibling tension; shame-free reflection; boundaries with warmth; returning after a hard moment; when a child refuses; when a parent feels rushed.

---

## 14. Revised future build sequence

PR #120A must remain docs only.

Recommended future sequence:

1. **PR #120A** — Fix payment/pricing strategy privacy rows and add future roadmap section.
2. **PR #121** — Simplified Chinese language toggle strategy spec.
3. **PR #122** — Language toggle foundation: English / Simplified Chinese UI toggle and static translation dictionary.
4. **PR #123** — Payment entitlement copy and constants spec.
5. **PR #124** — Wayfinder trial and read-only gating design.
6. **PR #125** — Stripe product setup runbook.
7. **PR #126** — Payment data model / entitlement persistence, only after schema review.
8. **PR #127** — Stripe Checkout and webhook implementation.
9. **PR #128** — Stripe Customer Portal integration.
10. **PR #129** — Upgrade UX and entitlement gates.
11. **PR #130** — Connected MHP sharing gates.
12. **PR #131** — Personal profiling revamp strategy spec.
13. **PR #132** — Research consent capability spec.
14. **PR #133** — Self-read informative bytes content model and first relationship theme set.
15. **PR #134** — Corporate/workshop support strategy spec.
16. **PR #135** — Facilitator module strategy, role, permissions, and payout-risk review.
17. **PR #136+** — Runtime builds only after privacy, legal, role, consent, and schema review.

---

## 15. PR #120A acceptance criteria

PR #120A should be accepted only if:

- only docs are changed;
- this document is added/updated;
- `CURRENT_LAUNCH_STATUS.md` is updated only if needed;
- no runtime files are touched;
- no SQL files are touched;
- no API routes are touched;
- no Stripe code is added;
- no App Version entry is added;
- no entitlement gates are added;
- privacy is baseline across every plan;
- research, sharing, MHP review, facilitator visibility, and corporate participation are consent-based;
- MHP portrait pipeline rules remain unchanged;
- parent/child ID rules remain unchanged;
- journal save/read logic remains unchanged;
- all language remains non-diagnostic and non-blaming;
- `git diff --check` passes.

---

## 16. Files explicitly out of scope for PR #120A

Do not touch: `app.js`, `supabase.js`, `api/*`, SQL files, `content.js`, `styles.css`, auth/profile/ensure_profile, journal save/read, Parent ID / Child ID, MHP publication/portrait pipeline, consent runtime, App Version, payment runtime, Stripe runtime, dashboard loading, Supabase auth, RLS policies, email verification logic.

---

## 17. External references consulted

Implementation references only — no runtime scope added by this section.

- Stripe Checkout subscriptions: https://docs.stripe.com/payments/checkout/build-subscriptions
- Stripe Billing subscription lifecycle: https://docs.stripe.com/billing/subscriptions/overview
- Stripe free trial behaviour: https://docs.stripe.com/billing/subscriptions/trials/free-trials
- Stripe subscription webhooks: https://docs.stripe.com/billing/subscriptions/webhooks
- Stripe Customer Portal: https://docs.stripe.com/customer-management

---

## Related docs

| Doc | Role |
|-----|------|
| [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) | Living launch snapshot |
| [MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md) | Portrait privacy rules |
| [MHP_OWNER_HANDOFF_RUNBOOK.md](./MHP_OWNER_HANDOFF_RUNBOOK.md) | Owner MHP operations |
