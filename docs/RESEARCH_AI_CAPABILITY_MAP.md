# Wayfinder Research + AI Capability Map

## Status

**Planning / research architecture (Day 1)** — Issue #6

This document maps Wayfinder’s research contribution, evidence streams, AI capabilities, consent boundaries, and future backend phases. It is **docs-only**. It does **not** authorise schema changes, API changes, Supabase edits, auth changes, or new product features.

Read first:

- [AGENTS.md](../AGENTS.md)
- [docs/WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md)
- [docs/WAYFINDER_AGENT_OPERATING_SYSTEM.md](./WAYFINDER_AGENT_OPERATING_SYSTEM.md)
- [docs/WAYFINDER_PHASE_3_AI_REFLECTIVE_EVIDENCE_LAYER_PLAN.md](./WAYFINDER_PHASE_3_AI_REFLECTIVE_EVIDENCE_LAYER_PLAN.md)
- [docs/ai-prompt-safety-review.md](./ai-prompt-safety-review.md)
- [docs/PLATFORM_SYNC_BRIEF_TEMPLATE.md](./PLATFORM_SYNC_BRIEF_TEMPLATE.md)

---

## Non-negotiable framing

Wayfinder is **not**:

- child diagnosis or labelling
- parent scoring or fixed parent typing
- stage completion or “relationship fixed/solved” tracking
- a Behaviour → Advice parenting tool

Wayfinder **is** a parent emotional development pathway using ALIGN/CAB:

Behaviour → Need → Parent CAB → Alignment Check → Awareness → Growth → Navigate / Next Action

Use cautious language in all research and product copy: **may**, **might**, **possible**, **appears to suggest**, **let's explore**.

---

## 1. Wayfinder’s research contribution to mental health

### Research focus

Wayfinder may contribute to research on **parent alignment capacity** — how parents notice behaviour without blame, locate a possible child need, recognise their own Cognition/Affect/Behaviour (CAB), and choose growth and repair steps.

This is adjacent to family mental health and parent emotional development. It is **not** a substitute for clinical assessment, child treatment, or crisis intervention.

### Unit of analysis

| Level | Identifier | Notes |
|-------|------------|-------|
| Parent practice | Generated Parent ID / Wayfinder ID | App identity; not Supabase UUID in normal UI |
| Parent–child dyad | Generated Child ID | Per-relationship evidence; never child name in normal UI |
| Moment / session | Journal or decode entry | Timestamped reflection evidence |

Research should scope evidence **per dyad** unless a separate, approved parent-wide aggregation study design explicitly allows otherwise.

### Example research questions

Wayfinder evidence may support questions such as:

- Where might a parent’s CAB be misaligned with an emerging child need in a given moment?
- What ALIGN-stage practice **may** appear in written reflection evidence over time?
- How might self-declared awareness markers, activity practice, and decode entries **together** suggest a parent’s current growth edge?
- How might counsellor-reviewed AI summaries compare with parent self-declaration — without ranking parents or labelling children?

### What Wayfinder research must not claim

- That child behaviour has been diagnosed or explained with certainty
- That a parent has a fixed type, deficit, or clinical score
- That ALIGN stages are completed, mastered, or ranked
- That journal quantity equals moral or clinical progress
- HIPAA compliance or clinical certification (readiness reviews are not compliance claims)

---

## 2. Parent alignment capacity (core construct)

**Parent alignment capacity** is a living developmental construct — not a psychometric score or parent diagnosis.

### Construct dimensions

| Dimension | Research meaning | Example evidence |
|-----------|------------------|------------------|
| Notice without blame | Parent describes behaviour as signal, not child fault | Decode Awareness text; non-blaming activity CAB |
| Locate possible need | Exploratory inference about emerging child need | Decode Locate; need options or free text |
| Parent CAB awareness | Parent names cognition, affect, behaviour | Activity CAB fields; decode Integrate section |
| Alignment check | Parent compares child need vs own CAB | Decode alignment step; written mismatch language |
| Growth edge | Parent-side capacity being developed | Decode Growth; activity reflection on practice |
| Navigate / repair | Next action or reconnection step | Decode Navigate; repair language in journal text |

### Living profile (acceptable research outputs)

Recurring patterns **may** be described as:

- “Current alignment challenge: urgency vs child need for predictability.”
- “Possible growth edge: pausing before correcting.”
- “Emerging strength: noticing need beneath behaviour.”

### Unacceptable research outputs

- “Controlling parent” / “Oppositional child”
- Parent percentile, leaderboard, or ALIGN stage completion %
- “Relationship fixed” or “problem solved”
- Behaviour-reduction as the primary success metric

### Developmental outcome questions (from product canon)

Research framing should align with:

