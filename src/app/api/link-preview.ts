import extractTitleFromHtml from '@/lib/urls/extractTitle';

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return Response.json({ error: 'Missing URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Stonethrow/1.0; +https://getstonethrow.com)',
      },
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return Response.json({
        title: null,
        error: 'Not an HTML page',
      });
    }

    const html = await res.text();
    const title = extractTitleFromHtml(html);

    return Response.json({
      title: title ?? 'Untitled',
      url,
    });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch URL' }, { status: 500 });
  }
}
