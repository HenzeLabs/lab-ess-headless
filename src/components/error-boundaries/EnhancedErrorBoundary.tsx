'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { buttonStyles } from '@/lib/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Send to analytics/monitoring
    if (typeof window !== 'undefined') {
      // Track error with user context
      console.log('Error context:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        level: this.props.level || 'component',
        context: this.props.context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: undefined,
        errorId: '',
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorId: '',
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on level
      const isPageLevel = this.props.level === 'page';
      const isCritical = this.props.level === 'critical';

      return (
        <div
          className={`
            ${
              isPageLevel
                ? 'min-h-screen flex items-center justify-center'
                : 'min-h-64 flex items-center justify-center'
            }
            ${isCritical ? 'bg-red-50' : 'bg-gray-50'}
            p-8 rounded-lg border border-gray-200
          `}
        >
          <div className="text-center max-w-md">
            <div
              className={`
              w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
              ${isCritical ? 'bg-red-100' : 'bg-gray-100'}
            `}
            >
              <svg
                className={`w-8 h-8 ${
                  isCritical ? 'text-red-600' : 'text-gray-600'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isCritical ? 'Critical Error' : 'Something went wrong'}
            </h2>

            <p className="text-gray-600 mb-6">
              {isCritical
                ? 'A critical error has occurred. Please refresh the page or contact support.'
                : 'An unexpected error occurred. You can try again or refresh the page.'}
            </p>

            <div className="space-y-3">
              {this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className={`${buttonStyles.primary} w-full`}
                >
                  Try Again ({this.maxRetries - this.state.retryCount} attempts
                  left)
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className={`${buttonStyles.outline} w-full`}
              >
                Refresh Page
              </button>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error?.message}
                    </div>
                    <div className="mb-2">
                      <strong>Context:</strong>{' '}
                      {this.props.context || 'Unknown'}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.error?.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="text-xs text-gray-500 mt-4">
                Error ID: {this.state.errorId}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper component
export const EnhancedErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundary {...props} />;
};

// Component-level error boundary with sensible defaults
export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  context?: string;
}> = ({ children, context }) => {
  return (
    <ErrorBoundary level="component" context={context}>
      {children}
    </ErrorBoundary>
  );
};

export default EnhancedErrorBoundary;
