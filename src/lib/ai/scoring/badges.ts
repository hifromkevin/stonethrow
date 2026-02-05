import type { BadgeName, Badge, BadgeCategory } from '@/types/scoring';

const BADGE_DEFINITIONS: Record<BadgeName, BadgeCategory> = {
  'Quick Win': 'positive',
  'Actionable': 'positive',
  'Beginner Friendly': 'positive',
  'High ROI': 'positive',
  'Strong Focus Match': 'positive',
  'Builds Momentum': 'positive',
  'Time Investment': 'neutral',
  'Advanced': 'neutral',
  'Reference Material': 'neutral',
  'Save for Later': 'neutral',
  'Paywalled': 'neutral',
  'Clickbait': 'negative',
  'Off Focus': 'negative',
  'Low Signal': 'negative',
};

const VALID_BADGE_NAMES = new Set(Object.keys(BADGE_DEFINITIONS));

/**
 * Convert badge name strings (from LLM) to typed Badge objects.
 * Filters out unknown names and caps at 4 badges.
 */
export function toBadges(names: string[]): Badge[] {
  return names
    .filter((name): name is BadgeName => VALID_BADGE_NAMES.has(name))
    .slice(0, 4)
    .map((name) => ({
      name,
      category: BADGE_DEFINITIONS[name],
    }));
}
