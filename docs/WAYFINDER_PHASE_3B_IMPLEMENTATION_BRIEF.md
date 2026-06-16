# Wayfinder Phase 3B - Implementation Brief

## Status

**Implementation brief only.**
No code change, schema change, save-payload change, auth change, or deployment change is authorised by this document.

This brief must be reviewed and accepted before any implementation begins.

**Parent planning documents:**

- `docs/WAYFINDER_PHASE_3_ALIGN_JOURNEY_PLAN.md`
- `docs/WAYFINDER_PHASE_3_AI_REFLECTIVE_EVIDENCE_LAYER_PLAN.md`
- `docs/WAYFINDER_PHASE_3B_TWO_LAYER_ALIGN_JOURNEY_PLAN.md`

---

## Product model this brief operates within

Phase 3B accepted model:

- One parent-wide ALIGN Journey
- Child-specific dyad lenses

These are product layers, not technical layers.

Product hierarchy:

- Emotional regulation is the parent-wide core capacity.
- ALIGN is the shared process.
- Parent-child relationship quality/tending is the visible growth outcome.

Core principle:
The parent develops one emotional regulation capacity through ALIGN, but each child relationship may reveal a different parent-child alignment edge to practise.

---

## 1. MVP Scope Decision

### Options considered

Option A - Parent-wide ALIGN Journey only first.
Dyad lenses deferred to Phase 3B.2.

Option B - Parent-wide ALIGN Journey and dyad lenses together.

Option C - Dyad lenses only first.

### Recommendation: Option A

Implement the parent-wide ALIGN Journey only in Phase 3B MVP.
Defer dyad lenses to Phase 3B.2.

### Rationale

Option A is recommended for the following reasons:

**Risk reduction:**
Dyad lenses require per-child evidence inference. Per-child pattern inference from a small number of entries carries a higher risk of overclaiming, misleading the parent, or drifting toward implicit child profiling. Testing the parent-wide layer first allows the evidence threshold model and cautious copy patterns to be validated before adding per-child scope.

**UI placement is unresolved:**
The correct placement for dyad lenses - inside Relationship Garden cards, below the garden as an expandable section, or as a separate panel - has not yet been confirmed. Building the dyad lens before its placement is agreed risks UI rework and a harder test surface.

**Evidence sufficiency is easier to validate at parent-wide scope first:**
The parent-wide layer aggregates across all entries, which means even a parent with 3-4 total entries can experience it meaningfully. Per-child evidence must be assessed per Child ID, which means a parent with three children needs 3-4 entries per child before dyad lenses have sufficient signal. Validating parent-wide evidence behaviour first is a safer starting point.

**Option B risk:**
Attempting both layers together doubles the test surface and doubles the risk of guardrail violations. If a dyad lens card inadvertently drifts toward child-profile language, it is harder to catch when shipping together with a new parent-wide layer.

**Option C is not recommended:**
Dyad lenses without the parent-wide layer contradict the product hierarchy. The parent-wide journey is the primary product outcome. Dyad lenses are contextual companions, not the primary experience.

### Phase 3B.2 scope (deferred)

Dyad lenses are deferred to a separate Phase 3B.2 implementation brief.
Phase 3B.2 may begin only after:

- Phase 3B MVP is accepted and live on main.
- Dyad lens placement decision is confirmed.
- Dyad lens evidence behaviour is confirmed.
- Phase 3B.2 brief is written and reviewed.

---

## 2. Dyad Lens Placement (future Phase 3B.2)

This decision is required before Phase 3B.2 implementation begins. It is recorded here so that Phase 3B MVP UI does not accidentally foreclose any placement option.

### Options

**Option 2A - Inside Relationship Garden cards (expandable per pot):**
Each garden pot already represents one child relationship. A dyad lens panel that expands from or attaches to the pot card is the most natural placement: the parent sees the garden pot and its reflective companion in one visual unit.

**Option 2B - Below Relationship Garden as a separate expandable section:**
The dyad lenses appear as a collapsible list below the garden. Keeps garden visual clean. Allows parent to access lenses without engaging with the garden UI.

