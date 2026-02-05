import { HtmlMetadata } from '@/types';
import extractRawText from '@/lib/urls/extractRawText';

const extractHtmlMetadata = async (
  url: string
): Promise<HtmlMetadata | null> => {
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

    const ogTitle = html.match(
      /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i
    )?.[1];

    const title =
      ogTitle?.trim() ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ||
      null;

    const description =
      html
        .match(
          /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
        )?.[1]
        ?.trim() ||
      html
        .match(
          /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
        )?.[1]
        ?.trim() ||
      null;

    let image: string | null = null;
    let imageSource: HtmlMetadata['imageSource'];

    const ogImage = html.match(
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
    )?.[1];

    const twitterImage = html.match(
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i
    )?.[1];

    if (ogImage) {
      image = ogImage.trim();
      imageSource = 'og';
    } else if (twitterImage) {
      image = twitterImage.trim();
      imageSource = 'twitter';
    }

    if (!image) {
      const ytMatch =
        url.match(/youtube\.com\/watch\?v=([^&]+)/) ||
        url.match(/youtu\.be\/([^?]+)/);

      if (ytMatch?.[1]) {
        image = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
        imageSource = 'youtube';
      }
    }

    if (!image) {
      const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];

      const candidates = imgMatches
        .map((match) => match[1])
        .filter((src) => src && !src.includes('logo') && !src.includes('icon'));

      if (candidates.length > 0) {
        image = candidates[0];
        imageSource = 'dom';
      }
    }

    const resolveUrl = (
      resourceUrl?: string | null,
      pageUrl?: string | null
    ): string | null => {
      if (!resourceUrl || !pageUrl) return null;

      try {
        return new URL(resourceUrl, pageUrl).toString();
      } catch {
        return null;
      }
    };
    const { rawText, paywalled } = extractRawText(html);

    return {
      title,
      description,
      image: resolveUrl(image, url),
      imageSource,
      html,
      rawText,
      paywalled,
    };
  } catch (err) {
    console.warn('❌ extractHtmlMetadata error:', err);
    return null;
  }
};

export default extractHtmlMetadata;
