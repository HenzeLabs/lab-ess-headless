'use client';

import React, { createContext, useContext } from 'react';
import { useSearch } from '@/hooks/useSearch';

const SearchContext = createContext<ReturnType<typeof useSearch> | null>(null);

interface SearchProviderProps {
  children: React.ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const searchHook = useSearch();

  return (
    <SearchContext.Provider value={searchHook}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
