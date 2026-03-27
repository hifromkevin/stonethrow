import { callLLM } from '@/lib/ai/callLLM';
import { MODELS } from '@/lib/ai/client';
import {
  FOCUS_VALIDATE_SYSTEM_PROMPT,
  buildFocusValidateUserPrompt,
} from '@/lib/ai/prompts/focus-validate';
import type { FocusSafetyResult } from '@/types/scoring';

const validateFocusSafety = async (
  statement: string
): Promise<FocusSafetyResult> => {
  // Quick pre-checks (no LLM needed)
  if (!statement || statement.trim().length < 3) {
    return {
      is_safe: false,
      rejection_reason:
        'Focus statement is too short. Please describe what you want to focus on.',
      alternatives: [
        'Learn something new',
        'Work on a personal project',
        'Prepare for an upcoming deadline',
      ],
    };
  }

  if (statement.trim().length > 500) {
    return {
      is_safe: false,
      rejection_reason:
        'Focus statement is too long. Keep it concise — one or two sentences.',
      alternatives: [],
    };
  }

  try {
    const result = await callLLM<FocusSafetyResult>({
      model: MODELS.FOCUS_VALIDATE,
      systemPrompt: FOCUS_VALIDATE_SYSTEM_PROMPT,
      userPrompt: buildFocusValidateUserPrompt(statement),
      maxTokens: 256,
    });

    return result;
  } catch (err) {
    console.error('Focus safety validation failed:', err);
    // Fail open: if safety check fails, allow the focus
    return { is_safe: true };
  }
};

export default validateFocusSafety;
