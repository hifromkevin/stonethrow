import { describe, it, expect } from 'vitest';
import canonicalizeUrl from '../canonicalizeUrl';

describe('canonicalizeUrl', () => {
  it('removes utm_source parameter', () => {
    const result = canonicalizeUrl('https://example.com/article?utm_source=twitter');
    expect(result).toBe('https://example.com/article');
  });

  it('removes all utm_* parameters', () => {
    const result = canonicalizeUrl(
      'https://example.com/page?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=ad1'
    );
    expect(result).toBe('https://example.com/page');
  });

  it('removes fbclid parameter', () => {
    const result = canonicalizeUrl('https://example.com/post?fbclid=abc123');
    expect(result).toBe('https://example.com/post');
  });

  it('removes gclid parameter', () => {
    const result = canonicalizeUrl('https://example.com/page?gclid=xyz789');
    expect(result).toBe('https://example.com/page');
  });

  it('removes ref parameter', () => {
    const result = canonicalizeUrl('https://example.com/article?ref=homepage');
    expect(result).toBe('https://example.com/article');
  });

  it('removes mc_cid and mc_eid parameters', () => {
    const result = canonicalizeUrl('https://example.com/page?mc_cid=123&mc_eid=456');
    expect(result).toBe('https://example.com/page');
  });

  it('removes hash fragments', () => {
    const result = canonicalizeUrl('https://example.com/page#section');
    expect(result).toBe('https://example.com/page');
  });

  it('preserves valid query parameters', () => {
    const result = canonicalizeUrl('https://example.com/search?q=test&page=2');
    expect(result).toBe('https://example.com/search?q=test&page=2');
  });

  it('removes tracking params but preserves valid ones', () => {
    const result = canonicalizeUrl(
      'https://example.com/search?q=test&utm_source=google&page=2&fbclid=abc'
    );
    expect(result).toBe('https://example.com/search?q=test&page=2');
  });

  it('handles URLs with no query parameters', () => {
    const result = canonicalizeUrl('https://example.com/article');
    expect(result).toBe('https://example.com/article');
  });

  it('handles URLs with paths', () => {
    const result = canonicalizeUrl('https://example.com/blog/post/123?utm_source=twitter');
    expect(result).toBe('https://example.com/blog/post/123');
  });

  it('preserves the protocol', () => {
    const result = canonicalizeUrl('http://example.com/page?utm_source=test');
    expect(result).toBe('http://example.com/page');
  });

  it('handles complex URLs with port numbers', () => {
    const result = canonicalizeUrl('https://example.com:8080/api?utm_source=test&id=1');
    expect(result).toBe('https://example.com:8080/api?id=1');
  });
});