- Can the parent notice behaviour without blame?
- Can the parent locate the child’s possible need?
- Can the parent identify their own CAB?
- Can the parent see where CAB may be misaligned?
- Can the parent choose a growth capacity?
- Can the parent navigate a next action or repair step?

---

## 3. Evidence streams

Summary table:

| Stream | Live today | Primary storage | Parent-facing use | Research use |
|--------|------------|-----------------|-------------------|--------------|
| Questionnaires | **No** | N/A (planned) | Not approved by default | Baseline/follow-up if licensed + consented |
| Decode entries | **Yes** | `journal_entries` (`entry_type: behaviour_decode`) | Decode a Moment; Journal Trail | Moment-level ALIGN/CAB evidence per Child ID |
| Journal reflections | **Yes** | `journal_entries` (activity CAB + markers) | Journal Trail; dashboard; ALIGN Journey | Written CAB + marker practice patterns |
| Activity practice | **Yes** | Activity choice + `phase` + timestamps | 52-day activities; past activities | Practice exposure proxy (not completion scoring) |
| AI congruence coding | **Partial** | Server responses; counsellor notes | DISC insight (parent); counsellor AI tabs | Pattern coding; counsellor review workflows |

### 3a. Questionnaires (planned — not live)

**Not implemented in the codebase today.**

Planned role (research-only by default):

- Optional baseline and follow-up measures (e.g. parenting stress, wellbeing) under ethics approval
- Stratification or outcome monitoring in de-identified research exports
- Separate from everyday parent app use unless explicitly approved

