import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  context?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  appVersion: string;
  platform: 'mobile';
}

const STORAGE_KEY = 'beer_cellar_error_logs';
const MAX_LOGS = 100; // Keep only last 100 errors
const BATCH_SIZE = 10; // Send 10 errors at a time

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private isSyncing = false;

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to initialize error logger:', err);
    }
  }

  async log(
    message: string,
    error?: Error | unknown,
    context?: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'error'
  ): Promise<void> {
    const errorLog: ErrorLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      severity,
      appVersion: '1.0.0', // Should come from app.json
      platform: 'mobile',
    };

    this.logs.unshift(errorLog); // Add to beginning

    // Keep only recent logs
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(0, MAX_LOGS);
    }

    // Persist to AsyncStorage
    await this.persistLogs();

    // Try to sync critical errors immediately
    if (severity === 'critical') {
      await this.syncErrorsToBacked([errorLog]);
    } else {
      // Queue for batch sync
      await this.syncIfReady();
    }
  }

  private async persistLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (err) {
      console.warn('Failed to persist error logs:', err);
    }
  }

  private async syncIfReady(): Promise<void> {
    // Sync when we have BATCH_SIZE errors or on app startup
    if (this.logs.length >= BATCH_SIZE && !this.isSyncing) {
      await this.syncErrorsToBacked(this.logs.slice(0, BATCH_SIZE));
    }
  }

  private async syncErrorsToBacked(logsToSync: ErrorLog[]): Promise<void> {
    if (this.isSyncing || logsToSync.length === 0) return;

    this.isSyncing = true;
    try {
      await apiClient.post('/errors/log', {
        logs: logsToSync,
        timestamp: Date.now(),
      });

      // Remove synced logs
      this.logs = this.logs.filter(
        (log) => !logsToSync.find((syncLog) => syncLog.id === log.id)
      );
      await this.persistLogs();
    } catch (err) {
      console.warn('Failed to sync errors to backend:', err);
      // Keep logs for retry
    } finally {
      this.isSyncing = false;
    }
  }

  async getLogs(limit = 50): Promise<ErrorLog[]> {
    return this.logs.slice(0, limit);
  }

  async clearLogs(): Promise<void> {
    this.logs = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  async getStats(): Promise<{
    totalErrors: number;
    critical: number;
    error: number;
    warning: number;
    info: number;
  }> {
    return {
      totalErrors: this.logs.length,
      critical: this.logs.filter((l) => l.severity === 'critical').length,
      error: this.logs.filter((l) => l.severity === 'error').length,
      warning: this.logs.filter((l) => l.severity === 'warning').length,
      info: this.logs.filter((l) => l.severity === 'info').length,
    };
  }
}

export const errorLogger = new ErrorLogger();
