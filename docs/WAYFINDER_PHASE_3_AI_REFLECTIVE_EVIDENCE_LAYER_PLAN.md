# Wayfinder Phase 3 — AI Reflective Evidence Layer Plan

## Status

**Planning only.** This document describes a future server-side AI-assisted reflective evidence layer. No implementation, schema change, code change, Supabase change, auth change, or deployment change is authorised by this document.

This plan depends on Phase 3 (Your ALIGN Journey) being accepted and live, and builds toward Phase 3B–3D and Phase 4 in the roadmap. It does not replace or modify `docs/WAYFINDER_PHASE_3_ALIGN_JOURNEY_PLAN.md`.

---

## 1. Phase purpose

This plan describes a **future AI-assisted reflective evidence layer** for Wayfinder.

The layer does not exist yet. It is not currently being built. No code will be written until Rodney reviews and approves a separate implementation brief.

The purpose of this layer is to help parents — and later, counsellors — develop a deeper, safer understanding of written reflection evidence accumulated across each child relationship, using careful AI analysis on the server side.

The layer will:

- read parent-written journal reflections and behaviour decode entries
- identify patterns in parent Cognition, Affect, and Behaviour (CAB) within each child relationship
- locate possible ALIGN-stage evidence across the parent's reflection history
- surface cautious, non-diagnostic, non-scoring summary insights
- suggest one stage-appropriate Wayfinder activity per child relationship when evidence is sufficient
- support counsellor review of AI-generated summaries before or after they reach the parent

This layer must never become a diagnostic engine, a scoring system, a parent-ranking tool, a child-labelling tool, or a substitute for counsellor or clinical support.

---

## 2. Why this layer is needed

The current Wayfinder dashboard reads saved entry payloads in the browser and derives conservative, read-only insights from tags and structured fields. This is appropriate for early phases and ensures privacy and safety.

However, the structured-tag approach has a fundamental limitation: **it can only underclaim**.

- It can count entries.
- It can read tags.
- It can detect whether a field is filled or empty.
- It cannot read what the parent actually wrote.

True reflective insight — "what is this parent noticing about their CAB?", "what possible need are they repeatedly locating?", "what ALIGN stage may be genuinely practised vs merely attempted?" — requires careful analysis of **written evidence** across multiple reflections.

A parent may complete every section of a behaviour decode and still have no meaningful written reflection. Another parent may write one sentence in a single entry that reveals deep Locate-stage insight. The tag layer cannot distinguish between these.

The AI reflective evidence layer is designed to:

- read written reflection evidence carefully, across entries
- identify what is present, what is emerging, and what is not yet clear
- surface insights cautiously, using language that invites rather than concludes
- avoid overclaiming, labelling, or shaming
- support counsellor review of what the AI notices before parents see it

This layer should make the Wayfinder dashboard more honest, more useful, and more aligned with the product's research ambitions — without crossing into diagnosis, scoring, or behaviour advice.

---

## 3. Per-child analysis model

The AI must analyse **each child relationship separately**.

A parent may show very different Cognition, Affect, and Behaviour patterns with different children. The AI must not pool or average evidence across children. It must not transfer assumptions from one child relationship to another.

### Per-child scope rules

- Each analysis unit is one **parent–child relationship** (one Child ID).
- Analysis reads only journal entries and decode entries linked to that Child ID.
- Evidence sufficiency is assessed per child, not per parent globally.
- CAB patterns are summarised per child.
- ALIGN evidence is summarised per child.
- Activity recommendations are per child.

### Why Child ID, not child name

- Normal UI must not expose child names (per AGENTS.md and PDPA rules).
- The AI layer uses **Child ID** only for scoping and cross-referencing.
- Any parent-facing output describes the relationship using "your child" or "this relationship" — never the child's name.

### Multi-child parents

When a parent has more than one Child ID:

- Each child relationship is summarised separately.
- The AI must not say "your child pattern applies to both children."
- The AI must not compare children.
- Cross-child overgeneralisation is listed as a named risk in Section 15.

---

## 4. Evidence sufficiency model

The AI must assess **reflection evidence sufficiency** before generating any pattern summary. Generating pattern summaries from insufficient evidence risks hallucination, overclaiming, and parent harm.

### Evidence thresholds

