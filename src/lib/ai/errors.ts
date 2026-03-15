import Anthropic from '@anthropic-ai/sdk';

export type AIErrorCode =
  | 'BILLING_ERROR'
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'INVALID_REQUEST'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR'
  | 'UNKNOWN_ERROR'
  | 'INVALID_INPUT'
  | 'MISSING_API_KEY';

export class AIError extends Error {
  readonly code: AIErrorCode;
  readonly retryable: boolean;
  readonly statusCode?: number;
  readonly requestId?: string;

  constructor(
    message: string,
    code: AIErrorCode,
    options?: {
      retryable?: boolean;
      statusCode?: number;
      requestId?: string;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.retryable = options?.retryable ?? false;
    this.statusCode = options?.statusCode;
    this.requestId = options?.requestId;
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

/**
 * Classify an error from the Anthropic SDK into a typed AIError.
 */
export function classifyAIError(err: unknown): AIError {
  if (err instanceof AIError) {
    return err;
  }

  // Handle Anthropic SDK errors
  if (err instanceof Anthropic.APIError) {
    const requestId =
      err.headers?.['request-id'] ?? (err as any).requestID ?? undefined;

    // Billing/credit issues (400 with specific message)
    if (
      err.status === 400 &&
      err.message?.toLowerCase().includes('credit balance')
    ) {
      return new AIError(
        'Anthropic API credit balance is too low. Please add credits to continue.',
        'BILLING_ERROR',
        { retryable: false, statusCode: 400, requestId, cause: err }
      );
    }

    // Authentication errors (401)
    if (err instanceof Anthropic.AuthenticationError || err.status === 401) {
      return new AIError(
        'Invalid Anthropic API key. Please check your configuration.',
        'AUTH_ERROR',
        { retryable: false, statusCode: 401, requestId, cause: err }
      );
    }

    // Permission denied (403)
    if (err instanceof Anthropic.PermissionDeniedError || err.status === 403) {
      return new AIError(
        'Permission denied. Your API key may not have access to this model.',
        'AUTH_ERROR',
        { retryable: false, statusCode: 403, requestId, cause: err }
      );
    }

    // Rate limiting (429)
    if (err instanceof Anthropic.RateLimitError || err.status === 429) {
      return new AIError(
        'Rate limit exceeded. Please try again later.',
        'RATE_LIMIT',
        { retryable: true, statusCode: 429, requestId, cause: err }
      );
    }

    // Server errors (5xx)
    if (
      err instanceof Anthropic.InternalServerError ||
      (err.status && err.status >= 500)
    ) {
      return new AIError(
        'Anthropic API server error. Please try again.',
        'SERVER_ERROR',
        { retryable: true, statusCode: err.status, requestId, cause: err }
      );
    }

    // Other bad requests (400)
    if (err.status === 400) {
      return new AIError(`Invalid request: ${err.message}`, 'INVALID_REQUEST', {
        retryable: false,
        statusCode: 400,
        requestId,
        cause: err,
      });
    }

    // Fallback for other API errors
    return new AIError(err.message || 'Unknown API error', 'UNKNOWN_ERROR', {
      retryable: false,
      statusCode: err.status,
      requestId,
      cause: err,
    });
  }

  // Network errors
  if (
    err instanceof TypeError &&
    err.message?.toLowerCase().includes('fetch')
  ) {
    return new AIError(
      'Network error connecting to Anthropic API.',
      'NETWORK_ERROR',
      { retryable: true, cause: err }
    );
  }

  // Generic error handling
  const message = err instanceof Error ? err.message : String(err);
  return new AIError(message, 'UNKNOWN_ERROR', {
    retryable: false,
    cause: err instanceof Error ? err : undefined,
  });
}

/**
 * Check if an error should trigger a retry.
 */
export function isRetryableError(err: unknown): boolean {
  const aiError = classifyAIError(err);
  return aiError.retryable;
}

/**
 * Get a user-friendly error message.
 */
export function getErrorMessage(err: unknown): string {
  const aiError = classifyAIError(err);
  return aiError.message;
}
