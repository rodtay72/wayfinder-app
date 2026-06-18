# Questionnaire Measures Framework

## Status

**Day 3 — docs-only research architecture**

Questionnaires are **not live** in the Wayfinder app today. This document defines planning rules for how validated measures may complement existing evidence streams. It does **not** authorise schema changes, API changes, Supabase edits, auth changes, questionnaire UI, scoring engines, consent persistence, or research exports.

Read first:

- [AGENTS.md](../AGENTS.md)
- [docs/WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [docs/RESEARCH_AI_CAPABILITY_MAP.md](./RESEARCH_AI_CAPABILITY_MAP.md)
- [docs/ACTIVITY_PRACTICE_TAXONOMY.md](./ACTIVITY_PRACTICE_TAXONOMY.md)
- [docs/WAYFINDER_AGENT_OPERATING_SYSTEM.md](./WAYFINDER_AGENT_OPERATING_SYSTEM.md)

---

## Non-negotiable framing

Wayfinder is **not**:

- child diagnosis or labelling
- parent scoring, ranking, or fixed parent typing
- stage completion or “relationship fixed/solved” tracking
- a Behaviour → Advice parenting tool

Wayfinder **is** a parent emotional development pathway using ALIGN/CAB:

Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action

Use cautious language in all research and product copy: **may**, **might**, **possible**, **appears to suggest**, **let's explore**.

---

## 1. Purpose — Wayfinder questionnaire and measures role

Wayfinder may use **questionnaires and structured measures** in research to complement — not replace — parent narrative evidence.

### What measures may support

- Optional **baseline**, **follow-up**, or **stratification** in approved research studies
- Context for interpreting parent alignment capacity alongside reflection, decode, activity practice, and (where governed) AI-coded patterns
- Exploration of whether parent-side capacities **may** shift over time when combined with ALIGN/CAB practice — without claiming clinical outcome or child change as primary success

### What measures must not become

- Everyday app requirements or parent dashboard scores
- Child assessment, temperament diagnosis, or behaviour labelling tools
- Parent performance rankings, percentiles, or ALIGN stage completion metrics
- Substitutes for parent-written reflection or counsellor-reviewed interpretation

### Default pipeline

Unless explicitly approved otherwise: **research-only collection and export**, with separate consent from everyday app use and from Phase A PDPA signup notice acknowledgement.

---

## 2. Measurement domains

Each domain below describes a **research lens** on parent–child relational practice. Domains are **not** parent diagnoses, child labels, or composite scores.

| Domain | Research meaning | Example evidence (may combine) |
|--------|------------------|----------------------------------|
| **Parent self-emotional regulation** | Parent capacity to notice and stay with own affect and body signals without immediate reactivity | Journal affect/CAB fields; decode Integrate; activity `cab_domain: affect` |
| **Reflective functioning / mentalisation** | Parent curiosity about possible child inner experience — without certainty or labelling | Decode Locate/Integrate text; cautious AI congruence coding (governed) |
| **Parent sensitivity and responsiveness** | Attunement to emerging need signals in the dyad — not graded performance | Decode possible-need language; marker claims; activity `possible_need_context` |
| **Co-regulation** | Shared pacing, calming, and joint regulation during difficulty | Activity metadata (`co_regulation`); journal markers; decode repair language |
| **Emotion socialisation** | How emotions are named, validated, and modelled relationally in the family | Journal meaning/CAB fields; activity prompts (research-only metadata) |
| **Parenting stress / wellbeing** | Contextual load and wellbeing — describes context, not parent deficit | Licensed questionnaires (research-only, if approved); not inferred as app score |
| **Parental self-efficacy** | Parent sense of capacity for aligned response — not pass/fail or rank | Self-declared growth/navigate steps; never a leaderboard metric |
| **Child temperament / developmental context** | Background developmental context only — **never child diagnosis or typing** | Research stratification only; must not produce child labels in app or export |
| **Repair and aligned next action** | Rupture–repair capacity and Navigate-step choice | Decode Navigate; activity `repair` rhythm; journal repair language |
| **Practice over time** | Longitudinal exposure to ALIGN practice — not stage mastery | Journal timestamps; activity `progress_signal`; ALIGN Journey recency (non-scoring) |

**Rule:** Domains describe what evidence **may** be explored together. They must not be merged into a single “parent health score” or “child risk score.”

---

## 3. Four evidence types — how they differ

Wayfinder research may draw on four distinct evidence types. Each has different governance, licensing, and audience rules.

| Type | What it is | Live today | Parent-facing default | Research use |
|------|------------|------------|----------------------|--------------|
| **Professional questionnaire instruments** | Validated scales administered per publisher/ethics protocol | **No** | Not approved by default | Baseline/follow-up only if licensed, consented, and ethics-approved |
| **App-derived ALIGN/CAB indicators** | Self-declaration and read-only inference: markers, CAB fields, ALIGN Journey cards, decode structure | **Partial** | Yes — cautious, non-scoring copy | De-identified aggregates; no composite parent score |
| **AI-coded congruence markers** | Server-side pattern coding (e.g. `present` / `emerging` / `not yet clear`) | **Partial** (DISC insight, counsellor AI) | Gated; counsellor workspace for sensitive outputs | Counsellor review path; not parent ranking |
| **Activity practice signals** | `ACTIVITY_PRACTICE_CATALOG` metadata joined to journal `phase` + `activity` label | **Yes** (metadata in `content.js`) | Activity selection unchanged | `progress_signal` exposure tags — not mastery or completion % |

### Integration rule

These four streams **must not** be merged into:

- a single parent score or percentile
- a child temperament or behaviour label
- an ALIGN stage completion percentage
- a “relationship fixed” or “problem solved” indicator

Questionnaire data **may** sit alongside app-derived evidence in research datasets only when licensing, consent, and de-identification rules are met.

---

## 4. Questionnaire metadata model

When an instrument is considered for future research, record planning metadata **without embedding copyrighted item text** in the repository.

| Field | Description |
|-------|-------------|
| `instrument_name` | Official instrument title as published |
| `domain` | One or more domains from [Section 2](#2-measurement-domains) |
| `source_licensing_status` | e.g. `public_domain`, `licensed`, `permission_pending`, `not_approved` |
| `respondent_type` | e.g. `parent`, `counsellor_administered`, `research_coordinator` |
| `item_format` | e.g. Likert, frequency, yes/no — **item text stored only under confirmed license** |
| `scale_subscale_structure` | Named subscales (reference to publisher structure only) |
| `scoring_method_reference` | Publisher manual or approved protocol citation — no embedded formulas for copyrighted scales |
| `version` | Instrument version administered |
| `timing_frequency` | e.g. `baseline`, `follow_up_12w`, `ad_hoc` — per approved research protocol |

### Placeholder example (not an approved instrument)

| Field | Example value |
|-------|---------------|
| `instrument_name` | Parenting Stress Index (example placeholder) |
| `domain` | Parenting stress / wellbeing |
| `source_licensing_status` | `permission_pending` |
| `respondent_type` | `parent` |
| `item_format` | Likert (per publisher manual) |
| `scale_subscale_structure` | Per publisher subscale names — not copied here |
| `scoring_method_reference` | Publisher scoring manual — external reference only |
| `version` | TBD upon license |
| `timing_frequency` | `baseline`, `follow_up_12w` |

This row is illustrative only. **No items, cutoffs, or scoring formulas appear in Wayfinder docs or code without license and clinical/ethics review.**

---

## 5. Licensing and copyright caution

Validated questionnaires are typically **copyrighted intellectual property**.

### Before any instrument is referenced in implementation

- Confirm **copyright / license agreement** with the instrument owner or publisher
- Confirm fees, registration, or research-use terms if applicable
- Confirm rules on **modification**, translation, and mode of administration
- Confirm whether **trained administration** or clinician oversight is required
- Obtain **ethics review** and **informed consent** appropriate to the study

### Repository and product rules

- **Do not** copy questionnaire items into app code, docs, AI prompts, or training data unless permission and licensing are confirmed in writing
- **Do not** embed PHQ, GAD, PSS, or other copyrighted scales in Wayfinder without legal and clinical review
- Reference instrument **names**, **domains**, and **licensing status** only in planning metadata
- Store actual item text and scoring keys in approved, access-controlled research systems — not in the public app repository

See also [RESEARCH_AI_CAPABILITY_MAP.md — Section 6](./RESEARCH_AI_CAPABILITY_MAP.md).

---

## 6. Parent-facing vs research-only outputs

| Output | Default audience | Status / rule |
|--------|------------------|---------------|
| Raw questionnaire scores and subscales | Research only | Requires licensed instrument + explicit research opt-in |
| Clinical cutoffs or “your score means X” | **Not approved** for parents | Stop condition |
| De-identified aggregate trends | Research | Consent-gated export; legal basis documented |
| Plain-language reflection summaries | Parent (if ever approved) | No diagnoses, cutoffs, or certainty language |
| ALIGN Journey cards | Parent | Live — cautious, non-scoring copy |
| Decode / journal / markers | Parent | Live — self-declaration; not clinical validation |
| Activity practice metadata | Parent | Live — dropdown labels unchanged; metadata research-only |
| DISC insight / counsellor AI | Parent / counsellor | Live — governed; not child assessment |
| In-app questionnaire administration | **Not approved** by default | Stop condition without full governance review |

### Key rule

**Using the parent app, signing up, or viewing the App Version page is not research consent.**

Research participation requires its own notice, legal basis, and opt-in architecture (future Phase B/C).

---

## 7. Consent and privacy implications

### Current state (main)

| Topic | Today | Implication for measures |
|-------|-------|--------------------------|
| PDPA signup notice | UI checkbox; **not persisted** | Does not authorise questionnaire collection |
| Research opt-in | Not implemented | No measure administration in app |
| Identifiers in normal UI | Parent ID, Child ID | No parent email, child names, Supabase UUID |
| Free-text reflections | User-typed | May contain PII — minimise in copy; review before export |
| Questionnaire responses | Not collected | Future collection requires separate consent design |

### Privacy rules for future measure collection

- Scope evidence per **Parent ID / Child ID** dyad unless an approved study design states otherwise
- Never export JWTs, emails, service keys, or direct identifiers in research datasets when de-identification is feasible
- Review free-text and open-ended questionnaire responses for accidental PII before release
- Document **legal basis** (consent, legitimate interest, etc.) before any research use — legal review required
- Agent handoffs must not include raw reflection or questionnaire content ([platform sync brief rules](./PLATFORM_SYNC_BRIEF_TEMPLATE.md))

PDPA signup copy states future learning **may** use anonymised or de-identified data with safeguards. That statement is **not** active research consent.

See [RESEARCH_AI_CAPABILITY_MAP.md — Section 8](./RESEARCH_AI_CAPABILITY_MAP.md).

---

## 8. Question Vetting and Item Governance

Every questionnaire item, app-derived question, AI-generated prompt, parent reflection prompt, and future research measure must pass a **mandatory review gate** before use in Wayfinder — in UI, research export, AI pipelines, or approved study protocols.

### Scope — what this gate applies to

- Professional questionnaire items (metadata only in repo until licensed)
- Custom Wayfinder research questions
- Parent reflection prompts (including any future parent-facing measure wording)
- AI-generated draft items and AI research coding prompts
- Activity taxonomy reflection prompts (`post_practice_reflection_prompt` — research-only today)

No item may skip this gate because it is “internal,” “research-only,” or “AI-assisted.”

### 8.1 Twelve review criteria

| # | Criterion | Requirements |
|---|-----------|--------------|
| 1 | **Cultural sensitivity** | Avoid assumptions about family structure, parenting style, religion, ethnicity, class, education, gender roles, language background, or household resources. Questions must work across diverse families and cultural contexts. If adapted for another language or culture, require **cultural adaptation** — not direct translation only. |
| 2 | **Bias and prejudice** | No wording that assumes one parenting behaviour, family norm, or child response is superior without context. No wording that blames parents, labels children, or pathologises family differences. Avoid examples that privilege middle-class, two-parent, neurotypical, English-speaking, or Western family assumptions. |
| 3 | **Non-discrimination** | No discriminatory wording related to race, ethnicity, nationality, gender, disability, neurodivergence, religion, income, marital status, family composition, or education. Do not imply that one family structure is healthier or more valid than another. |
| 4 | **Simple English** | Use plain, parent-facing language. Avoid academic, clinical, legal, or counselling jargon unless explained. Prefer short sentences and one idea per sentence. Prefer terms like “what you noticed,” “what you felt,” “what you did,” and “what your child may have needed.” |
| 5 | **Not loaded** | No question should imply the “right” answer. No emotionally charged or shaming wording. Avoid words such as “failed,” “bad,” “wrong,” “overreacted,” “should have,” “always,” or “never,” unless part of a validated licensed instrument and used with permission. |
| 6 | **Not leading** | Do not push parents toward a particular answer. Avoid questions like “How much better did you respond after using Wayfinder?” Prefer neutral wording like “What did you notice in your response?” |
| 7 | **Not double-barrelled** | Each item must ask about only one construct. Do not combine two ideas such as “I stayed calm and connected with my child.” Split into separate items, e.g. “I noticed my emotional state” and “I tried to connect before correcting.” |
| 8 | **One construct per item** | Each question must map clearly to one domain from [Section 2](#2-measurement-domains) or to an AI congruence marker — not multiple domains in one item. |
| 9 | **Response scale clarity** | Response options must be balanced and easy to understand. Avoid vague scales unless anchored. Define what high/low means for research use without turning it into parent-facing scoring. |
| 10 | **Licensing and validated instruments** | If using professionally prepared or validated instruments, do not rewrite, simplify, translate, score, or reproduce items unless licensing/permission allows it. Any adaptation may affect validity and must be documented. If permission is unclear, store only instrument metadata and do not copy item text. |
| 11 | **Cognitive testing requirement** | Before launch of any custom Wayfinder research questions, require parent comprehension review or cognitive interviewing. Review whether parents understand the item as intended and whether wording causes shame, confusion, cultural mismatch, or defensive responding. |
| 12 | **AI-generated question control** | AI may suggest draft items, but AI-generated questions must pass human review before use. AI must not generate diagnostic, discriminatory, leading, loaded, or double-barrelled items. AI-generated research coding prompts must also be reviewed for bias and cultural assumptions. |

### 8.2 Required item review checklist

For **every** item, document answers before approval:

| Review question | Pass required |
|---------------|---------------|
| What construct does this item measure? | Yes — one domain from Section 2 or AI congruence marker |
| Is it parent-facing or research-only? | Yes — audience declared |
| Is it culturally sensitive? | Yes |
| Could any group reasonably feel blamed, excluded, stereotyped, or judged? | No reasonable harm |
| Is the language simple enough for non-specialist parents? | Yes |
| Is it neutral? | Yes |
| Is it free from loaded language? | Yes |
| Is it free from leading language? | Yes |
| Does it ask only one thing? | Yes |
| Are response options clear and balanced? | Yes |
| Is it licensed/approved for use if from a professional instrument? | Yes, or metadata-only |
| Does changing the wording affect validity? | Documented if applicable |
| Does it preserve Wayfinder’s ALIGN/CAB non-diagnostic framing? | Yes |

Items that fail any required check must be revised or rejected before use.

### 8.3 Item-level stop conditions

Stop item use or publication and escalate to the human owner when:

| Condition | Action |
|-----------|--------|
| Item is diagnostic | Halt |
| Item labels the child | Halt |
| Item scores the parent in a shaming way | Halt |
| Item is culturally biased | Halt |
| Item is discriminatory | Halt |
| Item is loaded or leading | Halt |
| Item is double-barrelled | Halt; split or rewrite |
| Professional questionnaire item copied without confirmed permission | Halt |
| Translation or adaptation proposed without cultural review | Halt |

---

## 9. Future backend and schema phases

This section is **roadmap only**. Day 3 does **not** authorise SQL, RLS, `supabase.js`, `api/*`, or HTML changes.

| Phase | Measures-related focus | Prerequisites |
|-------|------------------------|---------------|
| **B — Consent persistence** | Store PDPA notice version, acknowledgement timestamp, optional research opt-in flags | Approved high-risk branch; `ensure_profile` compatibility |
| **C — Research evidence store** | Instrument registry, response storage, de-identified export jobs | Ethics alignment; export SOP; no browser-side profile writes |
| **D — AI and counsellor linkage** | Join governed AI congruence coding with measure timelines per Child ID | [AI Reflective Evidence Layer plan](./WAYFINDER_PHASE_3_AI_REFLECTIVE_EVIDENCE_LAYER_PLAN.md) approval |
| **Audit track** | `audit/research-consent-legal-basis` — instrument licenses, legal basis, counsellor governance | Parallel to B/C |

### Unchanged guardrails across all phases

- No browser `profiles.insert` / `profiles.upsert`
- Dashboard reads by `parent_id` first with Bearer token
- Static React/Babel architecture unless explicitly approved otherwise
- One branch, one merge at a time

---

## 10. Stop conditions before implementation

Stop questionnaire planning, implementation, UI work, export, or item publication and escalate to the human owner when:

| Condition | Action |
|-----------|--------|
| Proposal introduces child diagnosis, labelling, or temperament typing | Halt; revise framing |
| Proposal introduces parent scoring, ranking, fixed parent types, or stage completion | Halt; revise framing |
| Questionnaire items embedded without confirmed license + clinical/ethics review | Halt |
| Parent-facing scores, cutoffs, or diagnostic certainty proposed | Halt |
| Measures would replace parent narrative as primary evidence | Halt; revise design |
| Research export includes raw PII without consent and de-identification review | Halt |
| Schema, auth, `api/*`, or HTML entry points change without approved high-risk branch | Halt |
| ALIGN/CAB canon or PDPA rules would be weakened | Halt; report conflict |
| AI measure interpretation reaches parents without required counsellor governance | Halt |
| Any [Section 8 item-level stop condition](#83-item-level-stop-conditions) is triggered | Halt |

---

## Related documents

| Document | Role |
|----------|------|
| [RESEARCH_AI_CAPABILITY_MAP.md](./RESEARCH_AI_CAPABILITY_MAP.md) | Day 1 evidence streams, consent, future phases |
| [ACTIVITY_PRACTICE_TAXONOMY.md](./ACTIVITY_PRACTICE_TAXONOMY.md) | Day 2 activity practice metadata (PR #9) |
| [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md) | Product and research framing canon |
| [WAYFINDER_AGENT_OPERATING_SYSTEM.md](./WAYFINDER_AGENT_OPERATING_SYSTEM.md) | Agent merge rules and guardrails |
| [PLATFORM_SYNC_BRIEF_TEMPLATE.md](./PLATFORM_SYNC_BRIEF_TEMPLATE.md) | Cross-platform handoff without raw user data |
| [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) | Release snapshot |

---

## Document control

| Field | Value |
|-------|-------|
| Issue | Questionnaire Measures Framework (Day 3) |
| Branch | `docs/questionnaire-measures-framework` |
| Base | `main` @ PR #9 (`c0d91f9`) |
| App Version entry | Not required (internal docs-only) |
| Prerequisites | PR #7 (Capability Map), PR #9 (Activity Taxonomy) |
| Questionnaires in app | **No** — planning framework only |
