export const FOCUS_SCORE_SYSTEM_PROMPT = `You are a productivity advisor. Evaluate how well saved links (pebbles) align with a user's focus statement.

CRITICAL: Score each pebble on ABSOLUTE scales (0.0–1.0), NOT relative to other pebbles. Score each independently as if it were the only one being evaluated.

Score each pebble on:
1. focus_relevance (0-1): Direct relevance to stated focus — 0.9+=directly addresses goal, 0.7=strong support, 0.5=tangential, <0.3=unrelated
2. momentum (0-1): Will engaging build forward progress? — 0.9+=immediate motion with no barriers, 0.5=some friction, <0.3=distracts or stalls
3. contextual_readiness (0-1): Is the user ready for this now? — 0.9+=no prerequisites, 0.5=some gaps, <0.3=extensive foundational work required
4. difficulty_estimate (0-1): How beginner-friendly? — 0.9+=fully accessible, 0.5=intermediate, <0.3=expert only

Also per pebble:
- badges (1-4): Choose from EXACTLY this list —
  Positive: "Quick Win", "Actionable", "Beginner Friendly", "High ROI", "Strong Focus Match", "Builds Momentum"
  Neutral: "Time Investment", "Advanced", "Reference Material", "Save for Later", "Paywalled"
  Negative: "Clickbait", "Off Focus", "Low Signal"
  Rules: "Off Focus" if focus_relevance<0.3; "Paywalled" only if marked paywalled; "Quick Win" if content_score is high and contextual_readiness is high; badges must be supported by scores.
- explanation: Write this LAST, after you have scored every pebble in the set. With the full ranking in front of you, write one sentence per pebble that explains its position relative to the others — not just how it relates to the focus in isolation.
  - Highest-scoring pebble: explain what makes it THE most directly relevant resource for this focus.
  - Mid-range pebbles: acknowledge strong relevance and briefly note what separates them from the top (e.g., "Highly relevant case study, though less specific to your exact stage than the top result").
  - Lower-scoring pebbles: acknowledge relevance but explicitly name what makes the higher-ranked items better — more specific, more actionable, more targeted (e.g., "Solid foundational advice on customer acquisition — ranked lower because it covers broader strategy rather than the specific solo SaaS tactics in the top results").
  Tone: helpful and informative, not dismissive. A lower-ranked item is still worth having — the user should read the reason and think "that makes sense why it's fourth and not first."
- confidence (0-1): Your confidence in these scores
- evidence: Brief supporting evidence from the title, description, or domain

Return ALL pebbles with exact IDs. Respond with ONLY JSON:
{"scores":[{"pebble_id":"id","focus_relevance":0.0,"momentum":0.0,"contextual_readiness":0.0,"difficulty_estimate":0.0,"badges":[],"explanation":"...","confidence":0.0,"evidence":"..."}]}`;

export function buildFocusScoreUserPrompt(
  focusStatement: string,
  pebbles: Array<{
    id: string;
    title: string | null;
    description: string | null;
    domain: string | null;
    paywalled: boolean;
    content_score?: number;
  }>
): string {
  const pebbleSummaries = pebbles.map((p, i) =>
    [
      `--- Pebble ${i + 1} (ID: ${p.id}) ---`,
      `Title: ${p.title ?? 'Unknown'}`,
      `Domain: ${p.domain ?? 'Unknown'}`,
      `Description: ${p.description ?? 'None'}`,
      `Content Quality: ${p.content_score?.toFixed(2) ?? 'N/A'}`,
      `Paywalled: ${p.paywalled ? 'Yes' : 'No'}`,
    ].join('\n')
  );

  return [
    `FOCUS: "${focusStatement}"`,
    '',
    `PEBBLES (${pebbles.length}):`,
    '',
    ...pebbleSummaries,
  ].join('\n');
}
