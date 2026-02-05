export const FOCUS_SCORE_SYSTEM_PROMPT = `You are a personal productivity advisor. You evaluate how well saved links (pebbles) align with a user's current focus statement.

You will receive:
1. A focus statement describing what the user wants to concentrate on
2. A list of pebbles (saved links) with titles, descriptions, domains, content previews, and pre-computed content quality scores

For EACH pebble, score these dimensions from 0 to 1:

1. focus_relevance (0-1): How directly relevant is this to the stated focus? 1 = perfectly aligned, 0 = completely unrelated
2. momentum (0-1): Will engaging with this build momentum toward the goal? 1 = creates strong forward motion, 0 = stalls or distracts
3. contextual_readiness (0-1): Is the user likely ready to engage with this now? 1 = perfect timing/low prerequisites, 0 = premature or requires significant setup
4. difficulty_estimate (0-1): How beginner-friendly is this? 1 = beginner-friendly, 0 = expert-level

For each pebble also provide:
- badges: Pick 1-4 badges from EXACTLY this list:
  Positive: "Quick Win", "Actionable", "Beginner Friendly", "High ROI", "Strong Focus Match", "Builds Momentum"
  Neutral: "Time Investment", "Advanced", "Reference Material", "Save for Later", "Paywalled"
  Negative: "Clickbait", "Off Focus", "Low Signal"
  Choose badges that are supported by the scores. For example: "Quick Win" if time_to_value and actionability are both high; "Off Focus" if focus_relevance < 0.3; "Paywalled" only if marked as paywalled.
- explanation: One concise sentence explaining how this pebble relates (or doesn't) to the focus
- confidence (0-1): Your confidence in these scores
- evidence: Brief supporting evidence from the content or metadata

IMPORTANT: Return scores for ALL pebbles provided, using their exact IDs.

Respond with ONLY a JSON object:
{
  "scores": [
    {
      "pebble_id": "exact-id-from-input",
      "focus_relevance": 0.0,
      "momentum": 0.0,
      "contextual_readiness": 0.0,
      "difficulty_estimate": 0.0,
      "badges": ["Badge Name"],
      "explanation": "...",
      "confidence": 0.0,
      "evidence": "..."
    }
  ]
}`;

export function buildFocusScoreUserPrompt(
  focusStatement: string,
  pebbles: Array<{
    id: string;
    title: string | null;
    description: string | null;
    domain: string | null;
    raw_text: string | null;
    paywalled: boolean;
    content_score?: number;
  }>
): string {
  const pebbleSummaries = pebbles.map((p, i) => {
    const textPreview = p.raw_text?.slice(0, 300) ?? 'No content available';
    return [
      `--- Pebble ${i + 1} (ID: ${p.id}) ---`,
      `Title: ${p.title ?? 'Unknown'}`,
      `Domain: ${p.domain ?? 'Unknown'}`,
      `Description: ${p.description ?? 'None'}`,
      `Content Quality Score: ${p.content_score?.toFixed(2) ?? 'N/A'}`,
      `Paywalled: ${p.paywalled ? 'Yes' : 'No'}`,
      `Preview: ${textPreview}`,
    ].join('\n');
  });

  return [
    `FOCUS STATEMENT: "${focusStatement}"`,
    '',
    `PEBBLES TO SCORE (${pebbles.length}):`,
    '',
    ...pebbleSummaries,
  ].join('\n');
}
