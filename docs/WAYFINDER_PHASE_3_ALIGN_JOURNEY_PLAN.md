# Wayfinder Phase 3 — ALIGN Journey Plan

## Status

**Planning only.** Phase 1 — Decode a Moment V1 is accepted and live on `main`. Phase 2 — Journal Trail Evolution is accepted, merged, and live. The Davina UI Enhancement Module (Relationship Garden dashboard visual) is accepted, merged, and live.

This document plans Phase 3 per `docs/WAYFINDER_6_PHASE_IMPROVEMENT_BUILD.md` and the current product canon. **No build, commit, deployment, schema change, or Supabase/auth/journal save-read change is authorised by this document.**

---

## 1. Phase 3 purpose

Phase 3 adds **Your ALIGN Journey** as a **planning and guidance layer** on the parent dashboard.

The parent should be able to see:

- where they may currently be **practising** within ALIGN (not where they have “completed” it)
- what **pattern** might be worth noticing from recent reflection
- what **growth practice** they may already be tending
- what **stage-appropriate Wayfinder activity** might help them practise emotional regulation next
- how each **parent–child relationship** in the Relationship Garden may be reflecting ALIGN-stage **practice evidence**

Phase 3 is **not** a scoring system, diagnostic layer, or child-progress tracker. It is a calm, cautious mirror for parent emotional regulation practice and relationship tending.

**Working app function (when implemented):**

Dashboard shows **Your ALIGN Journey** with read-only cards derived from already-loaded `dyads` and `entries`, plus an updated Relationship Garden growth display based on explicit ALIGN-stage practice evidence — without breaking existing dashboard loading, journal save/read, or privacy rules.

---

## 2. Core hierarchy

Wayfinder’s product hierarchy must remain visible in Phase 3 UI and copy:

| Layer | Meaning | Phase 3 expression |
| --- | --- | --- |
| **Core capacity** | Emotional regulation | Parent can pause, notice, soften, and return to repair |
| **Process** | ALIGN (A → L → I → G → N) | Current Focus, stage tags, activity recommendations |
| **Growth outcome** | Parent–child relationship quality being tended | Relationship Garden pots; cautious “tending” language |

The UI must communicate:

> As the parent practises emotional regulation through ALIGN, the relationship may be tended and may grow in quality over time.

The plant/flower in Relationship Garden represents **relationship tending through parent regulation, reflection, repair, and ALIGN practice** — not child improvement, task completion, or parent achievement.

---

## 3. Two parent entry routes

Phase 3 must support both routes without privileging one as “correct.”

### Route A — Behaviour-first

```text
Decode a behaviour
→ identify possible need / parent CAB / current ALIGN stage being explored
→ recommend suitable Wayfinder activity (optional, non-commanding)
→ parent practises emotional regulation through ALIGN
```

**Phase 3 role:** After a decode, Journey cards may surface what stage was **explored** (e.g. Locate, Integrate) and suggest a **possible next activity** that may support the next stage of practice — without treating decode completion as mastered ALIGN practice.

### Route B — Activity-first

```text
Parent participates in Wayfinder activity
→ journals the activity
→ activity/reflection is associated with an ALIGN stage (explicit tag)
→ parent continues ALIGN practice
```

**Phase 3 role:** Journey cards read activity journal entries with explicit `alignStage` tags to infer **practice evidence** and suggest what may be worth practising next.

### Route integration rule

Both routes feed the same read-only Journey summary. Decode entries and activity entries may contribute differently:

- **Decode:** surfaces what was **explored** or **noticed** (especially A/L/I/G/N sections within the decode flow)
- **Activity journal:** counts as **practice evidence** only when explicitly tagged with an ALIGN stage at save time

---

## 4. Non-negotiable meaning

Phase 3 must **never** imply:

- child diagnosis
- child improvement as the primary outcome
- parent scoring, ranking, or levelling
- parent completion or “unlocking” stages
- behaviour solved
- full alignment achieved
- relationship solved
- clinical improvement
- compliance or performance metrics

Required framing (from canon):

- Behaviour is a signal, not a diagnosis.
- The child is not the problem.
- The parent is not blamed or shamed.
- Use cautious language: **may**, **might**, **possible**, **worth noticing**, **practice**, **tending**, **repair**.

