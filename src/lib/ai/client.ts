import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const MODELS = {
  CONTENT_SCORE: 'claude-haiku-4-20250414',
  FOCUS_VALIDATE: 'claude-haiku-4-20250414',
  FOCUS_SCORE: 'claude-sonnet-4-20250514',
} as const;

export type ModelVersion = (typeof MODELS)[keyof typeof MODELS];

export default anthropic;