**Option 2C - Separate child-lens panel:**
A dedicated dashboard section for dyad lenses, distinct from the garden. Highest information density but highest implementation complexity and most risk of visual overwhelm.

### Recommendation for Phase 3B.2 (advisory, not binding)

Option 2A is the preferred default.

Rationale: The Relationship Garden is already the per-child relationship surface. Attaching the dyad lens to each pot keeps child-specific reflection contextually close to the relationship visual it describes. It avoids a second, duplicate per-child list elsewhere in the dashboard. The dyad lens should feel like a quiet companion to the pot - not a performance report.

**This recommendation must be confirmed by Rodney before Phase 3B.2 begins.**

---

## 3. Evidence Sufficiency Thresholds

The following thresholds apply to Phase 3B MVP (parent-wide layer).
The same model applies per Child ID for Phase 3B.2 dyad lenses.

### Parent-wide thresholds (Layer 1 - Phase 3B MVP)

| Reflection count (all children, all entry types) | Journey behaviour |
| --- | --- |
| 0 entries | No journey cards. Show gentle invitation only. |
| 1 entry | Single-moment reflection note only. No pattern inference. No stage suggested. |
| 2-3 entries | Possible early signal only. Highly cautious language required. No recurring pattern claimed. |
| 4+ entries | Cautious recurring theme may be surfaced. Use cautious language throughout. |

### Important language rule

Use "reflection evidence sufficiency" in all technical documentation and internal copy planning.

Do not use in any parent-facing copy:

- "adequate journalling"
- "enough journalling"
- "you have not journalled enough"
- "you need more entries to unlock insights"
- "journal more to see your patterns"

These phrases frame journalling quantity as a performance metric. They must not appear.

### Preferred empty-state copy

"Wayfinder is ready when you are. One small reflection can be a starting point."

"Your ALIGN Journey will build here as you reflect and practise."

"A few more reflections may help Wayfinder notice something worth sharing."

---

## 4. Data Inputs for Phase 3B MVP

### Principle

Phase 3B MVP derives all Journey card content from data already loaded into memory by the existing `DB.getEntries` and `DB.getAllDyads` calls. No new database calls are required for MVP.

### Allowed data inputs

The following fields already exist in `journal_entries.data` and are already loaded into the `entries` state:

**From activity journal entries:**

- `phase` - the ALIGN stage key chosen at journal save time (e.g. `A`, `L`, `I`, `G`, `N`). This is the primary practice evidence signal for activity entries in MVP. Maps to ALIGN stages: A=Awareness, L=Locate, I=Integrate, G=Growth, N=Navigate.
- `entry_type` / `entryType` / `type` - to distinguish activity journals from behaviour decodes.
- `childId` / `child_id` / `dyadId` / `dyad_id` - to scope entries by child relationship if needed.

**From behaviour decode entries:**

- `align.awareness` - named child behaviour and context.
- `align.locate.possible_child_need` - possible child need the parent explored.
- `align.locate.parent_affect` - parent affect explored.
- `align.integrate.parent_cognition` - parent thought during the moment.
- `align.integrate.parent_behaviour` - parent behaviour during the moment.
- `align.integrate.possible_misalignment` - possible misalignment surfaced.
- `align.growth.growth_capacity` - growth capacity chosen.
- `align.growth.awareness_markers` - awareness markers claimed.
- `align.navigate.next_action` - next action chosen.
- `align.navigate.repair_intention` - repair intention named.
- `reminder.possible_need_worth_staying_curious_about` - flat field (alternative path).
- `reminder.stabilising_response_to_practise` - flat field (alternative path).
- `reminder.next_action` - flat field (alternative path).
- `reminder.repair_intention` - flat field (alternative path).
- `childId` / `child_id` / `dyadId` / `dyad_id` - to scope by child.

**From dyads (already loaded via `DB.getAllDyads`):**

- `child_id` / `childId` - to identify child relationships.
- Child age/gender if available - for display alongside child relationship references.

### ALIGN stage inference for Phase 3B MVP (without new payload fields)

Since `alignStage` tags are deferred (see Section 5), MVP heuristic inference should use:

