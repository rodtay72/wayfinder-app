# Simplified Chinese Language Toggle Strategy

**PR #123 — docs-only strategy spec**

**Status:** Strategy only — no runtime in this PR  
**Last updated:** 2026-06-29

Read first:

- [AGENTS.md](../AGENTS.md)
- [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md)
- [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md)
- [PWA_INSTALL_COMPATIBILITY_AUDIT.md](./PWA_INSTALL_COMPATIBILITY_AUDIT.md)

---

## 1. Purpose

This document defines the product, UX, privacy, translation, and implementation strategy for an **English / Simplified Chinese (简体中文)** language toggle in Wayfinder.

PR #123 is **documentation only**. It must not introduce UI changes, translation files in runtime, SQL, API routes, auth changes, journal logic changes, payment gates, or App Version entries.

The goal is to agree direction before a later runtime PR implements a safe, privacy-preserving language preference for parent-facing (and eventually MHP-facing) static product copy.

---

## 2. Why Simplified Chinese matters

Wayfinder serves parents in Singapore and broader Chinese-speaking communities. Many parents may reflect more comfortably in English today but navigate product guidance more confidently in **Simplified Chinese**.

A language toggle supports:

- clearer access to ALIGN/CAB parent-development guidance;
- lower friction for bilingual households;
- alignment with a future payment/pricing and upgrade UX that may also be localised;
- respectful inclusion without turning Wayfinder into a generic translation app or child-diagnosis tool.

Simplified Chinese (`zh-Hans`) is the first additional language. Traditional Chinese, Malay, Tamil, or other locales are **out of scope** until separately approved.

---

## 3. Supported language labels and codes

| User-facing label | Internal code | Use |
|-------------------|---------------|-----|
| English | `en` | Default; current production language |
| 简体中文 | `zh-Hans` | Simplified Chinese UI/product copy |

Rules:

- Show **English** and **简体中文** in the toggle — not internal codes in normal UI.
- Store preference as `en` or `zh-Hans` only in future server-side or client preference fields.
- Do not expose Supabase UUIDs, auth tokens, or parent email in language settings UI.
- Language preference is **not** a payment entitlement (see [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md)).

---

## 4. Product framing to preserve

Wayfinder is not a child-diagnosis app, behaviour-labelling app, therapy marketplace, or generic Behaviour → Advice parenting app.

Wayfinder helps parents recognise where their **Cognition, Affect, and Behaviour (CAB)** may not yet be aligned with the child's emerging need.

Core pathway (both languages must preserve this meaning):

```text
Behaviour -> Need -> Parent CAB -> Alignment Check -> Awareness -> Growth -> Navigate / Next Action
```

Official **ALIGN** mapping:

| Letter | English | zh-Hans guidance (product terms — final copy in runtime PR) |
|--------|---------|--------------------------------------------------------------|
| A | Awareness | 觉察 — notice what happened without blaming the child |
| L | Locate | 定位 — locate possible child need and parent internal response |
| I | Integrate | 整合 — connect child need with parent CAB |
| G | Growth | 成长 — parent capacity being developed |
| N | Navigate | Navigate / 下一步 — one next action or repair step |

**CAB** in both languages:

| Term | Meaning |
|------|---------|
| Cognition | What the parent thinks, assumes, expects, or interprets |
| Affect | What the parent feels emotionally and in the body |
| Behaviour | What the parent does in response |

Use cautious language in **both** languages: 可能 / might / may / let's explore — not certainty, diagnosis, or blame.

The phrase **"My child did something and I don't know why"** must never imply the child is the problem. In any language it means the behaviour **may** reveal a moment where the parent's CAB is not yet aligned with the child's emerging need.

---

## 5. Translation boundaries

### Phase 1 (first runtime PR) — translate

Static **UI and product copy** only, for example:

- navigation labels and dashboard section titles;
- Decode a Moment step labels and helper text (not saved reflection body);
- login/signup/email-verification helper copy where parent-facing;
- Journal Trail UI labels (not entry body);
- Relationship Garden UI labels;
- Events listing UI;
- review-sharing **UI** and consent framing (not shared reflection content);
- upgrade/pricing **UI shell** when payment runtime exists;
- error/empty states that contain no user-generated text;
- App Version page entries when explicitly approved for parent-facing release notes.

### Phase 1 — do **not** translate automatically

- private parent journal entries;
- Decode reflection saved text (behaviour, possible need, parent CAB, growth, next action);
- activity journal CAB fields saved by the parent;
- counsellor/MHP feedback body text;
- parent-written reflections on feedback;
- child names or child-identifying content;
- MHP private profile, licence, or portrait metadata;
- owner/admin operational copy;
- research export payloads;
- Stripe receipts/invoices (Stripe-hosted unless separately approved).

