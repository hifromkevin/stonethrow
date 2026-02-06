import { describe, it, expect } from 'vitest';
import {
  FOCUS_SCORE_SYSTEM_PROMPT,
  buildFocusScoreUserPrompt,
} from '../focus-score';

describe('FOCUS_SCORE_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof FOCUS_SCORE_SYSTEM_PROMPT).toBe('string');
    expect(FOCUS_SCORE_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it('mentions the four scoring dimensions', () => {
    expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain('focus_relevance');
    expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain('momentum');
    expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain('contextual_readiness');
    expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain('difficulty_estimate');
  });

  it('mentions all positive badges', () => {
    const positiveBadges = [
      'Quick Win',
      'Actionable',
      'Beginner Friendly',
      'High ROI',
      'Strong Focus Match',
      'Builds Momentum',
    ];
    positiveBadges.forEach((badge) => {
      expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain(badge);
    });
  });

  it('mentions all neutral badges', () => {
    const neutralBadges = [
      'Time Investment',
      'Advanced',
      'Reference Material',
      'Save for Later',
      'Paywalled',
    ];
    neutralBadges.forEach((badge) => {
      expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain(badge);
    });
  });

  it('mentions all negative badges', () => {
    const negativeBadges = ['Clickbait', 'Off Focus', 'Low Signal'];
    negativeBadges.forEach((badge) => {
      expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain(badge);
    });
  });

  it('specifies JSON output format', () => {
    expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain('JSON');
    expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain('"scores"');
    expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain('"pebble_id"');
  });

  it('specifies score range 0-1', () => {
    expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain('0-1');
    expect(FOCUS_SCORE_SYSTEM_PROMPT).toContain('0 to 1');
  });
});

describe('buildFocusScoreUserPrompt', () => {
  const mockPebbles = [
    {
      id: 'pebble-1',
      title: 'Learn TypeScript',
      description: 'A guide to TypeScript basics',
      domain: 'example.com',
      raw_text: 'TypeScript is a strongly typed language...',
      paywalled: false,
      content_score: 0.85,
    },
    {
      id: 'pebble-2',
      title: 'Advanced React Patterns',
      description: null,
      domain: 'blog.dev',
      raw_text: null,
      paywalled: true,
      content_score: 0.72,
    },
  ];

  it('includes the focus statement', () => {
    const result = buildFocusScoreUserPrompt('Learn web development', mockPebbles);
    expect(result).toContain('FOCUS STATEMENT: "Learn web development"');
  });

  it('includes pebble count', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('PEBBLES TO SCORE (2)');
  });

  it('includes pebble IDs', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('ID: pebble-1');
    expect(result).toContain('ID: pebble-2');
  });

  it('includes pebble titles', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('Title: Learn TypeScript');
    expect(result).toContain('Title: Advanced React Patterns');
  });

  it('includes pebble domains', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('Domain: example.com');
    expect(result).toContain('Domain: blog.dev');
  });

  it('includes descriptions when present', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('Description: A guide to TypeScript basics');
  });

  it('shows "None" for null descriptions', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('Description: None');
  });

  it('includes content quality scores', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('Content Quality Score: 0.85');
    expect(result).toContain('Content Quality Score: 0.72');
  });

  it('includes paywalled status', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('Paywalled: No');
    expect(result).toContain('Paywalled: Yes');
  });

  it('includes content preview when available', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('Preview: TypeScript is a strongly typed language');
  });

  it('shows "No content available" when raw_text is null', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('Preview: No content available');
  });

  it('truncates long content preview to 300 chars', () => {
    const longText = 'x'.repeat(500);
    const pebbles = [
      {
        id: 'pebble-1',
        title: 'Test',
        description: null,
        domain: 'test.com',
        raw_text: longText,
        paywalled: false,
      },
    ];
    const result = buildFocusScoreUserPrompt('My focus', pebbles);
    // Preview should be truncated
    expect(result).toContain('Preview: ' + 'x'.repeat(300));
    expect(result).not.toContain('x'.repeat(301));
  });

  it('handles empty pebble array', () => {
    const result = buildFocusScoreUserPrompt('My focus', []);
    expect(result).toContain('PEBBLES TO SCORE (0)');
  });

  it('handles pebbles with missing optional fields', () => {
    const minimalPebble = [
      {
        id: 'minimal-1',
        title: null,
        description: null,
        domain: null,
        raw_text: null,
        paywalled: false,
      },
    ];
    const result = buildFocusScoreUserPrompt('My focus', minimalPebble);
    expect(result).toContain('Title: Unknown');
    expect(result).toContain('Domain: Unknown');
    expect(result).toContain('Description: None');
    expect(result).toContain('Content Quality Score: N/A');
  });

  it('numbers pebbles starting from 1', () => {
    const result = buildFocusScoreUserPrompt('My focus', mockPebbles);
    expect(result).toContain('--- Pebble 1');
    expect(result).toContain('--- Pebble 2');
  });
});