**For activity entries:**
Use the existing `phase` field as a proxy for ALIGN stage practice evidence.
`A` = Awareness, `L` = Locate, `I` = Integrate, `G` = Growth, `N` = Navigate.
An activity entry with `phase: "L"` counts as possible Locate practice evidence.

**For decode entries:**
Use the presence and content of each `align.*` nested section to detect which stages were explored.
An entry with content in `align.locate` and `align.growth` indicates Locate and Growth stages were at least explored.
Do not treat decode completion as confirmed practice evidence. Use "explored" framing only.

**Implementation caution - phase field is a cautious proxy only:**
The `phase` field on activity entries is a proxy for ALIGN stage inference, not proof that the parent actually practised that stage. An activity entry with `phase: "L"` indicates the parent chose a Locate activity - it does not confirm they engaged in full Locate-stage emotional regulation practice. All parent-facing copy derived from `phase` inference must use "may", "might", "possible", or "appears to suggest". Never state a stage as fact from a `phase` tag alone.

**Implementation caution - exclude decode entries from phase tallies:**
When deriving Practice Direction or any metric that counts phase frequency across activity entries, the derivation logic must filter to activity journal entries only. Behaviour decode entries (`entry_type === "behaviour_decode"`) must be excluded from phase tallies. Decode entries may contain `align{}` nested sections and could include phase-like string values in nested fields; including them in an activity phase count would pollute the tally with non-activity data.

**Derivation rules for Journey cards:**

- Current Growth Edge: From the most recent decode entry's `align.growth.growth_capacity`, OR the most recent activity entry's `phase` label, whichever is more recent. If both are absent, use threshold-appropriate empty state.
- Recent Reflection Signal: From the most recent decode entry's `align.locate.possible_child_need` (or flat `reminder.possible_need_worth_staying_curious_about`). If 2+ decode entries share a value, this may be surfaced as a "possible recurring signal" with cautious language. Threshold: 2-3 entries minimum before naming a signal. 4+ entries before naming a possible recurring pattern.
- Practice Direction: From the most frequent `phase` value across recent activity entries (last 4-6 entries), or from recent decode `align.growth.growth_capacity` values. If no clear signal, show stage-direction copy based on most recent activity phase.
- Suggested Next Step: One general stage-direction suggestion based on the inferred current focus. See Section 6.

### What Phase 3B MVP must not load

- No new Supabase queries.
- No new API calls.
- No AI model calls.
- No external services.
- No new persisted fields read or written.
- No changes to `DB.getEntries` or `DB.getAllDyads` signatures.

---

## 5. Save-Payload Field Decision

### Recommendation: Defer all new save-payload fields

Fields discussed in parent planning documents - `alignStage`, `alignStagesExplored`, `primaryStageExplored`, `activityTag` - are **deferred** for Phase 3B MVP.

Phase 3B MVP must not add any new save-payload fields.

### Rationale

**Backward compatibility risk:**
Any new field added to the save payload requires a plan for handling existing entries that do not have that field. The backward compatibility approach has not been agreed. Introducing new fields without this agreement risks silent errors in Journey or Garden display when reading older entries.

**Unresolved design questions:**
The exact meaning, derivation rules, and display semantics of `alignStage`, `alignStagesExplored`, and `primaryStageExplored` were explicitly left unresolved in `docs/WAYFINDER_PHASE_3B_TWO_LAYER_ALIGN_JOURNEY_PLAN.md` (Section 8). Building an implementation that depends on these fields before their design is confirmed is premature.

**Scope creep risk:**
Adding `alignStage` tags to the activity journal save path touches `ClientJournal.finalSubmit` - a write path. Write path changes require higher review scrutiny than read-only display changes. Deferring this keeps Phase 3B MVP entirely read-only.

**MVP can deliver value without new fields:**
The existing `phase` field on activity entries and the existing `align{}` nested sections on decode entries provide sufficient signal for a cautious, heuristic-based parent-wide Journey display. The product value of the Journey section does not require the richer tagging model in Phase 3B MVP.

### When to introduce new save-payload fields

A separate Phase 3B.1 (or Phase 3C) brief should address:

