// ============================================
// WAY FINDER - CONTENT CONFIGURATION
// ============================================
// This file contains all the text, activities, and content.
// Business partner: Edit this file to change any text in the app!
// No coding knowledge needed - just edit the text between the quotes.

// BRAND & MESSAGING
const BRAND = {
  appName: "Way Finder",
  tagline: "A space to find your way back to each other",
  
  // Landing page hero
  hero: {
    eyebrow: "Welcome",
    title: "The Art of Connection",
    subtitle: "Guiding children with structure, while staying emotionally connected."
  },
  
  // Thank you message after journal entry
  thankYou: {
    title: "Thank you for taking this step.",
    message: "By attending to your own emotional patterns, you're becoming a steadier, warmer structure for your child to emulate. This is how change happens — one reflection at a time."
  }
};

// ALIGN PHASES
const PHASES = {
  A: "AWARE (Days 1–10)",
  L: "LOCATE (Days 11–20)",
  I: "INTEGRATE (Days 21–31)",
  G: "GROW (Days 32–42)",
  N: "NAVIGATE (Days 43–52)"
};

// 52-DAY ACTIVITIES (grouped by phase)
const ACTIVITIES = {
  A: ["Day 1 · Draw \"Today's Feelings\" Faces","Day 2 · Shared Colour Painting","Day 3 · Clay Emotion Shapes","Day 4 · Build a Paper Bridge","Day 5 · Mirror Drawing","Day 6 · Gratitude Card Craft","Day 7 · 3-Minute Silent Art","Day 8 · \"When I'm Angry\" Poster","Day 9 · Texture Collage","Day 10 · Family Shield Design"],
  L: ["Day 11 · \"Rules I Grew Up With\" Poster","Day 12 · \"What I Think Parents Expect\" Drawing","Day 13 · Red/Green Boundary Cards","Day 14 · Timeline Collage","Day 15 · Mask Craft (outside vs inside)","Day 16 · Emotion Thermometer","Day 17 · Family Motto Banner","Day 18 · \"When I Feel Disappointed\" Card","Day 19 · Build a \"Repair Box\"","Day 20 · Redo Day 4 Bridge"],
  I: ["Day 21 · Joint Vision Board","Day 22 · Build Tower with Limited Materials","Day 23 · Paint with One Brush","Day 24 · Design Family Routine Chart","Day 25 · Storybook \"A Hard Day\"","Day 26 · Fix a Broken Craft","Day 27 · Time-Limit Craft (5 mins)","Day 28 · Debate Poster: Yes/No","Day 29 · Parent-led, Child-directed Art","Day 30 · Child-led, Parent-directed Art","Day 31 · Repeat Tower Build"],
  G: ["Day 32 · Complex Lego Structure","Day 33 · Timed Team Art","Day 34 · \"Fix It Together\" Puzzle","Day 35 · Paint While Distracted","Day 36 · Build Blindfold Guide","Day 37 · Redesign Failed Craft","Day 38 · Family Crisis Plan Poster","Day 39 · \"No Words\" Craft","Day 40 · Swap Leadership Mid-Task","Day 41 · Deliberate Minor Frustration","Day 42 · Review Early Artwork"],
  N: ["Day 43 · Child Designs Activity","Day 44 · Parent Sets Constraint","Day 45 · Budgeted Craft Challenge","Day 46 · Family Values Flag","Day 47 · Independent Mini Project","Day 48 · Feedback Card Exchange","Day 49 · Design Future Family Plan","Day 50 · \"What I Need From You\" Poster","Day 51 · Redo Disagreement Poster","Day 52 · Celebration Installation"]
};

