import embeddingClient from '@/lib/ai/embeddings/client';
import createClient from '@/lib/supabase/server';

/**
 * Result from embedding-based ranking via pgvector similarity search.
 */
export type EmbeddingRankResult = {
  pebble_id: string;
  similarity: number;
};

export type RankByEmbeddingResult = {
  ranks: EmbeddingRankResult[];
  embedding: number[];
};

/**
 * Run the pgvector similarity search using a pre-computed embedding vector.
 * Use this to avoid re-calling Voyage AI when the embedding is already known.
 */
export async function matchPebblesByEmbedding(
  embedding: number[],
  userId: string
): Promise<EmbeddingRankResult[]> {
  const supabase = await createClient();
  const rpcStartTime = Date.now();
  const { data, error } = await supabase.rpc('match_pebbles', {
    query_embedding: embedding,
    match_user_id: userId,
    match_threshold: 0.2,
    match_count: 500,
  });
  const rpcElapsed = Date.now() - rpcStartTime;
  console.log(`[EMBEDDING_TIMING] match_pebbles RPC: ${rpcElapsed}ms`);

  if (error) {
    console.error('match_pebbles RPC error:', error);
    throw error;
  }

  return data ?? [];
}

export async function rankByEmbedding(
  focusStatement: string,
  userId: string
): Promise<RankByEmbeddingResult> {
  try {
    const embeddingStartTime = Date.now();

    // Step 1: Embed the focus statement (~200ms)
    const embedding = await embeddingClient.embedText(focusStatement);
    const embeddingElapsed = Date.now() - embeddingStartTime;
    console.log(`[EMBEDDING_TIMING] embedText: ${embeddingElapsed}ms`);

    // Step 2: Similarity search via pgvector RPC (~10-50ms)
    const ranks = await matchPebblesByEmbedding(embedding, userId);

    console.debug(`rankByEmbedding: found ${ranks.length} pebbles`);
    return { ranks, embedding };
  } catch (err) {
    console.error('Failed in rankByEmbedding:', err);
    throw err;
  }
}

/**
 * Persist a pre-computed embedding vector for a focus statement.
 * Pass the vector already obtained from rankByEmbedding to avoid a second Voyage AI call.
 */
export async function storeFocusEmbedding(
  focusId: string,
  embedding: number[]
): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('focus_statements')
      .update({ embedding })
      .eq('id', focusId);

    if (error) {
      console.error('Failed to store focus embedding:', error);
      throw error;
    }

    console.debug(`Stored embedding for focus ${focusId}`);
  } catch (err) {
    console.error('Failed to store focus embedding:', err);
    // Don't throw — this is non-critical for the happy path
  }
}
