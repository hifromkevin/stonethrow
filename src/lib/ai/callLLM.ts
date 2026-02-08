import anthropic, { type ModelVersion } from '@/lib/ai/client';
import { AIError, classifyAIError } from '@/lib/ai/errors';
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

  let lastError: AIError | null = null;

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
      const aiError = classifyAIError(err);
      lastError = aiError;

      // Don't retry non-retryable errors (billing, auth, invalid requests)
      if (!aiError.retryable) {
        console.error(`LLM call failed (non-retryable): [${aiError.code}] ${aiError.message}`);
        throw aiError;
      }

      console.warn(
        `LLM call attempt ${attempt + 1}/${maxRetries + 1} failed (retryable): [${aiError.code}] ${aiError.message}`
      );

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new AIError('LLM call failed after all retries', 'UNKNOWN_ERROR');
}
