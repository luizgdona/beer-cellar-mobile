import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import apiClient from './apiClient';

export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  type: 'error' | 'event' | 'performance' | 'user_action';
  name: string;
  data?: Record<string, any>;
  userId?: string;
  sessionId: string;
  appVersion: string;
  platform: 'mobile-ios' | 'mobile-android' | 'mobile-web';
}

export interface PerformanceMetrics {
  eventName: string;
  duration: number; // milliseconds
  startMemory?: number;
  endMemory?: number;
  success: boolean;
}

const ANALYTICS_STORAGE_KEY = 'beer_cellar_analytics';
const SESSION_STORAGE_KEY = 'beer_cellar_session_id';
const BATCH_SIZE = 20;
const SYNC_INTERVAL = 300000; // 5 minutes

let sessionId: string = '';
let analyticsQueue: AnalyticsEvent[] = [];
let syncTimer: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

class AnalyticsManager {
  async initialize(): Promise<void> {
    try {
      // Get or create session ID
      let stored = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      } else {
        sessionId = stored;
      }

      // Load queued events
      const storedEvents = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (storedEvents) {
        analyticsQueue = JSON.parse(storedEvents);
      }

      // Start periodic sync
      this.startPeriodicSync();
    } catch (err) {
      console.warn('Failed to initialize analytics:', err);
    }
  }

  private getPlatform(): 'mobile-ios' | 'mobile-android' | 'mobile-web' {
    if (Platform.OS === 'ios') return 'mobile-ios';
    if (Platform.OS === 'android') return 'mobile-android';
    return 'mobile-web';
  }

  trackEvent(name: string, data?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'event',
      name,
      data,
      sessionId,
      appVersion: '1.0.0',
      platform: this.getPlatform(),
    };

    analyticsQueue.push(event);
    this.persistQueue();
  }

  async trackErrorEvent(
    errorName: string,
    errorMessage: string,
    stack?: string,
    userId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'error',
      name: errorName,
      data: {
        message: errorMessage,
        stack,
      },
      userId,
      sessionId,
      appVersion: '1.0.0',
      platform: this.getPlatform(),
    };

    analyticsQueue.push(event);
    await this.persistQueue();

    // Send critical errors immediately
    await this.syncIfReady();
  }

  async trackPerformance(metrics: PerformanceMetrics, userId?: string): Promise<void> {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'performance',
      name: metrics.eventName,
      data: {
        duration: metrics.duration,
        startMemory: metrics.startMemory,
        endMemory: metrics.endMemory,
        success: metrics.success,
      },
      userId,
      sessionId,
      appVersion: '1.0.0',
      platform: this.getPlatform(),
    };

    analyticsQueue.push(event);
    await this.persistQueue();
  }

  async trackUserAction(
    actionName: string,
    actionData?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'user_action',
      name: actionName,
      data: actionData,
      userId,
      sessionId,
      appVersion: '1.0.0',
      platform: this.getPlatform(),
    };

    analyticsQueue.push(event);
    await this.persistQueue();
  }

  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analyticsQueue));
    } catch (err) {
      console.warn('Failed to persist analytics queue:', err);
    }
  }

  private async syncIfReady(): Promise<void> {
    if (analyticsQueue.length < BATCH_SIZE || isSyncing) {
      return;
    }

    await this.syncToBackend();
  }

  private async syncToBackend(): Promise<void> {
    if (isSyncing || analyticsQueue.length === 0) return;

    isSyncing = true;
    try {
      const eventsToSync = analyticsQueue.slice(0, BATCH_SIZE);

      await apiClient.post('/analytics/events', {
        events: eventsToSync,
        sessionId,
        timestamp: Date.now(),
      });

      // Remove synced events
      analyticsQueue = analyticsQueue.filter(
        (event) => !eventsToSync.find((syncEvent) => syncEvent.id === event.id)
      );

      await this.persistQueue();
    } catch (err) {
      console.warn('Failed to sync analytics:', err);
      // Keep in queue for retry
    } finally {
      isSyncing = false;
    }
  }

  private startPeriodicSync(): void {
    if (syncTimer) {
      clearInterval(syncTimer);
    }

    syncTimer = setInterval(() => {
      this.syncToBackend();
    }, SYNC_INTERVAL);
  }

  stopPeriodicSync(): void {
    if (syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
    }
  }

  async forceSync(): Promise<void> {
    while (analyticsQueue.length > 0) {
      await this.syncToBackend();
    }
  }

  async getQueueSize(): Promise<number> {
    return analyticsQueue.length;
  }

  getSessionId(): string {
    return sessionId;
  }
}

export const analyticsManager = new AnalyticsManager();

// Performance tracking helper
export const measurePerformance = async <T,>(
  fn: () => Promise<T>,
  eventName: string,
  userId?: string
): Promise<T> => {
  const startTime = Date.now();
  const startMemory = (performance as any)?.memory?.usedJSHeapSize;

  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    const endMemory = (performance as any)?.memory?.usedJSHeapSize;

    await analyticsManager.trackPerformance(
      {
        eventName,
        duration,
        startMemory,
        endMemory,
        success: true,
      },
      userId
    );

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const endMemory = (performance as any)?.memory?.usedJSHeapSize;

    await analyticsManager.trackPerformance(
      {
        eventName,
        duration,
        startMemory,
        endMemory,
        success: false,
      },
      userId
    );

    throw error;
  }
};
