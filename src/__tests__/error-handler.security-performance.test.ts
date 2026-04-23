import { describe, expect, it, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { handleError, retryWithExponentialBackoff, withTimeout, AppError } from '../lib/errorHandler';

vi.mock('../lib/errorLogger', () => ({
  errorLogger: {
    log: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('mobile errorHandler security and performance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('maps axios 401 errors to UNAUTHORIZED code', async () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    const error = {
      message: 'Unauthorized',
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };

    const appError = await handleError(error, 'auth-login');

    expect(appError).toBeInstanceOf(AppError);
    expect(appError.code).toBe('UNAUTHORIZED');
    expect(appError.statusCode).toBe(401);
  });

  it('does not retry client errors except 429', async () => {
    const fn = vi.fn().mockRejectedValue(new AppError('NOT_FOUND', 'Missing', 404));

    await expect(retryWithExponentialBackoff(fn, 'fetch-resource', 3, 1)).rejects.toThrow('Missing');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('applies timeout guard for long operations', async () => {
    await expect(
      withTimeout(
        () => new Promise((resolve) => setTimeout(resolve, 20)),
        5,
        'slow-op'
      )
    ).rejects.toMatchObject({ code: 'TIMEOUT' });
  });
});
