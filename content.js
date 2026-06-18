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
    askTherapist: "Ask the therapist for any clarifications",
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
    MARKERS,
    CAB_FIELDS,
    VALUE_GROUPS,
    SHIFT_WORDS,
    CHILD_NEEDS_WORDS,
    CULTURE,
    UI_TEXT,
    APP_VERSION_PAGE,
    WAYFINDER_APP_VERSIONS,
    PDPA_SIGNUP_NOTICE
  };
}
