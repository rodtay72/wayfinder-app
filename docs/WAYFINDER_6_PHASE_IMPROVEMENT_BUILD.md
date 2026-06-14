# WAYFINDER 6-PHASE IMPROVEMENT BUILD MASTER BRIEF

## 0. Purpose of this brief

This document is the shared master brief for all Wayfinder improvement work across:

* ChatGPT
* Claude
* Claude Code
* Codex
* Cursor
* OpenClaw
* UI/UX partner
* GitHub / Vercel release review
* Any future technical or product collaborator

This document gives the full 6-phase roadmap so every platform understands the intended direction.

However:

**The 6 phases are roadmap context, not permission to build everything.**

Only the current approved phase may be implemented.

Every phase must deliver a working app function before the next phase begins.

Do not build ahead.

Do not refactor broadly.

Do not change auth, privacy, Supabase, RLS, profile logic, Parent ID / Child ID logic, journal save/read behaviour, dashboard loading, deployment configuration, or existing user record compatibility unless Rodney explicitly approves it.

---

# 1. Wayfinder product identity

Wayfinder is a privacy-safe, modular parent-child reflection and parent emotional development app.

Wayfinder is not primarily a journalling app.

The journal is the mechanism.

The product is a parent emotional development pathway that helps parents recognise where their Cognition, Affect, and Behaviour may not yet be aligned with the emerging needs of the child.

Wayfinder is not:

* a child-diagnosis app
* a behaviour-labelling app
* a generic Behaviour -> Advice parenting app
* a child-compliance app
* an AI script generator that tells parents what to say
* a therapy replacement
* a tool that frames the child as the problem
* a tool that blames the parent

Wayfinder is:

* a parent reflection app
* a parent emotional-regulation practice system
* a parent-child alignment tool
* a repair and next-action guide
* a research-enabled app for observing parent CAB alignment over time
* a counsellor-aware system that encourages parents to validate recurring patterns with a counsellor

---

# 2. Non-negotiable framing

The entry phrase:

**“My child did something and I don’t know why.”**

must never mean:

**“The child is the problem.”**

It means:

**“The child’s behaviour may be revealing a moment where the parent’s Cognition, Affect, and Behaviour are not yet aligned with the child’s emerging need.”**

The app must always guide parents from blame toward curiosity, reflection, regulation, repair, and action.

Use cautious language:

* may
* might
* possible
* may have
* could be
* let’s explore

Do not use certainty-based or diagnostic language.

Do not say:

* “Your child is avoidant.”
* “Your child is controlling.”
* “Your child has X.”
* “This behaviour means Y.”
* “Your child is the problem.”
* “You are a controlling parent.”
* “Fix this behaviour by…”

Use:

* “This behaviour may have been trying to solve something.”
* “A possible need underneath this behaviour is…”
* “The behaviour may be a signal of…”
* “Let’s get curious about what need was emerging.”
* “Where might your CAB have moved out of alignment with this need?”

---

# 3. Core Wayfinder model

Do not build:

```text
Behaviour -> Advice
```

Build:

```text
Behaviour
-> Need
-> Parent CAB
-> Alignment Check
-> Awareness
-> Growth
-> Navigate / Next Action
```

---

# 4. Official ALIGN framework

ALIGN means:

```text
A = Awareness
L = Locate
I = Integrate
G = Growth
N = Navigate
```

## A — Awareness

Purpose:

Name what happened without judging the child.

Parent-facing question examples:

* What did your child do?
* When did this happen?
* What did you first notice?

Output:

* observed behaviour
* context
* initial parent observation

---

## L — Locate

Purpose:

Locate the possible child need and the parent’s internal response.

Parent-facing question examples:

* What might this behaviour have been trying to solve for your child?
* What was happening in you at the same time?

Output:

* possible child need
* parent affect

---

## I — Integrate

Purpose:

Connect the child’s possible need with the parent’s Cognition, Affect, and Behaviour.

Parent-facing question examples:

* What thought appeared in your mind?
* How intense was the feeling?
* What did you do next?

Output:

* parent cognition
* parent affect intensity
* parent behaviour
* possible misalignment

---

## G — Growth

Purpose:

Identify the parent capacity being developed.

Parent-facing question examples:

* What capacity might help you meet this need next time?
* What are you becoming aware of?

Output:

* growth capacity
* awareness marker

---

## N — Navigate

Purpose:

Convert insight into one practical next action or repair step.

Parent-facing question examples:

* If this happens again, what will you try first?
* Is there anything to repair with your child?

Output:

* next action
* repair intention

---

# 5. CAB model

CAB means:

```text
C = Cognition
A = Affect
B = Behaviour
```

## Cognition

What the parent thinks, assumes, expects, predicts, or interprets.

Examples:

* “They should know better.”
* “We are going to be late.”
* “This always happens.”
* “I need to stop this now.”
* “I am failing as a parent.”
* “Maybe they were overwhelmed.”
* “Maybe they needed predictability.”

## Affect

What the parent feels emotionally and in the body.

Examples:

* frustrated
* worried
* rushed
* angry
* helpless
* embarrassed
* confused
* tired
* disappointed
* tense body
* tight chest
* heat in face
* fast heartbeat

## Behaviour

What the parent does in response.

Examples:

