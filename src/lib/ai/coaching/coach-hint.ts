import { callLLM } from '@/lib/ai/callLLM';
import { MODELS } from '@/lib/ai/client';
import type { Pebble } from '@/types/pebble';

export type CoachHintResponse = {
  acknowledgment: string;
  missing_content_type: string;
  suggestions: string[];
};

const SYSTEM_PROMPT = `You are a supportive content coach helping users build a better collection of resources for their goals.

The user has set a focus statement describing what they want to accomplish. Their current pebble collection (saved articles, resources, etc.) isn't quite matching their focus well enough yet.

Your job is to:
1. Acknowledge what their focus is trying to accomplish (be specific and empathetic)
2. Identify what TYPE of content seems to be missing based on their focus and what they've saved
3. Suggest 2-3 specific content topics they should try adding

Frame this positively - they're close, they just need a few more pieces. Don't say "nothing matched" or be discouraging.

Respond with JSON only:
{
  "acknowledgment": "A brief, specific acknowledgment of their goal (1-2 sentences)",
  "missing_content_type": "What category of content is lacking (e.g., 'practical tutorials', 'case studies', 'beginner guides')",
  "suggestions": ["Specific topic 1", "Specific topic 2", "Specific topic 3"]
}`;

function buildUserPrompt(
  focusStatement: string,
  pebbles: Array<{ title: string; domain: string; description?: string }>
): string {
  const pebbleSummaries = pebbles
    .slice(0, 10) // Limit to avoid token bloat
    .map((p) => `- "${p.title}" (${p.domain})${p.description ? `: ${p.description.slice(0, 100)}` : ''}`)
    .join('\n');

  return `Focus statement: "${focusStatement}"

Current saved content:
${pebbleSummaries || '(No content saved yet)'}

Based on this focus and the content they've saved, what's missing and what should they look for?`;
}

export async function generateCoachHint(
  focusStatement: string,
  pebbles: Pebble[]
): Promise<CoachHintResponse> {
  const pebbleSummaries = pebbles.map((p) => ({
    title: p.title,
    domain: p.domain ?? '',
    description: p.description ?? undefined,
  }));

  const userPrompt = buildUserPrompt(focusStatement, pebbleSummaries);

  return callLLM<CoachHintResponse>({
    model: MODELS.FOCUS_VALIDATE, // Use Haiku for speed/cost
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 512,
  });
}
