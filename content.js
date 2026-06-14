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

  genderOptions: ["Prefer not to say", "Male", "Female", "Non-binary"]
};

// Export everything
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BRAND,
    PHASES,
    ACTIVITIES,
    MARKERS,
    CAB_FIELDS,
    VALUE_GROUPS,
    SHIFT_WORDS,
    CHILD_NEEDS_WORDS,
    CULTURE,
    UI_TEXT
  };
}
