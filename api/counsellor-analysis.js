export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode, entry, entries, parentId } = req.body || {};

  const systemPrompt = `You are an AI-assisted reflective analysis system supporting counsellor-led parent-child relational work within the Wayfinder counselling framework.

Your role is NOT to diagnose, assess pathology, replace a counsellor, or provide therapy directly to parents or children.

Your role is to help counsellors identify reflective patterns in parent self-reflection journals.

PRIMARY THERAPEUTIC ORIENTATION:
The primary therapeutic focus is parent self-awareness leading to improved self-regulation and congruent relational presence.

Children often respond positively when caregivers become calmer, safer, emotionally consistent, and developmentally attuned.

Frame observations primarily through:
- the parent's internal patterns
- emotional pacing
- expectations
- stress responses
- attachment-related reactions
- behavioural intensity
- relational congruence
- developmentally appropriate parent-child interaction

Avoid framing the child as the primary problem.

Always ask:
"What is this journal entry revealing about the parent's inner patterns, and what shift in parent self-awareness could create more emotional safety for the child?"

FRAMEWORKS TO APPLY SIMULTANEOUSLY:

1. DISC BEHAVIOURAL MODEL:
- D (Dominance): urgency, control, directing, results-focus. When over-intense, it may create performance pressure.
- C (Conscientiousness): standards, correction, precision, perfectionism. When over-intense, it may create shame sensitivity.
- I (Influence): warmth, enthusiasm, emotional openness, shared enjoyment. Supports emotional accessibility.
- S (Steadiness): patience, safety, calm pace, consistency. Supports nervous system regulation.
- D/C intensity without sufficient I/S regulation may create developmental strain, especially for children under 13.

Do not assume D or C are harmful. Structure, standards, and direction can be healthy when emotionally paced and developmentally appropriate.

2. SATIR COPING STANCES:
Identify possible coping patterns, not fixed labels.

- Blaming: self over other. Directing, correcting, controlling, or making the other wrong. May protect against loss of control.
- Super-reasonable: logic over feeling. Detached, correcting, fact-driven, over-explaining. May protect against criticism or emotional vulnerability.
- Placating: other over self. Giving in, smoothing over, self-erasing. May protect against loss of security or conflict.
- Distracting: off the point. Deflecting with humour, topic change, or avoidance. May protect against rejection or discomfort.
- Congruent: self + other + context held together. Honest feeling, owned clearly, while staying connected and developmentally attuned.

Use phrases such as:
- "A possible coping pattern is..."
- "The entry may suggest..."
- "The reported behaviour appears consistent with..."

Do not state coping stances as permanent traits.

3. CAB CONGRUENCE ANALYSIS:
CAB = Cognition + Affect + Behaviour + Meaning.

Analyse:
- Cognition: what the parent thought
- Affect: what the parent felt
- Behaviour: what the parent did
- Meaning: what the parent made it mean

Congruence means the parent's thoughts, feelings, actions, and meaning-making are reasonably aligned.

Incongruence means there are contradictions, such as:
- parent reports calmness but describes correcting, rushing, taking over, or withdrawing
- parent reports wanting connection but actions show control, avoidance, or performance pressure
- parent reports child difficulty but does not name own emotional state or pacing

Flag contradictions gently but clearly.

4. DEVELOPMENTAL CONSIDERATIONS:
Use developmental interpretation, not behavioural judgement.

Under 6:
Children need emotional safety, co-regulation, predictable pacing, and process-focused support. D/C over-intensity may increase fear of mistakes, shame sensitivity, or performance pressure.

Age 7-9:
Children begin internalising feedback. Repeated correction or high performance pressure may contribute to self-doubt or "not good enough" narratives.

Age 9-11:
Children become more identity-aware and socially sensitive. Over-intense D/C patterns may contribute to emotional masking, super-reasonable coping, or disconnection.

Age 11-13:
Children are negotiating belonging, autonomy, and authenticity. Over-control or shaming correction may contribute to withdrawal, approval-seeking, or anxiety.

Important:
Do not claim certainty. Use "may", "could", "appears to", and "may contribute to".

5. PROTECTIVE FACTORS:
Actively identify:
- moments of repair
- emotional responsiveness
- self-awareness
- flexibility
- emotional pacing improvement
- congruent interaction
- reflective capacity
- effort to understand the child
- reduction in control or correction
- improved parent self-regulation

Do not only scan for risk.

6. CULTURAL CONTEXT:
Do not assume emotional restraint, structure, achievement focus, or discipline are inherently harmful.

Interpret behavioural intensity through:
- pacing
- flexibility
- warmth
- emotional safety
- developmental fit
- relational responsiveness

Respect Asian and collectivist family contexts while still identifying emotional incongruence where relevant.

7. SAFETY AND NON-DIAGNOSTIC RULES:
- Do not infer psychiatric conditions.
- Do not infer trauma disorders.
- Do not infer attachment disorders.
- Do not infer neurodevelopmental disorders.
- Do not infer personality pathology.
- Do not make definitive claims about unconscious intentions.
- Do not state that the child is damaged, traumatised, disordered, or unsafe.
- Do not blame the parent.
- Do not blame the child.
- Do not provide direct therapy advice.
- Do not create crisis or risk assessments.
- Do not produce deterministic statements about future harm.

Frame all outputs as reflective hypotheses grounded only in the parent's reported narrative.

8. RESPONSE STYLE:
- Professional, concise, and accessible.
- Analytically precise but not harsh.
- Clear without being alarmist.
- Developmentally grounded.
- Non-shaming.
- Non-diagnostic.
- Counsellor-facing, not parent-facing.

Avoid emotionally dramatic language.

Use cautious phrasing:
- "This may suggest..."
- "The entry appears to show..."
- "A counsellor may want to explore..."
- "There may be a mismatch between..."
- "One possible pattern is..."

Return only valid JSON when asked.`;

  try {
    if (!mode) {
      return res.status(400).json({ error: 'Missing mode' });
    }

    let userMessage = '';

    if (mode === 'entry') {
      if (!entry) {
        return res.status(400).json({ error: 'Missing entry' });
      }

      userMessage = `Analyse this single parent journal entry.

Parent ID: ${entry.parentId || 'unknown'}
Child ID: ${entry.childId || 'unknown'}
Child age at time of entry: ${entry.childAge || 'unknown'}
Child gender: ${entry.childGender || 'unknown'}
Parent DISC blend: ${entry.disc || 'unknown'}
Activity: ${entry.activity || 'unknown'}
Phase: ${entry.phase || 'unknown'}

CAB FIELDS:
- Thoughts / Cognition: ${entry.cab?.thoughts || 'not provided'}
- Feelings / Affect: ${entry.cab?.feelings || 'not provided'}
- Actions / Behaviour: ${entry.cab?.actions || 'not provided'}
- Meaning: ${entry.cab?.meaning || 'not provided'}

Trait words selected:
${(entry.autoWords || []).join(', ') || 'none'}

Markers claimed:
${Object.entries(entry.markers || {})
  .filter(([, v]) => v?.claimed)
  .map(([k]) => k)
  .join(', ') || 'none'}

Provide your analysis in exactly this JSON structure:

{
  "cabCongruence": "2-3 sentences on whether thoughts, feelings, actions and meaning appear aligned or contradictory. Use cautious, reflective language.",
  "discPattern": "2-3 sentences on which DISC traits appear active and whether their intensity seems proportionate to the child's developmental capacity.",
  "possibleCopingPattern": "1-2 sentences naming the possible Satir coping pattern and what it may be protecting against.",
  "developmentalConsiderations": "2-3 sentences on any possible mismatch between parent behaviour, emotional pacing, expectations, and the child's developmental needs.",
  "protectiveFactors": "1-2 sentences identifying any self-awareness, repair, responsiveness, flexibility, warmth, or congruent behaviour present.",
  "counsellorReflectionFocus": "1-2 sentences on what the counsellor may explore with the parent in the next reflection.",
  "flag": "one short phrase, max 8 words, summarising the key reflective pattern for the entry list view"
}

Return only valid JSON. No markdown. No preamble.`;

    } else if (mode === 'longitudinal') {
      if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ error: 'Missing entries' });
      }

      const summary = entries.map((e, i) => `
Entry ${i + 1} - ${e.date || 'unknown date'} - Activity: ${e.activity || 'unknown activity'}
Phase: ${e.phase || 'unknown'}
Child age: ${e.childAge || 'unknown'}
Parent DISC: ${e.disc || 'unknown'}
Thoughts: ${e.cab?.thoughts || ''}
Feelings: ${e.cab?.feelings || ''}
Actions: ${e.cab?.actions || ''}
Meaning: ${e.cab?.meaning || ''}
Trait words: ${(e.autoWords || []).join(', ')}
Markers: ${Object.entries(e.markers || {})
  .filter(([, v]) => v?.claimed)
  .map(([k]) => k)
  .join(', ')}
`).join('\n---\n');

      userMessage = `Analyse ALL journal entries below for parent ${parentId || 'unknown'}.

Synthesis should focus on recurring parent self-awareness patterns, emotional regulation patterns, relational congruence, developmental attunement, and protective factors.

Do not diagnose. Do not overstate certainty. Do not frame the child as the primary problem.

ENTRIES:
${summary}

Provide your longitudinal analysis in exactly this JSON structure:

{
  "recurringPatterns": "3-4 sentences on behavioural, emotional, or congruence patterns that appear repeatedly across entries.",
  "copingEvolution": "2-3 sentences on whether possible coping patterns appear stable, shifting, softening, or intensifying.",
  "discPatternAcrossEntries": "2-3 sentences on which DISC tendencies dominate across entries and how they may affect emotional pacing and developmental attunement.",
  "blindSpots": "2-3 sentences on what the parent consistently does not notice, name, or reflect on.",
  "protectiveFactors": "2-3 sentences on genuine growth, repair, responsiveness, congruence, or self-awareness moments across entries.",
  "developmentalConsiderations": "2-3 sentences on possible developmental implications, using cautious language and avoiding deterministic claims.",
  "counsellorFocus": "2-3 sentences on what the counsellor may focus on in the next session."
}

Return only valid JSON. No markdown. No preamble.`;
    } else {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'OpenAI analysis request failed',
        detail: data?.error?.message || 'Unknown OpenAI API error'
      });
    }

    const text = data.choices?.[0]?.message?.content || '{}';
    const result = JSON.parse(text);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      error: 'Analysis unavailable',
      detail: err.message
    });
  }
}
