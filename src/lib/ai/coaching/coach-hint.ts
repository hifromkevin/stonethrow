import { callLLM } from '@/lib/ai/callLLM';
import { MODELS } from '@/lib/ai/client';
import type { Pebble } from '@/types/pebble';

export type CoachHintResponse = {
  is_strong_collection: boolean;
  acknowledgment: string;
  missing_content_type?: string;
  suggestions: string[];
};

const SYSTEM_PROMPT = `You are a supportive content coach helping users build a better collection of resources for their goals.

The user has set a focus statement and you can see the content they've saved, along with how each piece scored against their focus (badge + match tier). Your job is to give an honest, useful assessment grounded in these scores — not a vibe check on titles.

CRITICAL EVALUATION RULES:

1. Look at the match tiers FIRST. If the user has multiple "Strong Match" or "Top Match" items, that means the scoring system already confirmed these are highly relevant. Trust that signal.

2. A collection with 3+ Strong/Top Matches for a focus is a STRONG collection. Period. The user does not need to cover every possible sub-topic — they need enough high-quality, relevant content to make progress.

3. Only flag a gap if you can name a specific, critical aspect of the focus that NONE of the scored content addresses. "You could add more about X" is not a gap — it's a nice-to-have. A gap is: "Your focus is about cold outreach but none of your saved content covers outreach at all."

4. Do NOT invent an exhaustive checklist of sub-topics and then penalize the user for not covering all of them. A focus like "get my first 100 users" does not require separate content on ASO, Product Hunt, cold email, community building, activation funnels, AND retention metrics. A handful of strong tactical resources is sufficient.

5. When the collection IS strong, say so with confidence. Name what makes it strong. The user should feel encouraged to start working through their top matches, not hunting for more content.

Respond with JSON only:

If STRONG (the default when scores confirm relevance):
{
  "is_strong_collection": true,
  "acknowledgment": "Name their specific strengths based on the scored content — what topics are well-covered and why this collection is ready to act on.",
  "missing_content_type": "",
  "suggestions": []
}

If there is a GENUINE GAP (not a nice-to-have):
{
  "is_strong_collection": false,
  "acknowledgment": "Acknowledge what they DO have (with specifics), then name the precise gap.",
  "missing_content_type": "The specific category of content that is genuinely absent — not 'more of what you already have'",
  "suggestions": ["Specific topic 1", "Specific topic 2"]
}`;

function buildUserPrompt(
  focusStatement: string,
  pebbles: Array<{
    title: string;
    domain: string;
    description?: string;
    bucket?: string;
    badges?: string[];
    final_score?: number;
  }>
): string {
  // Sort by score descending so the coach sees the strongest content first
  const sorted = [...pebbles].sort(
    (a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)
  );

  const pebbleSummaries = sorted
    .slice(0, 15) // Show more pebbles now that we're not bloating with raw_text
    .map((p) => {
      const tierLabel = bucketToLabel(p.bucket);
      const badgeStr =
        p.badges && p.badges.length > 0
          ? ` | badges: ${p.badges.join(', ')}`
          : '';
      const desc = p.description ? ` — ${p.description.slice(0, 80)}` : '';
      return `- "${p.title}" (${p.domain}) → ${tierLabel}${badgeStr}${desc}`;
    })
    .join('\n');

  // Summary stats so the coach can quickly gauge collection strength
  const totalPebbles = pebbles.length;
  const strongOrBetter = pebbles.filter(
    (p) => p.bucket === 'primary' || p.bucket === 'focused'
  ).length;

  return `Focus statement: "${focusStatement}"

Collection summary: ${totalPebbles} saved items, ${strongOrBetter} scored as Strong Match or better.

Top scored content:
${pebbleSummaries || '(No content saved yet)'}

Evaluate whether this collection is well-suited for the stated focus, or whether there is a genuine gap that needs filling.`;
}

function bucketToLabel(bucket?: string): string {
  switch (bucket) {
    case 'primary':
      return 'Top Match';
    case 'focused':
      return 'Strong Match';
    case 'other':
      return 'Other';
    default:
      return 'Unscored';
  }
}

export async function generateCoachHint(
  focusStatement: string,
  pebbles: Pebble[]
): Promise<CoachHintResponse> {
  const pebbleSummaries = pebbles.map((p) => ({
    title: p.title,
    domain: p.domain ?? '',
    description: p.description ?? undefined,
    // Pull scoring data if available on the pebble object
    bucket: (p as any).bucket ?? undefined,
    badges: (p as any).badges ?? undefined,
    final_score: (p as any).final_score ?? undefined,
  }));

  const userPrompt = buildUserPrompt(focusStatement, pebbleSummaries);

  return callLLM<CoachHintResponse>({
    model: MODELS.FOCUS_VALIDATE,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 512,
  });
}
