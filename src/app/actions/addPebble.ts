'use server';

import createClient from '@/lib/supabase/server';
import canonicalizeUrl from '@/lib/urls/canonicalizeUrl';
import extractDomain from '@/lib/urls/extractDomain';
import extractTitle from '@/lib/urls/extractTitle';
import requireUser from '@/lib/auth/server/requireUser';

import type { AddPebbleResult } from '@/types';

const addPebble = async (rawUrl: string): Promise<AddPebbleResult> => {
  const user = await requireUser();
  if (!user) return { ok: false, error: 'UNAUTHORIZED' };

  const canonicalUrl = canonicalizeUrl(rawUrl);

  let title: string | null = null;
  try {
    title = await extractTitle(canonicalUrl);
  } catch (err) {}

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pebbles')
    .insert({
      user_id: user.id,
      original_url: rawUrl,
      canonical_url: canonicalUrl,
      domain: extractDomain(rawUrl),
      title,
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