- Exact field names and values for `alignStage` (e.g. `"a"`, `"l"`, `"i"`, `"g"`, `"n"`).
- Derivation rule for `alignStage` from `phase` at activity journal save time.
- Derivation rule for `alignStagesExplored` from decode section content.
- Backward compatibility plan: how existing entries without `alignStage` fall back to `phase`.
- Write path review for `ClientJournal.finalSubmit` change.
- Evidence that the new tags actually change Journey or Garden display behaviour in a meaningful way.

New save-payload tags may only be added after a separate approved brief and separate Rodney review.

---

## 6. Suggested Activity Behaviour

### Rules for Phase 3B MVP

Activity suggestions in the Journey section must follow these rules:

**Do not pick by day number alone.**
"Try Day 15" is forbidden. Day number is an implementation detail, not a meaningful parent-facing concept.

**Do not name a specific activity unless stage mapping is explicitly confirmed.**
The authoritative activity-to-stage mapping has not been confirmed by Rodney (open question from Phase 3 plan, Section 13, question 1). Until this mapping is confirmed, do not name individual activities.

**Use general stage-direction copy when uncertain.**
If the inferred current focus is Locate, the suggestion should point toward Locate-stage practice generally - not name a specific activity from `ACTIVITIES["L"]`.

**Keep suggestion optional.**
The suggestion must use non-commanding, inviting language. The parent must never feel commanded, shamed, or behind.

**Do not suggest an advanced stage when earlier-stage evidence is absent.**
Do not suggest a Navigate activity if there is no evidence of Awareness, Locate, or Integrate practice. Suggestions must be grounded in inferred current stage, not in a fixed progression sequence.

### Safe suggestion copy patterns

For general stage direction when current focus is inferred:

"You might choose one Awareness practice when you are ready."

"One possible next direction is to practise pausing and noticing before responding."

"A Locate practice may support what you seem to be exploring."

"When you are ready, one direction worth trying might be to slow down and name what you notice."

"A Growth activity may support the capacity you may be building."

For empty state when no stage is yet inferable:

"Wayfinder will suggest a possible next direction as your reflections build."

"When you have a few more reflections, a practice direction may appear here."

### Forbidden suggestion copy

"You must do a Locate activity."

"You need to practise Navigate."

"You have not tried Growth yet."

"Your next required step is..."

"You are behind on Integrate."

---

## 7. Parent-Wide ALIGN Journey Cards

### Section title

"Your ALIGN Journey"

Do not use "ALIGN Progress" or "ALIGN Stage" as section titles. Both imply scoring or sequential advancement.

### Card definitions and safe copy patterns

#### Card 1 - Current Growth Edge

**Purpose:** Reflect what the parent may currently be practising or developing across recent reflections.

**Do not use:** "Current Focus" if it risks implying stage assignment. Prefer "Current Growth Edge" or "What may be growing in you now."

**Empty state (0-1 entries):**
"Your current growth edge will appear here as you reflect."

**Early signal (2-3 entries):**
"Your recent reflections may suggest you are beginning to explore [stage-area]."

**Recurring signal (4+ entries):**
"Your reflections may suggest [stage-area] is a current area of practice."

**Copy must use:**
"may be", "might be", "seems to be", "appears to be"

**Copy must not use:**
"You are at", "You have reached", "Your current stage is", "You are practising [stage]" stated as fact.

**Example safe copy:**
"Your recent reflections may suggest that noticing what you feel in the moment - pausing before reacting - is a practice worth tending right now."

#### Card 2 - Recent Reflection Signal

**Purpose:** Surface a possible recurring theme from recent reflections. Not a pattern diagnosis. A gentle mirror.

**Do not use:** "Recent Pattern" as the card label if it implies a fixed diagnosis. Prefer "Recent Reflection Signal" or "What may be worth noticing."

**Empty state (0-1 entries):**
"A reflection signal may appear here after a few more moments."

**Early signal (2-3 entries):**
"Something may be worth noticing from your recent reflections. A few more reflections may help Wayfinder say this more safely."

**Recurring signal (4+ entries):**
"A possible theme across recent reflections: [cautious theme statement]."

**Copy must use:**
"possible", "may", "might be worth noticing", "has appeared in recent reflections"

**Example safe copy:**
"Urgency may appear in recent reflections - a feeling of needing to resolve things quickly. This might be worth noticing."

