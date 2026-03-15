import { AIError, classifyAIError } from '@/lib/ai/errors';

export const EMBEDDING_MODEL = 'voyage-3-large';
export const EMBEDDING_DIMENSION = 1024;

type EmbeddingClientOptions = {
  apiKey: string;
};

class EmbeddingClient {
  private apiKey: string;
  private baseUrl = 'https://api.voyageai.com/v1';
  private maxRetries = 2;

  constructor(options: EmbeddingClientOptions) {
    this.apiKey = options.apiKey;
  }

  async embedText(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new AIError('Text to embed cannot be empty', 'INVALID_INPUT');
    }

    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new AIError(
        'VOYAGE_API_KEY environment variable is not set. Get your key from https://account.voyageai.com/',
        'MISSING_API_KEY'
      );
    }

    let lastError: AIError | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            input: text,
            model: EMBEDDING_MODEL,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const message = errorData.error?.message || `HTTP ${response.status}`;
          if (response.status === 429) {
            throw new AIError(message, 'RATE_LIMIT', {
              retryable: true,
              statusCode: 429,
            });
          }
          if (response.status >= 500) {
            throw new AIError(message, 'SERVER_ERROR', {
              retryable: true,
              statusCode: response.status,
            });
          }
          throw new AIError(message, 'UNKNOWN_ERROR', {
            retryable: false,
            statusCode: response.status,
          });
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
          throw new Error('No embedding data in response');
        }

        return data.data[0].embedding;
      } catch (err) {
        const aiError = classifyAIError(err);
        lastError = aiError;

        // Don't retry non-retryable errors
        if (!aiError.retryable) {
          console.error(
            `Embedding call failed (non-retryable): [${aiError.code}] ${aiError.message}`
          );
          throw aiError;
        }

        console.warn(
          `Embedding attempt ${attempt + 1}/${this.maxRetries + 1} failed (retryable): [${aiError.code}] ${aiError.message}`
        );

        if (attempt < this.maxRetries) {
          // Exponential backoff: 1s, 2s, 4s...
          const delay = 1000 * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw (
      lastError ??
      new AIError('Embedding call failed after all retries', 'UNKNOWN_ERROR')
    );
  }
}

const embeddingClient = new EmbeddingClient({
  apiKey: process.env.VOYAGE_API_KEY || '',
});

export default embeddingClient;
