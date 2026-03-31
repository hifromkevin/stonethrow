import { HtmlMetadata } from '@/types';
import extractRawText from '@/lib/urls/extractRawText';
import { extractYouTubeTranscript } from '@/lib/urls/extractYouTubeTranscript';

// Extracts the content attribute from a meta tag regardless of whether the
// identifying attribute (e.g. property="og:title") comes before or after
// the content attribute in the tag.
const getMetaContent = (
  html: string,
  attr: string,
  value: string
): string | null => {
  const v = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const attrFirst = html.match(
    new RegExp(`<meta[^>]+${attr}=["']${v}["'][^>]+content=["']([^"']+)["']`, 'i')
  )?.[1]?.trim();
  if (attrFirst) return attrFirst;
  return (
    html.match(
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${v}["']`, 'i')
    )?.[1]?.trim() ?? null
  );
};

const extractHtmlMetadata = async (
  url: string
): Promise<HtmlMetadata | null> => {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StonethrowBot/1.0)',
      },
    });

    if (!res.ok) {
      console.warn('❌ fetch failed:', res.status);
      return null;
    }

    const html = await res.text();

    const title =
      getMetaContent(html, 'property', 'og:title') ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ||
      null;

    const description =
      getMetaContent(html, 'property', 'og:description') ||
      getMetaContent(html, 'name', 'description') ||
      null;

    let image: string | null = null;
    let imageSource: HtmlMetadata['imageSource'];

    const ogImage = getMetaContent(html, 'property', 'og:image');
    const twitterImage = getMetaContent(html, 'name', 'twitter:image');

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
    const { rawText: scrapedText, paywalled } = extractRawText(html);

    // For YouTube URLs, replace scraped page body with actual transcript.
    // Scraped HTML for YouTube is navigation chrome with no content value.
    const isYouTube =
      url.includes('youtube.com/watch') || url.includes('youtu.be/');
    const transcript = isYouTube
      ? await extractYouTubeTranscript(url)
      : null;
    const rawText = transcript ?? scrapedText;

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
