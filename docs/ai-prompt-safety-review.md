# AI Prompt Safety Review

Last inspected: 2026-05-31
Scope: local repository inspection only. No live Vercel environment variables, live Supabase policies, or deployed runtime behavior were queried.

## Executive Summary

Wayfinder currently has three serverless AI endpoints:

- `/api/disc-insight`
- `/api/disc-vision`
- `/api/counsellor-analysis`

The core prompt safety boundaries are present: prompts repeatedly prohibit diagnosis, deterministic claims, child assessment/pathology framing, therapy replacement, and direct therapy advice. The strongest safety framing is in `api/counsellor-analysis.js`.

The main safety concern is not exposed key values or explicit diagnostic prompting. The main concern is boundary drift: parent-facing `/api/disc-insight` is shown directly to parents and asks the model for "one specific suggestion for an activity moment." That is framed as a reflective growth edge, but it sits close to advice and should be clinically vetted if Wayfinder's non-negotiable boundary is "reflection/perspective only, no behavioural prescriptions."

Counsellor-facing AI output is behind the counsellor portal and the prompt says "Counsellor-facing, not parent-facing." However, the UI labels are "AI Analysis" and "Longitudinal AI Reflections"; they do not explicitly say "internal", "therapist-support only", or "do not share without review." No formal therapist-vetting workflow exists in the repo.

## Files Inspected

- `api/disc-insight.js`
- `api/counsellor-analysis.js`
- `api/disc-vision.js`
- `content.js`
- `app.js`
- `counsellor.html`
- `docs/app-architecture-navigation-review.md`
- `docs/auth-profile-flow.md`
- `docs/codex-task-template.md`
- `docs/current-state-of-wayfinder.md`
- `docs/partner-collaboration-and-deployment-rules.md`
- `docs/profile-cleanup.sql`
- `supabase.js` for storage/env-name references only

No API key values or environment variable values were printed or copied into this document.

## 1. AI Endpoints

| Endpoint | File | Purpose | Output audience |
|---|---|---|---|
| `/api/disc-insight` | `api/disc-insight.js` | Parent-facing DISC reflection based on parent DISC blend, child age/gender, and journal entry count. | Parent-facing |
| `/api/disc-vision` | `api/disc-vision.js` | Extract approximate D/I/S/C bar heights from an uploaded DISC image. | Parent-facing utility output |
| `/api/counsellor-analysis` | `api/counsellor-analysis.js` | Single-entry and longitudinal analysis of parent journal entries for counsellor use. | Counsellor-facing |

## 2. Models Used

| Endpoint | Provider | Model |
|---|---|---|
| `/api/disc-insight` | Anthropic | `claude-haiku-4-5-20251001` |
| `/api/disc-vision` | Anthropic | Model name comes from env var `ANTHROPIC_VISION_MODEL` |
| `/api/counsellor-analysis` | OpenAI | `gpt-4o` |

