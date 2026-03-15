import { NextResponse, after } from 'next/server';
import createClient from '@/lib/supabase/server';
import addPebble from '@/app/actions/addPebble';
import getPebbles from '@/lib/queries/server/getPebbles';
import { scoreContent } from '@/lib/ai/scoring/content-score';
import { embedPebble } from '@/lib/ai/embeddings/embed-pebble';
import { scoreFocusSingle } from '@/lib/ai/scoring/focus-score';
import { getRankedPebbles } from '@/lib/ai/scoring/ranking';

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

    if (result.ok && result.data) {
      // Type is Pebble[] but .single() returns one object at runtime
      const pebbleArr = result.data;
      const pebble = Array.isArray(pebbleArr) ? pebbleArr[0] : pebbleArr;

      if (pebble) {
        after(async () => {
          try {
            // Stage A1: content scoring
            await scoreContent({
              id: pebble.id,
              title: pebble.title,
              description: pebble.description ?? null,
              domain: pebble.domain,
              raw_text: pebble.raw_text ?? null,
              paywalled: pebble.paywalled ?? false,
            });

            // Stage A2: embedding (for similarity search)
            await embedPebble({
              id: pebble.id,
              title: pebble.title,
              description: pebble.description ?? null,
              domain: pebble.domain,
            });

            // Stage B: focus scoring (if active focus exists)
            const supabaseAfter = await createClient();
            const { data: activeFocus } = await supabaseAfter
              .from('focus_statements')
              .select('id, statement')
              .eq('user_id', user.id)
              .eq('is_active', true)
              .single();

            if (activeFocus) {
              await scoreFocusSingle(activeFocus.id, activeFocus.statement, {
                id: pebble.id,
                title: pebble.title,
                description: pebble.description ?? null,
                domain: pebble.domain,
                raw_text: pebble.raw_text ?? null,
                paywalled: pebble.paywalled ?? false,
              });
            }
          } catch (err) {
            console.error(
              'Background scoring failed for pebble:',
              pebble.id,
              err
            );
          }
        });
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('addPebble route error:', err);
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const url = new URL(req.url);
    const focusId = url.searchParams.get('focus_id') ?? undefined;
    const ranked = url.searchParams.get('ranked');
    const pollUpdates = url.searchParams.get('poll_updates') === 'true';

    if (ranked === 'true' || focusId) {
      // For polling requests, we can skip expensive embedding recomputation
      // and just check for enrichment updates on already-ranked pebbles
      const rankedPebbles = await getRankedPebbles(
        user.id,
        focusId,
        undefined,
        pollUpdates
      );
      return NextResponse.json(rankedPebbles);
    }

    // Fallback: original flat list
    const pebbles = await getPebbles();
    return NextResponse.json(pebbles);
  } catch (err) {
    return NextResponse.json(
      { error: `GET error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
