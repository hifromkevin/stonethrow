/**
 * Parse JSON from LLM response with fallback strategies.
 * Handles: direct JSON, markdown code blocks, embedded JSON in text.
 */
const parseLLMJSON = <T>(raw: string): T => {
  // Try direct parse
  try {
    return JSON.parse(raw);
  } catch {
    // continue to fallbacks
  }

  // Extract from markdown code blocks
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // continue
    }
  }

  // Try to find a JSON object or array in the text
  const jsonMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // continue
    }
  }

  throw new Error(`Failed to parse LLM JSON response: ${raw.slice(0, 200)}`);
  };

export default parseLLMJSON;
