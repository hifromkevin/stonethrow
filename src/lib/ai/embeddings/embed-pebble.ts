import embeddingClient, {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
} from '@/lib/ai/embeddings/client';
import createClient from '@/lib/supabase/server';

type PebbleForEmbedding = {
  id: string;
  title: string | null;
  description: string | null;
  domain: string | null;
};

/**
 * Embed a pebble: generates a vector embedding from the pebble's metadata
 * and stores it in the pebble_embeddings table for later similarity search.
 *
 * Called after content scoring when a pebble is saved.
 */
export async function embedPebble(pebble: PebbleForEmbedding): Promise<void> {
  // Build the text to embed: title | domain | description
  const textParts = [
    pebble.title ?? '',
    pebble.domain ?? '',
    pebble.description ?? '',
  ].filter((part) => part.trim().length > 0);

  if (textParts.length === 0) {
    console.warn(
      `Skipping embedding for pebble ${pebble.id}: no text to embed`
    );
    return;
  }

  const textToEmbed = textParts.join(' | ');

  try {
    // Generate embedding via Voyage AI
    const embedding = await embeddingClient.embedText(textToEmbed);

    // Validate embedding dimension matches table schema
    if (embedding.length !== EMBEDDING_DIMENSION) {
      throw new Error(
        `Embedding dimension mismatch: expected ${EMBEDDING_DIMENSION}, got ${embedding.length}`
      );
    }

    // Persist to database
    const supabase = await createClient();
    const { error } = await supabase.from('pebble_embeddings').upsert(
      {
        pebble_id: pebble.id,
        embedding: embedding,
        model_version: EMBEDDING_MODEL,
      },
      { onConflict: 'pebble_id' }
    );

    if (error) {
      console.error('Failed to persist pebble embedding:', error);
      throw error;
    }

    console.debug(`Embedded pebble ${pebble.id} successfully`);
  } catch (err) {
    console.error(`Failed to embed pebble ${pebble.id}:`, err);
    throw err;
  }
}

/**
 * Backfill embeddings for a user's pebbles that are missing embeddings.
 * Safe to call at any time — skips pebbles that already have embeddings.
 */
export async function backfillUserEmbeddings(userId: string): Promise<void> {
  const supabase = await createClient();

  // Only fetch pebbles that don't have an embedding yet
  const { data: pebbles, error } = await supabase
    .from('pebbles')
    .select('id, title, description, domain, pebble_embeddings(pebble_id)')
    .eq('user_id', userId)
    .order('created_at');

  if (error) {
    console.error('Failed to fetch pebbles for embedding backfill:', error);
    throw error;
  }

  const missing = (pebbles ?? []).filter(
    (p: any) => !p.pebble_embeddings || p.pebble_embeddings.length === 0
  );

  if (missing.length === 0) {
    console.log('No pebbles missing embeddings for user', userId);
    return;
  }

  console.log(`Backfilling embeddings for ${missing.length} pebbles...`);
  let succeeded = 0;
  let failed = 0;

  for (const pebble of missing) {
    try {
      await embedPebble(pebble);
      succeeded++;
    } catch (err) {
      console.error(`Failed to embed pebble ${pebble.id}:`, err);
      failed++;
    }
  }

  console.log(
    `Embedding backfill complete: ${succeeded} succeeded, ${failed} failed`
  );
}

/**
 * Backfill embeddings for existing pebbles.
 * Run this once to generate embeddings for all pebbles already in the system.
 */
export async function backfillEmbeddings(): Promise<void> {
  const supabase = await createClient();

  const { data: pebbles, error } = await supabase
    .from('pebbles')
    .select('id, title, description, domain')
    .order('created_at');

  if (error) {
    console.error('Failed to fetch pebbles for backfill:', error);
    throw error;
  }

  if (!pebbles || pebbles.length === 0) {
    console.log('No pebbles to backfill');
    return;
  }

  console.log(`Starting backfill for ${pebbles.length} pebbles...`);

  let succeeded = 0;
  let failed = 0;

  for (const pebble of pebbles) {
    try {
      await embedPebble(pebble);
      succeeded++;
    } catch (err) {
      console.error(`Failed to embed pebble ${pebble.id}:`, err);
      failed++;
    }
  }

  console.log(
    `Backfill complete: ${succeeded} succeeded, ${failed} failed out of ${pebbles.length}`
  );
}
