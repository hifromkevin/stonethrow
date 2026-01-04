import { NextResponse } from 'next/server';
import getPebbles from '@/lib/queries/server/getPebbles';
import addPebble from '@/app/actions/addPebble';

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

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    console.log('📥 POST /api/pebbles url:', url);

    const result = await addPebble(url);
    console.log('📤 addPebble result:', result);

    return NextResponse.json(result);
  } catch (err) {
    console.error('❌ addPebble route error:', err);
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
  }
}
