import { VoyageAIClient, VoyageAIError } from 'voyageai';
import { AIError } from '@/lib/ai/errors';

export const EMBEDDING_MODEL = 'voyage-3-large';
export const EMBEDDING_DIMENSION = 1024;

const classifyVoyageError = (err: unknown): AIError => {
  if (err instanceof AIError) return err;

  if (err instanceof VoyageAIError) {
    if (err.statusCode === 429) {
      return new AIError(err.message, 'RATE_LIMIT', {
        retryable: true,
        statusCode: 429,
      });
    }
    if (err.statusCode === 401) {
      return new AIError(err.message, 'AUTH_ERROR', {
        retryable: false,
        statusCode: 401,
      });
    }
    if (err.statusCode != null && err.statusCode >= 500) {
      return new AIError(err.message, 'SERVER_ERROR', {
        retryable: true,
        statusCode: err.statusCode,
      });
    }
    return new AIError(err.message, 'UNKNOWN_ERROR', {
      retryable: false,
      statusCode: err.statusCode,
    });
  }

  const message = err instanceof Error ? err.message : String(err);
  return new AIError(message, 'UNKNOWN_ERROR', { retryable: false });
};

class EmbeddingClient {
  private client: VoyageAIClient;
  private maxRetries = 2;

  constructor(apiKey: string) {
    this.client = new VoyageAIClient({ apiKey });
  }

  async embedText(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new AIError('Text to embed cannot be empty', 'INVALID_INPUT');
    }

    let lastError: AIError | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.embed({
          input: text,
          model: EMBEDDING_MODEL,
        });

        const embedding = response.data?.[0]?.embedding;
        if (!embedding) {
          throw new AIError('No embedding data in response', 'UNKNOWN_ERROR');
        }

        return embedding;
      } catch (err) {
        const aiError = classifyVoyageError(err);
        lastError = aiError;

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

const embeddingClient = new EmbeddingClient(process.env.VOYAGE_API_KEY || '');

export default embeddingClient;