| Entry count (per Child ID) | AI behaviour | Suggested parent-facing copy |
| --- | --- | --- |
| **0 entries** | No pattern summary. Invite one reflection. | "Wayfinder is ready when you are. One small reflection can be a starting point." |
| **1 entry** | Single-moment reflection only. No pattern inference. | "There may be one reflection here worth noticing. A few more may help Wayfinder see more safely." |
| **2–3 entries** | Early pattern may be emerging. Use highly cautious language. | "Your recent reflections suggest something that may be worth noticing. A few more reflections may help Wayfinder say this more safely." |
| **4+ entries** | Cautious recurring themes may be summarised. Still use cautious language. | "There may be enough reflection evidence to notice a possible pattern." |

### Recency

- Recent entries (last 2–4 weeks) may be used for a "current focus" hint.
- They must **not** be treated as proof of growth, stage completion, or change.
- Older entries remain part of the evidence base but should be flagged as less recent.

### Language for evidence sufficiency

Use the phrase **"reflection evidence sufficiency"** in internal planning and technical documentation.

Do **not** use:

- "adequate journalling"
- "enough journalling"
- "you have not journalled enough"
- "journal more to unlock insights"

These phrases frame journalling quantity as a moral or performance metric. They must not appear in parent-facing copy.

---

## 5. CAB evidence rubric

The AI should identify **written evidence** for each component of the parent's CAB pattern within each child relationship.

### Cognition evidence

The AI looks for: parent thought, assumption, expectation, prediction, interpretation, or self-appraisal within the written reflection.

Examples of Cognition evidence in written text:

- "I expected them to be ready."
- "I thought they were doing this deliberately."
- "I kept thinking we were going to be late."
- "I assumed they understood."
- "I wondered if I was making it worse."

### Affect evidence

The AI looks for: named emotion, body state, urgency marker, overwhelm, intensity, or felt sense within the written reflection.

Examples of Affect evidence in written text:

- "I felt frustrated."
- "My chest went tight."
- "I was so rushed."
- "I felt helpless."
- "Something felt urgent in me."

### Behaviour evidence

The AI looks for: described parent action, reaction, pause, repair attempt, escalation, avoidance, or connection move within the written reflection.

Examples of Behaviour evidence in written text:

- "I raised my voice."
- "I tried to explain and it made it worse."
- "I stopped and took a breath before speaking."
- "I went over and sat with them."
- "I apologised later."

### CAB evidence output states

The AI should output one of three states for each CAB component:

| State | Meaning |
| --- | --- |
| **present** | Written evidence clearly names or describes this component |
| **emerging** | Written evidence suggests this component but does not name it explicitly |
| **not yet clear** | Insufficient or absent written evidence for this component |

Do **not** use numerical scores.
Do **not** use percentage confidence.
Do **not** say "your Cognition score is X."
Do **not** say "your Affect is weak."

---

## 6. ALIGN evidence rubric

The AI should identify **written evidence** for each stage of ALIGN practice across each child relationship.

### A — Awareness evidence

The parent names what happened without judging the child.

Written evidence indicators:

- Parent describes the child's behaviour in observational, non-blaming language.
- Parent does not conclude about child motive or character.
- Parent uses language like "what I noticed was," "what happened was," or "what I first saw."

What Awareness evidence does **not** require:

- The parent to perfectly avoid all reactive language.
- A complete or long description.

### L — Locate evidence

The parent identifies a possible child need and the parent's own affect.

Written evidence indicators:

- Parent names or speculates about a possible child need ("I wondered if they needed…").
- Parent names their own emotional or body state during the moment.
- Parent uses exploratory rather than conclusory language.

What Locate evidence does **not** require:

- Accurate identification of the actual child need.
- A named emotion that matches a clinical affect category.

### I — Integrate evidence

The parent connects the child's possible need with their own Cognition, Affect, and Behaviour.

Written evidence indicators:

- Parent references both their own internal state and the child's possible need in the same reflection.
- Parent identifies a misalignment or tension between what the child may have needed and what the parent did.
- Parent uses language like "I can see that while they may have needed X, I was…"

What Integrate evidence does **not** require:

- A perfectly articulated CBT formulation.
- A full sentence naming all three CAB components explicitly.

### G — Growth evidence

The parent identifies a capacity they are developing or wish to practise.

Written evidence indicators:

