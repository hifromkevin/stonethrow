import { NextResponse } from 'next/server';
import createClient from '@/lib/supabase/server';
import addPebble from '@/app/actions/addPebble';
import getPebbles from '@/lib/queries/server/getPebbles';

export async function POST(req: Request) {
  try {
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

    const { url } = await req.json();
    const result = await addPebble(url, user.id);

    return NextResponse.json(result);
  } catch (err) {
    console.error('❌ addPebble route error:', err);
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pebbles = await getPebbles();
    return NextResponse.json(pebbles);
  } catch (err) {
    return NextResponse.json(
      { error: `GET Stoned: ${(err as Error).message}` },
      { status: 401 }
    );
  }
}