Env var names found:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_VISION_MODEL`
- `OPENAI_API_KEY`
- `SUPABASE_ANON_KEY`
- `SUPABASE_URL`

No env var values are included here.

## 3. Parent-Facing vs Counsellor-Facing Outputs

### Parent-Facing

`/api/disc-insight`:

- Shown in the parent Dashboard DISC section.
- Stored/cached in the parent profile if generated successfully.
- Prompt says it is not therapy, not diagnosis, not child assessment, and supports parent self-awareness.
- Output is not reviewed by a counsellor before display.

`/api/disc-vision`:

- Used by parent DISC image upload.
- Returns only D/I/S/C numeric bars or null values.
- Prompt explicitly says not to interpret personality, not to provide advice, and not to add explanation.

Local parent-facing non-AI reflection:

- `discDescriptor()` gives local DISC blend descriptions and growth edges.
- `DISCIntensityChart()` frames the chart as reflective, not diagnostic.
- `analyzeCAB()` maps parent CAB text to local DISC/value words.
- Journal trail says patterns are reflective signals, not fixed traits.

### Counsellor-Facing

`/api/counsellor-analysis`:

- Used by `CounsellorApp` for list flags and longitudinal summaries.
- Used by `CounsellorReview` in the "AI Analysis" tab.
- Prompt explicitly says counsellor-facing, not parent-facing.
- Output is held in React state, not saved to the database by current code.

Local counsellor-facing non-AI generation:

- `suggestQuestion()` suggests a gentle question in the congruence workflow.
- `buildNarrative()` generates a draft client narrative.
- `CounsellorReview` stores counsellor notes, including narrative text, in `reviews`.
- The UI hint says to edit the generated narrative into the counsellor's own voice.

## 4. Where Prompts Live

| Prompt or prompt-like content | Location |
|---|---|
| Parent DISC insight system prompt | `api/disc-insight.js` |
| Parent DISC insight user message template | `api/disc-insight.js` |
| DISC image extraction prompt | `api/disc-vision.js` |
| Counsellor analysis system prompt | `api/counsellor-analysis.js` |
| Counsellor single-entry JSON schema prompt | `api/counsellor-analysis.js` |
| Counsellor longitudinal JSON schema prompt | `api/counsellor-analysis.js` |
| Static reflection copy, markers, CAB labels, DISC words, shift words | `content.js` |
| Local non-AI DISC descriptors and parent guidance | `app.js` |
| Local non-AI counsellor question/narrative generation | `app.js` |

## 5. Where AI Outputs Are Stored or Cached

| Output | Storage/caching behavior |
|---|---|
| `/api/disc-insight` text | Cached in `profiles.insight_text`, with `insight_generated_at`, `insight_entry_count`, and `insight_latest_entry_at`. |
| `/api/disc-vision` D/I/S/C bars | Saved to `profiles.disc_bars` through `Profile.saveDiscBars()`. |
| `/api/counsellor-analysis` entry flag | Held in `CounsellorApp` React state as `flags`; not persisted by current code. |
| `/api/counsellor-analysis` entry analysis | Held in `CounsellorReview` React state as `aiAnalysis`; not persisted by current code. |
| `/api/counsellor-analysis` longitudinal summary | Held in `CounsellorApp` React state as `longitudinalSummaries`; not persisted by current code. |
| Local generated counsellor narrative | Saved into `reviews.data.narrative` when generated/edited through `saveRv()`. This is not GenAI, but it is generated clinical-facing text. |

## 6. API Key Exposure

AI provider keys are used only in serverless API files via environment variables:

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

The Anthropic vision model name is also read from:

- `ANTHROPIC_VISION_MODEL`

No AI provider key values were found in browser code during this inspection.

Browser code does include Supabase public client configuration, including `SUPABASE_ANON_KEY` and `SUPABASE_URL` in `supabase.js`. That is normal for a Supabase browser client, but the anon key must not be displayed in normal UI. No service-role key name or value was found in the inspected browser files.

## 7. Advice, Diagnosis, Treatment, or Behavioural Prescription Review

### `/api/disc-insight`

Safety boundaries present:

- says the AI is not a therapist
- says the AI is not diagnosing
- says the AI is not assessing the child
- frames output as parent self-awareness
- requires cautious language such as "may", "can", or "might"
- prohibits clinical jargon, Satir terms, diagnosis, deterministic claims, and shaming

Concern:

- asks for "one specific suggestion for an activity moment"
- asks for "what their specific growth edge is right now"
- includes language such as softening urgency, commanding, correction, critique, and pressure

Assessment:

- No diagnosis or treatment recommendation is requested.
- The "specific suggestion" requirement may become advice or a behavioural prescription depending on the generated wording.
- Parent-facing output bypasses therapist review.

### `/api/disc-vision`

Safety boundaries present:

- extraction-only task
- JSON-only response
- null when uncertain
- says not to interpret personality
- says not to provide advice

Assessment:

- No diagnosis, treatment recommendation, advice, or behavioural prescription is requested.
- Main risks are reliability, model configuration, image privacy, and lack of endpoint auth/rate limiting, not prompt wording.

### `/api/counsellor-analysis`

Safety boundaries present:

- says not to diagnose, assess pathology, replace a counsellor, or provide therapy directly
- says to avoid framing the child as the primary problem
- says Satir coping stances are possible patterns, not fixed labels
- prohibits psychiatric, trauma, attachment, neurodevelopmental, and personality pathology inference
- prohibits definitive claims about unconscious intentions
- prohibits saying the child is damaged, traumatised, disordered, or unsafe
- prohibits blaming parent or child
- prohibits direct therapy advice
- prohibits crisis/risk assessments
- requires cautious phrasing
- labels output as counsellor-facing, not parent-facing

Concern:

- asks for "counsellorReflectionFocus" and "counsellorFocus"
- developmental wording may still influence clinical direction
- the UI does not clearly label the AI output as internal therapist-support only

Assessment:

- No direct parent-facing treatment advice is requested.
- Output is intended as counsellor support and hypothesis generation.
- It should remain internal unless a counsellor reviews and rewrites it.

### `app.js` local prompt-like generation

Not GenAI, but clinically relevant:

- `discDescriptor()` gives parent-facing growth edges.
- `suggestQuestion()` generates counsellor questions based on typed congruence notes.
- `buildNarrative()` generates a draft note to the parent.
- The "Gap & Narrative" tab includes "Gentle next step".

Assessment:

- These are not AI endpoint outputs, but they can still shape clinical guidance.
- The generated narrative has an edit hint, which helps, but there is no formal approval workflow.
- The "Gentle next step" and "suggest question" features should be therapist-vetted.

## 8. Parent-Facing Reflection/Perspective Framing

Parent-facing safety framing is partially clear:

- `/api/disc-insight` prompt explicitly frames output as self-awareness, not diagnosis or therapy.
- `DISCIntensityChart()` visibly says the chart is reflective, not diagnostic.
- Journal trail says patterns are reflective signals, not fixed traits.
- The product copy emphasizes noticing parent thoughts, feelings, actions, and regulation.

Gaps:

- The generated parent DISC insight itself is not visibly labelled every time as "AI-generated reflection only" or "not counselling".
- The prompt asks for one specific suggestion, which can move from reflection into advice.
- There is no therapist approval step before parent-facing AI text appears.

Conclusion:

- Parent-facing AI is intended as reflection/perspective.
- The framing should be tightened if "AI may not give behavioural prescriptions" is a hard boundary.

## 9. Counsellor-Facing Internal Labeling

Prompt-level labeling:

- Strong. `/api/counsellor-analysis` says "Counsellor-facing, not parent-facing."

UI-level labeling:

- Partial. The counsellor portal labels the feature "AI Analysis" and "Longitudinal AI Reflections".
- It does not explicitly say "internal", "therapist-support only", "hypothesis only", or "do not share without review".

Access-level labeling:

- `counsellor.html` sets `PORTAL_ROLE = 'counsellor'`.
- `App` checks `profile.role === 'counsellor'`.
- Docs state counsellor SQL/RLS must be installed for access.

Conclusion:

- The intended audience is counsellors.
- The UI should more clearly mark AI analysis as internal support if this output should not be shared directly.

## 10. GenAI Bypass of Therapist Review

Current GenAI outputs that bypass therapist review:

- Parent-facing `/api/disc-insight` is shown directly on the Dashboard.
- Parent-facing `/api/disc-vision` extraction updates DISC bars directly, but this is numeric extraction rather than clinical interpretation.

Current GenAI outputs behind counsellor portal:

- `/api/counsellor-analysis` single-entry output is shown to counsellors.
- `/api/counsellor-analysis` longitudinal output is shown to counsellors.
- These are not parent-facing by current UI, but there is no technical workflow preventing a counsellor from copying/sharing them.

Non-GenAI generated text needing clinical review:

- `buildNarrative()` creates a parent-addressed draft from counsellor review data.
- It is counsellor-facing and editable, but there is no formal approval state.

Conclusion:

- Yes, one parent-facing GenAI output bypasses therapist review: `/api/disc-insight`.
- Whether this is acceptable depends on Rodney's approved boundary for parent-facing AI reflection.
- If all advice-like wording requires therapist vetting, `/api/disc-insight` should be constrained further or routed through review before display.

## 11. Endpoint Safety Matrix

| Endpoint | Diagnosis risk | Advice/prescription risk | Therapist-review bypass | Current safety status |
|---|---|---|---|---|
| `/api/disc-insight` | Low by prompt | Medium because it asks for a specific suggestion | Yes, parent sees output directly | Needs clinical wording review |
| `/api/disc-vision` | Low | Low | Yes, but extraction-only | Acceptable prompt boundary, pending privacy/auth review |
| `/api/counsellor-analysis` | Low by prompt | Low to medium, counsellor-facing focus suggestions | No direct parent bypass found | Good prompt boundary, needs clearer UI/internal label |

## 12. Additional Safety Risks Outside Prompt Text

These are architecture risks, not prompt wording issues:

- No endpoint-level Supabase auth check was found in the API files.
- API functions set CORS to `*`.
- No application-level AI rate limiting was found.
- Parent journal content can be sent to `/api/counsellor-analysis` from the browser.
- Uploaded DISC image content is sent to `/api/disc-vision`.
- Live Vercel env var configuration was not verified.
- Live Supabase RLS and counsellor access policies were not verified in this task.

## 13. Recommended Safety Boundaries to Confirm

Open decisions for Rodney and clinical owner:

- Is parent-facing `/api/disc-insight` allowed to include one concrete suggestion?
- Should parent-facing AI text always include visible "reflection only, not counselling" wording beside it?
- Should all GenAI outputs that mention child developmental impact require therapist review?
- Should counsellor AI analysis be labelled "internal therapist-support only" in the UI?
- Should counsellor AI output be technically blocked from direct parent display/export?
- Should `buildNarrative()` require an explicit counsellor approval/save step before use?
- Should API endpoints require authenticated Supabase sessions?
- Should AI endpoints have per-user and per-IP rate limits?

## 14. Verification

Required checks run after creating this document:

- `git diff --check`
- `node --check supabase.js`
- `powershell -ExecutionPolicy Bypass -File .\scripts\verify-wayfinder.ps1`

Result summary:

- `git diff --check` passed. It emitted a line-ending warning for pre-existing modified `docs/codex-task-template.md`.
- `node --check supabase.js` passed.
- `scripts/verify-wayfinder.ps1` passed.

No code was changed. No commit was made.
