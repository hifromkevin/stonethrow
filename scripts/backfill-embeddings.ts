import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import embeddingClient, { EMBEDDING_MODEL, EMBEDDING_DIMENSION } from '@/lib/ai/embeddings/client';
import {
  CONTENT_SCORE_SYSTEM_PROMPT,
  buildContentScoreUserPrompt,
} from '@/lib/ai/prompts/content-score';
import { parseLLMJSON } from '@/lib/ai/parseJSON';
import type { ContentScoreLLMResponse } from '@/types/scoring';

/**
 * Backfill script: Generate embeddings + content scores for all pebbles missing either.
 *
 * Usage: npx tsx scripts/backfill-embeddings.ts
 *
 * Uses service role key to bypass RLS and access all pebbles.
 */

const WEIGHTS = {
  actionability: 0.3,
  signal_to_noise: 0.25,
  time_to_value: 0.2,
  time_relevance: 0.15,
  effort_friction: 0.1,
} as const;

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const voyageApiKey = process.env.VOYAGE_API_KEY;
  const claudeApiKey = process.env.CLAUDE_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  if (!voyageApiKey) {
    throw new Error('VOYAGE_API_KEY is required');
  }
  if (!claudeApiKey) {
    throw new Error('CLAUDE_API_KEY is required');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const anthropic = new Anthropic({ apiKey: claudeApiKey });

  // Fetch all pebbles with fields needed for both steps
  const { data: pebbles, error } = await supabase
    .from('pebbles')
    .select('id, title, description, domain, raw_text, paywalled')
    .order('created_at');

  if (error) throw new Error(`Failed to fetch pebbles: ${error.message}`);
  if (!pebbles || pebbles.length === 0) {
    console.log('No pebbles found.');
    return;
  }

  console.log(`Found ${pebbles.length} pebbles total.\n`);

  // --- Phase 1: Content scoring ---
  const { data: existingScores } = await supabase
    .from('pebble_content_scores')
    .select('pebble_id');
  const alreadyScored = new Set((existingScores ?? []).map((r: any) => r.pebble_id));
  const toScore = pebbles.filter((p: any) => !alreadyScored.has(p.id));

  console.log(`Content scores: ${alreadyScored.size} already scored, ${toScore.length} to process.`);

  let scoreSucceeded = 0;
  let scoreFailed = 0;

  for (const pebble of toScore) {
    try {
      const userPrompt = buildContentScoreUserPrompt({
        title: pebble.title,
        description: pebble.description ?? null,
        domain: pebble.domain,
        raw_text: pebble.raw_text ?? null,
        paywalled: pebble.paywalled ?? false,
      });

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: CONTENT_SCORE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => ('text' in b ? b.text : ''))
        .join('');

      const metrics = parseLLMJSON<ContentScoreLLMResponse>(text);
      const content_score =
        WEIGHTS.actionability * metrics.actionability +
        WEIGHTS.signal_to_noise * metrics.signal_to_noise +
        WEIGHTS.time_to_value * metrics.time_to_value +
        WEIGHTS.time_relevance * metrics.time_relevance +
        WEIGHTS.effort_friction * metrics.effort_friction;

      const { error: upsertError } = await supabase.from('pebble_content_scores').upsert(
        {
          pebble_id: pebble.id,
          ...metrics,
          content_score,
          model_version: 'claude-haiku-4-5-20251001',
        },
        { onConflict: 'pebble_id' }
      );

      if (upsertError) throw new Error(upsertError.message);

      scoreSucceeded++;
      console.log(
        `  ✓ score [${scoreSucceeded + scoreFailed}/${toScore.length}] ${pebble.id} — "${pebble.title ?? '(no title)'}" (score: ${content_score.toFixed(2)})`
      );
    } catch (err: any) {
      scoreFailed++;
      console.error(`  ✗ score [${scoreSucceeded + scoreFailed}/${toScore.length}] ${pebble.id}: ${err.message}`);
    }

    // Small delay to respect Claude rate limits
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nContent scoring done: ${scoreSucceeded} succeeded, ${scoreFailed} failed.\n`);

  // --- Phase 2: Embeddings ---
  const { data: existing } = await supabase
    .from('pebble_embeddings')
    .select('pebble_id');
  const alreadyEmbedded = new Set((existing ?? []).map((r: any) => r.pebble_id));
  const toEmbed = pebbles.filter((p: any) => !alreadyEmbedded.has(p.id));

  console.log(`Embeddings: ${alreadyEmbedded.size} already embedded, ${toEmbed.length} to process.`);

  let embedSucceeded = 0;
  let embedFailed = 0;

  // Throttle: 700ms between requests (~85 req/min). On 429, wait 65s for the rate limit window to reset.
  const DELAY_MS = 700;
  const RATE_LIMIT_COOLDOWN_MS = 65_000;
  let consecutiveRateLimits = 0;

  for (const pebble of toEmbed) {
    const textParts = [pebble.title ?? '', pebble.domain ?? '', pebble.description ?? '']
      .filter((s: string) => s.trim().length > 0);

    if (textParts.length === 0) {
      console.warn(`  Skipping ${pebble.id}: no text to embed`);
      continue;
    }

    try {
      const embedding = await embeddingClient.embedText(textParts.join(' | '));

      if (embedding.length !== EMBEDDING_DIMENSION) {
        throw new Error(`Dimension mismatch: expected ${EMBEDDING_DIMENSION}, got ${embedding.length}`);
      }

      const { error: upsertError } = await supabase.from('pebble_embeddings').upsert(
        { pebble_id: pebble.id, embedding, model_version: EMBEDDING_MODEL },
        { onConflict: 'pebble_id' }
      );

      if (upsertError) throw new Error(upsertError.message);

      embedSucceeded++;
      consecutiveRateLimits = 0;
      console.log(
        `  ✓ embed [${embedSucceeded + embedFailed}/${toEmbed.length}] ${pebble.id} — "${pebble.title ?? '(no title)'}"`
      );
    } catch (err: any) {
      const isRateLimit = err.code === 'RATE_LIMIT' || err.message?.includes('429');
      if (isRateLimit) {
        consecutiveRateLimits++;
        embedFailed++;
        console.warn(
          `  ⏳ rate limit [${embedSucceeded + embedFailed}/${toEmbed.length}] ${pebble.id} — waiting ${RATE_LIMIT_COOLDOWN_MS / 1000}s...`
        );
        await new Promise((r) => setTimeout(r, RATE_LIMIT_COOLDOWN_MS));
        // Retry this pebble immediately after cooldown (re-insert at front by re-running inline)
        try {
          const embedding = await embeddingClient.embedText(textParts.join(' | '));
          if (embedding.length !== EMBEDDING_DIMENSION) throw new Error('Dimension mismatch after retry');
          const { error: upsertError } = await supabase.from('pebble_embeddings').upsert(
            { pebble_id: pebble.id, embedding, model_version: EMBEDDING_MODEL },
            { onConflict: 'pebble_id' }
          );
          if (upsertError) throw new Error(upsertError.message);
          embedFailed--;
          embedSucceeded++;
          consecutiveRateLimits = 0;
          console.log(
            `  ✓ embed [${embedSucceeded + embedFailed}/${toEmbed.length}] ${pebble.id} — "${pebble.title ?? '(no title)'}" (after cooldown)`
          );
        } catch (retryErr: any) {
          console.error(`  ✗ embed [${embedSucceeded + embedFailed}/${toEmbed.length}] ${pebble.id}: ${retryErr.message}`);
        }
        continue;
      }
      embedFailed++;
      console.error(`  ✗ embed [${embedSucceeded + embedFailed}/${toEmbed.length}] ${pebble.id}: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`\nEmbeddings done: ${embedSucceeded} succeeded, ${embedFailed} failed.\n`);

  // --- Final count check ---
  const { count: embeddingCount } = await supabase
    .from('pebble_embeddings')
    .select('*', { count: 'exact', head: true });
  const { count: pebbleCount } = await supabase
    .from('pebbles')
    .select('*', { count: 'exact', head: true });

  console.log(`Final counts: ${embeddingCount} embeddings / ${pebbleCount} pebbles`);
  if (embeddingCount === pebbleCount) {
    console.log('✓ All pebbles have embeddings.');
  } else {
    console.warn(`⚠ Mismatch: ${pebbleCount! - embeddingCount!} pebbles still missing embeddings.`);
  }
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
