import { describe, it, expect } from 'vitest';
import extractDomain from '../extractDomain';

describe('extractDomain', () => {
  it('extracts domain from a simple URL', () => {
    expect(extractDomain('https://example.com/page')).toBe('example.com');
  });

  it('removes www prefix', () => {
    expect(extractDomain('https://www.example.com/page')).toBe('example.com');
  });

  it('preserves subdomains other than www', () => {
    expect(extractDomain('https://blog.example.com/post')).toBe('blog.example.com');
  });

  it('handles URLs with ports', () => {
    expect(extractDomain('https://example.com:8080/api')).toBe('example.com');
  });

  it('handles URLs with query parameters', () => {
    expect(extractDomain('https://example.com/search?q=test')).toBe('example.com');
  });

  it('handles URLs with hash fragments', () => {
    expect(extractDomain('https://example.com/page#section')).toBe('example.com');
  });

  it('returns empty string for invalid URLs', () => {
    expect(extractDomain('not-a-url')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(extractDomain('')).toBe('');
  });

  it('handles http protocol', () => {
    expect(extractDomain('http://example.com/page')).toBe('example.com');
  });

  it('handles complex subdomains with www', () => {
    expect(extractDomain('https://www.blog.example.com')).toBe('blog.example.com');
  });

  it('handles domains with multiple TLD parts', () => {
    expect(extractDomain('https://example.co.uk/page')).toBe('example.co.uk');
  });

  it('handles localhost', () => {
    expect(extractDomain('http://localhost:3000/api')).toBe('localhost');
  });

  it('handles IP addresses', () => {
    expect(extractDomain('http://192.168.1.1:8080/api')).toBe('192.168.1.1');
  });
});
