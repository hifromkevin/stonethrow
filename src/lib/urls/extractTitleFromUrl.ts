// Segments that are structural URL chrome, not page content.
const SKIP_SEGMENTS = new Set([
  'watch', 'post', 'posts', 'article', 'articles', 'item', 'items',
  'index', 'home', 'page', 'view', 'details', 'show', 'read',
  'www', 'web', 'app', 'en', 'us',
]);

/**
 * Returns true for path segments that look like opaque IDs rather than
 * human-readable words — e.g. "d672-r6555467411", "abc123def456", "63920".
 */
const isLikelyId = (segment: string): boolean => {
  const stripped = segment.replace(/[-_]/g, '');
  // All hex (UUID-style) or all digits
  if (/^[0-9a-f]{8,}$/i.test(stripped)) return true;
  // Short letter prefix + long number run  e.g. "d672", "s110445371"
  if (/^[a-z]\d{4,}$/i.test(segment)) return true;
  // Compound ID: multiple dash-separated short codes e.g. "d672-r655-s110"
  if (/^([a-z]\d+[-_]){2,}/i.test(segment)) return true;
  return false;
};

/**
 * Derives a human-readable title from a URL path when normal metadata
 * extraction fails (bot-blocked pages, JS-rendered sites, etc.).
 *
 * Examples:
 *   npmjs.com/package/voyageai              → "Voyageai"
 *   github.com/anthropics/claude-sdk        → "Claude Sdk"
 *   reddit.com/r/programming                → "Programming"
 *   viator.com/Oahu-tourism/d672-r655-s110  → "Oahu Tourism"
 *   usnews.com/.../Diamond_Head_63920       → "Diamond Head"
 */
const extractTitleFromUrl = (rawUrl: string): string | null => {
  try {
    const url = new URL(rawUrl);

    const segments = url.pathname
      .split('/')
      .map((s) => decodeURIComponent(s).trim())
      .filter(Boolean);

    if (segments.length === 0) return null;

    // Walk from the end, find the first segment that looks like real content.
    let best: string | null = null;
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      if (!isLikelyId(seg) && !SKIP_SEGMENTS.has(seg.toLowerCase())) {
        best = seg;
        break;
      }
    }

    if (!best) return null;

    // Strip file extensions (.html, .php, …)
    best = best.replace(/\.[a-z]{2,4}$/i, '');

    // Many slugs embed opaque IDs between real words using dashes, e.g.
    // "Articles-lIGtPFnlLXqE-Best_time_to_visit_honolulu". Strip dash-separated
    // tokens that look like encoded IDs (mixed-case random chars, or pure digits).
    best = best
      .split('-')
      .filter((token) => {
        if (token.length === 0) return false;
        // Reject tokens with uppercase letters after position 0 (e.g. lIGtPFnlLXqE).
        // Skip this check when the token uses underscores — those are word separators,
        // not random ID characters (e.g. Diamond_Head_State_Monument is a real name).
        if (token.length >= 5 && !token.includes('_') && /[A-Z]/.test(token.slice(1)))
          return false;
        // Reject pure-digit tokens >= 4 digits
        if (/^\d{4,}$/.test(token)) return false;
        return true;
      })
      .join(' ');

    // Replace remaining underscores and plus signs with spaces
    best = best.replace(/[_+]/g, ' ');

    // Drop trailing standalone numbers that are likely IDs (e.g. "Monument 63920")
    best = best.replace(/\s+\d{4,}\s*$/, '').trim();

    // Collapse whitespace
    best = best.replace(/\s+/g, ' ').trim();

    if (best.length < 2) return null;

    // Title-case each word
    return best
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  } catch {
    return null;
  }
};

export default extractTitleFromUrl;
