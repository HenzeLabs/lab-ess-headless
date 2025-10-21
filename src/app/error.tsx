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
    <main
      role="main"
      className="flex items-center justify-center min-h-screen bg-background"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[hsl(var(--destructive))] mb-4">
          Something went wrong!
        </h1>
        <p className="text-muted-foreground mb-8">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 text-lg font-semibold text-white bg-[hsl(var(--brand-dark))] rounded-md hover:bg-[hsl(var(--brand-dark))]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
