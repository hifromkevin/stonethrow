'use server';

import { createClient } from '@/lib/supabase/server';
import canonicalizeUrl from '@/lib/urls/canonicalizeUrl';
import extractTitle from '@/lib/urls/extractTitle';
import requireUser from '@/lib/auth/requireUser';

import type { AddPebbleResult } from '@/types';

const addPebble = async (rawUrl: string): Promise<AddPebbleResult> => {
  console.log('🧠 addPebble called with:', rawUrl);

  // 1️⃣ Auth
  const user = await requireUser();
  if (!user) {
    console.error('❌ Unauthorized');
    return { ok: false, error: 'UNAUTHORIZED' };
  }

  console.log('👤 user:', user.id);

  // 2️⃣ Canonicalize
  const canonicalUrl = canonicalizeUrl(rawUrl);
  console.log('🔗 canonical:', canonicalUrl);

  // 3️⃣ Extract title (never let this crash the flow)
  let title: string | null = null;
  try {
    title = await extractTitle(canonicalUrl);
    console.log('📄 title:', title);
  } catch (err) {
    console.warn('⚠️ Title extraction failed:', err);
  }

  // 4️⃣ DB insert
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pebbles')
    .insert({
      user_id: user.id,
      original_url: rawUrl,
      canonical_url: canonicalUrl,
      title,
    })
    .select()
    .single();

  console.log('💾 insert result:', { data, error });

  if (error) {
    console.error('❌ DB insert failed:', error);

    if (error.code === '23505') {
      // unique_violation
      return { ok: false, error: 'DUPLICATE' };
    }
    if (error.code === '23503') {
      // foreign_key_violation
      return { ok: false, error: 'INVALID_REFERENCE' };
    }
    if (error.code === '22P02') {
      // invalid_text_representation (bad UUID, etc.)
      return { ok: false, error: 'INVALID_INPUT' };
    }
    if (error.code === '42501') {
      // insufficient_privilege (RLS)
      return { ok: false, error: 'UNAUTHORIZED' };
    }

    return {
      ok: false,
      error: 'DB_ERROR',
    };
  }

  return { ok: true, data };
};

export default addPebble;
