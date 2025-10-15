'use client';

import { useEffect } from 'react';
import { AnimationWrapper } from '@/components/ui/animations';
import { buttonStyles } from '@/lib/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
          <AnimationWrapper className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-red-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-600"
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
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Error
            </h2>

            <p className="text-gray-600 mb-8">
              Something went wrong with the application. Our team has been
              notified and is working on a fix.
            </p>

            <div className="space-y-4">
              <button
                onClick={reset}
                className={`${buttonStyles.primary} w-full`}
              >
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className={`${buttonStyles.outline} w-full`}
              >
                Go to Homepage
              </button>
            </div>

            {error.digest && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Error Details
                  </summary>
                  <div className="text-xs text-gray-600 font-mono bg-white p-3 rounded border">
                    <div>Error ID: {error.digest}</div>
                    <div>Message: {error.message}</div>
                  </div>
                </details>
              </div>
            )}

            <div className="mt-6 text-xs text-gray-500">
              If this problem persists, please contact support
            </div>
          </AnimationWrapper>
        </div>
      </body>
    </html>
  );
}