See [Section 6](#6-questionnaire-role-and-licensing-caution).

### 3b. Decode entries

**Live:** Decode a Moment saves structured reflection via existing journal storage.

Typical payload signals (conceptual):

- Observed behaviour and context (Awareness)
- Possible child need and parent affect (Locate)
- Parent cognition, affect, behaviour (Integrate)
- Alignment check between need and CAB
- Growth capacity named by parent
- Navigate / next action or repair step

Research notes:

- Entry type: `behaviour_decode` — distinct from activity journal entries
- Must be scoped by Child ID
- **Exclude** from activity `phase` frequency tallies (Phase 3B rule)
- Free text may contain identifying details if parents type them — handle in consent/export design

### 3c. Journal reflections (activity entries)

**Live:** 52-day ALIGN activity reflections with CAB fields and self-declared markers.

Evidence includes:

- CAB text: thoughts, feelings, actions, meaning
- Six **self-declared stability markers** (`MARKERS` in `content.js`): parent claims marker + optional evidence text
- Local `autoWords` inference from CAB keywords (not external AI)
- Activity metadata: selected activity, `phase` proxy (A/L/I/G/N), timestamps, dyad linkage

Research notes:

- Written text is primary evidence for future AI reflective layer
- Marker claims are **self-declaration**, not AI or clinician validation
- Do not use journal count alone as a performance or compliance metric

### 3d. Activity practice tracking

**Live:** Parent selects a daily ALIGN activity and submits a reflection.

Model principles:

- **Practice exposure + reflection**, not gamified completion
- `phase` on activity entries is a **proxy** for which ALIGN activity was chosen — not proof the parent practised that stage fully
- Recency may inform “current focus” hints; it must not prove growth or stage mastery

Current read-only inference (Phase 3B):

- Entry counts per parent / dyad
- Activity `phase` frequency (activity journals only)
- Marker claim frequency
- ALIGN Journey cards with cautious copy (“may be practising…”)

### 3e. AI congruence coding

**Partially live** server-side AI:

| Endpoint | Model (current) | Audience | Purpose |
|----------|-------------------|----------|---------|
| `/api/disc-insight` | Anthropic | Parent | Short DISC-linked reflection (not child diagnosis) |
| `/api/disc-vision` | Anthropic (env) | Parent | Extract D/I/S/C bar heights from image |
| `/api/counsellor-analysis` | OpenAI | Counsellor | Single-entry and longitudinal journal analysis |

**Planned:** AI Reflective Evidence Layer ([plan doc](./WAYFINDER_PHASE_3_AI_REFLECTIVE_EVIDENCE_LAYER_PLAN.md)):

- Read written reflection text per Child ID
- Output CAB evidence states: `present` / `emerging` / `not yet clear`
- Output ALIGN evidence with evidence-sufficiency thresholds
- Counsellor review before parent-facing pattern summaries where required

**Not live:** automated congruence scores, parent rankings, cross-child pooling, child profiling.

---

## 4. AI congruence markers

Three distinct layers — do not conflate:

### Layer A — Self-declared stability markers (parent)

**Live.** Six markers in `content.js` (`MARKERS`), e.g.:

- “I was here in the moment”
- “I watched without racing ahead to fix”
- “I let go of managing how everyone was doing”
- “I named what I expected — of myself and my child”
- “I found the thought beneath my feeling”
- “We worked it out together”

Parent claims marker + optional evidence text at journal save. Dashboard/Journal Trail may show claim frequency. This is **self-report**, not AI coding.

### Layer B — Counsellor congruence review (human)

**Live** in counsellor workspace: congruence moments, Satir fields, stance, gap, narrative, private review notes. Counsellor AI analysis assists review but does not replace professional judgement.

### Layer C — AI-assisted congruence / CAB coding (server)

**Planned** for written reflection analysis:

- Detect written CAB and ALIGN indicators with sufficiency gates
- No numeric congruence score in parent UI
- No child pathology or diagnostic labels
- Per-Child-ID scope only
- Counsellor validation encouraged before sensitive summaries reach parents

### AI safety boundaries (current + planned)

From [ai-prompt-safety-review.md](./ai-prompt-safety-review.md):

- Prompts prohibit diagnosis, deterministic child claims, and therapy replacement
- Parent-facing DISC insight sits near advice boundary — clinically vet if framing shifts toward prescription
- Counsellor AI output should remain clearly counsellor-facing unless a governed parent-summary path exists

---

## 5. Activity practice tracking model

### Current MVP (tag / proxy layer)

| Signal | Source | Use |
|--------|--------|-----|
| Entry count | Activity + decode entries | Sufficiency hints only |
| `phase` frequency | Activity journals only | Possible current ALIGN activity context |
| Marker claims | Activity journal `markers` | Possible practice themes |
| Recency | Entry timestamps | “Current focus” hints — not growth proof |

ALIGN Journey (v0.3.2) surfaces read-only, cautious summaries derived from loaded journal data — no new schema, no AI calls in MVP.

### Future extension (AI evidence layer)

- Written-evidence sufficiency before pattern summaries (0 / 1 / 2–3 / 4+ entries per Child ID)
- CAB and ALIGN rubrics on free text
- Optional counsellor-validated activity direction per dyad
- Audit log of AI inputs/outputs for research governance

### Prohibited tracking patterns

- Stage completion percentages or badges
- Streaks that shame low activity
- Parent leaderboards
- “Unlock insight by journaling more”
- Proof of relationship repair or “fixed” status

---

## 6. Questionnaire role and licensing caution

**Questionnaires are not in the Wayfinder app today.**

If introduced for research:

### Role

- Optional research baseline, follow-up, or stratification
- May complement reflection evidence — not replace parent narrative
- Default pipeline: **research-only export**, not parent dashboard scores

### Licensing caution

Validated instruments typically require:

- Copyright / license agreement with instrument owner
- Fee or registration for commercial or research use
- Rules on modification, translation, and administration
- Clinician or trained-administration requirements for some tools
- Separate ethics review and informed consent

**Do not** embed PHQ/GAD/PSS or other copyrighted scales in app or docs implementation without legal and clinical review.

### Parent-facing rule

If a questionnaire is ever shown to parents:

- Plain-language summaries only
- No clinical cutoffs, diagnoses, or “your score means X” certainty
- Separate explicit consent from everyday app use and from Phase A PDPA notice acknowledgement

---

## 7. Parent-facing vs research-only outputs

| Output | Audience | Status | Research export |
|--------|----------|--------|-----------------|
| ALIGN Journey cards | Parent | Live | De-identified aggregates only; consent-gated |
| Decode saved entries | Parent | Live | Dyad-scoped; redact free-text PII |
| Journal Trail / markers | Parent | Live | Same |
| 52-day activity reflections | Parent | Live | Same |
| DISC insight | Parent | Live (AI) | Not for child-assessment research claims |
| DISC vision bars | Parent | Live (AI) | Numeric bars only; no personality diagnosis |
| Counsellor AI analysis | Counsellor | Live | Counsellor workspace; governed export |
| Future AI pattern summaries | Parent (gated) | Planned | Server audit + counsellor review path |
| Questionnaire scores | Research | Not live | Licensed instruments + explicit opt-in |
| Platform sync briefs | Agents / owners | Live (process) | No raw user data ([template](./PLATFORM_SYNC_BRIEF_TEMPLATE.md)) |

### Key rule

**Using the parent app or viewing the App Version page is not research consent.**

Research participation requires its own notice, basis, and opt-in architecture (future Phase B/C).

---

## 8. Consent / privacy boundaries

### Current state (main)

| Topic | Today | Notes |
|-------|-------|-------|
| Signup PDPA notice | UI acknowledgement checkbox | Phase A — **not persisted** |
| Research opt-in | Not implemented | Deferred to Phase B/C |
| Identifiers in normal UI | Parent ID, Child ID | No parent email, child names, Supabase UUID |
| Free-text reflections | User-typed | May contain identifying details — minimise in copy |
| AI API calls | Server-side (`api/*`) | Keys in Vercel env; not in browser |
| Agent handoffs | Platform sync brief rules | No raw production user content |

### Future consent architecture (planning only)

| Phase | Focus |
|-------|-------|
| **B** | Persist notice version, acknowledgement timestamp, optional research flags via approved RPC/schema |
| **C** | Research export pipeline, de-identification review, audit logs |
| **D** | Mandatory research consent governance (`audit/research-consent-legal-basis`) |

### Research export privacy rules

- Export de-identified or pseudonymised data where possible
- Separate Parent ID / Child ID from direct identifiers in research datasets when feasible
- Never export JWTs, emails, or service keys
- Review free-text fields for accidental PII before release
- Document legal basis (consent, legitimate interest, etc.) before any research use — legal review required

### Anonymised / de-identified learning

PDPA signup copy states future learning **may** use anonymised or de-identified data with safeguards. That statement is **not** active research consent. Any learning pipeline requires separate approval, safeguards, and appropriate basis.

---

## 9. Future backend / schema phases

This section is **roadmap only**. Day 1 does not authorise implementation.

### Phase B — Consent persistence

- Store PDPA notice version + acknowledgement timestamp
- Optional research opt-in flags
- Requires: SQL/RLS review, `ensure_profile` compatibility check, high-risk branch

### Phase C — Research evidence store

- De-identified export tables or batch jobs
- Counsellor review flags on AI outputs
- Evidence sufficiency metadata per Child ID
- Requires: ethics alignment, export SOP, no browser-side profile writes

### Phase D — AI Reflective Evidence Layer

- Server jobs analysing written text per Child ID
- Cached summaries with versioned prompts
- Parent-facing gating + counsellor review workflow
- Requires: [AI Reflective Evidence Layer plan](./WAYFINDER_PHASE_3_AI_REFLECTIVE_EVIDENCE_LAYER_PLAN.md) implementation brief approval

### Parallel audit track

- `audit/research-consent-legal-basis` — PDPA/research legal basis, instrument licenses, counsellor governance

### Unchanged guardrails across phases

- No browser `profiles.insert` / `profiles.upsert`
- Dashboard reads by `parent_id` first with Bearer token
- Static React/Babel architecture unless explicitly approved otherwise
- One branch, one merge at a time ([Agent OS](./WAYFINDER_AGENT_OPERATING_SYSTEM.md))

---

## 10. Stop conditions

Stop research architecture work, implementation, or export planning and escalate to the human owner when:

| Condition | Action |
|-----------|--------|
| Proposal introduces child diagnosis or labelling | Halt; revise framing |
| Proposal introduces parent scoring, typing, or stage completion | Halt; revise framing |
| Questionnaire added without license + clinical/ethics review | Halt |
| Research export includes raw free text without consent and de-identification review | Halt |
| AI output would reach parents without required counsellor governance | Halt |
| Change requires `supabase.js`, `api/*`, SQL, auth, or HTML entry points without approved high-risk branch | Halt |
| ALIGN/CAB canon or PDPA rules would be weakened | Halt; report conflict |
| `main` is dirty or production is unstable | Halt |
| Sync brief or agent handoff would include emails, UUIDs, tokens, or raw reflection content | Halt |

---

## Related documents

| Document | Role |
|----------|------|
| [WAYFINDER_ALIGN_PRODUCT_CANON.md](./WAYFINDER_ALIGN_PRODUCT_CANON.md) | Product and research framing canon |
| [WAYFINDER_AGENT_OPERATING_SYSTEM.md](./WAYFINDER_AGENT_OPERATING_SYSTEM.md) | Agent roles, merge rules, guardrails |
| [WAYFINDER_PHASE_3_AI_REFLECTIVE_EVIDENCE_LAYER_PLAN.md](./WAYFINDER_PHASE_3_AI_REFLECTIVE_EVIDENCE_LAYER_PLAN.md) | Future AI evidence layer detail |
| [WAYFINDER_PHASE_3B_IMPLEMENTATION_BRIEF.md](./WAYFINDER_PHASE_3B_IMPLEMENTATION_BRIEF.md) | Current ALIGN Journey MVP rules |
| [ai-prompt-safety-review.md](./ai-prompt-safety-review.md) | Live AI endpoint safety review |
| [PLATFORM_SYNC_BRIEF_TEMPLATE.md](./PLATFORM_SYNC_BRIEF_TEMPLATE.md) | Cross-platform handoff without raw user data |
| [CURRENT_LAUNCH_STATUS.md](./CURRENT_LAUNCH_STATUS.md) | Release snapshot |

---

## Document control

| Field | Value |
|-------|-------|
| Issue | #6 — Research + AI Capability Map |
| Branch | `docs/research-ai-capability-map` |
| App Version entry | Not required (internal docs-only) |
| Implementation authorised | No |
