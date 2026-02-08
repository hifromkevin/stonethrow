import { NextResponse, after } from 'next/server';
import createClient from '@/lib/supabase/server';
import { AIError } from '@/lib/ai/errors';
import { validateFocusSafety } from '@/lib/ai/safety/focus-validator';
import { scoreFocusBatch } from '@/lib/ai/scoring/focus-score';
import { MODELS } from '@/lib/ai/client';

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const body = await req.json();
  const statement = body?.statement;

  if (!statement || typeof statement !== 'string') {
    return NextResponse.json(
      { ok: false, error: 'INVALID_INPUT' },
      { status: 400 }
    );
  }

  const trimmed = statement.trim();

  // Step 1: Validate safety
  const safetyResult = await validateFocusSafety(trimmed);

  if (!safetyResult.is_safe) {
    return NextResponse.json(
      {
        ok: false,
        error: 'UNSAFE_FOCUS',
        rejection_reason: safetyResult.rejection_reason,
        alternatives: safetyResult.alternatives,
      },
      { status: 422 }
    );
  }

  // Step 2: Deactivate any existing active focus
  await supabase
    .from('focus_statements')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_active', true);

  // Step 3: Insert new focus
  const { data: focus, error } = await supabase
    .from('focus_statements')
    .insert({
      user_id: user.id,
      statement: trimmed,
      is_active: true,
      is_safe: true,
      model_version: MODELS.FOCUS_VALIDATE,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to insert focus:', error);
    return NextResponse.json(
      { ok: false, error: 'DB_ERROR' },
      { status: 500 }
    );
  }

  // Step 4: Kick off Stage B scoring in background
  console.log('🎯 Focus saved, kicking off scoring for:', focus.id);
  after(async () => {
    console.log('🚀 after() callback started for focus:', focus.id);
    try {
      await scoreFocusBatch(user.id, focus.id, focus.statement);
      console.log('✅ scoreFocusBatch completed for focus:', focus.id);
    } catch (err) {
      if (err instanceof AIError) {
        console.error(
          `❌ Stage B scoring failed for focus: ${focus.id} [${err.code}] ${err.message}`
        );
      } else {
        console.error('❌ Stage B scoring failed for focus:', focus.id, err);
      }
    }
  });

  return NextResponse.json({ ok: true, data: focus });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from('focus_statements')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    return NextResponse.json(
      { ok: false, error: 'DB_ERROR' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data: data ?? null });
}
