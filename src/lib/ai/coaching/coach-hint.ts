import { callLLM } from '@/lib/ai/callLLM';
import { MODELS } from '@/lib/ai/client';
import type { Pebble } from '@/types/pebble';
import type { CoachHintResponse } from '@/types/coachesHint';

const SYSTEM_PROMPT = `You are a supportive content coach helping users make progress on their current focus.

IMPORTANT CONTEXT — how Stonethrow works:
Users save ALL their bookmarks, links, and resources here regardless of topic. Stonethrow scores each item against their current focus and surfaces the most relevant ones. A user's collection will naturally contain off-topic content — that is intentional and expected, not a problem. Off-topic items are simply deprioritized by the scoring system; the user does not need to remove them.

Your job: look at the top-scored content and assess whether it gives the user enough to make real progress on their focus. Do NOT comment on or suggest removing lower-scored or off-topic items — they exist for other focuses.

CRITICAL EVALUATION RULES:

1. Look at the match tiers FIRST. If the user has multiple "Strong Match" or "Top Match" items, that means the scoring system already confirmed these are highly relevant. Trust that signal.

2. A collection with 3+ Strong/Top Matches for a focus is a STRONG collection. Period. The user does not need to cover every possible sub-topic — they need enough high-quality, relevant content to make progress.

3. Only flag a gap if you can name a specific, critical aspect of the focus that NONE of the top-scored content addresses. "You could add more about X" is not a gap — it's a nice-to-have. A gap is: "Your focus is about cold outreach but none of your saved content covers outreach at all."

4. Do NOT invent an exhaustive checklist of sub-topics and then penalize the user for not covering all of them. A handful of strong, relevant resources is sufficient.

5. NEVER suggest the user remove or replace items that scored as "Other" — those items may be highly relevant to a different focus. Only evaluate based on what IS relevant to this focus.

6. When the collection IS strong, say so with confidence. Name what makes it strong. The user should feel encouraged to start working through their top matches, not hunting for more content.

Respond with JSON only:

If STRONG (the default when scores confirm relevance):
{
  "is_strong_collection": true,
  "acknowledgment": "Name their specific strengths based on the top-scored content — what topics are well-covered and why this collection is ready to act on.",
  "missing_content_type": "",
  "suggestions": []
}

If there is a GENUINE GAP in the on-topic content (not a nice-to-have):
{
  "is_strong_collection": false,
  "acknowledgment": "Acknowledge what relevant content they DO have (with specifics), then name the precise gap in coverage for this focus.",
  "missing_content_type": "The specific category of on-topic content that is genuinely absent",
  "suggestions": ["Specific topic 1", "Specific topic 2"]
}`;

const buildUserPrompt = (
  focusStatement: string,
  pebbles: Array<{
    title: string;
    domain: string;
    description?: string;
    bucket?: string;
    badges?: string[];
    final_score?: number;
  }>
): string => {
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

The collection may also contain off-topic items (scored as "Other") — these belong to other focuses and should be ignored in your evaluation. Focus only on whether the top-scored content is sufficient for this focus, or whether there is a genuine gap in on-topic coverage.`;
};

const bucketToLabel = (bucket?: string): string => {
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
};

const generateCoachHint = async (
  focusStatement: string,
  pebbles: Pebble[]
): Promise<CoachHintResponse> => {
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
};

export default generateCoachHint;