* raised my voice
* corrected quickly
* explained too much
* threatened consequence
* withdrew
* gave in
* rushed the child
* tried to fix immediately
* stayed calm
* paused
* connected first
* lowered my voice
* offered choice
* repaired afterwards

---

# 6. Product outcome

The outcome is not journal completion.

The outcome is not child compliance.

The outcome is not behaviour reduction as the primary metric.

The outcome is:

**Increased parent alignment capacity and improved parent-child relationship quality.**

Wayfinder should help answer:

* Can the parent notice behaviour without blame?
* Can the parent locate the child’s possible need?
* Can the parent identify their own Cognition, Affect, and Behaviour?
* Can the parent see where CAB may be misaligned with the child’s possible need?
* Can the parent choose a growth capacity?
* Can the parent navigate a next action or repair step?
* Can the parent return to the real relationship with the child?
* Can the parent validate recurring patterns with a counsellor?

---

# 7. Target user

Wayfinder is designed for parents or caregivers of children who still live with them at home.

This can include:

* parents of young children
* parents of primary-school children
* parents of adolescents
* parents of older children or young adults still living at home

The common factor is not the child’s age.

The common factor is that the parent can observe repeated parent-child moments at home and practise reflection, regulation, repair, and next action.

---

# 8. Research ambition

Wayfinder is first a practical parent-facing app.

However, it must be built with research enablement.

The parent-facing UI should remain simple, warm, and non-clinical.

The backend structure should support future research into:

* parent Cognition markers
* parent Affect markers
* parent Behaviour markers
* parent emotional regulation
* parent reflective functioning
* parent-child relationship quality
* child observable regulation markers
* repair and reconnection patterns
* counsellor validation
* de-identified longitudinal data

The research direction is:

**Wayfinder studies how parents develop emotional regulation through repeated reflection on real parent-child moments, and whether growth in parent CAB alignment is associated with improved parent-child relationship quality and child emotional-regulation markers.**

---

# 9. Thesis-aligned research position

Wayfinder should help challenge two assumptions:

## Assumption 1

Cognitive intervention alone is enough to produce emotional regulation.

Wayfinder’s position:

Cognition matters, but cognition alone may not be enough when the parent is emotionally activated. Sustainable parent regulation likely requires integration of Cognition, Affect, Behaviour, pause, repair, and human reconnection.

## Assumption 2

Technology can replace human connection.

Wayfinder’s position:

Technology can support reflection, pattern recognition, and practice structure, but emotional regulation is learned through repeated human connection, co-regulation, repair, and lived interaction.

Therefore, Wayfinder must never become a tool that keeps the parent in the app instead of returning them to the child.

The ideal Wayfinder loop is:

```text
Reflect briefly
-> return to the child
-> practise connection
-> repair if needed
-> record what happened
-> validate recurring patterns with a counsellor
```

---

# 10. Counsellor principle

Wayfinder may be self-guided, but it must consistently remind parents that recurring patterns should be validated with a counsellor.

This is non-negotiable.

Use parent-facing copy such as:

**“This reflection is a starting point. If this pattern repeats or feels difficult to understand, consider reviewing it with a counsellor.”**

For repeated high-intensity or recurring patterns, use:

**“You have noticed this pattern more than once. A counsellor can help you validate what you are seeing and practise the next step safely.”**

Do not position the app as a substitute for counselling, therapy, clinical diagnosis, crisis support, or professional assessment.

---

# 11. Current active phase

## Current approved build phase

```text
Phase 1 — Decode a Moment V1
```

All other phases are roadmap context only.

Do not implement Phase 2, 3, 4, 5, or 6 unless Rodney explicitly approves.

---

# 12. Working app function rule

Every phase must deliver a working app function.

A phase is not complete unless:

1. The app still loads.
2. Verified login still works.
3. Dashboard still loads.
4. Existing child records still appear.
5. Existing journal entries still appear.
6. The new phase function works end-to-end.
7. New data saves correctly, if saving is part of the phase.
8. New data displays correctly, if display is part of the phase.
9. Desktop layout remains usable.
10. Mobile layout remains usable.
11. No privacy, auth, RLS, profile, identity, or journal-save behaviour is weakened.
12. No existing user records are hidden, broken, overwritten, or made incompatible.
13. No future phase is partially built in a way that leaves the app unstable.
14. The app can still be deployed safely.

Do not mark a phase complete if the app is knowingly broken.

---

# 13. Six-phase roadmap

## Phase 1 — Decode a Moment V1

Goal:

Add the core behaviour decode flow.

Working app function:

Parent can start Decode a Moment, complete A -> L -> I -> G -> N, save a `behaviour_decode` entry using existing journal storage if safe, and view it in Journal Trail.

Required user-facing function:

* Dashboard card appears.
* Parent clicks Start Decode.
* Parent selects or confirms child context where required.
* Parent completes Awareness.
* Parent completes Locate.
* Parent completes Integrate.
* Parent sees cautious alignment insight.
* Parent completes Growth.
* Parent completes Navigate.
* Parent sees counsellor reminder.
* Parent saves the entry.
* Saved entry appears in Journal Trail.
* Existing activity journals still appear.

Allowed likely files:

* app.js
* content.js
* styles.css

Do not change unless explicitly approved:

* supabase.js
* SQL/RLS
* api/**
* auth/profile logic
* ensure_profile
* email verification gate
* Parent ID / Child ID generation
* Vercel config
* deployment config
* existing journal save/read compatibility

---

## Phase 2 — Journal Trail Evolution

Goal:

Improve Journal Trail so behaviour decodes are easy to read and filter.

Working app function:

Parent can filter and read behaviour decode cards by entry type, child, possible need, and growth capacity without breaking existing activity journals.

Required user-facing function:

* “All entries” filter works.
* “Activity journals” filter works.
* “Behaviour decodes” filter works.
* Child filter works.
* Possible need filter works.
* Growth capacity filter works.
* Clearing filters restores all entries.
* Behaviour decode cards show:

  * Behaviour
  * Possible Need
  * CAB Misalignment
  * Growth Capacity
  * Next Action
  * Repair Intention

Do not break:

* existing activity journal cards
* existing Journal Trail entries
* existing child records
* save/read behaviour

---

## Phase 3 — Your ALIGN Journey

Goal:

Add a dashboard section that helps parents see their growth over time.

Working app function:

Dashboard shows Current Focus, Recent Pattern, Growth Practice, and Next Step using already-loaded journal and behaviour decode entries.

Required dashboard section:

```text
Your ALIGN Journey
```

Cards:

1. Current Focus
   Example: “Locate — noticing the need beneath behaviour”

2. Recent Pattern
   Example: “Urgency appears when transitions are difficult”

3. Growth Practice
   Example: “Pause before correcting”

4. Next Step
   Example: “Try one transition with more predictability”

Rules:

* Use existing saved entries first.
* Use friendly empty states when there is not enough data.
* Do not add schema changes unless explicitly approved.
* Do not create fixed parent types.
* Do not diagnose parent or child.
* Use “possible”, “emerging”, “may be”, and “worth noticing”.

---

## Phase 4 — Counsellor Summary View

Goal:

Help counsellors review parent ALIGN/CAB patterns safely.

Working app function:

Counsellor can view parent ALIGN/CAB pattern summaries, recurring needs, repeated misalignments, growth practices, and repair intentions without exposing unsafe personal data.

Counsellor should eventually see:

* parent ALIGN pattern
* recurring CAB pattern
* child needs explored
* repeated misalignments
* growth practices attempted
* repair intentions
* possible current growth edge
* emerging strengths
* current practice

Counsellor review prompts:

* What alignment capacity is emerging?
* What should the parent practise next?
* What should be reinforced?
* What pattern may need professional attention or deeper validation?

Privacy rules:

* Do not expose parent email in normal UI.
* Do not expose Supabase UUID.
* Do not expose child names unnecessarily.
* Do not expose JWTs, tokens, anon keys, service keys, or raw auth identifiers.
* Preserve counsellor RLS and access rules.
* Do not create unsafe write/delete access.

---

## Phase 5 — Pattern Detection

Goal:

Detect repeated parent-child alignment patterns over time.

Working app function:

App identifies recurring need, trigger, cognition, affect, behaviour, growth edge, emerging strength, and current practice from repeated entries.

Pattern types:

* recurring child need noticed
* recurring context or trigger
* recurring parent cognition
* recurring parent affect
* recurring parent behaviour
* recurring possible misalignment
* recurring repair pattern
* current growth edge
* emerging strength
* current practice
* next action pattern

Language rules:

Use:

* “A possible pattern is…”
* “This may be worth noticing…”
* “You seem to be practising…”
* “An emerging strength may be…”
* “A current growth edge may be…”

Do not use:

* “You are this type of parent.”
* “Your child is oppositional.”
* “This proves…”
* “This diagnosis is…”
* “Your child’s motive is…”

---

## Phase 6 — Research Enablement Layer

Goal:

Support consented, de-identified longitudinal research data capture, export, and analysis while preserving privacy and journal integrity.

Working app function:

App supports parent consent, de-identification, research-ready export or analysis, and separation between private parent records and de-identified research data.

Required capabilities:

1. Consent flow

   * Parent understands what is collected.
   * Parent understands what is de-identified.
   * Parent understands participation is optional.
   * Parent understands counsellor/professional support is still recommended for recurring concerns.

2. De-identification
   Remove or hash:

   * email
   * Supabase UUID
   * child names
   * parent names
   * school names
   * exact locations
   * exact dates if not required
   * free-text identifiers
   * JWTs or tokens
   * raw auth identifiers

3. Research fields
   Support quantitative analysis of:

   * parent cognition
   * parent affect
   * affect intensity
   * parent behaviour
   * possible child need
   * repair intention
   * next action
   * child recovery observation
   * parent-child relationship quality
   * counsellor validation status

4. Validated construct mapping
   Parent-friendly UI should map quietly to research constructs such as:

   * emotion awareness
   * emotion clarity
   * cognitive appraisal
   * cognitive flexibility
   * reflective functioning
   * supportive response
   * unsupportive response
   * rupture-repair
   * child recovery
   * relationship quality

5. Export / analysis
   Research export must not expose personal identifiers.
   Research export must preserve privacy and consent boundaries.
   Research export must not weaken the production app.

Do not build Phase 6 until Phases 1–5 are working or Rodney explicitly approves earlier research scaffolding.

---

# 14. Phase 1 detailed build specification

## Feature name

```text
Decode a Moment V1
```

## Dashboard card

Add dashboard card:

```text
Title:
Decode a Moment

Subtitle:
“My child did something and I don’t know why.”

Description:
Explore what the behaviour may have been signalling, what happened in you, and how to respond with more alignment.

Button:
Start Decode
```

## Flow

The flow must follow:

```text
A -> L -> I -> G -> N
```

---

## A — Awareness screen

Purpose:

Name what happened without judging the child.

Questions:

1. What did your child do?
2. When did this happen?
3. What did you first notice?

First notice options:

* Refusal
* Meltdown
* Withdrawal
* Repeating questions
* Deflecting
* Restlessness
* Clinging
* Arguing
* Physical complaint
* Other

Output:

* observed_behaviour
* context
* initial_observation

---

## L — Locate screen

Purpose:

Locate the possible child need and the parent’s internal response.

Question:

```text
What might this behaviour have been trying to solve for your child?
```

Possible need options:

* Safety
* Connection
* Control / agency
* Predictability
* Emotional regulation
* Sensory regulation
* Avoidance of overwhelm
* Help expressing something
* I am not sure yet

Parent affect prompt:

```text
What was happening in you at the same time?
```

Parent affect options:

* Frustrated
* Worried
* Rushed
* Angry
* Helpless
* Embarrassed
* Confused
* Tired
* Disappointed
* Other

Output:

* possible_child_need
* parent_affect

---

## I — Integrate screen

Purpose:

Connect child need with parent CAB.

Cognition question:

```text
What thought appeared in your mind?
```

Example thoughts:

* They should know better.
* We are going to be late.
* This always happens.
* I need to stop this now.
* I am failing as a parent.
* I was not sure what they needed.
* I wondered if something was too much for them.

Affect intensity:

Use 0–5 scale for selected emotions.

Suggested scales:

* Frustration 0–5
* Anxiety 0–5
* Helplessness 0–5
* Embarrassment 0–5
* Anger 0–5
* Tiredness 0–5

Behaviour question:

```text
What did you do next?
```

Parent behaviour options:

* Raised my voice
* Corrected quickly
* Explained too much
* Threatened consequence
* Withdrew
* Gave in
* Rushed the child
* Tried to fix immediately
* Stayed calm
* Paused
* Connected first
* Lowered my voice
* Offered choice
* Other

Output:

* parent_cognition
* parent_affect_intensity
* parent_behaviour
* possible_misalignment

---

## Alignment insight screen

Generate a cautious summary only.

Use this structure:

```text
Your child may have needed:
[possible need]

Your CAB in that moment was:

Cognition:
[parent thought]

Affect:
[parent emotion / intensity]

Behaviour:
[parent action]

Possible misalignment:
Your child may have needed [need], while your CAB moved toward [pattern].

This is not a diagnosis. It is a reflection point to help you notice what may be happening and what you might practise next.
```

Rules:

* Always use “may have” and “possible”.
* Do not state child motive as fact.
* Do not diagnose.
* Do not label.
* Do not blame.
* Do not imply the parent failed.
* Do not imply the child is the problem.

---

## G — Growth screen

Purpose:

Identify the parent capacity being developed.

Question:

```text
What capacity might help you meet this need next time?
```

Options:

* Pause before responding
* Stay curious
* Name the feeling
* Offer predictability
* Connect before correcting
* Reduce urgency
* Give choice
* Co-regulate first
* Repair after rupture
* Ask instead of assume

Awareness marker prompt:

```text
What are you becoming aware of?
```

Possible awareness markers:

* I was here in the moment
* I watched without racing ahead to fix
* I let go of managing how everyone was doing
* I named what I expected
* I found the thought beneath my feeling
* We worked it out together
* I noticed my urgency
* I noticed my child may have needed support
* I noticed I can pause before correcting

Output:

* growth_capacity
* awareness_markers

---

## N — Navigate screen

Purpose:

Convert insight into one practical next action.

Question:

```text
If this happens again, what will you try first?
```

Options:

* Pause for 10 seconds
* Lower my voice
* Name what I see
* Offer two choices
* Say what is happening next
* Move closer instead of shouting
* Ask what feels hard
* Repair afterwards
* Give space and return later
* Ask instead of assume

Field:

```text
My next action:
```

Repair prompt:

```text
Is there anything to repair with your child?
```

Options:

* No repair needed
* I may need to reconnect
* I may need to apologise
* I may need to explain calmly
* I may need to try again later

Output:

* next_action
* repair_intention

---

## Counsellor reminder

At the end of the flow, show:

```text
This reflection is a starting point. If this pattern repeats or feels difficult to understand, consider reviewing it with a counsellor.
```

For repeated or high-intensity future versions:

```text
You have noticed this pattern more than once. A counsellor can help you validate what you are seeing and practise the next step safely.
```

---

# 15. Phase 1 suggested saved entry shape

Use existing journal storage if safe.

Do not change Supabase schema unless Rodney explicitly approves.

Suggested entry type:

```text
entry_type = "behaviour_decode"
```

Suggested payload:

```json
{
  "entry_type": "behaviour_decode",
  "child_id": "...",
  "align": {
    "awareness": {
      "observed_behaviour": "",
      "context": "",
      "initial_observation": ""
    },
    "locate": {
      "possible_child_need": [],
      "parent_affect": []
    },
    "integrate": {
      "parent_cognition": "",
      "parent_affect_intensity": {},
      "parent_behaviour": [],
      "possible_misalignment": ""
    },
    "growth": {
      "growth_capacity": [],
      "awareness_markers": {}
    },
    "navigate": {
      "next_action": "",
      "repair_intention": ""
    },
    "research_markers": {
      "parent_alignment_capacity": null,
      "affect_regulation_marker": null,
      "response_regulation_marker": null,
      "repair_marker": null,
      "relationship_quality_marker": null,
      "child_regulation_observation": null
    }
  }
}
```

Notes:

* `research_markers` may remain null in Phase 1.
* Do not expose research scoring to parents yet.
* Do not build formal research export yet.
* Do not change database schema in Phase 1 unless reviewed and approved.
* Preserve existing journal save/read behaviour.

---

# 16. Research marker mapping

The UI should remain parent-friendly.

The backend data shape should support future research mapping.

## Parent-friendly prompt -> research construct

```text
“What did your child do?”
-> observed child behaviour signal

“What might this behaviour have been trying to solve?”
-> parental reflective functioning / possible child need recognition

“What thought appeared?”
-> cognition / appraisal / attribution / cognitive flexibility

“What was happening in you?”
-> affect awareness / emotion clarity

“How intense was it?”
-> affect intensity / regulation demand

“What did you do next?”
-> parent behavioural response / supportive or unsupportive response

“What capacity might help next time?”
-> growth capacity / regulation strategy

“What will you try first?”
-> implementation intention / next action

“Is there anything to repair?”
-> rupture-repair awareness

“What happened afterwards?”
-> child recovery / reconnection / relationship marker
```

Do not show clinical labels to parents in normal UI.

---

# 17. Primary outcome matrix

The main outcome is:

```text
Improved parent-child relationship quality
```

Contributing indicators:

| Indicator                  | Meaning                                                                   |
| -------------------------- | ------------------------------------------------------------------------- |
| Shorter recovery time      | Child or dyad returns to settled state sooner                             |
| Fewer escalations          | Parent response may be less activating                                    |
| Better emotion naming      | Child learns emotional language through co-regulation                     |
| More repair/reconnection   | Relationship can recover after rupture                                    |
| More parent CAB awareness  | Parent notices thought, feeling, and action                               |
| More supportive response   | Parent becomes less punitive, less dismissive, more emotionally available |
| More counsellor validation | Parent patterns are reviewed with human professional support              |

Do not frame these as guaranteed outcomes.

Use “may be associated with”, “may support”, “may help”, “possible indicator”, and “worth tracking”.

---

# 18. Technical guardrails

## Do not touch unless explicitly approved

* Supabase RLS
* SQL schema
* auth/profile logic
* ensure_profile
* email verification gate
* Parent ID generation
* Child ID generation
* journal save/read compatibility
* dashboard loading logic
* existing user records
* deployment config
* API secrets
* Vercel environment variables
* service role keys
* tokens
* Supabase anon/service keys
* counsellor access rules
* data writes/deletes outside the current approved feature

## High-risk files or areas

Treat these as Rodney-owned or requiring explicit review:

* supabase.js
* api/**
* *.sql
* vercel.json
* auth/profile/session handling
* ensure_profile
* email verification
* parent/child identity chain
* journal save/read paths
* counsellor permissions
* deployment configuration

## Lower-risk areas for Phase 1

Likely allowed:

* app.js
* content.js
* styles.css

But even in these files, do not break:

* dashboard loading
* journal save/read
* existing entries
* child record display
* privacy masking
* auth flow
* counsellor portal

---

# 19. Stable identity chain

Preserve this identity chain:

```text
Supabase auth user
-> profiles.parent_id / Wayfinder ID
-> dyads.child_id
-> journal_entries
```

Rules:

* Supabase user_id is technical auth identity only.
* parent_id / Wayfinder ID is the app identity.
* child_id is the child identity.
* Dashboard data should load by parent_id first.
* user_id should only be fallback where already designed.
* Do not expose Supabase UUID in normal UI.
* Do not expose parent email in normal UI.
* Do not expose child names unnecessarily.
* Do not expose JWTs, tokens, anon keys, service keys, or raw auth identifiers.

---

# 20. Auth and profile rules

Required:

1. User signs up/signs in with Supabase email/password.
2. Email must be verified before app access.
3. Profile creation/retrieval goes through ensure_profile.
4. ensure_profile must be called via explicit `/rest/v1/rpc/ensure_profile` fetch.
5. Request must send `Authorization: Bearer <access_token>`.
6. Browser code must never directly insert/upsert into profiles.

Never add browser-side:

```text
profiles.insert
profiles.upsert
```

Do not weaken the email verification gate.

Do not bypass profile integrity.

---

# 21. Dashboard rules

After verified login, Dashboard must still show:

* Parent ID / Wayfinder ID
* role
* parent age/gender if available
* Past activities
* DISC insight if available
* Your children
* Child ID
* child age/gender
* recent reflections
* My journal trail
* This week, lean into

If no records exist, show friendly empty states.

Do not break the Dashboard just because one data fetch fails.

Future dashboard enhancements may add:

* Decode a Moment
* Your ALIGN Journey

But these must not break existing Dashboard data loading.

---

# 22. Journal rules

Existing journal entries must remain readable.

Existing activity journals must remain visible.

New behaviour decode entries must not break existing journal display.

In Phase 1:

* Save `behaviour_decode` using existing journal storage if safe.
* Show behaviour decode in Journal Trail.
* Do not change schema unless explicitly approved.
* Do not overwrite old entries.
* Do not change old payload compatibility.
* Do not hide old entries.

---

# 23. Privacy and PDPA rules

Normal user-facing UI must not show:

* parent email
* Supabase UUID
* child names unnecessarily
* JWTs
* refresh tokens
* anon keys
* service keys
* raw auth identifiers
* private research identifiers
* de-identification keys
* API secrets

Normal user-facing UI may show:

* generated Parent ID / Wayfinder ID
* generated Child ID
* parent age
* parent gender
* child age
* child gender
* role
* non-identifying activity/reflection content
* non-identifying ALIGN/CAB reflection content

Debug UI may show technical IDs only when hidden behind the existing debug gate.

Never show tokens or secrets, even in debug UI.

---

# 24. Date/time rule

Any value written to Supabase timestamp/timestamptz columns must use ISO format:

```js
new Date().toISOString()
```

Never write locale strings such as:

```text
28/05/2026, 00:23:02
```

Locale formatting is allowed only for display.

---

# 25. Platform-specific roles

## ChatGPT role

ChatGPT is the product, research, and build-planning guide.

ChatGPT should:

* preserve the 6-phase roadmap
* protect ALIGN/CAB logic
* produce implementation prompts
* review reports from other platforms
* help decide whether the next phase is safe
* help write release checklists
* help convert research goals into parent-friendly product markers

ChatGPT should not:

* recommend unsafe schema/auth/RLS changes casually
* weaken privacy
* turn Wayfinder into a child diagnosis app
* turn Wayfinder into behaviour -> advice
* skip the working app function rule

---

## Claude / Claude Code role

Claude should be used for reasoning review, risk review, and product/technical critique.

Claude should check:

1. Does the proposed work preserve ALIGN/CAB?
2. Does it avoid child diagnosis?
3. Does it avoid parent blame?
4. Does it preserve journal save/read behaviour?
5. Does it avoid Supabase/RLS/auth changes unless approved?
6. Does every phase deliver a working app function?
7. Are there risks before Codex or Cursor implements?
8. Does it preserve counsellor validation?
9. Does it avoid over-reliance on AI advice?

Claude should not build future phases without explicit approval.

---

## Codex role

Codex should be used for focused implementation only.

Codex must:

* implement only the current approved phase
* modify only approved likely files
* avoid broad refactors
* preserve existing functionality
* run required checks
* report exactly what changed
* report anything not completed

For Phase 1, Codex should likely touch only:

* app.js
* content.js
* styles.css

Codex must not touch unless explicitly approved:

* supabase.js
* SQL/RLS
* api/**
* auth/profile logic
* ensure_profile
* email verification
* Parent ID / Child ID logic
* deployment config
* Vercel config
* journal save/read compatibility

---

## Cursor role

Cursor should be used for controlled scoped edits.

Good Cursor task examples:

```text
Improve only the visual spacing of the Decode a Moment dashboard card.
Touch styles.css only.
Do not change app logic, Supabase, auth, RLS, or save/read behaviour.
```

```text
Improve mobile responsiveness for the Decode a Moment flow.
Touch styles.css and UI-only JSX in app.js only.
Do not change data structure or save logic.
```

Bad Cursor task examples:

```text
Improve the whole app.
```

```text
Refactor the dashboard and make it cleaner.
```

```text
Make the app more modular.
```

Do not give Cursor broad instructions without file and scope boundaries.

---

## OpenClaw role

OpenClaw should be used for inspection, verification, and controlled file-level work.

Before implementation, OpenClaw should confirm:

1. Active repo.
2. Current branch.
3. Git status.
4. AGENTS.md exists.
5. docs/WAYFINDER_ALIGN_PRODUCT_CANON.md exists.
6. docs/WAYFINDER_6_PHASE_IMPROVEMENT_BUILD.md exists.
7. app.js exists.
8. content.js exists.
9. styles.css exists.
10. supabase.js exists.
11. No files modified unless explicitly requested.

OpenClaw should not commit, deploy, delete, overwrite, or modify files unless explicitly instructed.

---

## UI/UX partner role

The UI/UX partner may improve:

* layout
* readability
* accessibility
* spacing
* typography
* mobile responsiveness
* card design
* button hierarchy
* progress indicators
* visual clarity
* empty states
* parent-friendly copy suggestions
* non-sensitive content structure

The UI/UX partner must not change:

* ALIGN sequence
* CAB logic
* counselling model
* save logic
* auth logic
* Supabase logic
* RLS
* Parent ID / Child ID logic
* journal payload compatibility
* counsellor access rules
* privacy masking
* diagnostic boundaries

The UI/UX partner should preserve:

* non-diagnostic language
* parent reflection
* repair
* next action
* counsellor reminder
* emotional safety

---

## GitHub / Vercel release role

GitHub/Vercel should be treated as release control.

Before production:

* Use a branch.
* Prefer preview deployment.
* Review diff.
* Run checks.
* Smoke test.
* Confirm the phase delivers a working app function.
* Confirm no high-risk file changed without approval.
* Confirm no secret or identifier exposure.
* Confirm no broken dashboard/journal/auth behaviour.
* Merge only when safe.

---

# 26. Branching recommendation

Use focused branches.

Examples:

```text
feature/decode-a-moment-v1
feature/journal-trail-evolution
feature/align-journey-dashboard
feature/counsellor-align-summary
feature/pattern-detection
feature/research-enablement
ui/decode-card-polish
content/decode-copy-refinement
fix/journal-trail-behaviour-decode-display
security/auth-read-preservation
docs/six-phase-improvement-build
```

Do not mix unrelated changes.

Do not mix:

* UI changes
* content changes
* auth changes
* database changes
* deployment changes
* research schema changes

in one branch unless explicitly approved.

---

# 27. Required checks after every phase

Run:

```bash
git diff --check
node --check supabase.js
rg -n "profiles\.(insert|upsert)" app.js supabase.js api/*.js
rg -n "ensure_profile|Authorization|Bearer" supabase.js app.js api/*.js
```

If available, also run:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File ./scripts/verify-wayfinder.ps1
```

Confirm:

* no browser-side `profiles.insert`
* no browser-side `profiles.upsert`
* `ensure_profile` still uses explicit Bearer fetch
* dashboard reads still use verified session / Bearer token
* normal UI does not show parent email
* normal UI does not show Supabase UUID
* normal UI does not show child names unnecessarily
* normal UI does not show tokens
* ALIGN/CAB wording remains non-diagnostic and non-blaming
* behaviour decode remains Behaviour -> Need -> Parent CAB -> Alignment Check -> Awareness -> Growth -> Navigate / Next Action

---

# 28. Manual smoke test after every phase

Before deploying or after Vercel preview:

1. Verified user can log in.
2. Dashboard appears.
3. Same Parent ID is reused.
4. Child ID appears if records exist.
5. Past activities appear if records exist.
6. Recent reflections appear.
7. My Journal Trail appears.
8. Sign out works.
9. Unverified email is blocked.
10. No parent email appears in normal UI.
11. No Supabase UUID appears in normal UI.
12. No JWTs, tokens, or secrets appear.
13. Incognito and normal browser show the same dashboard records.
14. Existing journal entry can be saved and appears in Journal Trail.
15. Existing activity journals still display.
16. If Decode a Moment exists, behaviour_decode can be saved.
17. If Decode a Moment exists, behaviour_decode appears in Journal Trail.
18. Dashboard does not break when one section has no data.
19. Desktop layout remains usable.
20. Mobile layout remains usable.

---

# 29. Phase release gates

## Phase 1 release gate

Do not approve Phase 1 unless:

* Dashboard card appears.
* Parent can enter Decode a Moment.
* A -> L -> I -> G -> N works.
* Alignment insight uses cautious language.
* Counsellor reminder appears.
* behaviour_decode saves.
* behaviour_decode appears in Journal Trail.
* Existing activity journals still appear.
* Existing dashboard still works.
* Existing child records still appear.
* Existing auth flow still works.
* No schema change was made unless explicitly approved.
* No child diagnosis or parent blame appears.
* Desktop and mobile are usable.

---

## Phase 2 release gate

Do not approve Phase 2 unless:

* All entries still show.
* Activity journals still show.
* Behaviour decodes show with summary cards.
* Entry type filter works.
* Child filter works.
* Need filter works.
* Growth capacity filter works.
* Clearing filters restores all entries.
* No existing entry format breaks.
* No schema change was made unless explicitly approved.
* Desktop and mobile are usable.

---

## Phase 3 release gate

Do not approve Phase 3 unless:

* Dashboard still loads.
* Your ALIGN Journey appears.
* Current Focus card works.
* Recent Pattern card works.
* Growth Practice card works.
* Next Step card works.
* Cards use existing saved data first.
* Empty states work when there is not enough data.
* Language remains non-diagnostic.
* No parent type or child label is created.
* Desktop and mobile are usable.

---

## Phase 4 release gate

Do not approve Phase 4 unless:

* Counsellor portal still loads.
* Counsellor can view ALIGN/CAB summaries.
* Parent privacy masking remains intact.
* Counsellor cannot write/delete unsafe records.
* No raw emails appear in normal UI.
* No Supabase UUIDs appear in normal UI.
* No child names are exposed unnecessarily.
* No JWTs, tokens, or secrets appear.
* Counsellor view uses cautious language.
* Desktop and mobile are usable.

---

## Phase 5 release gate

Do not approve Phase 5 unless:

* Pattern detection works from existing entries.
* Patterns are framed as possible or emerging.
* No fixed parent type is created.
* No child diagnosis is created.
* Parent can see growth edge.
* Parent can see emerging strength.
* Parent can see current practice.
* Existing Journal Trail still works.
* Existing Dashboard still works.
* Desktop and mobile are usable.

---

## Phase 6 release gate

Do not approve Phase 6 unless:

* Consent flow exists.
* Parent can understand what is being collected.
* Parent can understand what is de-identified.
* Parent can opt in or out according to approved consent design.
* De-identification is documented.
* Research data does not expose emails.
* Research data does not expose names.
* Research data does not expose Supabase UUIDs.
* Research data does not expose child names.
* Research data does not expose tokens or secrets.
* Research export or analysis function works.
* Private journal integrity is preserved.
* Production app remains stable.
* Desktop and mobile are usable.

---

# 30. Required report format from every platform

After any work, report:

```text
1. Summary of work completed

2. Files changed

3. User-facing function delivered

4. Product / ALIGN impact

5. Technical risk level
   Low / Medium / High

6. High-risk areas touched?
   Yes / No
   If yes, explain why and what changed.

7. Auth / privacy / RLS impact
   Confirm preserved or explain risk.

8. Journal save/read impact
   Confirm preserved or explain risk.

9. Dashboard loading impact
   Confirm preserved or explain risk.

10. Existing records impact
   Confirm preserved or explain risk.

11. Checks run

12. Manual tests completed

13. Manual tests still needed

14. Anything not completed

15. Recommended next step
```

If any check fails, stop and report:

```text
- what failed
- suspected cause
- proposed fix
- whether the app is safe to continue using
```

Do not claim completion if the app is knowingly broken.

---

# 31. Current Phase 1 implementation prompt

Use this prompt when asking Codex, Claude Code, or another implementation platform to build Phase 1.

```text
Implement only Phase 1 — Decode a Moment V1.

You are being given the full 6-phase Wayfinder Improvement Build roadmap for context only.

Do not implement Phase 2–6.

Read first:
1. AGENTS.md
2. docs/WAYFINDER_ALIGN_PRODUCT_CANON.md
3. docs/WAYFINDER_6_PHASE_IMPROVEMENT_BUILD.md
4. docs/app-architecture-navigation-review.md
5. docs/auth-profile-flow.md
6. docs/partner-collaboration-and-deployment-rules.md

Goal:
Add the first parent-facing Behaviour Decode flow while preserving all existing auth, privacy, dashboard loading, journal save/read behaviour, existing user records, and deployment safety.

Scope:
1. Add dashboard card:
   Title: Decode a Moment
   Subtitle: “My child did something and I don’t know why.”
   Description: Explore what the behaviour may have been signalling, what happened in you, and how to respond with more alignment.
   Button: Start Decode

2. Add A -> L -> I -> G -> N flow:
   Awareness:
   - What did your child do?
   - When did this happen?
   - What did you first notice?

   Locate:
   - What might this behaviour have been trying to solve for your child?
   - What was happening in you at the same time?

   Integrate:
   - What thought appeared in your mind?
   - Rate affect intensity 0–5.
   - What did you do next?

   Growth:
   - What capacity might help you meet this need next time?
   - What are you becoming aware of?

   Navigate:
   - If this happens again, what will you try first?
   - Is there anything to repair with your child?

3. Generate an insight screen using cautious language only:
   - may
   - might
   - possible
   - may have
   - let’s explore

4. Save as:
   entry_type = “behaviour_decode”

5. Use existing journal storage if safe.
   Do not change Supabase schema.

6. Show saved behaviour_decode entries in Journal Trail without breaking existing activity journals.

7. Include counsellor reminder:
   “This reflection is a starting point. If this pattern repeats or feels difficult to understand, consider reviewing it with a counsellor.”

Allowed likely files:
- app.js
- content.js
- styles.css

Do not touch unless explicitly approved:
- supabase.js
- api/**
- SQL/RLS files
- auth/profile logic
- ensure_profile
- email verification gate
- Parent ID / Child ID generation
- data writes/deletes outside existing journal save path
- Vercel config
- deployment config
- environment variables
- service keys
- journal save/read compatibility

Acceptance criteria:
- Existing app loads.
- Verified login still works.
- Dashboard still loads.
- Existing child records still display.
- Existing journal entries still display.
- Decode a Moment card appears.
- Parent can start Decode a Moment.
- Parent can complete A -> L -> I -> G -> N.
- Insight screen uses cautious language.
- Parent can save behaviour_decode.
- behaviour_decode appears in Journal Trail.
- Existing activity journals still appear.
- Counsellor reminder appears.
- No child-diagnosis language.
- No parent-blaming language.
- Normal UI does not expose parent email, Supabase UUID, child names, JWTs, tokens, or secrets.
- No browser-side profiles.insert or profiles.upsert.
- ensure_profile and explicit Authorization/Bearer paths remain intact.
- No Supabase schema change.

Run checks:
- git diff --check
- node --check supabase.js
- rg -n "profiles\.(insert|upsert)" app.js supabase.js api/*.js
- rg -n "ensure_profile|Authorization|Bearer" supabase.js app.js api/*.js

Manual tests:
- verified user login
- dashboard load
- child record display
- existing journal display
- Decode flow complete
- behaviour_decode save
- behaviour_decode Journal Trail display
- desktop layout
- mobile layout

Report back:
- files changed
- user-facing function delivered
- product/ALIGN impact
- technical risk level
- checks run
- manual tests completed
- manual tests still needed
- anything not completed
```

---

# 32. Final rule

When in doubt, preserve:

1. Privacy
2. Security
3. Authentication
4. RLS
5. Profile integrity
6. Parent/child identity
7. Journal save/read behaviour
8. Dashboard loading
9. Existing user records
10. Deployability
11. ALIGN/CAB product canon
12. Non-diagnostic language
13. Parent reflection
14. Repair
15. Counsellor validation
16. Working app function

Do not commit, deploy, or claim completion if these are not preserved.
