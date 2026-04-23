import { errorLogger } from './errorLogger';
import axios, { AxiosError } from 'axios';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = async (
  error: unknown,
  context: string,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'error'
): Promise<AppError> => {
  let appError: AppError;

  if (axios.isAxiosError(error)) {
    // Handle API errors
    const axiosError = error as AxiosError<{ error: string; message: string }>;
    const message = axiosError.response?.data?.message || (axiosError.message ?? 'Unknown API error');
    const statusCode = axiosError.response?.status;

    const code =
      statusCode === 401
        ? 'UNAUTHORIZED'
        : statusCode === 403
          ? 'FORBIDDEN'
          : statusCode === 404
            ? 'NOT_FOUND'
            : statusCode === 429
              ? 'RATE_LIMITED'
              : statusCode && statusCode >= 500
                ? 'SERVER_ERROR'
                : 'API_ERROR';

    appError = new AppError(code, message, statusCode, error);
  } else if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError('UNKNOWN_ERROR', error.message, undefined, error);
  } else {
    appError = new AppError('UNKNOWN_ERROR', String(error), undefined, error);
  }

  // Log the error
  await errorLogger.log(appError.message, appError, context, severity);

  return appError;
};

export const withErrorHandler = async <T,>(
  fn: () => Promise<T>,
  context: string,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'error'
): Promise<[T | null, AppError | null]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const appError = await handleError(error, context, severity);
    return [null, appError];
  }
};

// Retry logic for failed requests
export const retryWithExponentialBackoff = async <T,>(
  fn: () => Promise<T>,
  context: string,
  maxRetries = 3,
  initialDelayMs = 1000
): Promise<T> => {
  let lastError: AppError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const [result, error] = await withErrorHandler(fn, `${context} (attempt ${attempt + 1}/${maxRetries})`);

    if (result) {
      return result;
    }

    lastError = error;

    // Don't retry on client errors (except 429 rate limit)
    if (error && error.statusCode && error.statusCode < 500 && error.statusCode !== 429) {
      throw error;
    }

    // Exponential backoff
    if (attempt < maxRetries - 1) {
      const delayMs = initialDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new AppError('MAX_RETRIES_EXCEEDED', `Failed after ${maxRetries} attempts`, undefined);
};

// Timeout wrapper
export const withTimeout = async <T,>(
  fn: () => Promise<T>,
  timeoutMs: number,
  context: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new AppError(
          'TIMEOUT',
          `Operation timed out after ${timeoutMs}ms`,
          undefined,
          new Error(context)
        )
      );
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};
