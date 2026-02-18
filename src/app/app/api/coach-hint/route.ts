import { NextResponse } from 'next/server';
import createClient from '@/lib/supabase/server';
import { generateCoachHint } from '@/lib/ai/coaching/coach-hint';
import { AIError } from '@/lib/ai/errors';

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
  const { focusStatement, pebbles } = body;

  if (!focusStatement || typeof focusStatement !== 'string') {
    return NextResponse.json(
      { ok: false, error: 'INVALID_INPUT', message: 'focusStatement is required' },
      { status: 400 }
    );
  }

  if (!Array.isArray(pebbles)) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_INPUT', message: 'pebbles array is required' },
      { status: 400 }
    );
  }

  try {
    const hint = await generateCoachHint(focusStatement, pebbles);
    return NextResponse.json({ ok: true, data: hint });
  } catch (err) {
    if (err instanceof AIError) {
      console.error(`Coach hint generation failed: [${err.code}] ${err.message}`);
      return NextResponse.json(
        { ok: false, error: err.code, message: err.message },
        { status: 500 }
      );
    }
    console.error('Coach hint generation failed:', err);
    return NextResponse.json(
      { ok: false, error: 'UNKNOWN_ERROR' },
      { status: 500 }
    );
  }
}