Do not use: “Unlocked”, “Completed”, “Perfect”, “Fully aligned”, “Score”, “Level”, “Achievement”, “Child improved”, “Behaviour fixed”, “Relationship solved”.

---

## 5. Your ALIGN Journey dashboard concept

### Section placement

Add a dashboard section **Your ALIGN Journey** below the hero / Relationship Garden and above or beside existing sections (Decode a Moment, Past activities, etc.). Must not break existing dashboard data loading.

### Planned cards

| Card | Purpose | Example copy (cautious) |
| --- | --- | --- |
| **Current Focus** | Which ALIGN stage the parent may be practising or exploring now | “Locate — you may be noticing possible needs beneath behaviour.” |
| **Recent Pattern** | A possible recurring theme from recent entries (not a diagnosis) | “Urgency may appear when transitions feel difficult.” |
| **Growth Practice** | A stabilising capacity or practice worth tending | “Pause before correcting — a practice you may be building.” |
| **Suggested Next Activity** | One optional stage-appropriate Wayfinder activity | “You might try a Locate activity when you are ready.” |
| **Relationship Garden status** | Short summary linking garden pots to practice evidence | “2 relationships tended · 1 may have recent Navigate/repair reflection.” |

### Empty states

When data is insufficient, show friendly non-shaming empty states, e.g.:

- “Your ALIGN Journey will build here as you reflect and practise.”
- “No stage pattern yet — that is ok. Start with one small moment when you are ready.”

Never imply the parent is “behind” or failing.

### Language rules for all cards

- Prefix insights with **“A possible…”**, **“You may be…”**, **“Worth noticing…”**
- Avoid certainty: no “You are at stage L” → prefer “Locate may be your current focus”
- Recommendations: **“You might try…”**, **“When you are ready…”**, **“One activity that may help…”**

---

## 6. Decoder ALIGN-stage tagging

### Current state (Phase 1 live)

`behaviour_decode` entries already persist a nested `align{}` object with:

- `align.awareness`
- `align.locate`
- `align.integrate`
- `align.growth`
- `align.navigate`

These map naturally to A/L/I/G/N **content sections** within Decode a Moment. They are **not** currently stored as explicit top-level practice tags on the entry.

### Planned tagging model (Phase 3)

When implementing, consider adding **read-only derived tags** and/or **explicit saved tags** on decode save:

| ALIGN stage | Decode section source | Tag meaning |
| --- | --- | --- |
| **A — Awareness** | `align.awareness` (observed behaviour, context, initial observation) | Parent named what happened without judging the child |
| **L — Locate** | `align.locate` (possible child need, parent affect) | Parent explored a possible need |
| **I — Integrate** | `align.integrate` (thinking, feelings, behaviour, possible misalignment) | Parent connected need with their CAB |
| **G — Growth** | `align.growth` (growth capacity, awareness markers) | Parent identified a capacity to practise |
| **N — Navigate** | `align.navigate` (next action, repair intention, observe next time) | Parent chose a next action or repair step |

### Critical rule: decode ≠ completed practice

**Decoder completion alone must not be treated as completed ALIGN practice.**

Decode tags reveal what stage was **explored or surfaced** during reflection, not proof that the parent has mastered the stage.

Suggested payload distinction (planning only):

```json
{
  "entry_type": "behaviour_decode",
  "alignStagesExplored": ["a", "l", "i", "g", "n"],
  "alignStagePractice": []
}
```

- `alignStagesExplored` — derived from decode sections completed (exploration)
- `alignStagePractice` — empty for decodes unless Rodney approves decode-as-practice (not recommended for Phase 3)

**Recommendation:** Use decode data for **Current Focus**, **Recent Pattern**, and **Growth Practice** hints only. Do **not** advance Relationship Garden to Bloom based on decode alone.

---

## 7. Wayfinder activity ALIGN-stage tagging

### Current state

`content.js` already groups the 52-day activities under ALIGN phases:

| Phase key | ALIGN stage | Activity count (current) |
| --- | --- | --- |
| `A` | Awareness | Days 1–10 (10 activities) |
| `L` | Locate | Days 11–20 (10 activities) |
| `I` | Integrate | Days 21–31 (11 activities) |
| `G` | Growth | Days 32–42 (11 activities) |
| `N` | Navigate | Days 43–52 (10 activities) |

