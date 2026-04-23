import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { errorLogger } from '../lib/errorLogger';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  onError?: (error: Error) => void;
  context?: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return {
      hasError: true,
      error,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to our error logging system
    void errorLogger.log(
      error.message,
      error,
      this.props.context || 'ErrorBoundary',
      'critical'
    );

    // Update error count
    this.setState((prevState: ErrorState) => ({
      ...prevState,
      errorCount: prevState.errorCount + 1,
    }));

    // Call external handler if provided
    if (this.props.onError) {
      this.props.onError(error);
    }

    // Log to console for development
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState((prevState: ErrorState) => ({
      hasError: false,
      error: null,
      errorCount: prevState.errorCount,
    }));
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <View style={styles.container}>
          <ScrollView style={styles.content}>
            <Text style={styles.title}>⚠️ Something went wrong</Text>
            <Text style={styles.message}>{this.state.error.message}</Text>

            {__DEV__ && (
              <>
                <Text style={styles.stackTitle}>Stack trace:</Text>
                <Text style={styles.stack}>{this.state.error.stack}</Text>
              </>
            )}

            <Text style={styles.errorCount}>
              Error occurred {this.state.errorCount} time
              {this.state.errorCount > 1 ? 's' : ''}
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={(): void => {
                void errorLogger.clearLogs();
                Alert.alert('Success', 'Error logs cleared');
              }}
            >
              <Text style={styles.secondaryButtonText}>Clear Logs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={this.resetError}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (this.props.children || null) as React.ReactNode;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#d32f2f',
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  stackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#666',
  },
  stack: {
    fontSize: 11,
    fontFamily: 'Courier New',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    color: '#333',
  },
  errorCount: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#d4af37',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
