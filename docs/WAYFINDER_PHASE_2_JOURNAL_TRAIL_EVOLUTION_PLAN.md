# Wayfinder Phase 2 — Journal Trail Evolution (Implementation Plan)

## Status

Planning only. Phase 1 — Decode a Moment V1 is accepted and live on `main` (commit `d472b95`). This document plans Phase 2 per `docs/WAYFINDER_6_PHASE_IMPROVEMENT_BUILD.md`. No build, commit, or deployment is authorised by this document.

## Phase 2 working function

Parent can filter and read Journal Trail by:

1. All entries
2. Activity journals
3. Behaviour decodes
4. By child
5. By possible need
6. By growth capacity

Behaviour decode cards should show: Behaviour, Possible Need, CAB Misalignment, Growth Capacity, Next Action, Repair Intention.

## Core principle

Phase 2 is **read-only filtering and rendering over the entries already loaded in memory**. It adds no data, changes no data, and triggers no new network or database calls. Everything required already persists in `journal_entries.data` and is already read by the existing `DB.getEntries` path.

---

## 1. Current data fields available for filters

All fields below already exist in `journal_entries.data`, are already loaded into the `entries` state, and are parsed by the existing `decodeReminderFromEntry` helper. No new fetch is required.

**Entry-type facet** — `isBehaviourDecodeEntry(entry)` (app.js ~1089) tests `entry_type` / `entryType` / `type` === `behaviour_decode`. Activity journals = the complement.

**Child facet** — `entryChildId(entry)` (app.js ~1378) resolves `childId` / `child_id` / `dyadId` / `dyad_id`. Display metadata (age/gender) via `dyadByChildId` (app.js ~1642).

**Possible-need facet (decodes)** — persisted in two places:
- flat: `reminder.possible_need_worth_staying_curious_about` (array)
- nested: `align.locate.possible_child_need` (array)
- canonical option list: `DECODE_NEED_OPTIONS` (app.js ~959)

**Growth-capacity facet (decodes)** — persisted in two places:
- flat: `reminder.stabilising_response_to_practise` (array)
- nested: `align.growth.growth_capacity` (array)
- canonical option list: `DECODE_GROWTH_OPTIONS` (app.js ~963)

**Behaviour decode card fields (all already available):**

| Card field | Source |
| --- | --- |
| Behaviour | `reminder.observed_behaviour` (fallback `reminder.moment_noticed`) |
| Possible Need | `reminder.possible_need_worth_staying_curious_about` / `align.locate.possible_child_need` |
| CAB Misalignment | `reminder.possible_alignment_gap` / `align.integrate.possible_misalignment` |
| Growth Capacity | `reminder.stabilising_response_to_practise` / `align.growth.growth_capacity` |
| Next Action | `reminder.next_action` |
| Repair Intention | `reminder.repair_intention` |

---

## 2. Files likely touched

- **`app.js`** — `JournalTrail` component only (~1632): add filter state, a filter bar, a filtered "Past entries" list, and a condensed behaviour-decode summary card. Medium-risk (display/UI).
- **`content.js`** — filter labels and any new copy (e.g. a `UI_TEXT.trail` block), matching the existing `UI_TEXT.decode` style. Low-risk.
- **`styles.css`** — filter bar and summary-card styling. Low-risk.

---

## 3. Files that must NOT be touched

- `supabase.js`
- all `*.sql` / RLS files
- `api/**`
- auth / profile logic and `ensure_profile`
- email-verification gate
- Parent ID / Child ID generation
- `vercel.json` / deployment config
- the `DB.getEntries` / `DB.saveEntry` signatures and the journal save/read payload shape (no compatibility changes)

No schema change. No change to the save/read path.

---

## 4. Risks