// ACTIVITY PRACTICE TAXONOMY (Issue #8 — additive metadata; ACTIVITIES unchanged)
const ACTIVITY_PRACTICE_CATALOG = [
  { activity_id: "A-01", align_stage: "A", label: "Day 1 · Draw \"Today's Feelings\" Faces", cab_domain: "affect", growth_capacity: "Noticing emotional signals without rushing to interpret them", possible_need_context: "Possible need for emotional safety and being seen", practice_marker: "present", post_practice_reflection_prompt: "What did you notice in yourself while making space for feelings to appear?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "gentle" },
  { activity_id: "A-02", align_stage: "A", label: "Day 2 · Shared Colour Painting", cab_domain: "co_regulation", growth_capacity: "Staying present during shared creative flow", possible_need_context: "Possible need for connection and playful togetherness", practice_marker: "present", post_practice_reflection_prompt: "When did you stay curious rather than directing the outcome?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "gentle" },
  { activity_id: "A-03", align_stage: "A", label: "Day 3 · Clay Emotion Shapes", cab_domain: "affect", growth_capacity: "Naming shapes and sensations linked to emotion", possible_need_context: "Possible need to express inner experience safely", practice_marker: "present", post_practice_reflection_prompt: "What feelings or body signals showed up for you during this activity?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "gentle" },
  { activity_id: "A-04", align_stage: "A", label: "Day 4 · Build a Paper Bridge", cab_domain: "integration", growth_capacity: "Noticing cooperation and small moments of bridge-building", possible_need_context: "Possible need for predictability and shared effort", practice_marker: "collaborates", post_practice_reflection_prompt: "Where might your child have needed steadiness while you built together?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "A-05", align_stage: "A", label: "Day 5 · Mirror Drawing", cab_domain: "affect", growth_capacity: "Observing reflection and mirroring without correcting", possible_need_context: "Possible need to be seen without being fixed", practice_marker: "noProjecting", post_practice_reflection_prompt: "What did you notice in your own face, tone, or urgency while mirroring?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "gentle" },
  { activity_id: "A-06", align_stage: "A", label: "Day 6 · Gratitude Card Craft", cab_domain: "integration", growth_capacity: "Practising gratitude without performance pressure", possible_need_context: "Possible need for warmth and acknowledgement", practice_marker: "present", post_practice_reflection_prompt: "What shifted in you when you focused on appreciation?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "gentle" },
  { activity_id: "A-07", align_stage: "A", label: "Day 7 · 3-Minute Silent Art", cab_domain: "affect", growth_capacity: "Tolerating quiet co-presence without filling the space", possible_need_context: "Possible need for calm presence and reduced stimulation", practice_marker: "noManaging", post_practice_reflection_prompt: "What happened in you during the silence — restlessness, calm, or something else?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "gentle" },
  { activity_id: "A-08", align_stage: "A", label: "Day 8 · \"When I'm Angry\" Poster", cab_domain: "cognition", growth_capacity: "Naming anger patterns without blaming the child", possible_need_context: "Possible need for help understanding big feelings", practice_marker: "thoughtsBeneath", post_practice_reflection_prompt: "What thought sat beneath your own anger or discomfort during this poster work?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "reflective" },
  { activity_id: "A-09", align_stage: "A", label: "Day 9 · Texture Collage", cab_domain: "affect", growth_capacity: "Exploring sensory experience with curiosity", possible_need_context: "Possible need for regulation through sensory engagement", practice_marker: "present", post_practice_reflection_prompt: "What sensations or emotions arose as textures changed?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "gentle" },
  { activity_id: "A-10", align_stage: "A", label: "Day 10 · Family Shield Design", cab_domain: "integration", growth_capacity: "Imagining family strengths without idealising perfection", possible_need_context: "Possible need for belonging and shared identity", practice_marker: "collaborates", post_practice_reflection_prompt: "What part of your family story felt tender or challenging to include?", progress_signal: "awareness_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "L-01", align_stage: "L", label: "Day 11 · \"Rules I Grew Up With\" Poster", cab_domain: "cognition", growth_capacity: "Noticing inherited rules without forcing agreement", possible_need_context: "Possible need for understanding family expectations", practice_marker: "ownsExpectations", post_practice_reflection_prompt: "Which rule from your upbringing surfaced in you during this activity?", progress_signal: "locate_exposure", difficulty_or_rhythm: "reflective" },
  { activity_id: "L-02", align_stage: "L", label: "Day 12 · \"What I Think Parents Expect\" Drawing", cab_domain: "cognition", growth_capacity: "Separating your assumptions from your child's experience", possible_need_context: "Possible need for clarity about roles and expectations", practice_marker: "ownsExpectations", post_practice_reflection_prompt: "What expectation of yourself as a parent appeared while you drew?", progress_signal: "locate_exposure", difficulty_or_rhythm: "reflective" },
  { activity_id: "L-03", align_stage: "L", label: "Day 13 · Red/Green Boundary Cards", cab_domain: "integration", growth_capacity: "Practising clear boundaries with warmth", possible_need_context: "Possible need for predictability and safe limits", practice_marker: "ownsExpectations", post_practice_reflection_prompt: "Where might a boundary have felt firm, unclear, or too sharp for your child?", progress_signal: "locate_exposure", difficulty_or_rhythm: "structured" },
  { activity_id: "L-04", align_stage: "L", label: "Day 14 · Timeline Collage", cab_domain: "cognition", growth_capacity: "Tracing how past moments may still shape today", possible_need_context: "Possible need for context and patience with pacing", practice_marker: "thoughtsBeneath", post_practice_reflection_prompt: "What memory or pattern felt most alive while building the timeline?", progress_signal: "locate_exposure", difficulty_or_rhythm: "reflective" },
  { activity_id: "L-05", align_stage: "L", label: "Day 15 · Mask Craft (outside vs inside)", cab_domain: "affect", growth_capacity: "Holding outside/inside differences without judgement", possible_need_context: "Possible need to be accepted beyond performance", practice_marker: "thoughtsBeneath", post_practice_reflection_prompt: "What felt easier to show — the outside mask or the inside one — and why?", progress_signal: "locate_exposure", difficulty_or_rhythm: "reflective" },
  { activity_id: "L-06", align_stage: "L", label: "Day 16 · Emotion Thermometer", cab_domain: "affect", growth_capacity: "Tracking emotional intensity with language", possible_need_context: "Possible need for co-regulation when feelings run high", practice_marker: "present", post_practice_reflection_prompt: "Where did your own temperature rise or settle during this activity?", progress_signal: "locate_exposure", difficulty_or_rhythm: "structured" },
  { activity_id: "L-07", align_stage: "L", label: "Day 17 · Family Motto Banner", cab_domain: "cognition", growth_capacity: "Naming shared values without moral scoring", possible_need_context: "Possible need for meaning and shared direction", practice_marker: "ownsExpectations", post_practice_reflection_prompt: "Which value word felt most demanding or most relieving to choose?", progress_signal: "locate_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "L-08", align_stage: "L", label: "Day 18 · \"When I Feel Disappointed\" Card", cab_domain: "affect", growth_capacity: "Staying with disappointment without rushing repair", possible_need_context: "Possible need for validation when hopes are unmet", practice_marker: "noProjecting", post_practice_reflection_prompt: "What disappointment arose in you, separate from your child's experience?", progress_signal: "locate_exposure", difficulty_or_rhythm: "reflective" },
  { activity_id: "L-09", align_stage: "L", label: "Day 19 · Build a \"Repair Box\"", cab_domain: "repair", growth_capacity: "Preparing repair tools before conflict escalates", possible_need_context: "Possible need for predictability after rupture", practice_marker: "collaborates", post_practice_reflection_prompt: "What repair gesture might feel natural for you before the next hard moment?", progress_signal: "locate_exposure", difficulty_or_rhythm: "repair" },
  { activity_id: "L-10", align_stage: "L", label: "Day 20 · Redo Day 4 Bridge", cab_domain: "integration", growth_capacity: "Returning to an earlier activity with new awareness", possible_need_context: "Possible need for retry without shame", practice_marker: "collaborates", post_practice_reflection_prompt: "What did you notice differently on the second bridge build?", progress_signal: "locate_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "I-01", align_stage: "I", label: "Day 21 · Joint Vision Board", cab_domain: "integration", growth_capacity: "Co-creating vision without controlling the outcome", possible_need_context: "Possible need for agency and shared hope", practice_marker: "collaborates", post_practice_reflection_prompt: "Where did you lead, follow, or negotiate during the vision board?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "I-02", align_stage: "I", label: "Day 22 · Build Tower with Limited Materials", cab_domain: "behaviour", growth_capacity: "Managing impulse to take over when materials are limited", possible_need_context: "Possible need for problem-solving space", practice_marker: "noManaging", post_practice_reflection_prompt: "What did you do when the tower wobbled — step in, wait, or invite?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "structured" },
  { activity_id: "I-03", align_stage: "I", label: "Day 23 · Paint with One Brush", cab_domain: "behaviour", growth_capacity: "Practising patience with shared constraints", possible_need_context: "Possible need for turn-taking and fairness", practice_marker: "noProjecting", post_practice_reflection_prompt: "What frustration or flexibility showed up with one brush between you?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "structured" },
  { activity_id: "I-04", align_stage: "I", label: "Day 24 · Design Family Routine Chart", cab_domain: "cognition", growth_capacity: "Designing rhythm that may support daily connection", possible_need_context: "Possible need for predictability and gentle structure", practice_marker: "ownsExpectations", post_practice_reflection_prompt: "Which routine idea felt realistic versus idealised for your family?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "structured" },
  { activity_id: "I-05", align_stage: "I", label: "Day 25 · Storybook \"A Hard Day\"", cab_domain: "integration", growth_capacity: "Storytelling hard days without blaming the child", possible_need_context: "Possible need for emotional safety after difficulty", practice_marker: "present", post_practice_reflection_prompt: "What part of the story touched your own hard-day memory?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "reflective" },
  { activity_id: "I-06", align_stage: "I", label: "Day 26 · Fix a Broken Craft", cab_domain: "repair", growth_capacity: "Modelling calm problem-solving when something breaks", possible_need_context: "Possible need for reassurance that mistakes are survivable", practice_marker: "collaborates", post_practice_reflection_prompt: "How did you respond inside when the craft failed — urgency, humour, or shutdown?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "repair" },
  { activity_id: "I-07", align_stage: "I", label: "Day 27 · Time-Limit Craft (5 mins)", cab_domain: "behaviour", growth_capacity: "Working within time limits without panic", possible_need_context: "Possible need for pacing and reduced pressure", practice_marker: "noManaging", post_practice_reflection_prompt: "What happened in you as the timer counted down?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "stretch" },
  { activity_id: "I-08", align_stage: "I", label: "Day 28 · Debate Poster: Yes/No", cab_domain: "cognition", growth_capacity: "Holding two views without winning the argument", possible_need_context: "Possible need for voice and respectful disagreement", practice_marker: "thoughtsBeneath", post_practice_reflection_prompt: "Where did you notice your mind pushing to be right?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "structured" },
  { activity_id: "I-09", align_stage: "I", label: "Day 29 · Parent-led, Child-directed Art", cab_domain: "co_regulation", growth_capacity: "Leading structure while following your child's direction", possible_need_context: "Possible need for guided autonomy", practice_marker: "collaborates", post_practice_reflection_prompt: "When did you defer — and when did you struggle to let go?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "I-10", align_stage: "I", label: "Day 30 · Child-led, Parent-directed Art", cab_domain: "co_regulation", growth_capacity: "Following your child's lead while staying regulated", possible_need_context: "Possible need for trust and shared creativity", practice_marker: "noProjecting", post_practice_reflection_prompt: "What arose in you when your child set the pace or style?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "I-11", align_stage: "I", label: "Day 31 · Repeat Tower Build", cab_domain: "integration", growth_capacity: "Repeating a challenge to notice practice shifts", possible_need_context: "Possible need for persistence without perfection", practice_marker: "collaborates", post_practice_reflection_prompt: "What might be different in how you approached the tower this time?", progress_signal: "integrate_exposure", difficulty_or_rhythm: "stretch" },
  { activity_id: "G-01", align_stage: "G", label: "Day 32 · Complex Lego Structure", cab_domain: "behaviour", growth_capacity: "Staying regulated during complex joint building", possible_need_context: "Possible need for support when tasks feel demanding", practice_marker: "noManaging", post_practice_reflection_prompt: "Where did you feel urge to correct, hurry, or micromanage?", progress_signal: "growth_exposure", difficulty_or_rhythm: "stretch" },
  { activity_id: "G-02", align_stage: "G", label: "Day 33 · Timed Team Art", cab_domain: "co_regulation", growth_capacity: "Coordinating under time pressure together", possible_need_context: "Possible need for teamwork and mutual pacing", practice_marker: "collaborates", post_practice_reflection_prompt: "What happened in your body when time felt tight?", progress_signal: "growth_exposure", difficulty_or_rhythm: "stretch" },
  { activity_id: "G-03", align_stage: "G", label: "Day 34 · \"Fix It Together\" Puzzle", cab_domain: "repair", growth_capacity: "Practising collaborative fixing instead of blame", possible_need_context: "Possible need for reassurance during frustration", practice_marker: "collaborates", post_practice_reflection_prompt: "What story did you tell yourself when the puzzle was hard?", progress_signal: "growth_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "G-04", align_stage: "G", label: "Day 35 · Paint While Distracted", cab_domain: "behaviour", growth_capacity: "Maintaining presence while internally distracted", possible_need_context: "Possible need for attuned presence despite parent stress", practice_marker: "present", post_practice_reflection_prompt: "What pulled your attention away — and how did you return?", progress_signal: "growth_exposure", difficulty_or_rhythm: "stretch" },
  { activity_id: "G-05", align_stage: "G", label: "Day 36 · Build Blindfold Guide", cab_domain: "co_regulation", growth_capacity: "Guiding with words while trusting your child's hands", possible_need_context: "Possible need for safety and gentle direction", practice_marker: "noProjecting", post_practice_reflection_prompt: "How did it feel to guide without seeing or controlling directly?", progress_signal: "growth_exposure", difficulty_or_rhythm: "stretch" },
  { activity_id: "G-06", align_stage: "G", label: "Day 37 · Redesign Failed Craft", cab_domain: "repair", growth_capacity: "Redesigning after failure without shame language", possible_need_context: "Possible need for dignity after mistakes", practice_marker: "collaborates", post_practice_reflection_prompt: "What did you say or imply about failure — to yourself or your child?", progress_signal: "growth_exposure", difficulty_or_rhythm: "repair" },
  { activity_id: "G-07", align_stage: "G", label: "Day 38 · Family Crisis Plan Poster", cab_domain: "cognition", growth_capacity: "Planning for stress without catastrophising", possible_need_context: "Possible need for predictability during uncertainty", practice_marker: "ownsExpectations", post_practice_reflection_prompt: "Which crisis-plan idea felt grounding versus alarming?", progress_signal: "growth_exposure", difficulty_or_rhythm: "structured" },
  { activity_id: "G-08", align_stage: "G", label: "Day 39 · \"No Words\" Craft", cab_domain: "affect", growth_capacity: "Communicating through presence rather than words", possible_need_context: "Possible need for connection without verbal pressure", practice_marker: "present", post_practice_reflection_prompt: "What did you notice when words were removed from the interaction?", progress_signal: "growth_exposure", difficulty_or_rhythm: "gentle" },
  { activity_id: "G-09", align_stage: "G", label: "Day 40 · Swap Leadership Mid-Task", cab_domain: "integration", growth_capacity: "Swapping roles mid-task with flexibility", possible_need_context: "Possible need for shared leadership and fairness", practice_marker: "collaborates", post_practice_reflection_prompt: "Where was role-switch easy or awkward for you?", progress_signal: "growth_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "G-10", align_stage: "G", label: "Day 41 · Deliberate Minor Frustration", cab_domain: "behaviour", growth_capacity: "Staying steady during intentional minor frustration", possible_need_context: "Possible need for tolerance of manageable struggle", practice_marker: "thoughtsBeneath", post_practice_reflection_prompt: "What thought appeared when frustration surfaced — for you or your child?", progress_signal: "growth_exposure", difficulty_or_rhythm: "stretch" },
  { activity_id: "G-11", align_stage: "G", label: "Day 42 · Review Early Artwork", cab_domain: "integration", growth_capacity: "Reviewing earlier work with compassion not comparison", possible_need_context: "Possible need for continuity and belonging over time", practice_marker: "present", post_practice_reflection_prompt: "What changed in how you see earlier artwork — or yourself as parent?", progress_signal: "growth_exposure", difficulty_or_rhythm: "reflective" },
  { activity_id: "N-01", align_stage: "N", label: "Day 43 · Child Designs Activity", cab_domain: "co_regulation", growth_capacity: "Honouring your child's design while staying grounded", possible_need_context: "Possible need for agency and creative ownership", practice_marker: "collaborates", post_practice_reflection_prompt: "What happened in you when your child's idea differed from yours?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "N-02", align_stage: "N", label: "Day 44 · Parent Sets Constraint", cab_domain: "cognition", growth_capacity: "Setting constraints without crushing initiative", possible_need_context: "Possible need for structure with freedom inside it", practice_marker: "ownsExpectations", post_practice_reflection_prompt: "Which constraint felt fair — and which felt too tight?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "structured" },
  { activity_id: "N-03", align_stage: "N", label: "Day 45 · Budgeted Craft Challenge", cab_domain: "integration", growth_capacity: "Problem-solving within limits as a team", possible_need_context: "Possible need for resourcefulness and shared planning", practice_marker: "collaborates", post_practice_reflection_prompt: "Where did budgeting spark stress or creativity in you?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "structured" },
  { activity_id: "N-04", align_stage: "N", label: "Day 46 · Family Values Flag", cab_domain: "integration", growth_capacity: "Naming values you hope to live toward", possible_need_context: "Possible need for meaning and shared identity", practice_marker: "ownsExpectations", post_practice_reflection_prompt: "Which value on the flag felt most alive or most difficult today?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "collaborative" },
  { activity_id: "N-05", align_stage: "N", label: "Day 47 · Independent Mini Project", cab_domain: "co_regulation", growth_capacity: "Supporting independence while remaining available", possible_need_context: "Possible need for autonomy with nearby safety", practice_marker: "noProjecting", post_practice_reflection_prompt: "What did you feel when you stepped back during their mini project?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "gentle" },
  { activity_id: "N-06", align_stage: "N", label: "Day 48 · Feedback Card Exchange", cab_domain: "repair", growth_capacity: "Giving and receiving feedback with care", possible_need_context: "Possible need for honest connection without harshness", practice_marker: "collaborates", post_practice_reflection_prompt: "What feedback was hardest to offer or to hear?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "repair" },
  { activity_id: "N-07", align_stage: "N", label: "Day 49 · Design Future Family Plan", cab_domain: "cognition", growth_capacity: "Imagining future rhythms without over-controlling", possible_need_context: "Possible need for hope and collaborative planning", practice_marker: "ownsExpectations", post_practice_reflection_prompt: "Which future plan felt realistic for your actual capacity?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "reflective" },
  { activity_id: "N-08", align_stage: "N", label: "Day 50 · \"What I Need From You\" Poster", cab_domain: "affect", growth_capacity: "Naming needs relationally without guilt", possible_need_context: "Possible need for mutual understanding and repair", practice_marker: "thoughtsBeneath", post_practice_reflection_prompt: "What need of yours surfaced that may be worth gentle expression?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "repair" },
  { activity_id: "N-09", align_stage: "N", label: "Day 51 · Redo Disagreement Poster", cab_domain: "repair", growth_capacity: "Revisiting disagreement with curiosity not victory", possible_need_context: "Possible need for reconciliation after conflict", practice_marker: "collaborates", post_practice_reflection_prompt: "What might you see differently in the disagreement poster now?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "repair" },
  { activity_id: "N-10", align_stage: "N", label: "Day 52 · Celebration Installation", cab_domain: "integration", growth_capacity: "Celebrating shared effort without performance", possible_need_context: "Possible need for joy, belonging, and closure", practice_marker: "present", post_practice_reflection_prompt: "What moment of connection felt most genuine during celebration?", progress_signal: "navigate_exposure", difficulty_or_rhythm: "celebration" }
];

const ACTIVITY_PRACTICE_BY_LABEL = Object.fromEntries(ACTIVITY_PRACTICE_CATALOG.map((item) => [item.label, item]));
const ACTIVITY_PRACTICE_BY_ID = Object.fromEntries(ACTIVITY_PRACTICE_CATALOG.map((item) => [item.activity_id, item]));

const getActivityPracticeByLabel = (label) => ACTIVITY_PRACTICE_BY_LABEL[String(label || '').trim()] || null;
const getActivityPracticeById = (activityId) => ACTIVITY_PRACTICE_BY_ID[String(activityId || '').trim()] || null;

// ACTIVITY-BASED HOSTED SESSIONS (Issue #45 — DB-backed published events only)
const ACTIVITY_EVENTS_PAGE = {
  title: "Events Listing",
  subtitle: "Browse hosted Wayfinder parent-child events drawn from the 52-day activity catalogue. Each listing shows the underlying activity practice focus plus venue, date, time, fee, and registration details added by an approved facilitator.",
  privacyNote: "Calendar invites and add-to-calendar links contain event logistics only — activity title, date, time, venue or online meeting note, and fee type. They never include child names, Child IDs, Parent IDs, journal text, Decode content, therapist notes, or private reflection content.",
  emptyState: "No events are available yet. Check back when a facilitator publishes a hosted Wayfinder activity.",
  calendarDownloadLabel: "Download .ics",
  googleCalendarLabel: "Google Calendar",
  outlookCalendarLabel: "Outlook web"
};

const PARENT_REVIEW_SHARING = {
  title: "Share for Mental Health Practitioner (MHP) review",
  subtitle: "You choose which journal or Decode entries a Mental Health Practitioner may review. Sharing is time-limited and you can revoke access.",
  setupUnavailable: "Mental Health Practitioner (MHP) review sharing is not ready yet. The database setup still needs to be completed.",
  counsellorSelectLabel: "Choose a Mental Health Practitioner",
  counsellorSelectPlaceholder: "Select a practitioner…",
  counsellorSelectLoading: "Loading practitioners…",
  counsellorSelectHint: "Only verified Wayfinder Mental Health Practitioners appear here. Your practitioner may share their Wayfinder ID with you if needed.",
  noCounsellorsAvailable: "No Mental Health Practitioners are available for review sharing yet. Please contact your Wayfinder administrator.",
  counsellorRequired: "Please choose a Mental Health Practitioner before sharing.",
  consentExpiryNotice: "Shared access lasts 30 days unless you revoke it earlier.",
  consentVersion: "2026-06-1",
  consentTitle: "Consent to share selected reflections",
  consentBody: "I understand that the selected journal and Decode reflections may be read by the Mental Health Practitioner I identify for up to 30 days. These reflections are for ALIGN/CAB review support — not child diagnosis, behaviour labelling, or scoring. I may revoke access before expiry.",
  consentCheckbox: "I consent to share the selected entries under these terms.",
  selectEntriesLabel: "Select entries to share",
  previewLabel: "What will be shared",
  grantExpiryDays: 30,
  grantButton: "Grant review access",
  revokeButton: "Revoke access",
  activeGrantsTitle: "Active review access",
  emptyGrants: "No active MHP review access. Select entries above when you are ready to share.",
  grantCreated: "Review access granted. Your Mental Health Practitioner may now open only the entries you selected.",
  grantRevoked: "Review access revoked.",
  grantError: "We could not complete review sharing. Please try again or choose a different Mental Health Practitioner.",
  counsellorNotFound: "The selected Mental Health Practitioner could not be found.",
  noEntriesSelected: "Select at least one entry to share.",
  consentRequired: "Please confirm consent before sharing.",
  privacyNote: "Only selected reflection content is shared — never your email, tokens, or full journal history.",
  entryActionLabel: "Share this reflection for review",
  dashboardActionLabel: "Share for MHP review",
  dashboardCardTitle: "Share for MHP review",
  dashboardCardSubtitle: "Choose saved journal or Decode entries to share with your Mental Health Practitioner for time-limited ALIGN/CAB review. You preview exactly what will be shared before giving consent.",
  dashboardCardButton: "Open sharing in Journal Trail",
  postSaveButtonLabel: "Share this reflection for MHP review",
  postSaveHelper: "Preview what will be shared and give consent in Journal Trail.",
  previewTypeActivity: "Activity journal",
  previewTypeDecode: "Decode a Moment",
  entryNotShareable: "This saved entry cannot be shared yet. Newer entries from Journal Trail can be shared for review.",
  browseTrailLink: "View full journal trail",
  shareModeIntro: "Choose entries, preview what will be shared, select your Mental Health Practitioner, and confirm consent."
};

const PARENT_COUNSELLOR_FEEDBACK = {
  notificationTitle: "MHP feedback to review",
  notificationSubtitle: "Your Mental Health Practitioner has shared a contextual reflection on entries you chose to share. This is for your private parent-development use.",
  notificationBadgeSingular: "1 unread reflection",
  notificationBadgePlural: " unread reflections",
  openFeedbackButton: "Read MHP feedback",
  readerTitle: "MHP feedback",
  readerIntro: "This reflection relates only to the Wayfinder entries you chose to share. It is not a diagnosis of you or your child.",
  counsellorLabelPrefix: "MHP",
  publishedLabel: "Published",
  markReadButton: "Mark as read",
  markReadHelper: "Mark as read only when you have reviewed this feedback. This preserves the shared context and clears the dashboard notice.",
  markReadSaving: "Marking as read…",
  markReadDone: "Marked as read",
  markReadError: "We couldn't update the read status or clear the dashboard notice right now. Please try again.",
  reflectionSectionTitle: "My reflection after reading this feedback",
  reflectionPlaceholder: "Your private reflection — only you can see this.",
  reflectionSaveButton: "Save my reflection",
  reflectionSaving: "Saving…",
  reflectionSaved: "Saved",
  reflectionError: "Your reflection could not be saved right now.",
  confidentialityNotice: "This response is provided only in relation to the specific Wayfinder reflections and activities you chose to share. It is a contextual parent-reflection response, not a diagnosis, clinical report, legal opinion, expert assessment, admission, or general statement about you or your child. It should not be taken out of context, shared publicly, or treated as a standalone record beyond the specific shared Wayfinder activity. It is intended for your private reflection and parent-development use. You are responsible for keeping it confidential. It is not created for public use, legal proceedings, evidence, or admissions, subject always to applicable law or lawful orders.",
  unavailable: "MHP feedback is not available yet. Your journal and shared reflections remain unchanged.",
  detailUnavailable: "This MHP feedback could not be loaded right now.",
  entryLockNotice: "This reflection has been locked because MHP feedback has been published or read. This preserves the original context of the shared review.",
  entryLockedShareNote: "This entry is locked for review integrity and cannot be shared again.",
  sharedEntryFallbackLabel: "Shared reflection",
  feedbackLibraryTitle: "MHP feedback",
  feedbackLibrarySubtitle: "Feedback your Mental Health Practitioner has shared on entries you chose to share.",
  feedbackLibraryEmpty: "No MHP feedback has been shared yet.",
  feedbackLibraryOpen: "Open feedback",
  feedbackStatusNew: "New",
  feedbackStatusAvailable: "Available"
};

const COUNSELLOR_REVIEW_SHARING = {
  title: "Parent shared reflections",
  subtitle: "Reflections a parent has chosen to share with you for time-limited ALIGN/CAB review. You may not diagnose the child, score the parent, or label behaviour.",
  setupUnavailable: "Parent review grants are not ready yet. The database setup still needs to be completed. Until then, legacy journal access may still apply if configured.",
  emptyList: "No parent has shared reflections with you yet. When a parent grants review access, those entries will appear here.",
  legacyNotice: "Review grants are not configured yet — showing legacy journal access. Assistive AI is paused until grant-scoped sharing is active.",
  aiDisabledNotice: "Assistive AI runs only on parent-granted entries. It supports reflection structure — it does not diagnose, score, or decide for you.",
  grantScopedNotice: "You are viewing only entries a parent selected and consented to share. Use ALIGN/CAB tools to explore — not to label the child or parent.",
  contextProfileTitle: "Wayfinder review context",
  contextProfileNote: "Parent-reported context only — for ALIGN/CAB review, not diagnosis or profiling.",
  parentSummaryLabel: "Parent",
  childSummaryLabel: "Child",
  entryCountSingular: "entry",
  entryCountPlural: "entries",
  entryCountPluralShared: "shared entries",
  parentContextLabel: "Parent context",
  childContextLabel: "Child context",
  sharedEntriesLabel: "Parent-approved entries",
  grantExpiresLabel: "Review access expires",
  parentWayfinderLabel: "Wayfinder Parent ID",
  childWayfinderLabel: "Child ID",
  parentReportedLabel: "Parent-reported",
  openEntryLabel: "Open for ALIGN/CAB review",
  longitudinalTitle: "Longitudinal AI Reflections",
  longitudinalNote: "Assistive reflection across parent-granted entries — for ALIGN/CAB review support, not diagnosis or profiling.",
  longitudinalUnavailable: "Assistive reflection is not available for this parent right now. Try refreshing after more shared entries are granted.",
  responseTabLabel: "Parent-Facing Response",
  responseComposerTitle: "Parent-facing response",
  responseComposerNote: "Draft a bounded, non-diagnostic reflection for the parent. You remain responsible for what is shared.",
  responseComposerUnavailable: "MHP response storage is not available yet. Existing grant review remains available.",
  responsePrefillNote: "Draft fields may be prefilled from your review tabs and this shared entry. Edit everything before publishing.",
  responseRegeneratePrefill: "Regenerate draft from review context",
  responseGrantRequired: "Parent-facing response is available when you open a parent-approved grant entry.",
  responseEntryLinkRequired: "Parent-facing response is available when this approved entry has a review grant link.",
  responseStatusPending: "Pending response",
  responseStatusDraft: "Draft saved",
  responseStatusPublished: "Published",
  responseStatusRevoked: "Revoked",
  responseStatusUnavailable: "Status unavailable"
};

const COUNSELLOR_EVENTS_HOSTING = {
  title: "Events hosting",
  subtitle: "Select one of the 52 Wayfinder activities and add hosting logistics. Published events appear on the parent Events Listing. Draft events remain visible only here.",
  setupUnavailable: "Hosted events are not ready yet. The database setup still needs to be completed.",
  emptyList: "No hosted events yet. Create one to publish a Wayfinder activity session for parents.",
  newEventLabel: "Host new event",
  backToList: "Back to hosted events",
  backToReflections: "Client reflections",
  saveDraftLabel: "Save draft",
  publishLabel: "Publish event",
  archiveLabel: "Archive",
  editLabel: "Edit",
  activityLabel: "Wayfinder activity",
  venueTypeLabel: "Venue type",
  venuePhysical: "Physical",
  venueOnline: "Online",
  venueDetailLabel: "Venue address or online meeting note",
  dateLabel: "Date",
  startTimeLabel: "Start time",
  endTimeLabel: "End time",
  feeTypeLabel: "Fee type",
  feeFree: "Free",
  feePaid: "Paid",
  registrationUrlLabel: "Registration link (optional)",
  eventbriteUrlLabel: "Eventbrite link (optional)",
  statusDraft: "Draft",
  statusPublished: "Published",
  statusArchived: "Archived",
  privacyNote: "Hosted event records store activity logistics only — never child names, Child IDs, Parent IDs, journal text, or private reflection content."
};

const ALIGN_STAGE_LABELS = {
  A: "Awareness",
  L: "Locate",
  I: "Integrate",
  G: "Growth",
  N: "Navigate"
};

// Parent Events Listing reads published rows from hosted_activity_events only (Issue #45).
// Static sample events removed — no fake live availability.
const HOSTED_ACTIVITY_EVENTS = [];

const enrichHostedActivityEvent = (event) => {
  const practice = getActivityPracticeById(event.activity_id);
  const alignStage = practice?.align_stage || "";
  return {
    ...event,
    activityTitle: practice?.label || event.activity_id,
    alignStage,
    alignStageLabel: ALIGN_STAGE_LABELS[alignStage] || alignStage,
    practiceFocus: practice?.growth_capacity || "",
    possibleNeedContext: practice?.possible_need_context || "",
    cabDomain: practice?.cab_domain || ""
  };
};

const getEnrichedHostedActivityEvents = () =>
  HOSTED_ACTIVITY_EVENTS.map(enrichHostedActivityEvent).sort((a, b) => {
    const da = String(a.date || "").localeCompare(String(b.date || ""));
    if (da !== 0) return da;
    return String(a.startTime || "").localeCompare(String(b.startTime || ""));
  });

// 6-PART EMOTIONAL STABILITY MARKERS
// These are the "What I became aware of" checkboxes
const MARKERS = [
  {
    key: 'present',
    label: 'I was here in the moment',
    guide: 'I will notice what my child is doing, I will stay curious and only respond if my child asks for me to respond.'
  },
  {
    key: 'noProjecting',
    label: 'I watched without racing ahead to fix',
    guide: 'I will be at my child\'s side, my child may be slow to respond and I am ok, as I am confident that my child knows what to do.'
  },
  {
    key: 'noManaging',
    label: 'I let go of managing how everyone was doing',
    guide: 'I will trust my child to find their own way, I will release the need to control the outcome.'
  },
  {
    key: 'ownsExpectations',
    label: 'I named what I expected — of myself and my child',
    guide: 'I will speak my expectations clearly and kindly, giving my child and myself clarity about what we\'re working toward.'
  },
  {
    key: 'thoughtsBeneath',
    label: 'I found the thought beneath my feeling',
    guide: 'I will pause when feelings arise and ask: what am I thinking that creates this feeling?'
  },
  {
    key: 'collaborates',
    label: 'We worked it out together',
    guide: 'I will invite my child into problem-solving, we will figure it out as a team rather than me deciding alone.'
  }
];

// CAB FIELD LABELS & PLACEHOLDERS
const CAB_FIELDS = {
  thoughts: {
    label: "My thoughts — what went through my mind when I saw",
    placeholder: "Example: I worried they weren't doing it right, or that I should have explained better"
  },
  feelings: {
    label: "My feelings — what I felt when I saw",
    placeholder: "Example: Anxious, a bit frustrated, like I was failing as a parent"
  },
  actions: {
    label: "My actions — what I actually did when I saw",
    placeholder: "Example: I jumped in and started directing, then took over when they hesitated"
  },
  meaning: {
    label: "The meaning I made — what I think this means when I saw",
    placeholder: "Example: I assumed their hesitation meant they couldn't do it without me helping"
  }
};

// VALUE WORDS (for auto-analysis)
const VALUE_GROUPS = [
  {
    k: 'I',
    title: 'Warmth (I)',
    hint: 'Bringing people together, enthusiasm, expressiveness',
    words: ['Playful', 'Warm', 'Encouraging', 'Enthusiastic', 'Inviting', 'Expressive', 'Friendly', 'Spontaneous'],
    on: 'warmth',
    cls: 'i-warmth'
  },
  {
    k: 'S',
    title: 'Steadiness (S)',
    hint: 'Patience, presence, consistent support',
    words: ['Patient', 'Steady', 'Present', 'Gentle', 'Calm', 'Supportive', 'Listening', 'Accepting'],
    on: 'steady',
    cls: 's-steady'
  },
  {
    k: 'D',
    title: 'Drive (D)',
    hint: 'Taking charge, directing, problem-solving',
    words: ['Directing', 'Decisive', 'Commanding', 'Assertive', 'Challenging', 'Driving', 'Controlling', 'Correcting'],
    on: 'drive',
    cls: 'd-drive'
  },
  {
    k: 'C',
    title: 'Standards (C)',
    hint: 'Precision, analysis, getting things right',
    words: ['Precise', 'Analytical', 'Thorough', 'Systematic', 'Critical', 'Correcting', 'Explaining', 'Instructing'],
    on: 'precise',
    cls: 'c-standards'
  }
];

// SHIFT GUIDANCE WORDS
const SHIFT_WORDS = {
  lowerDC: ['Pausing', 'Releasing', 'Softening', 'Waiting', 'Allowing', 'Stepping back'],
  raiseIS: ['Noticing', 'Connecting', 'Inviting', 'Staying', 'Being curious', 'Following their lead']
};

// CHILD NEEDS (I&S words)
const CHILD_NEEDS_WORDS = ['Patient', 'Warm', 'Encouraging', 'Present'];

// CULTURAL BACKGROUNDS
const CULTURE = {
  Chinese: "Face (面子) and family harmony matter. Congruent warmth often lands through steady presence, a gentle tone and quiet acknowledgement rather than effusive praise. Owning a feeling can be softened relationally: \"I feel… and I'm here with you.\"",
  Malay: "Budi bahasa (courtesy) and kinship warmth are central. An affectionate, respectful tone and inclusive \"kita / we\" framing let honest feeling preserve harmony rather than threaten it.",
  Indian: "Respect for elders sits alongside expressive warmth. Clear feeling-words paired with reassuring relational closeness land well — honesty offered inside, not against, the family bond.",
  Eurasian: "Often a blend of direct and Asian-relational norms. Direct warmth is usually comfortable; follow the family's own emotional language and pace.",
  Other: "Follow the family's own warmth and respect norms. Congruence stays the same underneath: honest feeling + preserved dignity for both."
};

// UI LABELS & MESSAGES
const UI_TEXT = {
  buttons: {
    continue: "Continue to reflection",
    addEntry: "Add to my journal entry",
    journalAnother: "Journal another entry",
    askTherapist: "Share this reflection for MHP review",
    viewJournal: "Go to my journal entries trail and summary page",
    doneForNow: "Done for now",
    saveBegin: "Save & begin"
  },
  
  sections: {
    cabTitle: "What I noticed in myself",
    cabSubtitle: "Write what actually happened — not what you wish happened. Be honest and specific.",
    
    mirrorTitle: "How I was",
    mirrorSubtitle: "Based on what you wrote, these words describe your stance:",
    
    scaffoldingTitle: "Desired emotional scaffolding for",
    scaffoldingSubtitle: "What your child needs from you to feel safe and seen:",
    
    awarenessTitle: "What I became aware of",
    awarenessSubtitle: "Tick what was genuinely there as you emotionally attended to your child:",
    
    shiftGuideTitle: "To support this shift:",
    shiftLowerLabel: "Soften D & C - reduce directing and correcting:",
    shiftRaiseLabel: "Let I & S rise - warmth and presence follow naturally:",
    
    summaryTitle: "Remember for next time",
    summaryWhatIDo: "What I will do:",
    summaryChildNeeds: "What my child needs:",
    summaryShift: "My shift:"
  },
  
  setup: {
    title: "Set up your space",
    subtitle: "A one-time setup for",
    noNames: "No names — codes only.",
    childIdLabel: "Child ID",
    parentDobLabel: "Your birthdate",
    childDobLabel: "Child's birthdate",
    parentGenderLabel: "Your gender",
    childGenderLabel: "Child's gender",
    discLabel: "DISC blend (if known)",
    cultureLabel: "Cultural background",
    cultureHint: "Helps your Mental Health Practitioner offer culturally-attuned reflections."
  },

  decode: {
    privacyNudge: "Keep names and identifying details out. Use your child's Child ID or a simple description of what happened.",
    counsellorReminder: "This reflection is a starting point. If this pattern repeats or feels difficult to understand, consider reviewing it with a Mental Health Practitioner."
  },

  trail: {
    showLabel: "Show",
    filterAll: "All entries",
    filterActivity: "Activity journals",
    filterDecode: "Behaviour decodes",
    childLabel: "Child",
    childAll: "All children",
    childUnassigned: "Unassigned",
    needLabel: "Possible need",
    growthLabel: "Growth capacity",
    clearFilters: "Clear filters",
    emptyFiltered: "No entries match these filters. Clear filters to see all."
  },

  genderOptions: ["Prefer not to say", "Male", "Female", "Non-binary"]
};


// APP VERSION PAGE (edit copy here - no database or admin UI)
// Workflow: before merging a user-facing PR, add or update an entry at the top of
// WAYFINDER_APP_VERSIONS with parent-facing copy. Internal-only PRs: note in the PR
// description that no App Version entry is needed.
// App Version page is parent/client-facing.
// Include only parent-visible UI/UX enhancements, privacy notices, or parent workflow improvements.
// Do not include MHP workspace, admin, SQL/RLS/auth, ops, or internal-only release notes here.
const APP_VERSION_PAGE = {
  title: "App Version",
  subtitle: "A parent-facing record of Wayfinder updates, privacy reminders, and planned improvements.",
  releasedHeading: "Recent updates",
  plannedHeading: "Planned",
  reassurance: "These notes help you understand what may have changed and what is coming next. They are not labels, scores, or clinical assessments.",
  workflowNote: "Wayfinder updates this page when parent-facing improvements are released. Future research or data use will always be explained with clear notice, consent, and privacy safeguards."
};

const WAYFINDER_DASHBOARD_POLISH = {
  pathwayNote: "Wayfinder helps you reflect on what happened, what your child may have needed, what happened in you, and one next step you may try.",
  plansEntryNote: "Plans are for saving, revisiting, and optional parent-controlled review support. Privacy is included in every plan."
};

const WAYFINDER_PLANS_PAGE = {
  title: "Plans",
  subtitle: "Paid plans help you save, revisit, and reflect on your parent-growth practice. Connect adds optional, parent-controlled MHP review support if you choose it.",
  privacyBaseline: "Privacy is included in every plan. No ads. No data-selling. Research use is consent-led.",
  readAccessReassurance: "Reflections you have already saved remain readable even if your trial ends or paid access lapses.",
  trialActiveDetail: "30-day trial · unlimited saves · {daysLeft} {dayWord} remaining (ends {endDate})",
  trialActiveNoDateDetail: "30-day trial · unlimited reflection saves · no card required",
  trialEndedDetail: "Your 30-day trial has ended. Saved reflections remain readable.",
  connectDisclaimer: "Wayfinder Connect adds optional, parent-controlled Mental Health Practitioner (MHP) review support. It is not therapy, diagnosis, emergency care, or crisis support.",
  sandboxTestModeNote: "Upgrades use Stripe secure checkout. Your plan updates after payment is confirmed — it may take a moment to refresh here.",
  checkoutUpgradeMonthly: "Upgrade — monthly",
  checkoutUpgradeYearly: "Upgrade — yearly",
  checkoutLoading: "Opening secure checkout…",
  checkoutErrorMessage: "Checkout could not be started. Please sign in again or try later.",
  checkoutSuccessNotice: "Payment received. Your plan may take a moment to refresh.",
  checkoutCancelledNotice: "Checkout was cancelled. No changes were made.",
  checkoutDismissNotice: "Dismiss",
  manageBillingLabel: "Manage billing",
  manageBillingLoading: "Opening billing portal…",
  manageBillingErrorMessage: "Billing portal could not be opened. Please try again in a moment or use Upgrade below.",
  manageBillingLegacyErrorMessage: "Billing portal could not be opened. If your Plus access was set up before Stripe billing was connected, your access remains unchanged. Billing management is not yet linked.",
  manageBillingNote: "Manage billing opens Stripe's secure billing portal. Some changes, such as downgrades or billing interval changes, may take effect at your next renewal date. Until Stripe confirms the change, Wayfinder continues to show your current active plan.",
  manageBillingSessionSafetyNote: "Stripe will open a secure billing page in this browser. For privacy on shared devices, please return to Wayfinder, sign out, and close this browser window when finished.",
  billingReturnNotice: "You're back from billing. If you changed your plan, Stripe may take a moment to confirm it. Some changes take effect at the next renewal date.",
  billingReturnSessionSafetyNote: "You have returned from Stripe. Billing changes are confirmed by Stripe and may take a moment to update. On a shared device, sign out of Wayfinder, close this browser window, and clear your browser history or site data after use.",
  currentPlanConfirmedNote: "Your current plan reflects what Stripe has confirmed as active now.",
  currentPlanLabel: "Your current plan",
  unavailableNote: "Plan details are not ready yet. You can keep using Wayfinder while this is being set up.",
  catalogHeading: "Wayfinder plans",
  monthlyLabel: "Monthly",
  yearlyLabel: "Yearly",
  freePriceLabel: "Free",
  noCardRequired: "No card required",
  currentPlanBadge: "Current plan",
  catalog: [
    {
      planKey: "wayfinder",
      name: "Wayfinder",
      tagline: "30-day trial — start reflecting, no card required.",
      positioning: "Start reflecting",
      priceMonthly: null,
      priceYearly: null,
      highlights: [
        "Core parent reflection pathway",
        "30-day no-card trial",
        "Unlimited reflection saves during your trial",
        "Privacy-first — no ads, no data-selling"
      ]
    },
    {
      planKey: "wayfinder_plus",
      name: "Wayfinder Plus",
      tagline: "Unlock unlimited saving and your parent-growth progress tracker.",
      positioning: "Track your growth",
      priceMonthly: "S$7.90/month",
      priceYearly: "S$69/year",
      highlights: [
        "Unlimited reflection saves",
        "Parent-growth progress tracker",
        "Full Journal Trail and practice history"
      ]
    },
    {
      planKey: "wayfinder_connect",
      name: "Wayfinder Connect",
      tagline: "Add parent-controlled MHP review support.",
      positioning: "Add parent-controlled MHP review",
      priceMonthly: "S$29.90/month",
      priceYearly: "S$299/year",
      highlights: [
        "Everything in Wayfinder Plus",
        "Parent-controlled sharing only — nothing automatic",
        "Includes 1 MHP review request per month when enabled"
      ]
    }
  ]
};

const WAYFINDER_APP_VERSIONS = [
  {
    id: "v0-4-6-live-billing-support-polish",
    version: "v0.4.6",
    date: "July 2026",
    status: "released",
    tag: "Plans and support",
    title: "Live billing, clearer Plans, and support guidance",
    body: "Wayfinder now has live Stripe checkout for paid plans, clearer Plans wording, and safer Billing Portal guidance for shared devices. User-facing copy now consistently uses Mental Health Practitioner (MHP) for review support. Legacy Plus accounts set up before live billing keep their current access while billing migration remains deferred. Privacy remains included in every plan.",
    parentAction: "Use Plans to review your current plan or upgrade through Stripe secure checkout. If you use a shared device, sign out and close the browser window when finished."
  },
  {
    id: "v0-4-5-parent-mhp-portrait-display",
    version: "v0.4.5",
    date: "June 2026",
    status: "released",
    tag: "Profiles",
    title: "MHP portraits in parent selection",
    body: "Published Mental Health Practitioner profiles can now display an owner-approved portrait in parent selection areas. This may help you recognise your practitioner when sharing reflections for review. Only the current approved portrait is shown.",
    parentAction: "When sharing reflections for review, look for your Mental Health Practitioner's name and portrait in the selection list."
  },
  {
    id: "v0-4-4-login-branding-install-icon",
    version: "v0.4.4",
    date: "June 2026",
    status: "released",
    tag: "Branding",
    title: "Wayfinder login branding and app icon refreshed",
    body: "Wayfinder now shows clearer branding on the login experience, and the installed parent app uses a dedicated Wayfinder icon. This is a visual update only and does not change your journal, Child IDs, privacy settings, or reflections.",
    parentAction: "If your phone still shows the old icon, remove the old home-screen shortcut and install Wayfinder again."
  },
  {
    id: "v0-4-3-privacy-acknowledgement-record",
    version: "v0.4.3",
    date: "June 2026",
    status: "released",
    tag: "Privacy",
    title: "Privacy acknowledgement can now be saved",
    body: "Wayfinder can now save a simple record that you have seen the current privacy and data-use notice. This supports transparency and parent choice. It does not change your journal, Child IDs, reflections, or how you use Decode and the Relationship Garden.",
    parentAction: "When the privacy acknowledgement appears, review it and choose Acknowledge. You can keep using Wayfinder if saving the acknowledgement is temporarily unavailable."
  },
  {
    id: "v0-4-2-relationship-garden-growth-evidence",
    version: "v0.4.2",
    date: "June 2026",
    status: "released",
    tag: "Relationship Garden",
    title: "Relationship Garden now reflects saved practice",
    body: "Your Relationship Garden now responds more clearly to saved Wayfinder activities for each Child ID. Activity practice may gently move a relationship pot from Awareness toward curiosity, connection, growth practice, or repair. This is not a score, level, diagnosis, or sign that anything is complete — it is a quiet reflection of relationship tending through parent practice.",
    parentAction: "After saving an activity for a child, return to the dashboard to see how that relationship pot may reflect the practice you are tending."
  },
  {
    id: "v0-4-0-events-listing",
    version: "v0.4.0",
    date: "June 2026",
    status: "released",
    tag: "Events",
    title: "Events Listing",
    body: "You can now browse upcoming hosted parent-child events based on Wayfinder's 52-day activity catalogue. Each listing shows the activity practice focus, venue or online details, date and time, and whether it is free or paid. Add-to-calendar options include a privacy-safe download — calendar invites contain event logistics only, not child names, IDs, or reflection content.",
    parentAction: "Open Events from your dashboard to explore the Events Listing and add an event to your calendar if helpful."
  },
  {
    id: "v0-3-2-align-journey",
    version: "v0.3.2",
    date: "June 2026",
    status: "released",
    tag: "Reflection update",
    title: "Your ALIGN Journey",
    body: "Wayfinder now offers a gentle ALIGN Journey reflection so parents can notice what they may be practising over time, such as noticing a possible need, pausing before responding, or choosing one next action. These reflections are not labels or scores.",
    parentAction: "After a few reflections, open Your ALIGN Journey to notice what may be emerging."
  },
  {
    id: "v0-3-1-decode",
    version: "v0.3.1",
    date: "June 2026",
    status: "released",
    tag: "Decode support",
    title: "Decode a Moment",
    body: "Decode a Moment helps you slow down after something happens with your child. It guides you to explore the possible need, your CAB response, and one gentle next step.",
    parentAction: "Try it after a difficult moment, or when you want to understand a repeated moment more clearly."
  },
  {
    id: "v0-3-0-journal-trail",
    version: "v0.3.0",
    date: "June 2026",
    status: "released",
    tag: "Practice trail",
    title: "Journal Trail improvements",
    body: "The Journal Trail helps you revisit recent reflections and activities so you can notice how your practice is developing over time.",
    parentAction: "Use it to revisit what you noticed, what helped, and what you may try next."
  },
  {
    id: "upcoming-language-toggle-zh-hans",
    version: "Upcoming",
    date: "Planned",
    status: "planned",
    tag: "Language access",
    title: "Simplified Chinese language toggle",
    body: "We are planning an English / 简体中文 toggle for static Wayfinder guidance and product copy. Private reflections, child names, journal entries, and MHP feedback will not be automatically translated.",
    parentAction: "Continue writing reflections in the language that feels natural to you."
  },
  {
    id: "upcoming-privacy-reminder",
    version: "Upcoming",
    date: "Planned",
    status: "planned",
    tag: "Privacy reminder",
    title: "Reflection privacy reminder",
    body: "Wayfinder uses generated Parent IDs and Child IDs in the app interface. When writing reflections, avoid adding names or identifying details unless they are truly needed.",
    parentAction: "Keep reflections focused on what happened, what you noticed, and what you may try next."
  }
];

const MENTAL_HEALTH_PROFESSIONAL_ONBOARDING = {
  forgotPasswordLink: "Forgot password?",
  forgotPasswordTitle: "Reset your password",
  forgotPasswordPrompt: "Enter the email you used for Wayfinder. If an account exists, we will send a password reset link.",
  forgotPasswordSubmit: "Send reset link",
  forgotPasswordSuccess: "If an account exists, we will send a password reset link.",
  forgotPasswordBack: "Back to sign in",
  inviteProfileSetupTitle: "Set up your Wayfinder Mental Health Practitioner profile",
  inviteProfileSetupIntro: "You've been invited to begin Mental Health Practitioner onboarding with Wayfinder.",
  inviteProfileSetupDetail: "This invitation lets you create your profile draft and upload licence details for review. It does not publish your profile or activate public access automatically.",
  inviteCreateAccountTitle: "Create your Wayfinder Mental Health Practitioner account",
  inviteCreateAccountIntro: "This invitation is tied to the email below. After email verification, sign in with this email and Wayfinder will continue your profile and licence setup.",
  inviteCreateAccountSubtitle: "This invitation is tied to the email below. After email verification, sign in with this email and Wayfinder will continue your profile and licence setup.",
  inviteCreateAccountButton: "Create account and continue",
  inviteSignInTitle: "Sign in with your invited email",
  inviteSignInButton: "Sign in and continue profile setup",
  inviteEmailLockedNote: "This invitation is tied to this email address.",
  inviteCreatePasswordLabel: "Create password",
  inviteConfirmPasswordLabel: "Confirm password",
  inviteSignInInsteadLink: "Already have a Wayfinder account? Sign in instead.",
  inviteAccountExistsMessage: "This email may already have a Wayfinder account. Sign in instead, or reset your password.",
  inviteSignInInsteadAction: "Sign in instead",
  inviteResetPasswordAction: "Reset password",
  invitePasswordMismatch: "Passwords do not match. Please check both password fields.",
  inviteSignupPendingTitle: "Check your email to continue",
  inviteSignupPendingBody: "We've sent a confirmation link to the invited email address. After verifying, return to the Wayfinder MHP sign-in page and sign in with the same email.",
  inviteSignupPendingResendButton: "Resend confirmation email",
  inviteSignupPendingContinueButton: "I've verified my email — continue",
  inviteSignupPendingSignInInstead: "Sign in instead",
  inviteSignupPendingResendSuccess: "If this email exists, a confirmation link has been sent. Please check your inbox.",
  inviteSignupPendingContinueWaiting: "We still cannot see a confirmed email for this account. If you just clicked the link, wait a moment and try again.",
  officialMhpSignInLink: "Go to MHP sign in",
  inviteAutoAcceptTitle: "Setting up your Mental Health Practitioner profile…",
  inviteAutoAcceptBody: "Please wait while Wayfinder prepares your profile and licence draft.",
  inviteConsumeFailedTitle: "We could not complete your invitation setup",
  inviteContinueNeedsVerifiedSession: "Please sign in with your invited verified email before continuing profile setup.",
  inviteNoActiveInviteTitle: "No active invitation found",
  inviteNoActiveInviteMessage: "No active Mental Health Practitioner invitation was found for this signed-in email.",
  inviteNoActiveInviteBody: "If you expected an invitation, sign in with the invited email or contact Wayfinder admin for a new invite link.",
  mhpSetupSignInGuidance: "Your email is verified. Sign in with the invited email address to continue Mental Health Practitioner profile setup.",
  inviteSignInNote: "Sign in with the invited email address below. After email verification, Wayfinder will match your invitation by email — you do not need to preserve the original invite tab.",
  counsellorSignInOnlyNote: "New Mental Health Practitioner (MHP) onboarding requires an invitation from Wayfinder admin.",
  inviteVerificationTitle: "Verify your email to continue profile setup",
  inviteVerificationBody: "Please confirm your email address before continuing Mental Health Practitioner profile setup. After verification, sign in at the MHP portal and Wayfinder will continue setup using your verified invited email.",
  inviteTitle: "Set up your Wayfinder Mental Health Practitioner profile",
  inviteSubtitle: "You've been invited to begin Mental Health Practitioner onboarding with Wayfinder.",
  inviteOnboardingSafetyNote: "This invitation lets you create your profile draft and upload licence details for review. It does not publish your profile or activate public access automatically.",
  inviteInvalidTitle: "Invitation link unavailable",
  inviteInvalidFallback: "This invitation link is invalid, expired, or no longer active. Please contact Wayfinder admin if you need a new invitation.",
  inviteAcceptanceUnavailable: "Invitation acceptance is not available yet. Please try again later or contact Wayfinder admin.",
  inviteConsumeFailure: "We could not accept this invitation right now. Please sign in with the invited email address and try again, or contact Wayfinder admin.",
  inviteEmailMismatch: "This invitation was issued for a different email address. Please sign in with the invited email or contact Wayfinder admin.",
  inviteAcceptedTitle: "Invitation accepted",
  inviteAcceptedMessage: "You may begin your Mental Health Practitioner profile and licence draft. Publication still requires Wayfinder review.",
  inviteCheckingMessage: "Checking your invitation…",
  inviteUseEmailLabel: "Invited email",
  inviteAdminContactFallback: "If this keeps happening, contact Wayfinder admin for support.",
  onboardingTitle: "Complete your Mental Health Practitioner profile",
  onboardingSubtitle: "Profile and licence upload are coming in the next step.",
  onboardingPortalLabel: "Mental Health Practitioner (MHP) Portal",
  editProfileNavLabel: "Edit profile",
  editProfileTitle: "Your Mental Health Practitioner profile",
  editProfileSubtitle: "Update your professional profile draft. Publication requires Wayfinder review.",
  editProfileUnavailable: "Professional profile storage is not available yet. Your MHP workspace remains available.",
  editProfileReviewNotice: "Profile publication requires Wayfinder review. Upload your licence PDF below, then extract and review draft details before submitting.",
  editProfileSaveDraft: "Save draft",
  editProfileSaving: "Saving…",
  editProfileSaved: "Draft saved",
  editProfileSaveError: "Your profile draft could not be saved right now.",
  editProfileReadOnlyNotice: "This profile is under review or published. Contact the Wayfinder administrator to request changes.",
  profileStatusLabel: "Profile status",
  membershipStatusLabel: "Membership status",
  membershipExpiresLabel: "Membership expires",
  fieldPhotoUrl: "Photo URL",
  fieldPhotoUrlLegacyNote: "Legacy optional URL. The preferred workflow is private upload and owner-reviewed portrait.",
  sourcePhotoSectionTitle: "Private source photo",
  sourcePhotoHelper: "Upload a private source photo for future Wayfinder portrait review. This image is not public, does not edit your published profile, and does not publish your portrait.",
  sourcePhotoUploadButton: "Upload source photo",
  sourcePhotoChooseFile: "Choose image",
  sourcePhotoUploading: "Uploading…",
  sourcePhotoUploaded: "Private source photo uploaded.",
  sourcePhotoUploadError: "We could not upload this photo. Please try again.",
  sourcePhotoPreviewExpired: "Preview link expired; refresh to view again.",
  sourcePhotoUnsupportedFile: "Please choose a JPG, PNG, or WebP image up to 2 MB.",
  sourcePhotoStorageUnavailable: "Private photo upload is not ready yet. Your profile draft remains available.",
  fieldFullName: "Full name",
  fieldProfessionalTitle: "Professional title",
  fieldLicenseNumber: "License / registration number",
  fieldAccreditationNumber: "Accreditation number",
  fieldIssuingBody: "Issuing body",
  fieldShortBio: "Short bio",
  fieldCountryOfOrigin: "Country of origin",
  fieldEthnicity: "Ethnicity",
  fieldEnquiryEmail: "Enquiry email",
  fieldEnquiryMobile: "Enquiry mobile",
  licenseSectionTitle: "Licence / registration document",
  licenseSectionIntro: "Upload your licence or registration certificate as a PDF. AI extraction and Wayfinder review will happen in the next step. Your PDF is private and is not shown to parents.",
  licenseUploadButton: "Upload PDF",
  licenseChooseFile: "Choose PDF",
  licenseChooseAnother: "Choose another PDF",
  licenseUploading: "Uploading…",
  licenseUploaded: "Uploaded",
  licenseUploadSuccess: "Licence document uploaded. Extraction is pending.",
  licenseUploadListTitle: "Uploaded licence documents",
  licenseUploadDuplicateHint: "Upload another document only if you are replacing or adding a newer certificate.",
  licenseUploadFailed: "Upload failed",
  licenseStorageUnavailable: "Licence upload storage is not ready yet. Your MHP workspace remains available.",
  licensePdfOnly: "Please choose a PDF file up to 10 MB.",
  licenseExtractionPending: "Extraction pending",
  licenseExtractionComingNext: "AI extraction coming next",
  licenseExtractDetails: "Extract details",
  licenseExtracting: "Extracting…",
  licenseExtractionDraftSuccess: "Draft details extracted. Please review before submitting for Wayfinder review.",
  licenseExtractionReviewTitle: "Review extracted details",
  licenseReviewIntroPrivatePdf: "Review values from your private licence PDF.",
  licenseReviewIntroAdjustOnly: "Adjust only if extraction is wrong.",
  licenseReviewIntroApplyAbove: "Apply values to the profile draft above, then save from the top form.",
  licenseReviewAdjustDetails: "Adjust extracted details",
  licenseReviewDoneAdjusting: "Done adjusting",
  licenseExtractionAccuracyWarning: "AI extraction may be inaccurate. Check names, registration numbers, issuing body, and expiry dates before submitting.",
  licenseHumanReviewRequired: "Human review required",
  licenseExtractionFailed: "Extraction failed. Please try again or contact Wayfinder support.",
  licenseExtractionTimeout: "Extraction took too long. Please try again later.",
  licenseExtractionDebugLabel: "Diagnostic",
  licenseReviewFullName: "Full name",
  licenseReviewProfessionalTitle: "Professional title / credential",
  licenseReviewIssuingBody: "Issuing body",
  licenseReviewLicenseNumber: "Licence / certificate number",
  licenseReviewAccreditationNumber: "Accreditation number",
  licenseReviewValidFrom: "Valid from",
  licenseReviewValidTo: "Valid to",
  licenseReviewRawValidityText: "Raw validity text",
  licenseApplyToProfileDraft: "Use reviewed details in my profile draft",
  licenseApplyToProfileDraftSuccess: "Reviewed details applied to your profile draft. Please save your draft.",
  licenseApplyReviewWorkflowNote: "Submit for Wayfinder review will be available after profile and licence review workflow is enabled.",
  licensePrivacyNote: "Your PDF is private and not visible to parents.",
  licenseDocumentStatusLabel: "Document status",
  licenseExtractionStatusLabel: "Extraction status",
  licenseUploadedDateLabel: "Uploaded",
  licenseDocumentsEmpty: "No licence PDF uploaded yet."
};

const PARENT_SIGNUP_INVITE = {
  parentButtonLabel: "Invite another parent",
  parentButtonTitle: "Share only the Wayfinder parent signup link. No referral tracking, journal sharing, or professional account creation.",
  counsellorButtonLabel: "Invite parents to Wayfinder",
  counsellorButtonTitle: "Share only the Wayfinder parent signup link. No referral tracking, journal sharing, or professional account creation.",
  modalTitleParent: "Invite another parent",
  modalTitleCounsellor: "Invite parents to Wayfinder",
  modalIntro: "Share the parent signup link below. This is only the Wayfinder parent entry point.",
  linkLabel: "Parent signup link",
  copyButton: "Copy link",
  copiedButton: "Link copied",
  shareButton: "Share link",
  closeButton: "Close",
  privacyNote: "No referral tracking, automatic journal sharing, professional account creation, or MHP provisioning is included.",
  shareTitle: "Join Wayfinder",
  shareText: "Create your Wayfinder parent account using this link.",
  shareUnavailable: "Copy the link below to share it manually."
};

const MENTAL_HEALTH_PROFESSIONAL_INVITE_REQUEST = {
  panelTitle: "Invite others to Wayfinder",
  panelIntro: "Share the parent signup link with parents you know. Mental Health Practitioner (MHP) colleagues must be invited by the Wayfinder administrator.",
  parentButtonLabel: "Invite parents to Wayfinder",
  parentButtonTitle: "Share only the Wayfinder parent signup link.",
  professionalButtonLabel: "Invite MHP colleagues to Wayfinder",
  professionalButtonTitle: "Prepare an admin invitation request. No public professional signup link.",
  modalTitle: "Invite MHP colleagues to Wayfinder",
  modalIntro: "Mental Health Practitioner (MHP) accounts are invitation-only. Submit this request for Wayfinder admin review. No account, invite link, or MHP access is created until admin approval.",
  fieldColleagueName: "Colleague name",
  fieldColleagueEmail: "Colleague email",
  fieldNote: "Optional note for Wayfinder admin",
  adminEmail: "ask.anything@psytec.com.sg",
  emailAdminButton: "Open email draft to Wayfinder admin",
  emailDraftNote: "Use email draft only if you also want to notify Wayfinder admin manually. Nothing is sent automatically.",
  closeButton: "Close",
  requestDraftIntro: "Wayfinder Mental Health Practitioner (MHP) invitation request",
  requestDraftFooter: "Please review and send this request to Wayfinder admin if appropriate. Admin must review before any invitation or access is created. No self-serve professional signup is available.",
  submitRequestButton: "Submit request for admin review",
  submittingRequestButton: "Submitting request…",
  submitSuccessMessage: "Request sent for Wayfinder admin review. No access has been created yet.",
  submitFailureMessage: "We could not save this request right now. You can open an email draft to Wayfinder admin instead.",
  submitUnavailableMessage: "In-app request storage is not available yet. Open an email draft to Wayfinder admin instead.",
  submitValidationMessage: "Please enter your colleague's name and email before submitting.",
  submitFallbackNote: "You can still open an email draft to Wayfinder admin if in-app submit is unavailable."
};

const OWNER_ADMIN_MHP_INVITE_REQUESTS = {
  sectionTitle: "Pending MHP colleague invite requests",
  sectionIntro: "MHP-submitted requests awaiting owner review. Approve to generate a one-time invitation link. The link does not create or publish MHP access automatically. Invitee sign-up is handled in a later step (PR #132).",
  emptyMessage: "No pending colleague invite requests right now.",
  loadErrorMessage: "We could not load pending invite requests right now.",
  unavailableMessage: "Invite request intake storage is not available yet. Apply supabase-mhp-invite-requests.sql in Supabase.",
  approvalUnavailableMessage: "Invite approval is not available yet. Apply supabase-mhp-invite-approval-token-contract.sql in Supabase.",
  requestLabel: "MHP colleague invite request",
  requesterIdLabel: "Requester Wayfinder ID",
  submittedLabel: "Submitted",
  noteLabel: "Requester note",
  readOnlyNote: "Review the colleague details, then approve to generate a one-time invitation link for manual send.",
  refreshButton: "Refresh requests",
  approveButton: "Approve and generate invite link",
  approvingButton: "Generating invite link…",
  approvalFailureMessage: "This invitation link could not be generated right now. Please try again.",
  inviteLinkLabel: "One-time invitation link",
  inviteLinkHelper: "Copy or email this link to the colleague. Links always use the public production portal (wayfinder-modular.vercel.app) so invitees are not blocked by Vercel preview login. The link is shown once here and is not stored in Wayfinder.",
  inviteSafetyNote: "This link is for invitation only. It does not activate or publish MHP access automatically.",
  copyInviteLinkButton: "Copy invite link",
  copiedInviteLinkButton: "Invite link copied",
  copyInviteLinkFailedButton: "Copy failed — select link manually",
  emailInviteButton: "Open email draft to colleague",
  inviteEmailSubject: "Wayfinder Mental Health Practitioner (MHP) invitation",
  inviteEmailIntro: "You have been invited to join Wayfinder as a Mental Health Practitioner (MHP). Use this one-time link to begin invitation sign-up when it is available. This link does not activate or publish MHP access automatically.",
  inviteExpiresLabel: "Link expires",
  inviteRouteNote: "Invite route: /counsellor.html?mhp_invite=<token> (token opens invitation page only; acceptance after verification uses verified email at /counsellor.html?mhp_setup=profile or official MHP sign-in)",
  generatedInvitesTitle: "Generated invitation links",
  generatedInvitesIntro: "Copy or email these links now. They are shown once here and are not stored in Wayfinder."
};

// PDPA / privacy notice for new signup only (UI acknowledgement - not persisted in Phase A)
const PDPA_SIGNUP_NOTICE = {
  version: "2026-06-1",
  title: "Before you create your account",
  body: "Wayfinder uses account, profile, generated Parent ID, generated Child ID, activity, and reflection information to provide the app experience, protect access, and support your parent-child reflection journey. Wayfinder does not intentionally collect precise location data or device IDs for parent reflection features. Please avoid adding names, addresses, school names, or other identifying details in reflections unless they are truly needed. Future research or learning use would require clearer notice, appropriate safeguards, and consent or another appropriate basis where required. Anonymised or de-identified learning may be used only where suitable safeguards are in place, and free-text reflections may contain identifying details if they are typed in.",
  checkboxLabel: "I have read and understood this privacy and data-use notice.",
  uncheckedMessage: "Please read the privacy and data-use notice and confirm you understand it before creating your account."
};

const SIGNUP_PRIVACY_ACKNOWLEDGEMENT = {
  title: "Privacy and data-use acknowledgement",
  body: "Wayfinder keeps a record that you have seen the current privacy and data-use notice. This helps us keep parent choice and transparency clear. It does not change your journal, Child IDs, or reflections.",
  button: "Acknowledge",
  secondaryNote: "You can keep using Wayfinder while this is shown.",
  successMessage: "Privacy acknowledgement saved.",
  failureMessage: "We could not save this acknowledgement right now. You can keep using Wayfinder and try again later.",
  fetchFailureMessage: "We could not verify your privacy acknowledgement right now. You can keep using Wayfinder and try again later.",
  retryButton: "Try again"
};

// Parent-facing static UI copy — PR #124 foundation, PR #125 expansion, PR #126 QA parity.
// Rules: en and zh-Hans keys must stay in parity; never store or translate private user content here.
const WAYFINDER_I18N = {
  en: {
    "language.label": "Language",
    "language.english": "English",
    "language.zhHans": "简体中文",
    "nav.journalTrail": "Journal trail",
    "nav.journalTrailOpen": "Open my journal trail",
    "nav.newChild": "+ New child",
    "nav.startActivity": "Start new activity",
    "nav.inviteParent": "Invite another parent",
    "nav.events": "Events",
    "nav.signOut": "Sign out",
    "nav.appVersion": "App Version",
    "nav.plans": "Plans",
    "dashboard.welcomeBack": "Welcome back",
    "dashboard.loading": "Loading your space...",
    "dashboard.pastActivities": "Past activities",
    "dashboard.pastActivitiesHelper": "Recent moments you have reflected on.",
    "dashboard.recent": "recent",
    "dashboard.noActivities": "No activities yet. Start when you are ready.",
    "dashboard.responsesUnderPressure": "Responses under pressure",
    "dashboard.discHelper": "Responses under pressure — what your child may observe.",
    "dashboard.personalisingInsight": "Personalising your insight...",
    "dashboard.addDiscHelper": "Add your DISC blend to unlock personalised insight.",
    "dashboard.yourChildren": "Your children",
    "dashboard.childrenHelper": "Each child has a generated Child ID — codes only, no names.",
    "dashboard.childSingular": "child",
    "dashboard.childrenPlural": "children",
    "dashboard.noChildren": "No children added yet. Use + New child when you are ready.",
    "dashboard.recentReflections": "Recent reflections",
    "dashboard.noReflectionsChild": "No reflections yet for this Child ID.",
    "dashboard.journal": "Journal",
    "dashboard.leanInto": "This week, lean into",
    "dashboard.leanIntoNeeds": "Possible needs to stay curious about:",
    "dashboard.optionalSupport": "Optional support",
    "dashboard.genderNotAdded": "Gender not added",
    "dashboard.ageNotAdded": "Age not added",
    "dashboard.notSaved": "Not saved",
    "relationshipGarden.title": "Your Relationship Garden",
    "relationshipGarden.helper": "Each relationship can be tended through pause, reflection, repair, and ALIGN.",
    "relationshipGarden.guideTitle": "How the garden grows",
    "relationshipGarden.guideSteps": "Seed → Sprout → Leaves → Bud → Bloom",
    "relationshipGarden.foot": "Growth here does not mean perfection. It means the relationship is being tended with more steadiness and repair.",
    "alignJourney.title": "Your ALIGN Journey",
    "alignJourney.helper": "A gentle read on where you may be practising emotional regulation through ALIGN.",
    "alignJourney.regionLabel": "Your ALIGN Journey",
    "alignJourney.emptyTitle": "Your ALIGN Journey is beginning",
    "alignJourney.emptyBody": "After you decode a few moments, Wayfinder will reflect back possible patterns in needs, CAB responses, growth practices, and next actions.",
    "alignJourney.currentFocus": "Current Focus",
    "alignJourney.recentPattern": "Recent Pattern",
    "alignJourney.growthPractice": "Growth Practice",
    "alignJourney.nextStep": "Next Step",
    "alignJourney.reassurance": "These reflections are not labels or scores. They are gentle prompts to help you notice alignment over time.",
    "decode.guidedReflection": "Guided reflection",
    "decode.title": "Decode a Moment",
    "decode.cardSubtitle": "\"My child did something and I don't know why.\"",
    "decode.cardHelper": "Pause, notice what may have been happening, and choose one steady next step.",
    "decode.start": "Start Decode",
    "decode.introLead": "Sometimes a child's behaviour is the visible part of something they cannot yet explain. This is not about finding what is wrong with your child. It is about slowing the moment down, noticing what may have been happening for them, and noticing what happened in your thinking, feelings, and behaviour.",
    "decode.realignmentTitle": "Why realignment matters",
    "decode.realignmentBody": "Stress can spill into relationships. The way we handle pressure, conflict, or urgency elsewhere can sometimes follow us home. Your child may not yet think through big emotions like an adult. Their emotional stability can strongly shape how they react in the moment. Wayfinder helps you notice where your thinking, feelings, and behaviour may need to realign with what your child was experiencing.",
    "decode.begin": "Begin",
    "decode.backToDashboard": "Back to Dashboard",
    "trail.pageTitle": "Journal trail",
    "trail.loading": "Loading your journal trail...",
    "trail.filterIntro": "Gently review reflection moments — filter without changing your records.",
    "trail.showLabel": "Show",
    "trail.filterAll": "All entries",
    "trail.filterActivity": "Activity journals",
    "trail.filterDecode": "Behaviour decodes",
    "trail.childLabel": "Child",
    "trail.childAll": "All children",
    "trail.childUnassigned": "Unassigned",
    "trail.needLabel": "Possible need",
    "trail.growthLabel": "Growth capacity",
    "trail.clearFilters": "Clear filters",
    "trail.emptyFiltered": "No entries match these filters. Clear filters to see all.",
    "trail.emptyNoEntries": "No entries yet. Your journal trail will build here as you reflect.",
    "trail.pastEntries": "Past entries",
    "trail.showing": "Showing",
    "trail.of": "of",
    "trail.entrySingular": "entry",
    "trail.entryPlural": "entries",
    "trail.emotionalPatterns": "Your emotional patterns",
    "trail.emotionalPatternsHelper": "Words that show up most in your reflections."
  },
  "zh-Hans": {
    "language.label": "语言",
    "language.english": "English",
    "language.zhHans": "简体中文",
    "nav.journalTrail": "反思记录",
    "nav.journalTrailOpen": "打开我的反思记录",
    "nav.newChild": "+ 添加孩子",
    "nav.startActivity": "开始新活动",
    "nav.inviteParent": "邀请另一位家长",
    "nav.events": "活动",
    "nav.signOut": "退出登录",
    "nav.appVersion": "版本更新",
    "nav.plans": "方案",
    "dashboard.welcomeBack": "欢迎回来",
    "dashboard.loading": "正在加载您的空间…",
    "dashboard.pastActivities": "过往活动",
    "dashboard.pastActivitiesHelper": "您最近反思过的时刻。",
    "dashboard.recent": "近期",
    "dashboard.noActivities": "还没有活动记录。准备好了就可以开始。",
    "dashboard.responsesUnderPressure": "压力下的反应",
    "dashboard.discHelper": "压力下的反应——您的孩子可能会观察到些什么。",
    "dashboard.personalisingInsight": "正在为您定制洞察…",
    "dashboard.addDiscHelper": "添加您的 DISC 组合，以解锁更个性化的洞察。",
    "dashboard.yourChildren": "您的孩子",
    "dashboard.childrenHelper": "每个孩子都有一个系统生成的 Child ID——只显示代码，不显示姓名。",
    "dashboard.childSingular": "孩子",
    "dashboard.childrenPlural": "孩子",
    "dashboard.noChildren": "还没有添加孩子。准备好了可以点「+ 添加孩子」。",
    "dashboard.recentReflections": "近期反思",
    "dashboard.noReflectionsChild": "这个 Child ID 还没有反思记录。",
    "dashboard.journal": "记录反思",
    "dashboard.leanInto": "本周，不妨多留意",
    "dashboard.leanIntoNeeds": "可以一起探索的可能需求：",
    "dashboard.optionalSupport": "可选支持",
    "dashboard.genderNotAdded": "未填写性别",
    "dashboard.ageNotAdded": "未填写年龄",
    "dashboard.notSaved": "未保存",
    "relationshipGarden.title": "您的关系花园",
    "relationshipGarden.helper": "每段关系都可以通过暂停、反思、修复和 ALIGN 来悉心照料。",
    "relationshipGarden.guideTitle": "花园如何成长",
    "relationshipGarden.guideSteps": "种子 → 新芽 → 叶片 → 花苞 → 盛开",
    "relationshipGarden.foot": "这里的成长不代表完美，而是表示这段关系正被更稳定地照料与修复。",
    "alignJourney.title": "您的 ALIGN 历程",
    "alignJourney.helper": "温和地回看您正在通过 ALIGN 练习情绪调节的地方。",
    "alignJourney.regionLabel": "您的 ALIGN 历程",
    "alignJourney.emptyTitle": "您的 ALIGN 历程刚刚开始",
    "alignJourney.emptyBody": "当您解读几个时刻后，Wayfinder 会温和地呈现需求、CAB 反应、成长练习和下一步行动中的可能模式。",
    "alignJourney.currentFocus": "当前关注点",
    "alignJourney.recentPattern": "近期模式",
    "alignJourney.growthPractice": "成长练习",
    "alignJourney.nextStep": "下一步",
    "alignJourney.reassurance": "这些反思不是标签或分数，而是帮助您随时间留意对齐情况的温和提示。",
    "decode.guidedReflection": "引导式反思",
    "decode.title": "解读一个时刻",
    "decode.cardSubtitle": "「孩子做了一件事，我不确定背后的原因。」",
    "decode.cardHelper": "先慢下来，留意可能发生了什么，并选择一个稳妥的下一步。",
    "decode.start": "开始解读",
    "decode.introLead": "有时，孩子的行为可能是他们尚无法表达的内在需要的外在表现。这不是为了找出孩子哪里不对，而是为了慢下来，留意他们身上可能发生了什么，也留意您自己的思维、感受和行动中发生了什么。",
    "decode.realignmentTitle": "为什么重新对齐很重要",
    "decode.realignmentBody": "压力可能会带进关系中。我们在其他地方应对压力、冲突或紧迫感的方式，有时也会跟着我们回家。孩子也许还不能像成年人一样梳理强烈情绪。当下的情绪稳定程度可能会影响他们的反应。Wayfinder 帮助您留意，自己的思维、感受和行为可能需要在哪里与孩子正在经历的事情重新对齐。",
    "decode.begin": "开始",
    "decode.backToDashboard": "返回首页",
    "trail.pageTitle": "反思记录",
    "trail.loading": "正在加载您的反思记录…",
    "trail.filterIntro": "温和地回顾反思时刻——筛选不会改变您的记录。",
    "trail.showLabel": "显示",
    "trail.filterAll": "全部记录",
    "trail.filterActivity": "活动日记",
    "trail.filterDecode": "解读记录",
    "trail.childLabel": "孩子",
    "trail.childAll": "全部孩子",
    "trail.childUnassigned": "未分配",
    "trail.needLabel": "可能的需求",
    "trail.growthLabel": "成长能力",
    "trail.clearFilters": "清除筛选",
    "trail.emptyFiltered": "没有符合这些筛选的记录。清除筛选即可查看全部。",
    "trail.emptyNoEntries": "还没有记录。随着您反思，反思记录会在这里慢慢积累。",
    "trail.pastEntries": "过往记录",
    "trail.showing": "显示",
    "trail.of": "/",
    "trail.entrySingular": "条记录",
    "trail.entryPlural": "条记录",
    "trail.emotionalPatterns": "您的常见情绪线索",
    "trail.emotionalPatternsHelper": "在您的反思中较常出现的词语。"
  }
};

// PR #126: lightweight runtime parity check (static UI keys only).
if(typeof window!=='undefined'){
 try{
  if(window.localStorage&&window.localStorage.getItem('wayfinder_debug_auth')==='1'){
   const enKeys=Object.keys(WAYFINDER_I18N.en||{});
   const zhKeys=Object.keys(WAYFINDER_I18N['zh-Hans']||{});
   const missingZh=enKeys.filter(k=>!zhKeys.includes(k));
   const missingEn=zhKeys.filter(k=>!enKeys.includes(k));
   if(missingZh.length||missingEn.length){
    console.warn('[Wayfinder i18n] dictionary parity mismatch', {missingZh,missingEn});
   }
  }
 }catch(_err){}
}

// Export everything
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BRAND,
    PHASES,
    ACTIVITIES,
    ACTIVITY_PRACTICE_CATALOG,
    getActivityPracticeByLabel,
    getActivityPracticeById,
    ACTIVITY_EVENTS_PAGE,
    PARENT_REVIEW_SHARING,
    PARENT_COUNSELLOR_FEEDBACK,
    COUNSELLOR_REVIEW_SHARING,
    COUNSELLOR_EVENTS_HOSTING,
    HOSTED_ACTIVITY_EVENTS,
    ALIGN_STAGE_LABELS,
    enrichHostedActivityEvent,
    getEnrichedHostedActivityEvents,
    MARKERS,
    CAB_FIELDS,
    VALUE_GROUPS,
    SHIFT_WORDS,
    CHILD_NEEDS_WORDS,
    CULTURE,
    UI_TEXT,
    APP_VERSION_PAGE,
    WAYFINDER_DASHBOARD_POLISH,
    WAYFINDER_PLANS_PAGE,
    WAYFINDER_APP_VERSIONS,
    PDPA_SIGNUP_NOTICE,
    SIGNUP_PRIVACY_ACKNOWLEDGEMENT,
    MENTAL_HEALTH_PROFESSIONAL_ONBOARDING,
    PARENT_SIGNUP_INVITE,
    MENTAL_HEALTH_PROFESSIONAL_INVITE_REQUEST,
    OWNER_ADMIN_MHP_INVITE_REQUESTS,
    WAYFINDER_I18N
  };
}
