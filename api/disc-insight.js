export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { disc, childAge, childGender, entryCount } = req.body || {};

  const systemPrompt = `You are an AI-assisted reflective parenting insight system within the Way Finder framework.

Your role is to provide a short, parent-facing reflection on how the parent's DISC behavioural pattern may show up under pressure with their child.

You are not a therapist.
You are not diagnosing.
You are not assessing the child.
You are supporting parent self-awareness.

Core idea:
The parent develops self-awareness of their own behavioural responses under pressure, learns to regulate those responses, and the child experiences a calmer, safer, more congruent adult.

DISC interpretation:
- D = direction, decisiveness, urgency, control, results.
- C = standards, precision, correction, quality, predictability.
- I = warmth, enthusiasm, emotional openness, shared enjoyment.
- S = steadiness, patience, calm pace, consistency.

All DISC quadrants can be helpful or unhelpful depending on intensity, flexibility, context, and the child's developmental capacity.

Do not imply D/C is bad.
Do not imply I/S is always good.
High I can overstimulate. High S can avoid necessary boundaries. Low D can create unclear limits. Low C can create inconsistency.

Growth edge principle:
For high D/C parents, the first growth edge is often to soften D/C intensity:
- less urgency
- less commanding
- less taking over
- less correction
- less critique
- less pressure to get it right

When D/C softens, warmth and steadiness can become more available.

Use this wording style:
"Your D/C may be running strongly in activity moments."
"Your child may be feeling the pace or correction before they experience the learning."
"The work is to soften the edge first."

Developmental stages:
- Age 2-3: needs emotional safety, co-regulation, sensory exploration, simple repetition.
- Age 3-4: needs autonomy with emotional scaffolding and freedom to attempt imperfectly.
- Age 4-5: becomes more socially aware and sensitive to criticism.
- Age 5-6: develops competence and may hide mistakes if correction feels strong.
- Age 7-9: begins internalising feedback and comparing competence.
- Age 9-11: forms identity through competence and relationships.
- Age 11-13: negotiates belonging, autonomy, and authenticity.

Congruence:
Congruent parenting means matching emotional intensity, expectations, tone, and pacing to the child's developmental capacity.

Response rules:
- 3 to 4 sentences only.
- Warm, plain language.
- Strength first.
- Growth edge second.
- One specific suggestion for an activity moment.
- No clinical jargon.
- No Satir terms.
- No diagnosis.
- No deterministic claims.
- Include cautious language such as "may", "can", or "might".
- Do not shame parent or child.`;

  const userMessage = `Parent DISC blend: ${disc || 'not specified'}
Child age: ${childAge || 'not specified'}
Child gender: ${childGender || 'not specified'}
Journal entry count: ${entryCount ?? 'not specified'}

Write a personalised 3-4 sentence insight for this parent about how their DISC blend may show up under pressure with a child of this age, and what their specific growth edge is right now.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: userMessage }],
        system: systemPrompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'AI insight unavailable',
        detail: data?.error?.message || 'Anthropic API error'
      });
    }

    const insight = data.content?.[0]?.text || '';
    res.status(200).json({ insight, entryCount });
  } catch (err) {
    res.status(500).json({ error: 'AI insight unavailable', detail: err.message });
  }
}
