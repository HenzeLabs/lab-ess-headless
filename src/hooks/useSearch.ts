'use client';

import { useState, useCallback } from 'react';
import type {
  SearchResults,
  PredictiveSearchResult,
  SearchParams,
} from '@/types/search';

interface UseSearchReturn {
  // Search state
  searchResults: SearchResults | null;
  predictiveResults: PredictiveSearchResult | null;
  isLoading: boolean;
  error: string | null;

  // Search functions
  search: (params: SearchParams) => Promise<SearchResults>;
  predictiveSearch: (
    query: string,
    limit?: number,
  ) => Promise<PredictiveSearchResult>;
  clearResults: () => void;
}

export function useSearch(): UseSearchReturn {
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null,
  );
  const [predictiveResults, setPredictiveResults] =
    useState<PredictiveSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (params: SearchParams): Promise<SearchResults> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const results: SearchResults = await response.json();
        setSearchResults(results);
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const predictiveSearch = useCallback(
    async (
      query: string,
      limit: number = 10,
    ): Promise<PredictiveSearchResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/search/predictive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, limit }),
        });

        if (!response.ok) {
          throw new Error(`Predictive search failed: ${response.status}`);
        }

        const results: PredictiveSearchResult = await response.json();
        setPredictiveResults(results);
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Predictive search failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearResults = useCallback(() => {
    setSearchResults(null);
    setPredictiveResults(null);
    setError(null);
  }, []);

  return {
    searchResults,
    predictiveResults,
    isLoading,
    error,
    search,
    predictiveSearch,
    clearResults,
  };
}