- Parent names a possible practice direction ("next time I might…", "what might help is…").
- Parent names awareness markers ("I noticed I can…", "I am becoming aware that…").
- Parent shows reflection on their own development, not on changing the child.

What Growth evidence does **not** require:

- A completed or successful practice.
- A formal commitment or contract.

### N — Navigate evidence

The parent chooses a next action or repair step.

Written evidence indicators:

- Parent states a concrete intended action ("I will try…", "I am going to…").
- Parent names a repair intention ("I want to reconnect," "I may need to apologise").
- Parent describes a repair that has already occurred.

What Navigate evidence does **not** require:

- A guaranteed outcome.
- Evidence that the action was taken successfully.

### ALIGN evidence output states

Use the same three states as CAB:

| State | Meaning |
| --- | --- |
| **present** | Written evidence clearly supports this ALIGN stage |
| **emerging** | Written evidence suggests this stage but not fully explicit |
| **not yet clear** | Insufficient or absent written evidence for this stage |

### Critical rule: decode completion ≠ ALIGN practice

A completed Decode a Moment entry touches all five ALIGN prompts by structure. This does **not** mean the parent has practised all five stages.

- A parent may complete G (Growth prompt) with a single word.
- A parent may write a single deeply integrated sentence under L (Locate) that reveals genuine stage practice.

The AI must assess **quality and substance of written evidence**, not structural completion of form fields.

Practice evidence should come from:

- Repeated reflections showing the same pattern of awareness, locate, integrate, or navigate
- Activity journal entries tagged with `alignStage` (practice route)
- Written examples of action or repair in Navigate or Growth sections

---

## 7. Decoder stage tagging

### Current state

`behaviour_decode` entries persist a nested `align{}` object covering:

- `align.awareness`
- `align.locate`
- `align.integrate`
- `align.growth`
- `align.navigate`

These represent the **content sections** of the Decode flow, not explicit stage-practice labels.

### Planned future tagging

When implemented, decode saves may include derived tags:

```json
{
  "entry_type": "behaviour_decode",
  "alignStagesExplored": ["a", "l", "i", "g", "n"],
  "primaryStageExplored": "l",
  "alignStagePractice": []
}
```

| Field | Meaning |
| --- | --- |
| `alignStagesExplored` | Stages whose prompt sections were filled during the decode |
| `primaryStageExplored` | The stage the AI or heuristic identifies as most evidenced in written content |
| `alignStagePractice` | Empty for decodes by default — practice evidence requires separate activity journal |

### Tag meaning

Tags reveal the **stage explored or surfaced** during reflection. They do not claim mastery, completion, or readiness. This distinction must be preserved in any future prompt engineering for the AI layer.

---

## 8. Wayfinder activity stage tagging

### Current state

`content.js` groups the 52-day activities under ALIGN phases (A, L, I, G, N). Activity journal saves currently include a `phase` key.

### Planned future tagging

When implemented, activity journal saves should include an explicit practice tag:

```json
{
  "phase": "L",
  "alignStage": "l",
  "alignStageLabel": "Locate",
  "activityTag": "practice"
}
```

### Planned activity–stage mapping

| ALIGN stage | Activity group | Meaning |
| --- | --- | --- |
| **A — Awareness** | Days 1–10 | Parent practises pausing and naming what happened |
| **L — Locate** | Days 11–20 | Parent practises identifying possible need and parent affect |
| **I — Integrate** | Days 21–31 | Parent practises connecting need with CAB |
| **G — Growth** | Days 32–42 | Parent practises developing regulation capacity |
| **N — Navigate** | Days 43–52 | Parent practises choosing next action and repair |

### Activity tagging rules

- Tag must derive from the **phase key** chosen at journal save time (`ACTIVITIES[phase]`).
- No manual stage selection by parent.
- Older entries without `alignStage` fall back to `phase` if present; entries with neither remain untagged.
- Untagged entries must not break Journey or Garden display.

### Open question

The authoritative list of Wayfinder activities (and their ALIGN-stage assignment) must be confirmed by Rodney before the AI layer uses them for recommendations. See Section 18.

---

## 9. AI feedback model

The AI layer generates a **per-child reflection evidence summary** for the parent. All outputs are optional, cautious, non-shaming, and repair-oriented.

### Output components

#### 1. Reflection evidence summary

A brief, non-diagnostic summary of what written evidence the AI noticed across this child relationship.