The parent selects a phase and activity in `ClientJournal`. The saved entry currently includes `phase` (e.g. `A`, `L`) but **not** a dedicated `alignStage` / `align_stage` practice tag.

### Planned tagging model (Phase 3)

On activity journal save, persist an explicit practice tag:

```json
{
  "phase": "L",
  "alignStage": "l",
  "alignStageLabel": "Locate",
  "activityTag": "practice"
}
```

| Tag value | Meaning |
| --- | --- |
| `alignStage: "a"` | Parent completed a journal for an Awareness activity |
| `alignStage: "l"` | Locate practice |
| `alignStage: "i"` | Integrate practice |
| `alignStage: "g"` | Growth practice |
| `alignStage: "n"` | Navigate / repair practice |

### Tag source of truth

Primary source: the **phase key** already chosen in the journal flow (`ACTIVITIES[phase]`). Map `A→a`, `L→l`, `I→i`, `G→g`, `N→n` at save time. No new activity catalogue required for Phase 3 MVP.

### Backward compatibility

Older entries without `alignStage` may fall back to `phase` if present. Entries with neither remain untagged and must not break Journey or Garden display.

---

## 8. Stage-aware activity recommendations

### Recommendation layer (read-only, optional)

A lightweight rules layer suggests **one** optional activity based on inferred current practice focus. Recommendations must be **optional, non-commanding, and non-shaming**.

### Suggested rules (draft — subject to Rodney review)

| Inferred practice state | Suggested direction | Example suggestion |
| --- | --- | --- |
| No tagged activity yet; may have decode only | Awareness or Locate | “When you are ready, an Awareness activity may help you pause and notice.” |
| Mainly **A** practice evidence | Locate or Integrate | “Locate activities may help you stay curious about possible needs.” |
| **A + L** evidence | Integrate | “Integrate activities may help you connect need with what happened in you.” |
| **I** or **G** evidence | Growth | “Growth activities may support the capacity you are practising.” |
| **N** evidence or recent repair intention in decode | Navigate / repair | “Navigate activities may help you choose one steady next action or repair step.” |

### Recommendation inputs (already-loaded data only)

- Tagged activity entries (`alignStage` / `phase`)
- Recent decode entries (`align.*` sections, `next_action`, `repair_intention`)
- Optional: child filter if recommendation is per-relationship

### Recommendation outputs

- One activity title from `ACTIVITIES[phase][n]` (deterministic pick, e.g. next untried activity in that phase, or first in phase if none done)
- Cautious helper line
- **Start activity** button reusing existing `ClientJournal` flow — no new navigation paradigm

### What recommendations must not do

- Command (“You must do Day 15”)
- Shame (“You have not practised Navigate”)
- Rank parents or children
- Use AI-generated advice without explicit Phase 3+ approval

---

## 9. Relationship Garden Phase 3 growth logic

### Current state (Davina module live)

`RelationshipGarden` in `app.js` uses conservative read-only logic:

| Stage | Current rule |
| --- | --- |
| **Seed** | Child dyad exists, no linked entries |
| **Sprout** | At least one entry linked to Child ID (decode or activity) |
| **Leaves / Bud / Bloom** | Reserved for explicit `alignStage` / `align_stage` tags on **activity** entries; Bloom requires all five tags present |

Decode completion alone does **not** advance garden stage beyond Sprout in the current implementation.

### Planned Phase 3 growth logic

Garden should grow from **explicit ALIGN-stage practice evidence** on activity journals, with decode data used only for supplementary Journey hints — not as primary growth fuel.

| Garden stage | Planned meaning | Planned evidence rule |
| --- | --- | --- |
| **Seed** | Relationship exists | Dyad row exists, no linked entries |
| **Sprout** | Awareness practice may be beginning | At least one activity entry tagged `alignStage: "a"`, **or** first activity/decode linked (conservative fallback during rollout) |
| **Leaves** | Locate practice evidence | At least one activity entry tagged `alignStage: "l"` |
| **Bud** | Integrate or Growth practice evidence | At least one entry tagged `alignStage: "i"` **or** `"g"` |
| **Bloom** | Navigate / repair practice evidence | At least one entry tagged `alignStage: "n"` **and** earlier stage tags (A + L) also present for that Child ID |

