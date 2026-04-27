import { NextRequest, NextResponse } from 'next/server';
import createClient from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing id param' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await request.json();
  const allowed = ['is_complete', 'completed_at', 'notes'] as const;
  const update: Record<string, unknown> = {};

  for (const field of allowed) {
    if (field in body) {
      update[field] = body[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('pebbles')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing id param' }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase.from('pebbles').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