Example:
> "There may be enough reflection evidence for this relationship to notice some possible patterns. Your recent reflections suggest you may be exploring what was happening in you at the same time as your child."

#### 2. CAB evidence noticed

A cautious summary of which CAB components appear in written evidence, using the three output states (present / emerging / not yet clear).

Example:
> "Affect evidence is present — you have named emotional and body states in recent reflections. Cognition evidence is emerging — you have begun to name some thoughts and expectations. Behaviour evidence is not yet clear — you may want to reflect on what you did in response."

#### 3. Current ALIGN focus

Which ALIGN stage the written evidence suggests may be a current area of practice.

Example:
> "Your recent reflections suggest Locate may be a current focus — you may be practising identifying what your child may have needed."

#### 4. Emerging strength

One possible practice strength noticed from the written evidence.

Example:
> "An emerging strength may be your willingness to name what was happening in you, even when it felt difficult."

#### 5. Current practice edge

One possible area where the parent's written evidence suggests a next practice direction.

Example:
> "One possible practice edge is Integrate — connecting what you noticed in yourself with what your child may have needed in that moment."

#### 6. Suggested stage-appropriate activity

One optional Wayfinder activity that may support the inferred current practice edge.

Example:
> "A Locate activity may help you stay curious about possible needs beneath behaviour. You might try one when you are ready."

#### 7. Gentle next step

One non-commanding suggestion for what might help next.

Example:
> "You may want to explore one more reflection for this relationship. A few more entries may help Wayfinder notice patterns more safely."

### Output rules

- All outputs are **optional** — parents may collapse or dismiss summary cards.
- No output uses scoring, numerical values, percentages, or ranks.
- No output says "you are aligned," "you are dysregulated," "your child is avoidant," or "you have completed ALIGN."
- No output implies the parent has failed or is behind.
- Outputs must include a counsellor reminder where pattern evidence is present or repeated.

### Counsellor reminder

Where the AI has generated a pattern summary, always include:

> "This reflection summary is a starting point. If this pattern repeats or feels difficult to understand, consider reviewing it with a counsellor."

---

## 10. Activity recommendation criteria

Activity recommendations must be grounded in the specific child relationship context and evidence sufficiency — not driven by day number, newest activity, or recency alone.

### Recommendation inputs

| Input | Source |
| --- | --- |
| Child relationship context | Child ID; entries linked to that Child ID |
| Evidence sufficiency level | Entry count and content assessment per child |
| Current ALIGN focus | AI-inferred or heuristic-derived from recent entries |
| Next practice edge | AI-identified CAB or ALIGN gap from evidence assessment |
| Activity–stage mapping | `alignStage` tags on activity entries; `ACTIVITIES[phase]` catalogue |
| Emotional regulation capacity being practised | Named growth capacity in decode entries and activity journals |
| Relationship-tending relevance | Relationship Garden stage; recent repair evidence |

### Recommendation rules

- Recommend by **stage fit**, not by day number or newest activity.
- Recommend only one activity per child relationship per summary cycle.
- Do not recommend an advanced stage activity unless prior-stage evidence is present.
- Use non-commanding, optional language: "you might try," "when you are ready," "one activity that may help."
- If evidence is insufficient (0–1 entries), do not recommend an activity — invite a first reflection instead.

### What recommendations must not do

- Command: "You must do Day 15."
- Shame: "You have not practised Navigate."
- Rank: "You are behind on Growth."
- Over-claim: "This activity will improve your child's regulation."
- Assume completed stages without written evidence.

---

## 11. Privacy and safety architecture

### Server-side only

All AI analysis must be **server-side only**. The browser must never:

- hold a raw AI API key
- send journal content directly to a third-party AI API
- receive raw journal content from an AI API in the browser

AI analysis must occur inside a Vercel serverless function (or equivalent approved server environment) that:

- authenticates the parent via Bearer token before processing
- reads journal content via authenticated Supabase query
- sends only the minimum necessary content to the AI model
- returns only the summary output to the browser — never raw journal content

### Data minimisation

The AI prompt sent to the AI model must include:

- Parent ID (not email, not Supabase UUID, not JWT)
- Child ID (not child name)
- Written reflection content for the entries being analysed (minimum necessary)
- ALIGN stage tags and entry type metadata

The AI prompt must **not** include:

- Parent email
- Supabase UUID
- Auth tokens or refresh tokens
- Child names
- Counsellor identifiers
- Raw Supabase RLS metadata

### Logging

- Do not log raw journal content unnecessarily.
- Logs must not contain parent email, child names, JWTs, or Supabase UUIDs.
- If logging is required for debugging, use Parent ID and Child ID only, with written content stripped or hashed.

### RLS and auth

- AI analysis endpoint must respect existing Supabase RLS rules.
- The endpoint must authenticate with a verified Bearer token before querying entries.
- The endpoint must not bypass RLS or use service role access for parent data except where explicitly approved.

### Browser-side rules

- No browser-side AI API keys.
- No browser-side AI SDK calls.
- The browser may receive a pre-processed summary payload from the server — not raw AI model output.

---

## 12. Technical architecture options

Three architecture options are defined here for future consideration. No option is chosen or approved by this document.

### Option A — Non-AI heuristic stage tagging first (Phase 3B)

**Description:**
Use structured tags (`alignStage`, `alignStagesExplored`) and simple JavaScript heuristics to infer Current Focus, Recent Pattern, and Growth Practice without calling an AI model.

**Strengths:**
- No AI API costs or latency.
- No risk of hallucination.
- Privacy-safe: no journal content leaves the app.
- Deliverable in Phase 3 without new infrastructure.

**Weaknesses:**
- Cannot read written reflection content.
- Can only infer from tags, structured fields, and entry counts.
- Limited insight depth — can only underclaim.

**Suitable for:** Phase 3B (explicit tagging, non-AI heuristics) as a foundation before AI analysis is introduced.

---

### Option B — Serverless API reflective evidence analysis (Phase 3C)

**Description:**
Add a Vercel serverless function (`/api/reflect`) that:

1. Authenticates the parent via Bearer token.
2. Queries the parent's journal entries for a given Child ID.
3. Sends written reflection content to an AI model (e.g. Claude API) with a carefully engineered safety prompt.
4. Returns a cautious, structured evidence summary to the dashboard.

**Strengths:**
- Can read actual written content.
- Can identify nuanced CAB and ALIGN evidence.
- Can generate cautious stage summaries with appropriate language.

**Weaknesses:**
- Requires careful prompt engineering and safety rules.
- Introduces AI API costs.
- Introduces latency.
- Introduces hallucination risk (see Section 15).
- Requires server-side architecture review and approval.

**Suitable for:** Phase 3C, after Option A tagging is established and Rodney reviews the AI prompt and safety framework.

---

### Option C — Counsellor-reviewed AI summary (Phase 4)

**Description:**
The AI generates a reflective evidence summary, but it is **reviewed and optionally edited by a counsellor** before being shown to the parent. Counsellors see the AI-generated summary alongside the underlying evidence, approve or modify it, and release it to the parent dashboard.

**Strengths:**
- Highest safety level for parent-facing insights.
- Counsellor oversight reduces overclaiming, labelling, and harm risk.
- Aligns with Wayfinder's counsellor validation principle.

**Weaknesses:**
- Requires counsellor portal (Phase 4).
- Adds time delay between reflection and feedback.
- Requires clear rules about what counsellors can edit or suppress.

**Suitable for:** Phase 4 counsellor summary view, as an enhancement to Option B.

---

No implementation option is approved by this document. The choice of approach must be reviewed by Rodney, informed by the open questions in Section 18, and validated by the acceptance criteria in Section 17.

---

## 13. Counsellor validation pathway

### Why counsellors matter

Wayfinder's core principle is that recurring patterns should be validated with a counsellor. The AI reflective evidence layer amplifies this principle: AI analysis may surface possible patterns, but the human professional validation step must remain available and encouraged.

### What counsellors would review

In a future counsellor validation pathway (Phase 4), counsellors should be able to see:

- **CAB evidence summary:** what written evidence the AI noticed for Cognition, Affect, and Behaviour in this child relationship
- **ALIGN stage evidence summary:** which stages have written practice evidence and which are not yet clear
- **Suggested practice:** what activity or direction the AI suggested
- **Parent reflection summary:** a curated, non-identifying excerpt or paraphrase of recent reflection themes (not raw journal content shown unfiltered)

### Counsellor actions

Counsellors should be able to:

- **Approve** an AI-generated summary before it is shown to the parent.
- **Edit or soften** summary language where the AI may have overclaimed.
- **Suppress** a summary that they judge to be unsafe or misleading.
- **Add a counsellor note** that accompanies the parent-facing summary.

### Counsellor privacy rules

- Counsellors must not see parent email in normal counsellor UI.
- Counsellors must not see Supabase UUID.
- Counsellors may see Child ID (not child name).
- Counsellors must not be able to write or delete parent journal entries.
- Counsellor RLS rules must be preserved and reviewed separately.

### When to recommend counsellor review

Where the AI detects:

- High-intensity affect evidence across multiple entries
- Repeated misalignment patterns (same need, same CAB response, across 3+ entries)
- Repair intentions that do not appear to lead to Navigate evidence
- Absence of Growth evidence across an extended evidence set

The parent-facing copy should include:

> "This pattern has appeared more than once. A counsellor can help you validate what you are seeing and practise the next step safely."

---

## 14. Relationship Garden integration

### Principle

The Relationship Garden should grow only from **explicit ALIGN-stage practice evidence**. AI analysis may support identification of practice evidence, but it must not directly drive garden stage advancement.

### Garden stage rules (planned)

| Garden stage | Evidence required |
| --- | --- |
| **Seed** | Dyad exists; no linked entries |
| **Sprout** | At least one entry linked to this Child ID (activity or decode) |
| **Leaves** | At least one activity entry tagged `alignStage: "a"` (Awareness practice evidence) |
| **Bud** | At least one activity entry tagged `alignStage: "l"` or `"i"` (Locate or Integrate practice evidence) |
| **Bloom** | At least one activity entry tagged `alignStage: "n"` (Navigate practice evidence) with earlier-stage evidence also present |

### What the AI layer must not do

- Advance a relationship from Seed to Bloom based on Decode completion alone.
- Advance a relationship based on entry count alone.
- Claim a relationship is at Bloom because the AI inferred ALIGN practice from written content.

Garden stage advancement must come from:

- Explicit `alignStage` tags on activity journal entries (tagged at save time)
- Not from AI inference alone

The AI layer may surface:

- "This relationship may have recent Navigate or repair reflection evidence" as a cautious label
- A note that the garden stage may advance with further practice activity

But garden stage change must be driven by explicit tags — not AI inference alone. This rule protects against the AI layer silently claiming relationship growth that has not been earned through practice.

### Bloom meaning (non-negotiable)

Bloom means: **"This relationship has recent reflection that touched repair or next action, with earlier ALIGN-stage practice evidence present."**

Bloom does not mean:

- the parent is fully aligned
- the child has improved
- the relationship is fixed
- ALIGN is completed
- emotional regulation is mastered

This meaning must be preserved in all future AI prompt engineering and parent-facing copy.

---

## 15. Risks

The following risks must be actively designed against in any future implementation.

### Overclaiming alignment

The AI may infer alignment from partial or formulaic written evidence. A parent who writes "I noticed I was frustrated and I tried to stay calm" has not necessarily practised full Integrate-stage regulation. The AI must use calibrated caution and evidence thresholds. Overclaiming alignment may reduce a parent's motivation to continue practising or to seek counsellor support.

### Parent shame

AI-generated summaries that highlight what is "not yet clear" or what is "not present" in the CAB rubric may produce shame in parents who feel they are failing. Every output must be framed as an invitation, not a verdict. The evidence sufficiency model and language rules in Sections 4–9 are designed to mitigate this risk.

### Child labelling

The AI may generate language that implicitly or explicitly labels the child's character, diagnosis, or developmental pattern. The AI prompt must include explicit instructions to never label the child, never name a child diagnosis, never say the child is avoidant, controlling, dysregulated, or resistant. All child references must be cautious, observational, and need-focused.

### AI hallucination

AI language models may generate plausible-sounding but incorrect pattern summaries from insufficient evidence. Evidence thresholds (Section 4), structured CAB and ALIGN rubrics (Sections 5–6), and explicit AI prompt safety rules must limit this risk. Counsellor review (Section 13) is the strongest available safeguard.

### Insufficient evidence

The AI may generate summaries when evidence is too thin to support them. The evidence thresholds defined in Section 4 must be enforced as hard rules in the AI prompt and server-side logic. The AI should return a "insufficient evidence" state rather than generating a summary when thresholds are not met.