"Connection has been a possible need you have been exploring in recent moments."

#### Card 3 - Practice Direction

**Purpose:** Name a capacity the parent may currently be tending or building.

**Empty state:**
"A practice direction may appear here as your reflections build."

**Early signal (2-3 entries):**
"You may be beginning to explore [capacity]."

**Recurring signal (4+ entries):**
"[Capacity] may be a practice you are currently building."

**Example safe copy:**
"Pausing before correcting may be a practice you are building."

"Staying curious about what your child may have needed - rather than rushing to fix - may be emerging as a practice direction."

#### Card 4 - Suggested Next Step

**Purpose:** Offer one optional, non-commanding direction for what the parent might practise next.

**Important:** This is a direction, not a task assignment. It is always optional.

**Empty state:**
"A possible next step may appear here as your reflections build."

**With sufficient signal (4+ entries):**
"One possible next direction: [general stage-area copy]."

**Example safe copy:**
"You might choose one Awareness practice when you are ready."

"One possible next direction is to notice what happens in your body just before you respond."

"A Locate practice may support what you seem to be exploring."

### Card section rules

All four cards must:

- Use "may", "might", "possible", "seems to suggest", "worth noticing."
- Fail gracefully with a friendly empty state if data is insufficient.
- Be collapsible or dismissible so parents are not overwhelmed.
- Not require any new database calls.
- Not reference child names.
- Not reference specific day numbers.

---

## 8. Dyad Lens Future Shape (Phase 3B.2)

This section defines the intended shape for dyad lenses in Phase 3B.2. It is planning only. No implementation of dyad lenses is authorised by this brief.

### Each dyad lens uses Child ID only

Never: child name.
Display: "Child ID [id]" with age/gender if already available.

### Dyad lens elements (Phase 3B.2 planning)

Each lens for one child relationship would show:

**Activation context note:**
What kinds of parenting moments have appeared in reflections linked to this Child ID. Framed as parent-observed context - not child traits.

Example: "Transition moments have appeared in several reflections linked to this relationship."

**Parent CAB pattern in this relationship:**
What the parent has noticed in themselves - not what the child caused.

Example: "Urgency may appear as a possible Affect pattern in moments linked to this relationship."

**Possible need explored:**
What child need the parent has named most in decodes linked to this child. Framed cautiously as what the parent has been exploring - not a diagnostic conclusion.

Example: "Predictability has been a possible need the parent has been exploring in reflections linked to this relationship."

**Practice edge for this relationship:**
What ALIGN capacity may be most worth tending in this specific relationship context.

Example: "Pausing before correcting may be a particularly useful practice to explore in moments with this child."

**Gentle next step:**
One optional, non-commanding direction for this relationship specifically.

Example: "When you are ready, one reflection from a moment with this child may help Wayfinder notice more safely."

### Dyad lens guardrails (Phase 3B.2)

- Must not create a child profile.
- Must not label the child's personality, attachment style, or developmental pattern.
- Must not compare this child to other children.
- Must not say "this child is avoidant", "this child is controlling", "this child needs X."
- Must not advance the child relationship to a better score based on parent performance.
- Must not suggest the parent has failed in this relationship.
- Must not be visible if the per-child evidence threshold has not been met.
- Must not imply one relationship is healthier than another.
- Must read as complete in itself - not relative to other lenses.

---

## 9. Relationship Garden Interaction

### Rule: Relationship Garden remains unchanged in Phase 3B MVP

Phase 3B MVP must not change:

- Garden stage logic (Seed / Sprout / Leaves / Bud / Bloom).
- Garden visual (existing plant growth display).
- Garden card content or layout.
- Garden empty states.
- The stageOf derivation function.

### Garden stage is not advanced by AI inference or decode completion alone

In Phase 3B MVP, garden stage advancement logic remains exactly as currently implemented.

No garden stage change should result from:

- A new Journey section being added.
- Decode completion alone.
- AI inference (no AI in Phase 3B MVP).
- Heuristic inference from existing fields.

Garden stage may be revised in a future brief (Phase 3B.1 or 3C) when:

