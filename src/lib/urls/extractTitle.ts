// @/lib/urls/extractTitle.ts
const extractTitle = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StonethrowBot/1.0)',
      },
    });

    if (!res.ok) {
      console.warn('❌ fetch failed:', res.status);
      return null;
    }

    const html = await res.text();

    const ogMatch = html.match(
      /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i
    );
    if (ogMatch?.[1]) {
      return ogMatch[1].trim();
    }

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch?.[1]) {
      return titleMatch[1].trim();
    }

    return null;
  } catch (err) {
    console.warn('❌ extractTitle error:', err);
    return null;
  }
};

export default extractTitle;
