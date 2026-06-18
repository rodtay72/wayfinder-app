# Activity Practice Taxonomy

## Status

**Issue #8 — metadata-only (Day 2)**  
Planning and research architecture. No UI changes. No journal save/read changes. No Supabase/schema changes.

Related:

- [docs/RESEARCH_AI_CAPABILITY_MAP.md](./RESEARCH_AI_CAPABILITY_MAP.md)
- [docs/WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [`content.js`](../content.js) — `ACTIVITY_PRACTICE_CATALOG` (additive metadata alongside unchanged `ACTIVITIES`)

---

## Purpose

Wayfinder's 52-day activities are **practice supports** for parent emotional regulation, reflection, co-regulation, repair, and relationship quality — not child-improvement tasks or stage-completion checkpoints.

This taxonomy adds structured ALIGN/CAB metadata to each activity so future research and practice tracking can join saved journal entries (by activity label) to parent-side practice evidence.

---

## Non-negotiable framing

- Activities support **parent alignment capacity**, not child diagnosis or behaviour labelling.
- No parent scoring, ranking, or completion percentages.
- No stage-completion or relationship fixed/solved language.
- Use cautious language: **may**, **might**, **possible**, **appears to suggest**.
- `progress_signal` values are **research tags**, not parent-facing scores.

---

## Schema (per activity)

| Field | Description |
|-------|-------------|
| `activity_id` | Stable ID, e.g. `A-01` … `N-10` (phase-local index) |
| `align_stage` | `A`, `L`, `I`, `G`, or `N` |
| `label` | Exact legacy display string — must match saved `entry.activity` |
| `cab_domain` | Primary CAB practice focus: `affect`, `cognition`, `behaviour`, `integration`, `co_regulation`, `repair` |
| `growth_capacity` | Parent-side capacity being practised (non-scoring) |
| `possible_need_context` | Exploratory possible child need — not diagnostic |
| `practice_marker` | Suggested `MARKERS` key for reflection |
| `post_practice_reflection_prompt` | Internal/research prompt text (not shown in UI in Day 2) |
| `progress_signal` | Research exposure tag, e.g. `awareness_exposure`, `locate_exposure` |
| `difficulty_or_rhythm` | Optional rhythm tag: `gentle`, `reflective`, `structured`, `collaborative`, `stretch`, `repair`, `celebration` |

---

## How saved entries map to taxonomy

Journal entries continue to save:

- `phase` — ALIGN stage key (`A`–`N`)
- `activity` — full label string (unchanged)

Lookup at read/export time:

```javascript
getActivityPracticeByLabel(entry.activity)
getActivityPracticeById('A-01')
```

No `activity_id` is persisted in Phase Day 2. Future phases may add optional persistence after schema review.

---

## ACTIVITIES (unchanged)

`ACTIVITIES` remains the **source of truth** for journal dropdown labels and save/read behaviour. It is **not** derived from the catalog.

```javascript
{ A: [...], L: [...], I: [...], G: [...], N: [...] }
```

`ACTIVITY_PRACTICE_CATALOG` is additive metadata placed after `ACTIVITIES`. Every catalog `label` must match an existing `ACTIVITIES` label exactly.

---

## progress_signal glossary

| Signal | Typical ALIGN stage context |
|--------|----------------------------|
| `awareness_exposure` | Awareness-stage practice exposure |
| `locate_exposure` | Locate-stage practice exposure |
| `integrate_exposure` | Integrate-stage practice exposure |
| `growth_exposure` | Growth-stage practice exposure |
| `navigate_exposure` | Navigate-stage practice exposure |

These indicate **practice exposure tags** for research aggregation — not proof of mastery.

---

## Stop conditions

Stop taxonomy or export work when:

- Labels would change (breaks existing journal entries)
- Metadata copy drifts into child diagnosis or parent scoring
- Implementation requires journal save/read or Supabase changes without approved high-risk branch
- Parent-facing UI is added without App Version and copy review

---

## Document control

| Field | Value |
|-------|-------|
| Issue | #8 |
| Branch | `feature/activity-practice-taxonomy` |
| App Version entry | Not required (metadata-only) |
| Activities tagged | 52 |
