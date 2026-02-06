import { describe, it, expect } from 'vitest';
import { parseLLMJSON } from '../parseJSON';

describe('parseLLMJSON', () => {
  describe('direct JSON parsing', () => {
    it('parses valid JSON object', () => {
      const result = parseLLMJSON<{ name: string }>('{"name": "test"}');
      expect(result).toEqual({ name: 'test' });
    });

    it('parses valid JSON array', () => {
      const result = parseLLMJSON<number[]>('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it('parses nested JSON objects', () => {
      const result = parseLLMJSON<{ user: { name: string } }>(
        '{"user": {"name": "test"}}'
      );
      expect(result).toEqual({ user: { name: 'test' } });
    });
  });

  describe('markdown code block extraction', () => {
    it('extracts JSON from ```json code block', () => {
      const input = '```json\n{"scores": [1, 2, 3]}\n```';
      const result = parseLLMJSON<{ scores: number[] }>(input);
      expect(result).toEqual({ scores: [1, 2, 3] });
    });

    it('extracts JSON from ``` code block without language', () => {
      const input = '```\n{"name": "test"}\n```';
      const result = parseLLMJSON<{ name: string }>(input);
      expect(result).toEqual({ name: 'test' });
    });

    it('extracts JSON from code block with surrounding text', () => {
      const input =
        'Here is the result:\n\n```json\n{"status": "ok"}\n```\n\nThat is all.';
      const result = parseLLMJSON<{ status: string }>(input);
      expect(result).toEqual({ status: 'ok' });
    });

    it('handles code block with extra whitespace', () => {
      const input = '```json\n  { "key": "value" }  \n```';
      const result = parseLLMJSON<{ key: string }>(input);
      expect(result).toEqual({ key: 'value' });
    });
  });

  describe('embedded JSON extraction', () => {
    it('extracts JSON object embedded in text', () => {
      const input = 'The response is: {"result": true} which means success.';
      const result = parseLLMJSON<{ result: boolean }>(input);
      expect(result).toEqual({ result: true });
    });

    it('extracts JSON array embedded in text', () => {
      const input = 'Here are the scores: [85, 90, 78] for the students.';
      const result = parseLLMJSON<number[]>(input);
      expect(result).toEqual([85, 90, 78]);
    });

    it('extracts complex nested JSON from text', () => {
      const input =
        'Analysis complete. {"scores": [{"id": "1", "value": 0.8}]} is the result.';
      const result = parseLLMJSON<{ scores: { id: string; value: number }[] }>(
        input
      );
      expect(result).toEqual({ scores: [{ id: '1', value: 0.8 }] });
    });
  });

  describe('error handling', () => {
    it('throws error for non-JSON text', () => {
      expect(() => parseLLMJSON('This is not JSON at all')).toThrow(
        /Failed to parse LLM JSON response/
      );
    });

    it('throws error for empty string', () => {
      expect(() => parseLLMJSON('')).toThrow(/Failed to parse LLM JSON response/);
    });

    it('throws error for malformed JSON', () => {
      expect(() => parseLLMJSON('{"unclosed": true')).toThrow(
        /Failed to parse LLM JSON response/
      );
    });

    it('includes truncated input in error message', () => {
      const longText = 'x'.repeat(300);
      expect(() => parseLLMJSON(longText)).toThrow();
    });
  });

  describe('edge cases', () => {
    it('handles JSON with special characters in strings', () => {
      const result = parseLLMJSON<{ text: string }>(
        '{"text": "Hello\\nWorld\\t!"}'
      );
      expect(result).toEqual({ text: 'Hello\nWorld\t!' });
    });

    it('handles JSON with unicode characters', () => {
      const result = parseLLMJSON<{ emoji: string }>('{"emoji": "Hello 👋"}');
      expect(result).toEqual({ emoji: 'Hello 👋' });
    });

    it('handles JSON with null values', () => {
      const result = parseLLMJSON<{ value: null }>('{"value": null}');
      expect(result).toEqual({ value: null });
    });

    it('handles JSON with boolean values', () => {
      const result = parseLLMJSON<{ active: boolean; deleted: boolean }>(
        '{"active": true, "deleted": false}'
      );
      expect(result).toEqual({ active: true, deleted: false });
    });

    it('handles JSON with numeric values including decimals', () => {
      const result = parseLLMJSON<{ score: number; count: number }>(
        '{"score": 0.85, "count": 42}'
      );
      expect(result).toEqual({ score: 0.85, count: 42 });
    });
  });
});