### Phase 2+ (future, consent-based only)

Automatic or assisted translation of **saved private reflections** requires a **separate approved design** with explicit parent consent, purpose limitation, and no default-on behaviour. Not part of PR #123 or the first runtime toggle PR.

---

## 6. Privacy rules

Language implementation must preserve all existing Wayfinder privacy rules.

**Prohibited without explicit future approval:**

- sending journal entries, Decode reflections, CAB text, child data, or parent reflections to **external translation APIs** (Google Translate, DeepL, OpenAI, etc.);
- auto-translating saved entries when the parent toggles language;
- mixing translated reflection text into research exports without consent scope;
- storing translation of private reflections in third-party services;
- weakening auth, RLS, journal save/read, Parent ID / Child ID, dashboard loading, or privacy masking.

**Required:**

- parent reflections remain in the **language the parent entered** unless a later consent-based feature is approved;
- static UI strings may live in an in-repo dictionary (e.g. `content` modules or dedicated locale files) — no private data in those files;
- language preference must not expose parent email, Supabase UUID, tokens, or secrets in normal UI;
- debug UI for technical IDs remains behind existing debug gates only.

---

## 7. What should be translated first (runtime priority)

Recommended order for the **first runtime implementation PR**:

1. **Global chrome** — header, sign-in/sign-out, dashboard shell, footer/help links.
2. **Decode a Moment** — step titles, prompts, buttons, validation messages (not saved output).
3. **Dashboard** — section headings, empty states, non-identifying helper copy.
4. **Journal Trail** — list labels, filters, share-for-review UI shell.
5. **Relationship Garden** — pot labels, stage names, helper copy (preserve non-scoring, non-diagnostic tone).
6. **Events** — browse/add-to-calendar UI.
7. **MHP review-sharing** — consent titles and checkbox framing (English + 简体中文 static strings).
8. **Payment/upgrade shell** — when payment runtime exists; plan names may stay branded (Wayfinder Plus / Connected) with translated descriptions.

Lower priority for v1 toggle: MHP portal full translation, admin.html, owner ops, research instruments, self-read bytes (translate when that content PR ships).

---

## 8. Parent-facing copy tone (zh-Hans)

Simplified Chinese product copy should be:

- warm, plain, and respectful;
- non-diagnostic and non-blaming toward child and parent;
- aligned with ALIGN/CAB — not behaviour labels or fixes;
- cautious about child needs (可能的需求 / 也许 / 不妨一起探索);
- appropriate for parent emotional development, not clinical treatment marketing.

**Avoid:**

- 你的孩子有问题 / your child is the problem;
- 诊断 / diagnose the child;
- 对立 / oppositional child labels;
- 控制型家长 / controlling parent type labels;
- guaranteed outcomes or behaviour-fix promises.

**Prefer:**

- 这个行为可能在传递某种需求 / this behaviour may have been signalling a need;
- 在你身上发生了什么 / what happened in you;
- 下一步可以尝试 / one next step you might try;
- 修复 / repair intention without shame.

---

## 9. MHP terminology guidance

| Context | Label |
|---------|-------|
| Parent/client-facing UI | **Mental Health Professional** / **MHP** (or approved 简体中文 equivalent such as 心理健康专业人士 — final copy in runtime PR) |
| Internal role / code / SQL | `counsellor` — **do not rename** |
| Review sharing | Parent-controlled sharing; not automatic clinical care |

MHP portal translation may follow parent portal in a **later** PR. Do not expose internal `counsellor` role strings in parent-facing zh-Hans UI.

Portrait, source photo, and generated candidate rules from [MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md) remain unchanged.

---

## 10. Research and consent wording implications

Research participation remains **opt-in and consent-based** in every language.

When consent copy is translated:

- preserve purpose limitation and withdrawal language;
- do not imply research is required for app use;
- do not bundle research consent invisibly into language selection;
- align with [CONSENT_RESEARCH_GOVERNANCE_PLAN.md](./CONSENT_RESEARCH_GOVERNANCE_PLAN.md) and future consent persistence specs.

Language toggle must not change consent_records runtime until explicitly approved in a consent PR.

---

## 11. Payment and pricing wording implications

See [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md).

When payment UI is localised:

- **privacy remains baseline in every plan** — not a paid feature;
- translate plan **descriptions**, not Stripe legal invoices unless counsel approves;
- preserve Wayfinder / Wayfinder Plus / Wayfinder Connected product names unless marketing approves localized display names;
- do not imply therapy, diagnosis, or automatic MHP sharing in zh-Hans upgrade copy;
- `preferred_language` is not a billing entitlement field.

