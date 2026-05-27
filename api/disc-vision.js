export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, imageMediaType } = req.body || {};
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

  const systemPrompt = `You are analyzing a DISC behavioural profile image.

Your task is to extract the approximate bar heights for D, I, S, and C as integer percentages from 0 to 100.

Rules:
- Return only JSON.
- Use keys: D, I, S, C.
- If a value cannot be reliably extracted, return null for that key.
- If there are multiple DISC graphs and labels are unclear, do not guess. Return null values.
- If there is a clearly labelled Natural Style, Perceived Style, or Most-like-me graph, extract that graph.
- If only one clear graph is present, extract that graph.
- Do not interpret personality.
- Do not provide advice.
- Do not add explanation.

Example:
{"D":72,"I":45,"S":30,"C":68}`;

  try {
    const model = process.env.ANTHROPIC_VISION_MODEL;
    if (!model) {
      return res.status(500).json({
        error: 'Vision extraction failed',
        detail: 'ANTHROPIC_VISION_MODEL is not configured'
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        // TODO: Set ANTHROPIC_VISION_MODEL to a verified Anthropic vision-capable model available in this account.
        model,
        max_tokens: 200,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [{
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageMediaType || 'image/png',
              data: imageBase64
            }
          }, {
            type: 'text',
            text: 'Extract the DISC bar heights. Return only JSON.'
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Vision extraction failed',
        detail: data?.error?.message || 'Anthropic API error'
      });
    }

    const text = data.content?.[0]?.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const bars = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    const clean = (value) => Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
    const cleanBars = {
      D: clean(bars.D),
      I: clean(bars.I),
      S: clean(bars.S),
      C: clean(bars.C)
    };

    res.status(200).json({ bars: cleanBars });
  } catch (err) {
    res.status(500).json({
      error: 'Vision extraction failed',
      detail: err.message
    });
  }
}