- `alignStage` tags have been introduced to activity journal saves.
- The Bloom threshold has been confirmed.
- A separate garden stage update brief has been reviewed and approved.

### Bloom meaning (non-negotiable, must be preserved)

Bloom means: "This relationship has recent reflection that touched repair or next action, with earlier ALIGN practice evidence present."

Bloom does not mean:

- the parent is fully aligned
- the child has improved
- the relationship is fixed
- the relationship is solved
- ALIGN is completed
- emotional regulation is mastered

This meaning must not be changed by any Phase 3B MVP work.

---

## 10. Allowed Files for Phase 3B MVP Implementation

### Likely allowed

These files may be modified when implementation is approved:

- `app.js` - for the new Your ALIGN Journey dashboard section and derivation helpers. Scope: read-only display logic, Journey card rendering, evidence derivation functions using already-loaded entries. Medium risk.
- `styles.css` - for Journey section card layout, spacing, and mobile responsiveness. Low risk.
- `content.js` - only if copy constants for Journey card labels and stage-direction copy are added as named constants (e.g. in a `UI_TEXT.journey` block). Low risk.
- `docs/` - this brief and any acceptance checklist updates. Low risk.

### Forbidden files

These files must not be modified in Phase 3B MVP under any circumstances:

- `supabase.js`
- `api/**` (all API routes)
- `*.sql` (all SQL/RLS files)
- `vercel.json`
- `auth` or profile logic of any kind
- `ensure_profile`
- email verification gate
- Parent ID / Child ID generation code
- `DB.getEntries` signature
- `DB.saveEntry` signature
- `DB.getAllDyads` signature
- `DB.saveDyad` signature
- Journal save path compatibility (no changes to what is written at save time)
- Deployment configuration
- Environment variables

### Activity journal save path

`ClientJournal.finalSubmit` must not be modified in Phase 3B MVP.

The `phase` field is already saved on activity entries. Phase 3B MVP reads this field for ALIGN stage inference. The `alignStage` extension of this save path is deferred to a later approved brief.

---

## 11. Implementation Branch Name

Recommended branch:

```
feature/phase-3b-align-journey-mvp
```

This branch should be created from `main` at the time implementation begins.

Preview deploy before merge to `main`.

Do not merge to `main` until the Phase 3B release gate passes.

---

## 12. Validation Checks

Run the following checks before any commit on the implementation branch.

### Git checks

```bash
git diff --name-only
git diff --stat
git diff --check
```

Review `git diff --name-only` to confirm no forbidden files appear in the diff.

### Node syntax check

```bash
node --check supabase.js
```

`supabase.js` must not be modified. This check confirms its syntax is unchanged.

### Forbidden content checks (PowerShell)

The following phrase-based checks are whole-file zero-match blockers. Any match in `app.js`, `content.js`, or `styles.css` is a blocker.

**Framing and labelling checks:**

```powershell
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "relationship fixed"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "relationship solved"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "child profile"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "child personality"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "difficult child"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "fully aligned"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "child improved"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "behaviour solved"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "inadequate journalling"
```

**Scoring and stage-completion framing checks:**

New Phase 3B code must not introduce ALIGN scoring, stage completion framing, or achievement language. Check using phrase-specific patterns to avoid false-positives on existing legitimate app code.

```powershell
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "Journey score"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "ALIGN score"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "stage completed"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "completed ALIGN"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "completed stage"
```

**Note on bare terms "score" and "completed":**
The bare terms "score" and "completed" must not be used as whole-file zero-match blockers. The existing app legitimately uses terms such as `criticalScore`, `nurtureScore`, DISC score references, "no score to chase" copy, and password-recovery or role-completion states. A whole-file zero-match check for "score" or "completed" would false-positive on this existing code and block valid builds.

New Phase 3B code must not introduce ALIGN scoring, stage-completion framing, or achievement language. This requirement is enforced through the phrase-specific checks above and through the manual test checklist in Section 13.

### Protected area checks (PowerShell)

```powershell
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "profiles.insert"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "profiles.upsert"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "ensure_profile"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "Authorization"
Select-String -Path .\app.js, .\content.js, .\styles.css -SimpleMatch -Pattern "Bearer"
```