### Privacy leakage

Sending journal content to a third-party AI API carries privacy risk. The data minimisation rules in Section 11 and the server-side-only architecture requirement are designed to manage this. Any AI API provider used must be assessed for data retention, training use, and compliance with relevant privacy regulation before implementation begins.

### Cross-child overgeneralisation

The AI may generate a pattern seen in one child relationship and apply it to another. Per-child scoping (Section 3) must be enforced at both the data query level and the AI prompt level. The AI prompt must specify the Child ID scope and must not reference patterns from other Child IDs.

### Recommending the wrong activity

An AI recommendation that suggests an advanced activity when earlier-stage evidence is absent may confuse or overwhelm a parent. The recommendation criteria in Section 10 must be applied as hard rules. The AI must not recommend a Navigate activity when Awareness evidence is not yet present, for example.

### Weakening trust with counsellors

If parents receive AI-generated summaries that appear authoritative, they may be less likely to seek counsellor validation. The counsellor reminder must appear consistently alongside any AI-generated summary. Counsellor review (Option C in Section 12) is the preferred long-term architecture.

---

## 16. Implementation phases

The AI reflective evidence layer should be introduced in safe, reviewable slices.

### Phase 3B — Explicit activity-stage tagging, non-AI

**Scope:**

- Extend activity journal save to include `alignStage` tag derived from selected `phase`.
- Extend decode save to include `alignStagesExplored` derived from completed sections.
- Update Relationship Garden stage logic to use `alignStage` tags.
- Update Your ALIGN Journey cards to use `alignStage` and `alignStagesExplored`.

**No AI model used.** All insights derive from tags and structured fields.

**Approved files (when implementation is authorised):** `app.js`, `content.js`, `styles.css`, `docs/`.

**Schema change:** Payload fields only (within existing `journal_entries.data` JSON), with backward compatibility preserved.

---

### Phase 3C — Per-child CAB/ALIGN evidence summary, read-only/server-side

**Scope:**

- Add serverless function (`/api/reflect` or equivalent) that:
  - authenticates parent via Bearer token
  - queries entries for a specified Child ID
  - sends written content to AI model with approved safety prompt
  - returns structured evidence summary
- Add read-only AI evidence summary card to Your ALIGN Journey per child.
- Parent-facing language follows Section 9 model.
- Counsellor reminder included in all summaries.

**Requires separate review and approval before implementation:**
- AI prompt and safety rules reviewed by Rodney
- Privacy and server architecture reviewed
- Parent-facing language approved
- Manual test checklist defined

---

### Phase 3D — Stage-aware activity recommendations

**Scope:**

- Extend Phase 3C to include a stage-appropriate activity recommendation per child.
- Recommendation follows Section 10 criteria.
- Activity catalogue confirmed and tagged by Rodney.
- Recommendation is optional, non-commanding, and non-shaming.

**Depends on:** Phase 3B tagging complete; Phase 3C evidence summary working; activity–stage mapping confirmed by Rodney.

---

### Phase 4 — Counsellor validation and summary view

**Scope:**

- Add counsellor portal view for AI-generated CAB/ALIGN summaries.
- Counsellors can review, edit, suppress, or annotate AI summaries before parent sees them.
- Counsellor-released summaries appear in parent dashboard with counsellor note where present.
- Counsellor view respects existing RLS and privacy rules.

**Depends on:** Phase 3C working; counsellor portal existing; separate counsellor RLS and access review.

---

## 17. Acceptance criteria before implementation

No phase of the AI reflective evidence layer may begin implementation until all criteria below are met for that phase.

### Phase 3B acceptance criteria

- [ ] Activity–stage mapping confirmed: Rodney has confirmed which activities belong to A/L/I/G/N.
- [ ] `alignStage` tag format agreed (`"a"`, `"l"`, `"i"`, `"g"`, `"n"` or alternative).
- [ ] Backward compatibility confirmed: plan to handle entries without `alignStage`.
- [ ] Relationship Garden growth logic confirmed (especially Bloom threshold and meaning).
- [ ] Manual test checklist defined and signed off by Rodney.

### Phase 3C acceptance criteria

