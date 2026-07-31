# Language Toggle Post-Merge Smoke Evidence

**Status:** Docs-only post-merge record for PR #167  
**Last updated:** 2026-07-31  
**Branch track:** PR #168 — language toggle post-merge status + smoke evidence (docs only)

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md](./LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md)
- [POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md](./POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md)

**Privacy rule:** Do not record parent emails, child names, Supabase UUIDs, JWTs, or reflection content in this evidence doc. Use pass/fail and date only.

---

## 1. Status

- **PR #167 merged** on `main`.
- **Merge commit:** `12ce685ce17187041c2ea182bab25b63f2fd1938`.
- Parent-facing **English / 简体中文** language toggle is on `main` with PR #167; treat as live on production **only after** deploy reflects merge `12ce685` **and** the owner completes §4 checklist below.
- **Production smoke:** Not verified in this document until §4 items are checked by the owner/operator.
- Parents may write journal and Decode reflections in **Chinese or English**; saved text is preserved **exactly as entered**.
- **No auto-translation** of private reflections when UI language changes.
- **No external translation API or vendor** for parent content.
- **No SQL / API / auth / RLS / Stripe / journal payload** changes in PR #167.

---

## 2. What PR #167 delivered

| Area | Detail |
|------|--------|
| Preference storage | `localStorage` key `wayfinder_preferred_language` |
| Supported values | `en`, `zh-Hans` (invalid values repair to `en`) |
| Document language | `document.documentElement.lang` updates with preference |
| Static UI | Parent-facing dictionary expansion in `WAYFINDER_I18N` |
| Decode | Shell localisation; static chip **display-only** localisation (stored values remain English constants) |
| Dashboard | `CHILD_NEEDS_WORDS` chip **display-only** localisation |
| Journal Trail | Decode card labels and filter chip **display** localisation |
| Plans | Plans page shell localisation |
| App Version | **v0.4.7** — language toggle + private content not auto-translated |
| Reflection helper | `reflection.languageHelper` copy (EN + zh-Hans) |

Runtime reference: merge commit above; feature branch history includes static option label polish commit `a5c7cec` (display-only labels, no payload change).

---

## 3. Data boundary

- Parents may write in **English or Chinese** (or mix) in journal, Decode, and activity CAB free text.
- **Saved free text** remains exactly as entered — not rewritten on save or on language toggle.
- **Static option chips** (Decode groups, dashboard child-need words): UI may show zh-Hans labels; **stored/filter/internal values** stay English constants; **no migration** of historical entries.
- **Generated/saved alignment gap prose** is not rewritten or auto-translated at display time in v1.
- **No private content** is sent to translation services.

---

## 4. Production sanity checklist

Owner or operator: run after production deploy reflects merge `12ce685`. Check boxes when verified; do not paste reflection content into this file.

- [ ] Production app loads
- [ ] Verified parent can sign in
- [ ] Dashboard loads
- [ ] English ↔ 简体中文 toggle works
- [ ] Decode chip labels display in Chinese in zh-Hans mode
- [ ] Chinese Decode free text saves and displays exactly as entered
- [ ] English saved text remains English when UI is zh-Hans
- [ ] Journal Trail opens and entry bodies remain unchanged
- [ ] App Version v0.4.7 appears
- [ ] Plans page privacy baseline remains clear
- [ ] Connect disclaimer remains non-therapy / non-diagnosis / non-crisis
- [ ] Sign out works

**Evidence note (optional):** Record date and verifier initials only — e.g. `2026-__-__ — owner smoke — all checklist items pass`.

---

## 5. Known deferred language work

| Item | Notes |
|------|--------|
| Full Activity catalogue translation | Large `ACTIVITIES` / copy surface — follow-up PR |
| `PHASES` / `ACTIVITIES` titles | Defer with activity catalogue |
| Relationship Garden deep polish | If mixed-language static copy remains |
| MHP portal full translation | Out of parent PR #167 scope |
| Admin / owner ops translation | Out of scope |
| DISC upload widget microcopy | Low-traffic English microcopy |
| Generated/saved alignment gap prose | Display translation deferred; not rewritten in DB |
| Consent-gated private reflection translation | Future only — vendor, security, legal review |
| Server-side `preferred_language` | Future only — schema / RLS review |

---

## 6. Stop conditions for future language work

- Do **not** add external translation vendors without vendor review ([VENDOR_SUBPROCESSOR_REGISTER.md](./VENDOR_SUBPROCESSOR_REGISTER.md)).
- Do **not** auto-translate private reflections.
- Do **not** change saved journal payloads without explicit design review.
- Do **not** make language a paid feature.
- Do **not** weaken auth, RLS, journal, privacy, Stripe, or MHP boundaries.

---

## Related docs

| Doc | Role |
|-----|------|
| [LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md](./LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md) | Strategy, boundaries, sequencing |
| [POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md](./POST_LIVE_MONITORING_AND_SUPPORT_FAQ.md) | Support rules — no translation tools on private content |
| [PLATFORM_SYNC_STRIPE_LIVE_CUTOVER_BRIEF.md](./PLATFORM_SYNC_STRIPE_LIVE_CUTOVER_BRIEF.md) | Platform handoff — no billing/translation coupling |

---

## Document history

| Date | Change |
| --- | --- |
| 2026-07-31 | PR #168 — initial post-merge status and production smoke checklist (docs only) |
