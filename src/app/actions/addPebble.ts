'use server';

import createClient from '@/lib/supabase/server';
import canonicalizeUrl from '@/lib/urls/canonicalizeUrl';
import extractDomain from '@/lib/urls/extractDomain';
import extractHtmlMetadata from '@/lib/urls/extractHtmlMetadata';
import cleanTitle from '@/lib/urls/cleanTitle';
import extractTitleFromUrl from '@/lib/urls/extractTitleFromUrl';

import type { AddPebbleResult } from '@/types';

const addPebble = async (
  rawUrl: string,
  userId: string
): Promise<AddPebbleResult> => {
  const canonicalUrl = canonicalizeUrl(rawUrl);
  const supabase = await createClient();
  const meta = await extractHtmlMetadata(canonicalUrl);

  const { data, error } = await supabase
    .from('pebbles')
    .insert({
      user_id: userId,
      original_url: rawUrl,
      canonical_url: canonicalUrl,
      domain: extractDomain(rawUrl),
      title: cleanTitle(meta?.title) || extractTitleFromUrl(rawUrl),
      image_url: meta?.image,
      image_source: meta?.imageSource,
      description: meta?.description,
      raw_text: meta?.rawText ?? null,
      paywalled: meta?.paywalled ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Supabase insert error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    if (error.code === '23505') return { ok: false, error: 'DUPLICATE' }; // unique_violation
    if (error.code === '23503')
      return { ok: false, error: 'INVALID_REFERENCE' }; // foreign_key_violation
    if (error.code === '22P02') return { ok: false, error: 'INVALID_INPUT' }; // invalid_text_representation (bad UUID, etc.)
    if (error.code === '42501') return { ok: false, error: 'UNAUTHORIZED' }; // insufficient_privilege (RLS)

    return {
      ok: false,
      error: 'DB_ERROR',
    };
  }

  return { ok: true, data };
};

export default addPebble;