### Bloom meaning (non-negotiable)

Bloom means: **“This relationship has recent reflection that touched repair or next action, with earlier ALIGN practice evidence present.”**

Bloom must **not** mean:

- the parent is fully aligned
- the child is fixed
- the relationship is solved
- ALIGN is completed

### Per-child scope

Each pot uses **Child ID** only (plus age/gender if already shown). Stage is computed per child from entries linked to that `childId`.

### Fallback behaviour

- Missing tags → graceful fallback to Seed or Sprout; never error
- Never imply the relationship is poor or failing
- Visible text label always accompanies stage (no colour-only communication)

---

## 10. Data strategy

### Principle

**Prefer existing `journal_entries.data` JSON payloads.** No schema change unless explicitly reviewed and approved in a separate schema/RLS document.

### Fields likely added to entry payloads (planning)

**Activity journal entries:**

```json
{
  "alignStage": "l",
  "alignStageLabel": "Locate",
  "activityTag": "practice"
}
```

**Behaviour decode entries (optional, derived at save):**

```json
{
  "alignStagesExplored": ["a", "l", "i", "g", "n"],
  "primaryStageExplored": "l"
}
```

**No new tables in Phase 3 plan** without separate schema/RLS review.

### Read path

- Dashboard continues to load via existing `DB.getAllDyads` and `DB.getEntries`
- Journey and Garden derive display from in-memory `dyads` + `entries`
- No new DB calls for Phase 3 MVP

### Write path (future implementation)

- Extend `ClientJournal.finalSubmit` to include `alignStage` derived from selected `phase`
- Optionally extend decode save to include `alignStagesExplored` (derived, not user-scored)
- Must preserve backward compatibility for all existing entries

### What Phase 3 does not store

- Plant stage as a persisted field (always derived)
- Parent scores, streaks, badges, or levels
- Child improvement metrics
- Counsellor overrides (Phase 4+)

---

## 11. Technical guardrails

**No implementation yet.**

### Must NOT be touched without explicit Rodney approval

- `supabase.js`
- `api/**`
- `*.sql` / RLS files
- auth / profile logic / `ensure_profile`
- email verification gate
- Parent ID / Child ID generation
- `DB.getEntries`, `DB.saveEntry`, `DB.getAllDyads`, `DB.saveDyad` signatures (except backward-compatible payload fields inside existing save paths, when approved)
- `vercel.json` / deployment config
- environment variables

### Files likely touched when implementation is approved

| File | Risk | Scope |
| --- | --- | --- |
| `app.js` | Medium | Dashboard Journey section, Journey derivation helpers, Relationship Garden stage logic update, optional save payload fields |
| `content.js` | Low | Journey card labels, recommendation copy, activity stage metadata if needed |
| `styles.css` | Low | Journey card layout, garden + journey visual harmony |
| `docs/*` | Low | This plan, acceptance checklist updates |

### Instruction priority (unchanged)

1. Preserve privacy, auth, RLS, identity, journal save/read, deployability
2. Preserve ALIGN/CAB product canon
3. Improve UX/UI within those boundaries

---

## 12. Acceptance criteria for future implementation

Phase 3 implementation may **only begin** when:

- [ ] This Phase 3 plan is reviewed and accepted by Rodney
- [ ] Saved data shape for `alignStage` / `alignStagesExplored` is agreed
- [ ] Recommendation language is reviewed for non-diagnostic, non-shaming tone
- [ ] Relationship Garden growth logic is confirmed (especially Bloom rules)
- [ ] Manual test checklist is defined and signed off

### Phase 3 release gate (implementation)

Do not approve Phase 3 merge unless:

- [ ] Dashboard still loads with all existing sections intact
- [ ] **Your ALIGN Journey** section appears with all planned cards (or agreed MVP subset)
- [ ] Current Focus card works with cautious language and empty states
- [ ] Recent Pattern card works (or shows friendly empty state)
- [ ] Growth Practice card works (or shows friendly empty state)
- [ ] Suggested Next Activity card works; recommendation is optional and non-commanding
- [ ] Relationship Garden status integrates with updated stage logic
- [ ] Activity save persists `alignStage` without breaking existing entries
- [ ] Decode entries do not alone advance garden to Bloom
- [ ] Cards use existing saved data / already-loaded entries only (no new DB calls for MVP)
- [ ] No parent type, child diagnosis, or scoring language introduced
- [ ] Privacy intact: no email, Supabase UUID, child names, tokens, or secrets in normal UI
- [ ] Journal Trail filters, decode cards, emotional patterns, and congruence summaries unchanged
- [ ] Decode a Moment still saves and displays correctly
- [ ] Desktop and mobile layouts usable
- [ ] `git diff --check`, `node --check supabase.js`, and `scripts/verify-wayfinder.ps1` pass

