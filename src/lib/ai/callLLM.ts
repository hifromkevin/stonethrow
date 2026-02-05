import anthropic, { type ModelVersion } from '@/lib/ai/client';
import { parseLLMJSON } from '@/lib/ai/parseJSON';

type CallLLMOptions = {
  model: ModelVersion;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  maxRetries?: number;
};

export async function callLLM<T>(options: CallLLMOptions): Promise<T> {
  const {
    model,
    systemPrompt,
    userPrompt,
    maxTokens = 1024,
    maxRetries = 2,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''))
        .join('');

      return parseLLMJSON<T>(text);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`LLM call attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error('LLM call failed after all retries');
}
