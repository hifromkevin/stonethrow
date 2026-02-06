import { describe, it, expect } from 'vitest';
import { getAddPebbleErrorMessage } from '../getAddPebbleErrorMessage';
import type { AddPebbleError } from '@/types';

describe('getAddPebbleErrorMessage', () => {
  it('returns correct message for UNAUTHORIZED', () => {
    const result = getAddPebbleErrorMessage('UNAUTHORIZED');
    expect(result).toBe('Please sign in to add a Pebble.');
  });

  it('returns correct message for DUPLICATE', () => {
    const result = getAddPebbleErrorMessage('DUPLICATE');
    expect(result).toBe('You already saved this link.');
  });

  it('returns correct message for INVALID_INPUT', () => {
    const result = getAddPebbleErrorMessage('INVALID_INPUT');
    expect(result).toContain('link');
    expect(result).toContain('valid');
  });

  it('returns correct message for INVALID_REFERENCE', () => {
    const result = getAddPebbleErrorMessage('INVALID_REFERENCE');
    expect(result).toBe('This link references something invalid.');
  });

  it('returns correct message for DB_ERROR', () => {
    const result = getAddPebbleErrorMessage('DB_ERROR');
    expect(result).toContain('save');
    expect(result).toContain('Pebble');
  });

  it('returns fallback message for unknown error codes', () => {
    // Type assertion needed since we're testing unknown error
    const result = getAddPebbleErrorMessage('UNKNOWN_ERROR' as AddPebbleError);
    expect(result).toContain('save');
    expect(result).toContain('Pebble');
  });

  describe('all error codes have user-friendly messages', () => {
    const errorCodes: AddPebbleError[] = [
      'UNAUTHORIZED',
      'DUPLICATE',
      'INVALID_INPUT',
      'INVALID_REFERENCE',
      'DB_ERROR',
    ];

    it.each(errorCodes)('error code "%s" returns a non-empty string', (code) => {
      const result = getAddPebbleErrorMessage(code);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it.each(errorCodes)(
      'error code "%s" returns user-friendly message (no technical jargon)',
      (code) => {
        const result = getAddPebbleErrorMessage(code);
        // Should not contain technical terms
        expect(result.toLowerCase()).not.toContain('error');
        expect(result.toLowerCase()).not.toContain('exception');
        expect(result.toLowerCase()).not.toContain('failed');
      }
    );
  });
});
