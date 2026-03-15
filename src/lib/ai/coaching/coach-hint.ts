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

The user has set a focus statement and you can see the content they've saved. Your job is to give an honest, useful assessment.

IMPORTANT: If their collection already contains strong, relevant content for their focus, say so clearly. Acknowledge what they have and encourage them to dive into their top matches. Only suggest additions if there is a genuine, specific gap — not a vague "you could always add more about X." It is perfectly valid — and often the right answer — to tell the user their collection is well-suited for their focus.

Decide first: is this a strong collection for the stated focus, or is there a real gap?

If STRONG collection:
- Set is_strong_collection to true
- Write an acknowledgment that names the specific strengths you see
- Leave missing_content_type empty and suggestions empty

If there is a GENUINE GAP:
- Set is_strong_collection to false
- Acknowledge their goal specifically (1-2 sentences)
- Name the type of content that's actually missing (be precise, not generic)
- Suggest 2-3 specific topics to look for

Respond with JSON only:
{
  "is_strong_collection": true,
  "acknowledgment": "Your collection is well-suited for this focus — you have strong coverage of [specific topics]. Consider diving into your top matches first.",
  "missing_content_type": "",
  "suggestions": []
}

OR:

{
  "is_strong_collection": false,
  "acknowledgment": "A brief, specific acknowledgment of their goal (1-2 sentences)",
  "missing_content_type": "What specific category of content is genuinely lacking",
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
