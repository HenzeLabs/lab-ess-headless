'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          role="main"
          className="flex items-center justify-center min-h-screen bg-background"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Something went wrong!
            </h1>
            <p className="text-muted-foreground mb-8">{error.message}</p>
            <button
              onClick={reset}
              className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