---

## 12. UX strategy (future runtime)

Recommended first UX:

- **Location:** dashboard settings or header menu — "Language / 语言".
- **Control:** two-option toggle or select: English | 简体中文.
- **Persistence:** store `preferred_language` on profile or local preference per future schema review — browser must not be sole authority for paid features; for UI language, client preference with server sync is acceptable after schema review.
- **Default:** `en` for existing users; respect browser `Accept-Language` only as a **hint** for first visit, not for overriding an explicit user choice.
- **Scope v1:** parent portal (`index.html`) first; MHP portal (`counsellor.html`) second; admin excluded.

No language toggle in this PR.

---

## 13. Technical approach (future runtime — not PR #123)

Recommended pattern:

1. **Static string dictionary** — keyed by `en` and `zh-Hans` (extend existing `content.js` pattern or add `content.zh-Hans.js` / locale module in a dedicated PR).
2. **Lookup helper** — `t(key)` or existing content object switch by `preferred_language`.
3. **No runtime machine translation** of user content in v1.
4. **HTML `lang` attribute** — update `<html lang="en">` / `lang="zh-Hans">` on toggle.
5. **No SQL in first toggle PR** unless owner approves a minimal `preferred_language` column on profiles — defer until schema review PR.
6. **No changes** to journal save/read payloads for language in v1.

Explicitly **out of scope** for language work:

- auth / ensure_profile / email verification logic;
- RLS policies;
- payment / Stripe;
- PWA manifests (already handled in PR #121 / GitHub #122);
- Android Play Protect install warnings — **deferred**; do not reopen in language PRs.

---

## 14. Future runtime implementation sequence

| Step | PR theme (suggested) | Delivers |
|------|----------------------|----------|
| 1 | **PR #123 (this)** | Strategy spec only |
| 2 | PR #124+ | Static UI dictionary structure + language toggle UI (parent portal) |
| 3 | Later | Optional `preferred_language` persistence after schema review |
| 4 | Later | MHP portal static copy translation |
| 5 | Later | Payment upgrade copy localisation (with payment runtime) |
| 6 | Later | Self-read relationship bytes zh-Hans content |
| 7 | Future | Consent-gated reflection translation (only if approved) |

Do not bundle language toggle with payment gates, research storage, or journal schema changes.

---

## 15. Acceptance criteria for the later build PR

The first **runtime** language toggle PR should be accepted only if:

- [ ] Only approved files changed; no unauthorised auth/SQL/payment/PWA edits.
- [ ] Toggle offers **English** and **简体中文** with codes `en` / `zh-Hans`.
- [ ] Static UI copy translates; **saved journal/Decode/reflection text does not auto-translate**.
- [ ] No private reflections sent to external translation services.
- [ ] ALIGN/CAB and Decode pathway copy remains non-diagnostic and non-blaming in both languages.
- [ ] Official ALIGN letters and CAB meanings preserved or clearly mapped in glossary.
- [ ] MHP parent-facing label remains Mental Health Professional (or approved zh-Hans equivalent); internal role stays `counsellor`.
- [ ] Dashboard, auth, journal save/read, Parent ID / Child ID, and privacy masking still work.
- [ ] No parent email, Supabase UUID, child names, tokens, or secrets in normal UI.
- [ ] App Version entry added **only** if owner approves parent-visible release note for that runtime PR.
- [ ] Manual smoke: toggle language on dashboard and Decode shell; save journal entry in Chinese or English; confirm entry text unchanged when switching language.

---

## 16. PR #123 acceptance criteria (this PR)

- [ ] Only `docs/LANGUAGE_TOGGLE_ZH_HANS_STRATEGY.md` and `docs/CURRENT_LAUNCH_STATUS.md` changed.
- [ ] No runtime, SQL, API, auth, payment, PWA, or App Version changes.
- [ ] Privacy rules prohibit automatic translation of private reflections.
- [ ] ALIGN/CAB canon preserved.
- [ ] `git diff --check` passes.

---

## Related docs

| Doc | Role |
|-----|------|
| [PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md](./PAYMENT_GATEWAY_AND_PRICING_STRATEGY.md) | Payment + roadmap context |
| [PWA_INSTALL_COMPATIBILITY_AUDIT.md](./PWA_INSTALL_COMPATIBILITY_AUDIT.md) | PWA complete; Android install warning deferred |
| [MHP_PROFILE_IMAGE_STRATEGY.md](./MHP_PROFILE_IMAGE_STRATEGY.md) | Portrait privacy unchanged |
