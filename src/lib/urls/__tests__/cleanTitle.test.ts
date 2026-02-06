import { describe, it, expect } from 'vitest';
import cleanTitle from '../cleanTitle';

describe('cleanTitle', () => {
  it('returns empty string for null input', () => {
    expect(cleanTitle(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(cleanTitle(undefined)).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(cleanTitle('')).toBe('');
  });

  it('decodes HTML entities', () => {
    expect(cleanTitle('Hello &amp; World')).toBe('Hello & World');
  });

  it('decodes multiple HTML entities', () => {
    // Note: &lt;script&gt; decodes to <script>, which then gets stripped as a tag
    expect(cleanTitle('&amp; &quot;test&quot;')).toBe('& "test"');
  });

  it('decodes numeric HTML entities', () => {
    expect(cleanTitle('Hello &#8212; World')).toBe('Hello — World');
  });

  it('removes HTML tags', () => {
    expect(cleanTitle('<b>Bold</b> text')).toBe('Bold text');
  });

  it('removes multiple HTML tags', () => {
    expect(cleanTitle('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
  });

  it('removes self-closing tags', () => {
    // Tag removal doesn't add spaces - text runs together
    expect(cleanTitle('Line 1<br/>Line 2')).toBe('Line 1Line 2');
  });

  it('normalizes multiple spaces to single space', () => {
    expect(cleanTitle('Hello    World')).toBe('Hello World');
  });

  it('removes zero-width spaces', () => {
    expect(cleanTitle('Hello\u200BWorld')).toBe('HelloWorld');
  });

  it('trims leading and trailing whitespace', () => {
    expect(cleanTitle('  Hello World  ')).toBe('Hello World');
  });

  it('handles complex input with entities, tags, and spaces', () => {
    const input = '  <h1>Welcome &amp; Hello</h1>   <p>World</p>  ';
    expect(cleanTitle(input)).toBe('Welcome & Hello World');
  });

  it('preserves normal text unchanged', () => {
    expect(cleanTitle('Hello World')).toBe('Hello World');
  });

  it('handles apostrophe entities', () => {
    expect(cleanTitle("It&#39;s working")).toBe("It's working");
  });

  it('handles non-breaking space entities', () => {
    expect(cleanTitle('Hello&nbsp;World')).toBe('Hello World');
  });
});
