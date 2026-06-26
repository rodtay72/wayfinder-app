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
  title: "Share for Mental Health Professional review",
  subtitle: "You choose which journal or Decode entries a Mental Health Professional may review. Sharing is time-limited and you can revoke access.",
  setupUnavailable: "Mental Health Professional review sharing is not ready yet. The database setup still needs to be completed.",
  counsellorSelectLabel: "Choose your Mental Health Professional",
  counsellorSelectPlaceholder: "Select a practitioner…",
  counsellorSelectLoading: "Loading practitioners…",
  counsellorSelectHint: "Only verified Wayfinder Mental Health Professionals appear here. Your practitioner may share their Wayfinder ID with you if needed.",
  noCounsellorsAvailable: "No Mental Health Professionals are available for review sharing yet. Please contact your Wayfinder administrator.",
  counsellorRequired: "Please choose a Mental Health Professional before sharing.",
  consentExpiryNotice: "Shared access lasts 30 days unless you revoke it earlier.",
  consentVersion: "2026-06-1",
  consentTitle: "Consent to share selected reflections",
  consentBody: "I understand that the selected journal and Decode reflections may be read by the Mental Health Professional I identify for up to 30 days. These reflections are for ALIGN/CAB review support — not child diagnosis, behaviour labelling, or scoring. I may revoke access before expiry.",
  consentCheckbox: "I consent to share the selected entries under these terms.",
  selectEntriesLabel: "Select entries to share",
  previewLabel: "What will be shared",
  grantExpiryDays: 30,
  grantButton: "Grant review access",
  revokeButton: "Revoke access",
  activeGrantsTitle: "Active review access",
  emptyGrants: "No active counsellor review access. Select entries above when you are ready to share.",
  grantCreated: "Review access granted. Your counsellor may now open only the entries you selected.",
  grantRevoked: "Review access revoked.",
  grantError: "We could not complete review sharing. Please try again or choose a different counsellor.",
  counsellorNotFound: "The selected counsellor could not be found.",
  noEntriesSelected: "Select at least one entry to share.",
  consentRequired: "Please confirm consent before sharing.",
  privacyNote: "Only selected reflection content is shared — never your email, tokens, or full journal history.",
  entryActionLabel: "Share this reflection for review",
  dashboardActionLabel: "Share for counsellor review",
  dashboardCardTitle: "Share for counsellor review",
  dashboardCardSubtitle: "Choose saved journal or Decode entries to share with your counsellor for time-limited ALIGN/CAB review. You preview exactly what will be shared before giving consent.",
  dashboardCardButton: "Open sharing in Journal Trail",
  postSaveButtonLabel: "Share this reflection for counsellor review",
  postSaveHelper: "Preview what will be shared and give consent in Journal Trail.",
  previewTypeActivity: "Activity journal",
  previewTypeDecode: "Decode a Moment",
  entryNotShareable: "This saved entry cannot be shared yet. Newer entries from Journal Trail can be shared for review.",
  browseTrailLink: "View full journal trail",
  shareModeIntro: "Choose entries, preview what will be shared, select your counsellor, and confirm consent."
};

