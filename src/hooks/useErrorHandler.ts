import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { handleError, AppError, withErrorHandler, retryWithExponentialBackoff } from '../lib/errorHandler';
import { analyticsManager } from '../lib/analyticsManager';

export const useErrorHandler = () => {
  const [error, setError] = useState<AppError | null>(null);

  const handleAsyncError = useCallback(
    async (
      fn: () => Promise<void>,
      context: string,
      showAlert: boolean = true
    ): Promise<AppError | null> => {
      try {
        await fn();
        setError(null);
        return null;
      } catch (err) {
        const appError = await handleError(err, context, 'error');
        setError(appError);

        if (showAlert) {
          Alert.alert('Error', appError.message, [{ text: 'OK', onPress: () => {} }]);
        }

        return appError;
      }
    },
    []
  );

  const executeWithErrorHandler = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      context: string,
      showAlert = true
    ): Promise<[T | null, AppError | null]> => {
      const [result, err] = await withErrorHandler(fn, context, 'error');

      if (err && showAlert) {
        Alert.alert('Error', err.message, [{ text: 'OK', onPress: () => {} }]);
      }

      setError(err);
      return [result, err];
    },
    []
  );

  const executeWithRetry = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      context: string,
      maxRetries = 3,
      showAlert = false
    ): Promise<[T | null, AppError | null]> => {
      try {
        const result = await retryWithExponentialBackoff(fn, context, maxRetries);
        setError(null);
        return [result, null];
      } catch (err) {
        const appError = await handleError(err, context, 'warning');
        setError(appError);

        if (showAlert) {
          Alert.alert('Error', appError.message, [{ text: 'OK', onPress: () => {} }]);
        }

        return [null, appError];
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleAsyncError,
    executeWithErrorHandler,
    executeWithRetry,
    clearError,
  };
};

export const useAnalytics = () => {
  const trackEvent = useCallback(async (name: string, data?: Record<string, unknown>) => {
    analyticsManager.trackEvent(name, data);
  }, []);

  const trackUserAction = useCallback(async (actionName: string, actionData?: Record<string, unknown>) => {
    analyticsManager.trackUserAction(actionName, actionData);
  }, []);

  const trackError = useCallback(async (errorName: string, errorMessage: string, stack?: string) => {
    await analyticsManager.trackErrorEvent(errorName, errorMessage, stack);
  }, []);

  return {
    trackEvent,
    trackUserAction,
    trackError,
  };
};
