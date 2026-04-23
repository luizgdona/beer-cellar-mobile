# Mobile Error Persistence & Analytics System

## Overview

The mobile app now has a complete error persistence, logging,
and analytics system with:

- **Error Logger**: Persists errors to AsyncStorage and syncs to backend
- **Error Boundary**: Catches component errors and provides recovery UI
- **Error Handler**: Centralized error handling with retry logic
- **Analytics Manager**: Tracks events, performance, and user actions

## Features

### 1. Error Logging (`errorLogger`)

**Persists errors to:**

- Device AsyncStorage (up to 100 errors)
- Backend API endpoint (batched)

**Usage:**

```typescript
import { errorLogger } from '@/lib/errorLogger';

// Log an error
await errorLogger.log(
  'User not found',
  error,
  'LoginScreen',
  'error'
);

// Get all logs
const logs = await errorLogger.getLogs(10);

// Get statistics
const stats = await errorLogger.getStats();

// Clear logs
await errorLogger.clearLogs();
```

**Severity Levels:**

- `'info'` - General information
- `'warning'` - Non-critical issues
- `'error'` - Standard errors
- `'critical'` - Critical failures (sent immediately to backend)

### 2. Error Boundary Component

**Wraps the entire app to catch component errors:**

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary context="MyScreen">
  <YourComponent />
</ErrorBoundary>
```

**Features:**

- Catches render errors
- Shows error UI to user
- Logs errors automatically
- Provides "Try Again" button for recovery
- Shows stack trace in dev mode

### 3. Centralized Error Handler

**Provides consistent error handling across the app:**

```typescript
import { handleError, withErrorHandler, retryWithExponentialBackoff } from '@/lib/errorHandler';

// Basic error handling
try {
  await someAsyncOperation();
} catch (error) {
  const appError = await handleError(error, 'OperationName');
  // appError has: code, message, statusCode, originalError
}

// With error handler hook
const [result, error] = await withErrorHandler(
  () => apiClient.get('/beers'),
  'FetchBeers',
  'error'
);

// With automatic retry (exponential backoff)
const beers = await retryWithExponentialBackoff(
  () => apiClient.get('/beers'),
  'FetchBeers',
  3, // max retries
  1000 // initial delay (ms)
);

// With timeout
const result = await withTimeout(
  () => fetchBeers(),
  5000, // timeout (ms)
  'FetchBeers'
);
```

**Error Codes:**

- `'UNAUTHORIZED'` - 401
- `'FORBIDDEN'` - 403
- `'NOT_FOUND'` - 404
- `'RATE_LIMITED'` - 429
- `'SERVER_ERROR'` - 5xx
- `'API_ERROR'` - Other API errors
- `'TIMEOUT'` - Operation exceeded timeout
- `'UNKNOWN_ERROR'` - Unexpected errors

### 4. Analytics Manager

**Tracks events, performance, and user actions:**

```typescript
import { analyticsManager, measurePerformance } from '@/lib/analyticsManager';

// Track custom event
analyticsManager.trackEvent('beer_added', {
  beerName: 'IPA',
  brewery: 'Local Brewery'
});

// Track user action
await analyticsManager.trackUserAction('navigated_to_home', {
  from: 'login',
  timestamp: Date.now()
});

// Track error event
await analyticsManager.trackErrorEvent(
  'APIError',
  'Failed to fetch beers',
  error.stack
);

// Measure performance
const data = await measurePerformance(
  () => fetchBeers(),
  'fetchBeers',
  userId
);

// Force sync to backend
await analyticsManager.forceSync();

// Get queue size
const size = await analyticsManager.getQueueSize();
```

## Usage Hooks

### `useErrorHandler()`

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyScreen() {
  const { 
    error, 
    handleAsyncError,
    executeWithErrorHandler,
    executeWithRetry,
    clearError 
  } = useErrorHandler();

  const handleFetch = async () => {
    await executeWithErrorHandler(
      () => apiClient.get('/beers'),
      'FetchBeers',
      true // show alert
    );
  };

  return (
    <View>
      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
      <Button onPress={handleFetch} title="Fetch Beers" />
    </View>
  );
}
```

### `useAnalytics()`

```typescript
import { useAnalytics } from '@/hooks/useErrorHandler';

function MyScreen() {
  const { trackEvent, trackUserAction, trackError } = useAnalytics();

  const handleBeerAdded = async (beerData) => {
    try {
      await addBeer(beerData);
      trackEvent('beer_added', { beerName: beerData.name });
    } catch (err) {
      trackError('AddBeerFailed', err.message);
    }
  };

  return <Button onPress={handleBeerAdded} title="Add Beer" />;
}
```

## App Initialization

The error logger and analytics manager are automatically initialized in `App.tsx`:

```typescript
export default function App() {
  useEffect(() => {
    const initializeServices = async () => {
      await errorLogger.initialize();
      await analyticsManager.initialize();
      analyticsManager.trackEvent('app_started');
    };

    initializeServices();

    return () => {
      analyticsManager.stopPeriodicSync();
    };
  }, []);

  return (
    <ErrorBoundary context="RootApp">
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

## Backend Integration

The mobile app sends error logs and analytics to the backend via:

- **Error Logs URL**: `POST /errors/log`
  - Batches critical errors immediately
  - Batches regular errors every 10 logs
  
- **Analytics URL**: `POST /analytics/events`
  - Sends analytics events in batches of 20
  - Periodic sync every 5 minutes
  - Batches performance metrics and user actions

**Backend should implement:**

```typescript
// Receive error logs
POST /errors/log
{
  logs: ErrorLog[],
  timestamp: number
}

// Receive analytics events
POST /analytics/events
{
  events: AnalyticsEvent[],
  sessionId: string,
  timestamp: number
}
```

## Storage

- **Error Logs**: Stored in `beer_cellar_error_logs` in AsyncStorage
- **Analytics Events**: Stored in `beer_cellar_analytics` in AsyncStorage
- **Session ID**: Stored in `beer_cellar_session_id` in AsyncStorage

Maximum retention: 100 errors, unlimited analytics events (batched regularly)

## Best Practices

1. **Wrap async operations with error handlers:**

   ```typescript
   const [result, error] = await executeWithErrorHandler(
     () => apiClient.get('/beers'),
     'FetchBeers'
   );
   ```

2. **Use retry for network operations:**

   ```typescript
   const data = await retryWithExponentialBackoff(
     () => apiClient.get('/beers'),
     'FetchBeers'
   );
   ```

3. **Track important user actions:**

   ```typescript
   analyticsManager.trackUserAction('beer_marked_consumed', { beerId });
   ```

4. **Measure performance for critical operations:**

   ```typescript
   const result = await measurePerformance(
     () => fetchAndProcessBeers(),
     'fetchAndProcessBeers'
   );
   ```

5. **Use error boundary for component-level errors:**

   ```typescript
   <ErrorBoundary context="BeerList">
     <BeerList />
   </ErrorBoundary>
   ```

## Monitoring

To monitor errors in your app:

1. Check AsyncStorage contents during development:

   ```typescript
   const logs = await errorLogger.getLogs();
   console.log(logs);
   ```

2. Check analytics queue size:

   ```typescript
   const size = await analyticsManager.getQueueSize();
   console.log(`Pending analytics events: ${size}`);
   ```

3. Force sync to backend:

   ```typescript
   await errorLogger.syncErrorsToBacked();
   await analyticsManager.forceSync();
   ```
