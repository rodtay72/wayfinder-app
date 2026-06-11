# Wayfinder ALIGN Product Canon

## Status
This is the current product direction to preserve across ChatGPT, Claude, Codex, Cursor, Claude Code, and OpenClaw build work.

## Core shift
Wayfinder is not primarily a journalling app.

The journal is the mechanism.

The product is a parent emotional development pathway that helps parents recognise where their Cognition, Affect, and Behaviour (CAB) are not aligned with the emerging needs of the child.

## Non-negotiable framing
The entry phrase:

"My child did something and I don't know why."

must not be interpreted as:

"The child is the problem, so I need to get to the root of the child's behaviour."

It must be interpreted as:

"The child's behaviour is revealing a moment where my CAB may not be meeting the child's need. The conflict exists because the CAB is not aligned. Wayfinder helps me locate and realign that gap."

## Core Wayfinder model
Do not build a Behaviour -> Advice tool.

Build:

Behaviour
-> Need
-> Parent CAB
-> Alignment Check
-> Awareness
-> Growth
-> Navigate / Next Action

## ALIGN framework
Use this official ALIGN mapping:

A = Awareness
L = Locate
I = Integrate
G = Growth
N = Navigate

## CAB model
CAB means:

C = Cognition: what the parent thinks, assumes, expects, or interprets.
A = Affect: what the parent feels in the body and emotionally.
B = Behaviour: what the parent does in response.

The product should help the parent see:

Child need
vs
Parent CAB

and then ask:

"Where is the misalignment?"

## Behaviour is a signal, not a diagnosis
Wayfinder must avoid diagnostic or labelling language.

Do not say:
- Your child is avoidant.
- Your child is controlling.
- Your child is the problem.
- Your child has X.
- This behaviour means Y with certainty.

Use:
- This behaviour may have been trying to solve something.
- A possible need underneath this behaviour is...
- The behaviour may be a signal of...
- Let's get curious about what need was emerging.

## Parent profile principle
Do not create a fixed parent type or parent diagnosis.

Create a living developmental reflection profile:

- recurring CAB patterns
- recurring child needs noticed
- recurring misalignments
- current growth edge
- emerging strengths
- current practice
- repair habits
- next action patterns

Example:

Current Alignment Challenge:
"Urgency vs child need for predictability."

Emerging Strength:
"Noticing the need underneath behaviour before reacting."

Current Practice:
"Pause before correcting."

## Developmental outcome
The outcome is not journal completion.
The outcome is not child compliance.
The outcome is not behaviour reduction as the primary metric.

The outcome is increased parent alignment capacity:

- Can the parent notice behaviour without blame?
- Can the parent locate the child's possible need?
- Can the parent identify their own CAB?
- Can the parent see where CAB is misaligned?
- Can the parent choose a growth capacity?
- Can the parent navigate a next action or repair step?

## New entry point
Add a dashboard card:

Title: Decode a Moment
Subtitle: "My child did something and I don't know why."
Description: Explore what the behaviour may have been signalling, what happened in you, and how to respond with more alignment.
Button: Start Decode

## Decode a Moment flow

### A - Awareness
Purpose: Name what happened without judging the child.

Questions:
- What did your child do?
- When did this happen?
- What did you first notice?

Options for first notice:
- Refusal
- Meltdown
- Withdrawal
- Repeating questions
- Deflecting
- Restlessness
- Clinging
- Arguing
- Physical complaint
- Other

Output:
- observed behaviour
- context
- initial parent observation

### L - Locate
Purpose: Locate the possible child need and the parent's internal response.

Question:
"What might this behaviour have been trying to solve for your child?"

Need options:
- Safety
- Connection
- Control / agency
- Predictability
- Emotional regulation
- Sensory regulation
- Avoidance of overwhelm
- Help expressing something
- I am not sure yet

Parent affect prompt:
"What was happening in you at the same time?"

Affect options:
- Frustrated
- Worried
- Rushed
- Angry
- Helpless
- Embarrassed
- Confused
- Tired
- Disappointed
- Other

Output:
- possible child need
- parent affect

### I - Integrate
Purpose: Connect child need with parent CAB.

Cognition question:
"What thought appeared in your mind?"

Example thoughts:
- They should know better.
- We are going to be late.
- This always happens.
- I need to stop this now.
- I am failing as a parent.

Affect intensity:
- Frustration 0-5
- Anxiety 0-5
- Helplessness 0-5
- Embarrassment 0-5
- Anger 0-5

Behaviour question:
"What did you do next?"