These patterns should not appear in `app.js`, `content.js`, or `styles.css`. Any new match added by Phase 3B work is a blocker.

Note: `ensure_profile`, `Authorization`, and `Bearer` may legitimately exist in `supabase.js` and `api/**`. Confirm those files are unchanged.

### Cross-platform alternative (bash)

```bash
rg -n "relationship fixed|relationship solved|child profile|child personality|difficult child" app.js content.js styles.css
rg -n "fully aligned|child improved|behaviour solved|inadequate journalling" app.js content.js styles.css
rg -n "Journey score|ALIGN score|stage completed|completed ALIGN|completed stage" app.js content.js styles.css
rg -n "profiles\.(insert|upsert)|ensure_profile|Authorization|Bearer" app.js content.js styles.css
```

Note: bare "score" and "completed" are not included in the bash checks for the same reason as the PowerShell checks above - they would false-positive on existing legitimate app code.

### Verify script

If available, also run:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File ./scripts/verify-wayfinder.ps1
```

---

## 13. Manual Test Checklist

All items must pass before Phase 3B MVP is considered ready for review.

### Existing functionality - must remain working

- [ ] Login works - verified user can sign in.
- [ ] Dashboard loads after login.
- [ ] Relationship Garden still appears and displays correctly.
- [ ] Existing garden stage behaviour is unchanged.
- [ ] Decode a Moment card still appears.
- [ ] Decode a Moment flow still works (A -> L -> I -> G -> N).
- [ ] Behaviour decode can be saved and appears in Journal Trail.
- [ ] Activity journal still works (can start, journal, and save).
- [ ] Journal Trail loads with all existing entries.
- [ ] Journal Trail "All entries" filter works.
- [ ] Journal Trail "Activity journals" filter works.
- [ ] Journal Trail "Behaviour decodes" filter works.
- [ ] Journal Trail child filter works.
- [ ] Journal Trail need filter works.
- [ ] Journal Trail growth capacity filter works.
- [ ] Behaviour decode cards still show six fields (Behaviour, Possible Need, CAB Misalignment, Growth Capacity, Next Action, Repair Intention).
- [ ] Sign out works.
- [ ] Unverified email is still blocked from app access.

### Privacy and identity - must remain intact

- [ ] No child names appear in normal UI.
- [ ] No parent email appears in normal UI.
- [ ] No Supabase UUIDs appear in normal UI.
- [ ] No JWTs, tokens, anon keys, or service keys appear in normal UI.
- [ ] Child IDs (with age/gender if available) are the only child identifiers shown.
- [ ] Parent ID / Wayfinder ID is still shown correctly on dashboard.

### New Phase 3B MVP functionality

- [ ] Your ALIGN Journey section appears on dashboard.
- [ ] Journey section placement does not break other dashboard sections.
- [ ] Empty state displays correctly when parent has 0 entries.
- [ ] Empty state uses gentle, non-shaming copy.
- [ ] With 1 entry: Journey shows single-moment note only. No pattern inferred.
- [ ] With 2-3 entries: Journey uses highly cautious early-signal language. No recurring pattern claimed.
- [ ] With 4+ entries: Journey may surface a cautious possible pattern. Cautious language preserved.
- [ ] Current Growth Edge card: shows correct content or friendly empty state.
- [ ] Recent Reflection Signal card: shows correct content or friendly empty state.
- [ ] Practice Direction card: shows correct content or friendly empty state.
- [ ] Suggested Next Step card: shows one optional, non-commanding general stage-direction. No specific day number.
- [ ] All Journey card copy uses cautious language ("may", "might", "possible", "worth noticing").
- [ ] No Journey card copy uses forbidden terms ("score", "completed", "fully aligned", "child improved", "relationship solved", "relationship fixed").
- [ ] Journey section is collapsible or dismissible (if collapsible UX is implemented).
- [ ] Journey section fails gracefully if entries data is unavailable.

### Layout

- [ ] Mobile layout works - Journey section is usable on small screens.
- [ ] Desktop layout works - Journey section does not break existing layout.
- [ ] No horizontal overflow introduced by Journey cards.

---

## 14. Release Gate

Phase 3B MVP cannot be merged to `main` unless all of the following are confirmed.

### Process gates

- [ ] This implementation brief accepted by Rodney.
- [ ] Implementation review passes (OpenClaw or equivalent review tool).
- [ ] All manual test checklist items pass.
- [ ] `git diff --name-only` confirms no forbidden files were modified.
- [ ] `git diff --check` passes.
- [ ] `node --check supabase.js` passes.
- [ ] Forbidden content checks return zero matches.
- [ ] Protected area checks return zero new matches in `app.js`, `content.js`, `styles.css`.

### Product gates

- [ ] No high-risk files modified (supabase.js, api/**, *.sql, vercel.json, auth/profile logic, ensure_profile, Parent ID / Child ID generation, DB.getEntries / DB.saveEntry / DB.getAllDyads / DB.saveDyad signatures, journal save/read path, deployment config).
- [ ] No new save-payload fields added to activity journal or decode save paths.
- [ ] No AI API calls introduced.
- [ ] No new Supabase queries introduced.
- [ ] Relationship Garden visual and stage logic unchanged.
- [ ] No child names, parent emails, Supabase UUIDs, tokens, or secrets in normal UI.
- [ ] Journey copy uses cautious, non-diagnostic language throughout.
- [ ] Evidence thresholds respected: no pattern surfaced from fewer than 2-3 entries; no recurring signal surfaced from fewer than 4 entries.
- [ ] Suggested Next Step is general stage-direction copy only - no specific day numbers named.
- [ ] Counsellor reminder still present in Decode a Moment flow (existing behaviour unchanged).

---

## Open Questions Remaining

The following questions from the Phase 3 and Phase 3B planning documents remain unresolved and must not be assumed answered by this brief.

These questions will need to be addressed before Phase 3B.2 (dyad lenses) or before introducing new save-payload fields.

1. **Activity catalogue:** What is the authoritative mapping of each activity in `content.js ACTIVITIES` to A / L / I / G / N? Does each activity already belong to the correct ALIGN stage, or are any reclassifications needed?

2. **Dyad lens placement:** Inside Relationship Garden cards, below garden as expandable, or separate panel? (Advisory recommendation in Section 2 above is not binding until confirmed by Rodney.)

3. **Dyad lens visibility threshold:** Should a dyad lens appear at 1 entry linked to a Child ID (as a single-moment note), or only at 2+ entries?

4. **Save-payload field design:** When `alignStage` is introduced in a later phase, what are the exact values, derivation rules, backward compatibility plan, and write-path change scope?

5. **Evidence recency window:** Should Current Growth Edge and Recent Reflection Signal use a time-based window (e.g. last 30 days), an entry-count window (e.g. last 5 entries), or a combination?

6. **Suggested Direction scoping:** Should the Layer 1 Suggested Direction factor in which child relationship has the most recent reflection activity, or remain parent-wide only?

7. **Repair framing:** Should Navigate or repair reflection evidence be surfaced with a specific acknowledgement ("you have shown willingness to repair in this relationship") or remain implicit in practice language?

8. **Multi-child display cap:** If a parent has many children, should the dyad lens section (Phase 3B.2) cap at a visible number with a "see more" option?

9. **Layer 1 filter:** Should parents be able to filter the parent-wide Journey view to a specific child, or must it remain cross-child aggregated only?

10. **Counsellor visibility (Phase 4):** When a counsellor views a parent, should they see both Journey layers, or only dyad lenses?

---

## Document Control

| Field | Value |
| --- | --- |
| Title | Wayfinder Phase 3B - Implementation Brief |
| Status | Brief only - not authorised for implementation until accepted by Rodney |
| Branch | docs/phase-3b-implementation-brief |
| Depends on | Phase 1 live, Phase 2 live, Relationship Garden live, Phase 3B Two-Layer Plan reviewed |
| Next step | Rodney review -> accept or revise -> commission implementation on feature/phase-3b-align-journey-mvp |
| Files changed | docs/WAYFINDER_PHASE_3B_IMPLEMENTATION_BRIEF.md only |
| Code changed | None |
| Schema changed | None |
| Auth/RLS changed | None |
| Journal save/read changed | None |
| Deployment config changed | None |