### Recommended build setup (when approved)

- Branch: `feature/align-journey` (off `main`)
- Preview deploy before merge
- Scope: `app.js`, `content.js`, `styles.css`, `docs/` only unless schema review approved separately

---

## 13. Open questions for Rodney

These must be resolved before implementation begins:

1. **Activity catalogue:** What is the authoritative list of Wayfinder activities for recommendations — is `content.js` `ACTIVITIES` (52-day A/L/I/G/N) the full set, or are there additional/modified activities?

2. **Stage assignment:** Does each activity in `ACTIVITIES` already belong to the correct ALIGN stage, or does any activity need reclassification?

3. **Recommendation UX:** Should parents choose activities manually only, or should the app suggest one activity with a single “Start when ready” action?

4. **Scope of recommendations:** Per **child relationship** (filtered by Child ID), per **parent overall**, or both (with a toggle)?

5. **Decode → activity bridge:** After Decode a Moment, should the app suggest a specific activity immediately, or only show the suggestion on the dashboard Journey card?

6. **Practice evidence definition:** What exactly counts as “practice evidence” for each ALIGN stage?
   - Is journaling an Awareness activity sufficient for **A**?
   - Must markers be claimed?
   - Is partial journal save acceptable?

7. **Recent Pattern source:** Should Recent Pattern come from decode `possible_need` / CAB fields, activity `autoWords`, or wait for Phase 5 pattern detection?

8. **Garden Bloom threshold:** Must Bloom require **all** prior stages (A+L+I/G+N) or is Navigate/repair with any earlier practice enough?

9. **Counsellor influence (Phase 4 preview):** Should counsellor review eventually influence suggested activities, or remain parent-data-only through Phase 3?

10. **Multi-child display:** Should Your ALIGN Journey be parent-wide or show one card set per Child ID?

11. **`alignStagesExplored` on decode:** Should decode saves persist derived exploration tags, or should Journey read directly from nested `align{}` without new fields?

12. **MVP scope:** Is full five-card Journey required for Phase 3 v1, or is a subset (e.g. Current Focus + Suggested Next Activity + Garden) acceptable for first release?

---

## Appendix A — Relationship to other phases

| Phase | Relationship to Phase 3 |
| --- | --- |
| **Phase 1 (live)** | Decode flow provides `align{}` sections; Phase 3 reads but does not treat decode as full practice |
| **Phase 2 (live)** | Journal Trail filters remain unchanged; Journey reads same entry payloads |
| **Phase 4** | Counsellor ALIGN summaries; may later inform recommendations — out of Phase 3 scope |
| **Phase 5** | Richer Recent Pattern / recurring need detection; Phase 3 may use simple heuristics until then |
| **Phase 6** | Research consent; no Phase 3 dependency |

---

## Appendix B — Current code anchors (for implementers)

When implementation is approved, refer to:

- `RelationshipGarden` / `stageOf` — `app.js` (~1371)
- `buildDecodeEntry` / nested `align{}` — `app.js` (~1051)
- `ACTIVITIES` / `PHASES` — `content.js` (~27–43)
- `ClientJournal.finalSubmit` — activity save payload (to extend with `alignStage`)
- Phase 3 release gate — `docs/WAYFINDER_6_PHASE_IMPROVEMENT_BUILD.md` (§Phase 3 release gate)

---

## Document control

| Field | Value |
| --- | --- |
| **Title** | Wayfinder Phase 3 — ALIGN Journey Plan |
| **Status** | Planning only — not authorised for implementation |
| **Author** | Cursor agent (docs-only) |
| **Depends on** | Phase 1 live, Phase 2 live, Relationship Garden live |
| **Next step** | Rodney review → resolve open questions → approve data shape → author implementation brief |
