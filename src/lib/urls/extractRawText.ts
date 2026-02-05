import * as cheerio from 'cheerio';

const MAX_RAW_TEXT_LENGTH = 2000;

const PAYWALL_SIGNALS = [
  'subscribe to continue',
  'subscribe to read',
  'premium content',
  'members only',
  'paywall',
  'sign up to read',
  'create a free account',
  'this article is for subscribers',
  'unlock this article',
];

export type TextExtractionResult = {
  rawText: string;
  paywalled: boolean;
};

export default function extractRawText(html: string): TextExtractionResult {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $(
    'script, style, nav, footer, header, aside, iframe, noscript, svg'
  ).remove();
  $(
    '[role="navigation"], [role="banner"], [role="complementary"]'
  ).remove();

  // Prefer article > main > body for content extraction
  let contentEl = $('article');
  if (!contentEl.length) contentEl = $('main');
  if (!contentEl.length) contentEl = $('body');

  const rawText = contentEl
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_RAW_TEXT_LENGTH);

  // Detect paywall signals in the full HTML
  const lowerHtml = html.toLowerCase();
  const hasPaywallKeyword = PAYWALL_SIGNALS.some((signal) =>
    lowerHtml.includes(signal)
  );

  // Thin content in a large page is also a paywall signal
  const isContentThin = rawText.length < 200;
  const paywalled = hasPaywallKeyword || (isContentThin && html.length > 5000);

  return { rawText, paywalled };
}
