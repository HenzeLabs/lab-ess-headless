'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { textStyles, buttonStyles } from '@/lib/ui';
import type { LabAnalytics } from '@/lib/types';

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorData {
  errorId: string;
  message: string;
  stack?: string;
  componentStack: string;
  level: string;
  context?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  userId: string | null;
  sessionId: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  isolateErrors?: boolean;
  level: 'app' | 'page' | 'component' | 'feature';
  context?: string;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
  errorId: string;
  level: string;
  context?: string;
}

// Error reporting service
class ErrorReportingService {
  static async reportError(
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string,
    level: string,
    context?: string,
  ) {
    const errorData: ErrorData = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level,
      context,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    // Send to multiple error tracking services
    await Promise.allSettled([
      this.sendToAnalytics(errorData),
      this.sendToCustomEndpoint(errorData),
    ]);
  }

  private static getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId') || null;
  }

  private static getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('sessionId') || null;
  }

  private static async sendToAnalytics(errorData: ErrorData) {
    try {
      if (typeof window !== 'undefined') {
        const analytics = (
          window as unknown as { __labAnalytics?: LabAnalytics }
        ).__labAnalytics;
        if (analytics?.trackError) {
          analytics.trackError({
            errorId: errorData.errorId,
            errorType: 'javascript_error',
            errorLevel: errorData.level,
            errorContext: errorData.context,
          });
        }
      }
    } catch (e) {
      console.error('Failed to send error to analytics:', e);
    }
  }

  private static async sendToCustomEndpoint(errorData: ErrorData) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    } catch (e) {
      console.error('Failed to send error to custom endpoint:', e);
    }
  }
}

// Default error fallback components
const AppLevelErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  errorId,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--bg))] px-4">
    <div className="text-center max-w-md">
      <div className="mb-8">
        <h1 className={`${textStyles.h1} text-[hsl(var(--destructive))] mb-4`}>
          Something went wrong
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">
          We apologize for the inconvenience. Our team has been notified and is
          working to fix this issue.
        </p>
        <details className="text-left bg-[hsl(var(--surface))] p-4 rounded-lg mb-6">
          <summary className="cursor-pointer text-sm font-medium">
            Error Details (ID: {errorId})
          </summary>
          <pre className="mt-2 text-xs text-[hsl(var(--muted-foreground))] whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      </div>
      <div className="space-x-4">
        <Button onClick={resetError} className={buttonStyles.primary}>
          Try Again
        </Button>
        <Button
          onClick={() => (window.location.href = '/')}
          className={buttonStyles.outline}
        >
          Go Home
        </Button>
      </div>
    </div>
  </div>
);

const PageLevelErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetError,
  errorId,
  context,
}) => (
  <div className="py-12 px-4 text-center">
    <h2 className={`${textStyles.h2} text-[hsl(var(--destructive))] mb-4`}>
      Page Error
    </h2>
    <p className="text-[hsl(var(--muted-foreground))] mb-6">
      There was an error loading this {context || 'page'}. Please try
      refreshing.
    </p>
    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-6">
      Error ID: {errorId}
    </p>
    <div className="space-x-4">
      <Button onClick={resetError} className={buttonStyles.primary}>
        Retry
      </Button>
      <Button
        onClick={() => window.location.reload()}
        className={buttonStyles.outline}
      >
        Refresh Page
      </Button>
    </div>
  </div>
);

const ComponentLevelErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetError,
  errorId,
  context,
}) => (
  <div className="p-4 border border-[hsl(var(--destructive))] rounded-lg bg-[hsl(var(--destructive))]/5">
    <p className="text-sm text-[hsl(var(--destructive))] mb-2">
      {context || 'Component'} failed to load
    </p>
    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
      Error ID: {errorId}
    </p>
    <Button onClick={resetError} size="sm" className={buttonStyles.outline}>
      Retry
    </Button>
  </div>
);

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId =
      this.state.errorId ||
      `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.setState({
      errorInfo,
      errorId,
    });

    // Report error
    ErrorReportingService.reportError(
      error,
      errorInfo,
      errorId,
      this.props.level,
      this.props.context,
    );

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (
      this.state.hasError &&
      this.state.error &&
      this.state.errorInfo &&
      this.state.errorId
    ) {
      const FallbackComponent =
        this.props.fallback || this.getDefaultFallback();

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          errorId={this.state.errorId}
          level={this.props.level}
          context={this.props.context}
        />
      );
    }

    return this.props.children;
  }

  private getDefaultFallback() {
    switch (this.props.level) {
      case 'app':
        return AppLevelErrorFallback;
      case 'page':
        return PageLevelErrorFallback;
      case 'component':
      case 'feature':
        return ComponentLevelErrorFallback;
      default:
        return ComponentLevelErrorFallback;
    }
  }
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  level: 'page' | 'component' | 'feature' = 'component',
  context?: string,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary level={level} context={context}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = React.useCallback(
    (
      error: Error,
      context?: string,
      level: 'component' | 'feature' = 'component',
    ) => {
      const errorId = `manual_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const errorInfo: ErrorInfo = {
        componentStack: 'Manual error report',
      };

      ErrorReportingService.reportError(
        error,
        errorInfo,
        errorId,
        level,
        context,
      );
    },
    [],
  );

  return { reportError };
}
