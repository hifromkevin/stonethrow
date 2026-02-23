import { YoutubeTranscript } from 'youtube-transcript';

const MAX_TRANSCRIPT_LENGTH = 4000;

function extractVideoId(url: string): string | null {
  return (
    url.match(/youtube\.com\/watch\?v=([^&]+)/)?.[1] ??
    url.match(/youtu\.be\/([^?]+)/)?.[1] ??
    null
  );
}

/**
 * Fetches the transcript for a YouTube video URL.
 * Returns null if the video has no captions or the fetch fails.
 */
export async function extractYouTubeTranscript(
  url: string
): Promise<string | null> {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    if (!segments.length) return null;

    const text = segments
      .map((s) => s.text.trim())
      .filter(Boolean)
      .join(' ')
      .slice(0, MAX_TRANSCRIPT_LENGTH);

    return text || null;
  } catch (err) {
    // Video has no captions, is private, or transcript is disabled — not an error
    console.warn(`⚠️ No transcript available for ${videoId}:`, (err as Error).message);
    return null;
  }
}