const PARENT_COUNSELLOR_FEEDBACK = {
  notificationTitle: "Counsellor feedback to review",
  notificationSubtitle: "Your counsellor has shared a contextual reflection on entries you chose to share. This is for your private parent-development use.",
  notificationBadgeSingular: "1 unread reflection",
  notificationBadgePlural: " unread reflections",
  openFeedbackButton: "Read counsellor feedback",
  readerTitle: "Counsellor feedback",
  readerIntro: "This reflection relates only to the Wayfinder entries you chose to share. It is not a diagnosis of you or your child.",
  counsellorLabelPrefix: "Counsellor",
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
  unavailable: "Counsellor feedback is not available yet. Your journal and shared reflections remain unchanged.",
  detailUnavailable: "This counsellor feedback could not be loaded right now.",
  entryLockNotice: "This reflection has been locked because counsellor feedback has been published or read. This preserves the original context of the shared review.",
  entryLockedShareNote: "This entry is locked for review integrity and cannot be shared again.",
  sharedEntryFallbackLabel: "Shared reflection",
  feedbackLibraryTitle: "Counsellor feedback",
  feedbackLibrarySubtitle: "Feedback your counsellor has shared on entries you chose to share.",
  feedbackLibraryEmpty: "No counsellor feedback has been shared yet.",
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
  responseComposerUnavailable: "Counsellor response storage is not available yet. Existing grant review remains available.",
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
    askTherapist: "Share this reflection for counsellor review",
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
    cultureHint: "Helps your counsellor offer culturally-attuned reflections."
  },

  decode: {
    privacyNudge: "Keep names and identifying details out. Use your child's Child ID or a simple description of what happened.",
    counsellorReminder: "This reflection is a starting point. If this pattern repeats or feels difficult to understand, consider reviewing it with a counsellor."
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
const APP_VERSION_PAGE = {
  title: "App Version",
  subtitle: "A parent-facing record of Wayfinder updates, privacy reminders, and planned improvements.",
  releasedHeading: "Recent updates",
  plannedHeading: "Planned",
  reassurance: "These notes help you understand what may have changed and what is coming next. They are not labels, scores, or clinical assessments.",
  workflowNote: "Wayfinder updates this page when parent-facing improvements are released. Future research or data use will always be explained with clear notice, consent, and privacy safeguards."
};

const WAYFINDER_APP_VERSIONS = [
  {
    id: "v0-4-1-mhp-onboarding-invite",
    version: "v0.4.1",
    date: "June 2026",
    status: "released",
    tag: "Professional workspace",
    title: "Mental Health Professional onboarding and invite flow",
    body: "Parent invite sharing is clearer — you can share a parent signup link from your dashboard when you want another parent to join Wayfinder. Mental Health Professional accounts remain invitation and administrator controlled; there is no public professional signup. The professional profile review flow is safer and clearer, with details shown for review before you adjust or save. Parent and Mental Health Professional mobile shortcuts now have separate home-screen names so each portal installs with the right entry point.",
    parentAction: "Use Invite another parent on your dashboard if helpful. If you are a Mental Health Professional colleague, use the admin-mediated invite request in the professional workspace — Wayfinder will guide you to contact the administrator."
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
    id: "upcoming-privacy-reminder",
    version: "Upcoming",
    date: "Planned",
    status: "planned",
    tag: "Privacy reminder",
    title: "Reflection privacy reminder",
    body: "Wayfinder uses generated Parent IDs and Child IDs in the app interface. When writing reflections, avoid adding names or identifying details unless they are truly needed.",
    parentAction: "Keep reflections focused on what happened, what you noticed, and what you may try next."
  },
  {
    id: "upcoming-pdpa-consent",
    version: "Upcoming",
    date: "Planned",
    status: "planned",
    tag: "Privacy and consent",
    title: "Clearer PDPA and research-use notice",
    body: "We are planning clearer consent and research-use notices before registration, so parents can understand what may be used, what is not used, and how anonymised or de-identified learning may support future improvements.",
    parentAction: "We will keep privacy, clarity, and parent choice at the centre."
  },
  {
    id: "upcoming-security-review",
    version: "Upcoming",
    date: "Planned",
    status: "planned",
    tag: "Security review",
    title: "HIPAA and security-readiness review",
    body: "We are reviewing what additional safeguards would be needed if Wayfinder is used in healthcare or counselling contexts that require HIPAA or HIPAA-aligned protection. This is a readiness review, not a compliance claim.",
    parentAction: "Security, privacy, and appropriate access controls will remain part of future planning."
  },
  {
    id: "upcoming-research",
    version: "Upcoming",
    date: "Planned",
    status: "planned",
    tag: "Future research",
    title: "Future parent reflection research",
    body: "Wayfinder may later support research into parent reflection, emotional regulation, and repair. Any such use should be explained clearly, use anonymised or de-identified learning where appropriate, and respect parent choice.",
    parentAction: "Future research features should be introduced with clear notice, consent, and privacy safeguards."
  }
];

const MENTAL_HEALTH_PROFESSIONAL_ONBOARDING = {
  forgotPasswordLink: "Forgot password?",
  forgotPasswordTitle: "Reset your password",
  forgotPasswordPrompt: "Enter the email you used for Wayfinder. If an account exists, we will send a password reset link.",
  forgotPasswordSubmit: "Send reset link",
  forgotPasswordSuccess: "If an account exists, we will send a password reset link.",
  forgotPasswordBack: "Back to sign in",
  inviteTitle: "You've been invited as a Mental Health Professional",
  inviteSubtitle: "Sign in or create an account using the email address your invitation was sent to.",
  inviteSignInNote: "Use the invited email address. Your invite link has been received — you do not need to enter it again.",
  onboardingTitle: "Complete your Mental Health Professional profile",
  onboardingSubtitle: "Profile and licence upload are coming in the next step.",
  onboardingPortalLabel: "Mental Health Professional Portal",
  editProfileNavLabel: "Edit profile",
  editProfileTitle: "Mental Health Professional profile",
  editProfileSubtitle: "Update your professional profile draft. Publication requires Wayfinder review.",
  editProfileUnavailable: "Professional profile storage is not available yet. Your counsellor workspace remains available.",
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
  licenseStorageUnavailable: "Licence upload storage is not ready yet. Your counsellor workspace remains available.",
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
  privacyNote: "No referral tracking, automatic journal sharing, professional account creation, or counsellor provisioning is included.",
  shareTitle: "Join Wayfinder",
  shareText: "Create your Wayfinder parent account using this link.",
  shareUnavailable: "Copy the link below to share it manually."
};

const MENTAL_HEALTH_PROFESSIONAL_INVITE_REQUEST = {
  panelTitle: "Invite others to Wayfinder",
  panelIntro: "Share the parent signup link with parents you know. Mental Health Professional colleagues must be invited by the Wayfinder administrator.",
  parentButtonLabel: "Invite parents to Wayfinder",
  parentButtonTitle: "Share only the Wayfinder parent signup link.",
  professionalButtonLabel: "Invite counsellors to Wayfinder",
  professionalButtonTitle: "Prepare an admin invitation request. No public professional signup link.",
  modalTitle: "Invite counsellors to Wayfinder",
  modalIntro: "Mental Health Professional accounts are created by Wayfinder administrator invitation only.",
  modalAdminNote: "There is no public counsellor or Mental Health Professional signup link. Use the fields below to prepare a request message for the Wayfinder administrator. This does not create an account, send an invitation, create an invite token, or provision another professional.",
  fieldColleagueName: "Colleague name",
  fieldColleagueEmail: "Colleague email",
  fieldNote: "Optional note for Wayfinder admin",
  copyRequestButton: "Copy request message",
  copiedRequestButton: "Request message copied",
  emailAdminButton: "Email Wayfinder admin",
  closeButton: "Close",
  requestDraftIntro: "Wayfinder Mental Health Professional invitation request",
  requestDraftFooter: "Please review and ask the Wayfinder administrator to send an invitation to this colleague if appropriate. No self-serve professional signup is available."
};

// PDPA / privacy notice for new signup only (UI acknowledgement - not persisted in Phase A)
const PDPA_SIGNUP_NOTICE = {
  version: "2026-06-1",
  title: "Before you create your account",
  body: "Wayfinder uses account, profile, generated Parent ID, generated Child ID, activity, and reflection information to provide the app experience, protect access, and support your parent-child reflection journey. Wayfinder does not intentionally collect precise location data or device IDs for parent reflection features. Please avoid adding names, addresses, school names, or other identifying details in reflections unless they are truly needed. Future research or learning use would require clearer notice, appropriate safeguards, and consent or another appropriate basis where required. Anonymised or de-identified learning may be used only where suitable safeguards are in place, and free-text reflections may contain identifying details if they are typed in.",
  checkboxLabel: "I have read and understood this privacy and data-use notice.",
  uncheckedMessage: "Please read the privacy and data-use notice and confirm you understand it before creating your account."
};

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
    WAYFINDER_APP_VERSIONS,
    PDPA_SIGNUP_NOTICE,
    MENTAL_HEALTH_PROFESSIONAL_ONBOARDING,
    PARENT_SIGNUP_INVITE,
    MENTAL_HEALTH_PROFESSIONAL_INVITE_REQUEST
  };
}