Behaviour options:
- Raised my voice
- Corrected quickly
- Explained too much
- Threatened consequence
- Withdrew
- Gave in
- Rushed the child
- Tried to fix immediately
- Stayed calm
- Paused
- Connected first
- Other

Output:
- parent cognition
- parent affect intensity
- parent behaviour
- possible misalignment

### Alignment insight screen
Generate a cautious summary:

"Your child may have needed: [need].
Your CAB in that moment was:
Cognition: [thought]
Affect: [emotion/intensity]
Behaviour: [parent action]
Possible misalignment: Your child may have needed [need], while your CAB moved toward [pattern]."

Always use "may have" and "possible".
Do not state child motives as fact.

### G - Growth
Purpose: Identify the parent capacity being developed.

Question:
"What capacity might help you meet this need next time?"

Options:
- Pause before responding
- Stay curious
- Name the feeling
- Offer predictability
- Connect before correcting
- Reduce urgency
- Give choice
- Co-regulate first
- Repair after rupture
- Ask instead of assume

Awareness marker prompt:
"What are you becoming aware of?"

Use existing awareness markers where appropriate:
- I was here in the moment
- I watched without racing ahead to fix
- I let go of managing how everyone was doing
- I named what I expected
- I found the thought beneath my feeling
- We worked it out together

Output:
- growth capacity
- awareness markers

### N - Navigate
Purpose: Convert insight into one practical next action.

Question:
"If this happens again, what will you try first?"

Options:
- Pause for 10 seconds
- Lower my voice
- Name what I see
- Offer two choices
- Say what is happening next
- Move closer instead of shouting
- Ask what feels hard
- Repair afterwards

Field:
"My next action:"

Repair prompt:
"Is there anything to repair with your child?"

Options:
- No repair needed
- I may need to reconnect
- I may need to apologise
- I may need to explain calmly
- I may need to try again later

Output:
- next action
- repair intention

## Suggested saved entry shape
Use existing journal storage if possible in Phase 1. Do not change Supabase schema until reviewed.

Suggested entry type:
entry_type = "behaviour_decode"

Suggested payload:

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
    }
  }
}

## Dashboard evolution
Add a section:

Your ALIGN Journey

Cards:
- Current Focus: e.g. Locate - noticing the need beneath behaviour
- Recent Pattern: e.g. Urgency appears when transitions are difficult
- Growth Practice: e.g. Pause before correcting
- Next Step: e.g. Try one transition with more predictability

## Journal Trail evolution
Journal Trail should support:
- All entries
- Activity journals
- Behaviour decodes
- Child filter
- Need filter
- Growth capacity filter

Behaviour decode card summary:
- Behaviour
- Possible Need
- CAB Misalignment
- Growth Capacity
- Next Action
- Repair Intention

## Counsellor view evolution
Counsellor should eventually see:
- parent ALIGN pattern
- recurring CAB pattern
- child needs explored
- repeated misalignments
- growth practices attempted
- repair intentions

Counsellor review prompts:
- What alignment capacity is emerging?
- What should the parent practise next?
- What should be reinforced?

## Implementation phases

Phase 1:
- Add Decode a Moment dashboard card.
- Add A -> L -> I -> G -> N flow.
- Save behaviour_decode entries using existing journal storage if safe.
- Show behaviour decode in Journal Trail.

Phase 2:
- Add Journal Trail filters and behaviour decode summary cards.

Phase 3:
- Add Your ALIGN Journey dashboard section.

Phase 4:
- Add counsellor summary view for ALIGN/CAB patterns.

Phase 5:
- Add pattern detection:
  - recurring need
  - recurring trigger
  - recurring cognition
  - recurring affect
  - recurring behaviour
  - growth edge
  - emerging strength
  - current practice

## Coding guardrails
- UI/content changes should prefer app.js, styles.css, and content.js.
- Do not touch Supabase, RLS, SQL, auth, API routes, parent/child ID logic, or deployment config unless the task explicitly requires it.
- Preserve existing journal save/read behaviour.
- Keep language non-diagnostic and non-blaming.
- Keep child privacy intact.
- Do not expose emails, Supabase UUIDs, JWTs, tokens, secrets, or child names unnecessarily.
- Use cautious language: "may", "possible", "might", "let's explore".

## Release checks
Before pushing:
- git diff --name-only
- git diff --check
- node --check supabase.js
- Confirm no profiles.insert or profiles.upsert in browser/API code.
- Confirm ensure_profile and explicit Authorization/Bearer paths remain intact.
- Test desktop and mobile UI.
- Test save and Journal Trail display.
