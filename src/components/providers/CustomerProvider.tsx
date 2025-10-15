'use client';

import React from 'react';

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  // For now, just render children since the hook is self-contained
  // In the future, this can be expanded to provide context
  return <>{children}</>;
}
