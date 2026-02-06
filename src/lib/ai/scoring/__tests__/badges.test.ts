import { describe, it, expect } from 'vitest';
import { toBadges } from '../badges';

describe('toBadges', () => {
  describe('valid badges', () => {
    it('converts valid positive badge names to Badge objects', () => {
      const result = toBadges(['Quick Win', 'Actionable']);
      expect(result).toEqual([
        { name: 'Quick Win', category: 'positive' },
        { name: 'Actionable', category: 'positive' },
      ]);
    });

    it('converts valid neutral badge names to Badge objects', () => {
      const result = toBadges(['Time Investment', 'Advanced']);
      expect(result).toEqual([
        { name: 'Time Investment', category: 'neutral' },
        { name: 'Advanced', category: 'neutral' },
      ]);
    });

    it('converts valid negative badge names to Badge objects', () => {
      const result = toBadges(['Clickbait', 'Off Focus']);
      expect(result).toEqual([
        { name: 'Clickbait', category: 'negative' },
        { name: 'Off Focus', category: 'negative' },
      ]);
    });

    it('handles mixed categories', () => {
      const result = toBadges(['Quick Win', 'Paywalled', 'Low Signal']);
      expect(result).toEqual([
        { name: 'Quick Win', category: 'positive' },
        { name: 'Paywalled', category: 'neutral' },
        { name: 'Low Signal', category: 'negative' },
      ]);
    });
  });

  describe('all valid badge names', () => {
    const allBadges = [
      { name: 'Quick Win', category: 'positive' },
      { name: 'Actionable', category: 'positive' },
      { name: 'Beginner Friendly', category: 'positive' },
      { name: 'High ROI', category: 'positive' },
      { name: 'Strong Focus Match', category: 'positive' },
      { name: 'Builds Momentum', category: 'positive' },
      { name: 'Time Investment', category: 'neutral' },
      { name: 'Advanced', category: 'neutral' },
      { name: 'Reference Material', category: 'neutral' },
      { name: 'Save for Later', category: 'neutral' },
      { name: 'Paywalled', category: 'neutral' },
      { name: 'Clickbait', category: 'negative' },
      { name: 'Off Focus', category: 'negative' },
      { name: 'Low Signal', category: 'negative' },
    ] as const;

    it.each(allBadges)('recognizes badge "$name" as $category', (badge) => {
      const result = toBadges([badge.name]);
      expect(result).toEqual([{ name: badge.name, category: badge.category }]);
    });
  });

  describe('filtering invalid badges', () => {
    it('filters out unknown badge names', () => {
      const result = toBadges(['Quick Win', 'Invalid Badge', 'Actionable']);
      expect(result).toEqual([
        { name: 'Quick Win', category: 'positive' },
        { name: 'Actionable', category: 'positive' },
      ]);
    });

    it('returns empty array for all invalid badges', () => {
      const result = toBadges(['Not Real', 'Also Fake', 'Made Up']);
      expect(result).toEqual([]);
    });

    it('handles empty input array', () => {
      const result = toBadges([]);
      expect(result).toEqual([]);
    });

    it('is case sensitive - rejects lowercase versions', () => {
      const result = toBadges(['quick win', 'ACTIONABLE', 'Quick Win']);
      expect(result).toEqual([{ name: 'Quick Win', category: 'positive' }]);
    });
  });

  describe('maximum badge limit', () => {
    it('caps at 4 badges', () => {
      const result = toBadges([
        'Quick Win',
        'Actionable',
        'Beginner Friendly',
        'High ROI',
        'Strong Focus Match',
        'Builds Momentum',
      ]);
      expect(result).toHaveLength(4);
      expect(result).toEqual([
        { name: 'Quick Win', category: 'positive' },
        { name: 'Actionable', category: 'positive' },
        { name: 'Beginner Friendly', category: 'positive' },
        { name: 'High ROI', category: 'positive' },
      ]);
    });

    it('filters invalid badges before applying limit', () => {
      const result = toBadges([
        'Invalid1',
        'Quick Win',
        'Invalid2',
        'Actionable',
        'Invalid3',
        'High ROI',
        'Invalid4',
        'Paywalled',
        'Clickbait',
      ]);
      expect(result).toHaveLength(4);
      expect(result).toEqual([
        { name: 'Quick Win', category: 'positive' },
        { name: 'Actionable', category: 'positive' },
        { name: 'High ROI', category: 'positive' },
        { name: 'Paywalled', category: 'neutral' },
      ]);
    });

    it('returns fewer than 4 if fewer valid badges provided', () => {
      const result = toBadges(['Quick Win', 'Actionable']);
      expect(result).toHaveLength(2);
    });
  });
});
