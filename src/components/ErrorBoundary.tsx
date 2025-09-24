/**
 * Error Boundary Component for React Error Handling
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Props interface for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to wrap with error boundary */
  children: ReactNode;
  /** Optional fallback component to render when error occurs */
  fallback?: ReactNode;
  /** Optional callback function called when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Component name for error tracking */
  componentName?: string;
}

/**
 * State interface for ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error?: Error;
  /** Additional error information */
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 *
 * Provides comprehensive error handling for React components with:
 * - Error catching and display
 * - Error logging and reporting
 * - Graceful fallback UI
 * - Error recovery mechanisms
 *
 * @example
 * ```tsx
 * <ErrorBoundary componentName="Header" onError={logToSentry}>
 *   <Header />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Static method called when an error occurs during rendering
   * Updates component state to trigger error UI
   *
   * @param error - The error that was thrown
   * @returns Updated state indicating an error occurred
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called when an error is caught
   * Handles error logging and reporting
   *
   * @param error - The error that was thrown
   * @param errorInfo - Component stack trace information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error information
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to monitoring service (can be enhanced with Sentry)
    this.logErrorToService(error, errorInfo);
  }

  /**
   * Logs error information to monitoring services
   * Can be enhanced to integrate with Sentry, LogRocket, etc.
   *
   * @param error - The error that occurred
   * @param errorInfo - Component stack trace information
   */
  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // In production, you would send this to your monitoring service
    // Example: Sentry.captureException(error, { contexts: { errorData } });
  }

  /**
   * Attempts to recover from the error by resetting component state
   * Useful for allowing users to retry failed operations
   */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  /**
   * Renders the component
   * Shows error UI if error occurred, otherwise renders children
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center max-w-md">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
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

            {/* Error Message */}
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-red-700 mb-4">
              {this.props.componentName
                ? `There was an error in the ${this.props.componentName} component.`
                : 'An unexpected error occurred while loading this component.'}
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 * Provides a convenient way to add error handling to any component
 *
 * @param WrappedComponent - Component to wrap with error boundary
 * @param componentName - Name for error tracking
 * @returns Component wrapped with error boundary
 *
 * @example
 * ```tsx
 * const SafeHeader = withErrorBoundary(Header, 'Header');
 * ```
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string,
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary componentName={componentName}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