1. **Summary-card regression (highest).** "Your emotional patterns" and "Congruence markers" must keep computing on the full `activityEntries` set (app.js ~1656–1671). Mitigation: scope filters to the **Past entries list only**; leave both summary cards on the unfiltered activity set. Filtering the summaries is a possible later enhancement, not Phase 2.
2. **Decode-only facets vs the Activity view.** Possible-need and growth-capacity apply only to decode entries; if set while "Activity journals" is selected, results would be empty. Mitigation: when a need/growth filter is active, imply the decode scope (or disable the incompatible combination) and always show a friendly empty state.
3. **Entries with missing `childId`** (older/edge rows). Mitigation: an "Unassigned" child bucket so nothing is silently hidden.
4. **Multi-value arrays.** Needs and capacities are arrays; an entry can match several values. Use OR-within-a-facet and AND-across-facets, with array-membership checks.
5. **Privacy.** Filter chips must render Child ID + age/gender only — never names. Decode cards display the same parent-authored content already shown today (no new exposure); retain the "This is a reflection, not an assessment of your child" footer.
6. **Defensive parsing.** Continue using `decodeReminderFromEntry` (handles both the flat `reminder` and nested `align{}` shapes); never assume a single shape.

---

## 5. Recommended UI layout

Within `JournalTrail`, below the title bar:

- **Filter bar (compact):**
  - Row 1 — entry-type segmented chips: **All · Activity journals · Behaviour decodes**.
  - Row 2 (contextual) — **Child** (All children + each Child ID, with age/gender), **Possible need** (multi-select, decode values present), **Growth capacity** (multi-select, decode values present), and a **Clear filters** link.
  - A quiet result count: "Showing X of Y entries."
- **Keep** "Your emotional patterns" and "Congruence markers" cards exactly as they are (activity-only).
- **Past entries list** renders the filtered set:
  - **Activity entries** — unchanged rendering.
  - **Behaviour decode** — condensed summary card with the six fields above, cautious labels ("A possible need worth staying curious about", "Possible alignment gap"), header "Alignment Reminder · Decode a Moment · Child ID: …", and the reflection-not-assessment footer.
- **Empty state:** "No entries match these filters. Clear filters to see all."
- Derive need/growth options dynamically from the decode entries actually present (ordered by the canonical lists) so empty options do not clutter; hide or disable those facets when there are zero decodes.

---

## 6. Acceptance criteria (maps to the §29 Phase 2 release gate)

- All entries / Activity journals / Behaviour decodes filters each work; Clear filters restores all entries.
- Child filter works; Possible-need filter works; Growth-capacity filter works; combinations behave (AND across facets, OR within a facet).
- Behaviour decode cards show Behaviour, Possible Need, CAB Misalignment, Growth Capacity, Next Action, Repair Intention.
- Existing activity journal cards and existing Journal Trail entries still display unchanged.
- Emotional-patterns and congruence summaries remain activity-only and unchanged.
- No schema change; no Supabase / auth / RLS / save-read change; privacy masking intact (no names, email, Supabase UUID, or tokens).
- Language stays non-diagnostic and cautious; desktop and mobile remain usable.

---

## 7. Confirmation: Phase 2 can be built without schema changes

Yes — fully. Every filter facet (entry type, child, possible need, growth capacity) and all six decode-card fields already persist in `journal_entries.data` (flat `reminder` plus nested `align{}` arrays), and entries are already loaded client-side. No Supabase, SQL, RLS, or save/read change is required.

## 8. Reminder: Phase 2 is read-only filtering / rendering over existing loaded entries

Phase 2 must not add, edit, delete, or re-shape any stored data. It operates only on the entries already returned by the existing read path, applying client-side filtering and presentational summary cards. No writes, no new reads, no schema or payload changes.

---

## Recommended build setup (when approved)

- Branch: `feature/journal-trail-evolution` (branch-first, off `main`; preview deploy before merge per the 6-phase doc §25–26).
- Scope limited to `app.js` (JournalTrail), `content.js`, `styles.css`.
- Pre-merge checks per the 6-phase doc §27 and the §28 smoke test; verify the §29 Phase 2 release gate before acceptance.