- [ ] Phase 3B tagging is complete and live.
- [ ] AI API provider reviewed for privacy, data retention, and compliance.
- [ ] AI prompt and safety rules written and reviewed by Rodney.
- [ ] Data minimisation architecture reviewed: server-side only confirmed.
- [ ] Evidence sufficiency thresholds confirmed (Section 4 rules applied).
- [ ] CAB rubric confirmed (Section 5 output states agreed).
- [ ] ALIGN rubric confirmed (Section 6 output states agreed).
- [ ] Parent-facing language approved by Rodney.
- [ ] Counsellor reminder wording approved.
- [ ] `/api/reflect` endpoint design reviewed.
- [ ] Manual test checklist defined and signed off.

### Phase 3D acceptance criteria

- [ ] Phase 3C AI evidence summary is working and reviewed.
- [ ] Full activity catalogue confirmed and tagged by Rodney.
- [ ] Recommendation criteria reviewed (Section 10 rules applied).
- [ ] Recommendation UX confirmed: one suggestion per child, optional, non-commanding.
- [ ] Manual test checklist updated.

### Phase 4 acceptance criteria

- [ ] Counsellor portal is available and working.
- [ ] Counsellor RLS and access rules reviewed in separate schema document.
- [ ] Counsellor review workflow defined (approve / edit / suppress / note).
- [ ] Parent-facing counsellor-released summary design reviewed.
- [ ] Privacy rules confirmed: no email, UUID, child name, or token exposed in counsellor UI.
- [ ] Manual test checklist updated.

---

## 18. Open questions for Rodney

These questions must be resolved before implementation begins for each phase.

### Activity catalogue

1. What are the full Wayfinder activities currently in the app? Is `content.js` `ACTIVITIES` the authoritative and complete list?
2. Which activities belong to A, L, I, G, and N? Does each activity already belong to the correct ALIGN stage, or do any need reclassification?

### Practice evidence definition

3. What exactly counts as "practice evidence" for each ALIGN stage?
   - Is journalling an Awareness activity sufficient for **A**, regardless of written content?
   - Must the parent claim awareness markers or growth capacity for the entry to count?
   - Is a partial save acceptable, or must the journal be fully submitted?

### AI feedback scope and timing

4. Should AI feedback be **per child**, **per week**, or **per reflection** — or a combination?
5. Should the AI use **all entries** for a child relationship, or only **recent entries** (e.g. last 2–4 weeks)?
6. What should happen when evidence is insufficient — a specific empty state message, no card shown, or an invitation card?

### Activity recommendations

7. Should parents choose activities **manually** from a menu, or receive **one suggested activity** with an optional "Start when ready" action, or both?
8. Should the app suggest activities **per child relationship** (filtered by Child ID), **per parent overall**, or both with a toggle?

### Counsellor review

9. Should counsellors **validate AI summaries before parents see them** (Phase 4 Option C), or should AI summaries be shown to parents immediately with a counsellor reminder (Phase 3C Option B)?
10. Should counsellors be able to **edit** AI-generated summary language, or only **approve or suppress** the full summary?

### Relationship Garden

11. Must Bloom require evidence across **all five stages** (A + L + I/G + N), or is Navigate/repair evidence with any earlier practice sufficient?
12. Should the AI layer be able to **infer** garden stage advancement from written evidence, or must garden stage always come from explicit `alignStage` tags on activity entries only?

### Technical

13. Which AI API provider is preferred for the serverless evidence analysis function? Are there data residency, privacy, or compliance constraints to consider?
14. Should the AI prompt use all written reflection content, or only specific fields (e.g. parent cognition, parent affect narrative, next action, repair intention)?

---

## Document control

| Field | Value |
| --- | --- |
| **Title** | Wayfinder Phase 3 — AI Reflective Evidence Layer Plan |
| **Status** | Planning only — not authorised for implementation |
| **Branch** | `docs/phase-3-ai-reflective-evidence-layer` |
| **Depends on** | Phase 1 live, Phase 2 live, Phase 3 ALIGN Journey Plan reviewed |
| **Next step** | Rodney review → resolve open questions → approve Phase 3B first → author implementation brief |
| **Files changed** | `docs/WAYFINDER_PHASE_3_AI_REFLECTIVE_EVIDENCE_LAYER_PLAN.md` only |
| **Code changed** | None |
| **Schema changed** | None |
| **Auth/RLS changed** | None |
| **Journal save/read changed** | None |
| **Deployment config changed** | None |
