/**
 * Search Component
 *
 * Handles search modal trigger and search button functionality.
 * Integrates with SearchModal component and provides keyboard shortcuts.
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import SearchModal from '@/components/SearchModal';

/**
 * Props interface for Search component
 */
interface SearchProps {
  /** Optional custom class name for styling */
  className?: string;
  /** Optional test id for testing */
  testId?: string;
  /** Whether to show search icon label text */
  showLabel?: boolean;
  /** Custom aria label for accessibility */
  customAriaLabel?: string;
}

/**
 * Search Component
 *
 * Features:
 * - Modal-based search interface
 * - Keyboard shortcuts (Cmd+K, Ctrl+K, /)
 * - Focus management and accessibility
 * - Portal-based modal rendering
 * - Escape key handling
 * - Analytics integration ready
 *
 * @param props - Search component props
 * @returns React component for search functionality
 *
 * @example
 * ```tsx
 * <Search
 *   className="custom-search-styles"
 *   testId="header-search"
 *   showLabel={true}
 * />
 * ```
 */
export default function Search({
  className = '',
  testId = 'nav-search',
  showLabel = false,
  customAriaLabel,
}: SearchProps) {
  // Search modal visibility state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Reference to search button for focus management
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Opens the search modal
   * Manages focus and modal state
   */
  const openSearch = useCallback(() => {
    setIsSearchOpen(true);

    // Analytics event for search modal opened
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search_modal_opened', {
        event_category: 'Search',
        event_label: 'Header Search Button',
        value: 1,
      });
    }
  }, []);

  /**
   * Closes the search modal
   * Returns focus to search button for accessibility
   */
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);

    // Return focus to search button when modal closes
    setTimeout(() => {
      searchButtonRef.current?.focus();
    }, 100);

    // Analytics event for search modal closed
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search_modal_closed', {
        event_category: 'Search',
        event_label: 'Modal Closed',
        value: 1,
      });
    }
  }, []);

  /**
   * Handles search button click
   * Prevents default behavior and opens modal
   *
   * @param event - Click event
   */
  const handleSearchClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    openSearch();
  };

  /**
   * Handles keyboard events for search button
   * Supports Enter and Space keys for activation
   *
   * @param event - Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openSearch();
    }
  };

  /**
   * Effect hook for global keyboard shortcuts
   * Listens for Cmd+K, Ctrl+K, and "/" to open search
   */
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.contentEditable === 'true'
      ) {
        return;
      }

      // Handle different keyboard shortcuts
      const isModifierPressed = event.metaKey || event.ctrlKey;

      // Cmd+K or Ctrl+K to open search
      if (isModifierPressed && event.key === 'k') {
        event.preventDefault();
        openSearch();
        return;
      }

      // "/" key to open search (common in many apps)
      if (event.key === '/' && !isModifierPressed) {
        event.preventDefault();
        openSearch();
        return;
      }
    };

    // Add global event listener
    document.addEventListener('keydown', handleGlobalKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [openSearch]);

  /**
   * Effect hook for escape key handling when modal is open
   * Provides additional way to close modal
   */
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isSearchOpen, closeSearch]);

  /**
   * Generates accessible aria-label for search button
   * Includes keyboard shortcut information
   *
   * @returns Accessible label string
   */
  const getAriaLabel = (): string => {
    if (customAriaLabel) {
      return customAriaLabel;
    }

    const baseLabel = 'Search products';
    const shortcutInfo = 'Press Cmd+K or / to search';
    return `${baseLabel}. ${shortcutInfo}`;
  };

  /**
   * Determines appropriate button variant based on context
   * Uses ghost variant for header integration
   *
   * @returns Button variant
   */
  const getButtonVariant = () => 'ghost' as const;

  return (
    <>
      {/* Search Button */}
      <Button
        ref={searchButtonRef}
        variant={getButtonVariant()}
        className={`relative h-14 w-14 rounded-full hover:bg-[#4e2cfb] hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4e2cfb] focus-visible:ring-offset-2 ${className}`}
        onClick={handleSearchClick}
        onKeyDown={handleKeyDown}
        aria-label={getAriaLabel()}
        data-test-id={testId}
        type="button"
      >
        {/* Search Icon */}
        <SearchIcon
          className="h-9 w-9 transition-transform duration-200 hover:scale-105"
          aria-hidden="true"
        />

        {/* Optional Label Text */}
        {showLabel && (
          <span className="sr-only md:not-sr-only md:ml-2 text-sm font-medium">
            Search
          </span>
        )}

        {/* Keyboard Shortcut Hint (visible on larger screens) */}
        <div className="hidden lg:flex absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <kbd className="px-1.5 py-0.5 text-xs border border-gray-300 rounded bg-gray-50">
            ⌘K
          </kbd>
        </div>
      </Button>

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      )}
    </>
  );
}

/**
 * Custom hook for search functionality
 * Can be used in other components that need search features
 *
 * @returns Object with search state and control functions
 *
 * @example
 * ```tsx
 * const { isOpen, openSearch, closeSearch } = useSearch();
 * ```
 */
export function useSearch() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  };
}

/**
 * Interface for search analytics events
 * Standardizes search tracking across the application
 */
export interface SearchAnalytics {
  /** The search query entered by user */
  query: string;
  /** Source component that triggered the search */
  source: 'header' | 'hero' | 'collection' | 'modal';
  /** Number of results returned */
  resultCount?: number;
  /** Time taken to perform search in milliseconds */
  searchTime?: number;
}

/**
 * Utility function to track search analytics
 * Centralizes search event tracking logic
 *
 * @param analytics - Search analytics data
 */
export function trackSearchAnalytics(analytics: SearchAnalytics): void {
  // Google Analytics 4 event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: analytics.query,
      event_category: 'Search',
      event_label: `Search from ${analytics.source}`,
      custom_parameter_1: analytics.resultCount?.toString(),
      custom_parameter_2: analytics.searchTime?.toString(),
    });
  }

  // Microsoft Clarity custom event
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', 'search_performed', {
      query: analytics.query,
      source: analytics.source,
      resultCount: analytics.resultCount,
      searchTime: analytics.searchTime,
    });
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Search Analytics:', analytics);
  }
}
