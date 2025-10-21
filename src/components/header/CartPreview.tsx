/**
 * CartPreview Component
 *
 * Handles cart icon display and live cart count updates.
 * Manages cart count state and provides real-time updates via API polling.
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

/**
 * Props interface for CartPreview component
 */
interface CartPreviewProps {
  /** Initial cart item count from server */
  initialCartCount: number;
  /** Optional custom class name for styling */
  className?: string;
  /** Optional test id for testing */
  testId?: string;
}

/**
 * Interface for cart API response
 */
interface CartApiResponse {
  cart: {
    totalQuantity?: number;
  } | null;
}

/**
 * CartPreview Component
 *
 * Features:
 * - Live cart count updates via API polling
 * - Event listener for cart updates
 * - Error handling for API failures
 * - Optimistic UI updates
 * - Accessible cart icon with proper labeling
 *
 * @param props - CartPreview component props
 * @returns React component for cart preview with live updates
 *
 * @example
 * ```tsx
 * <CartPreview
 *   initialCartCount={5}
 *   className="custom-cart-styles"
 *   testId="header-cart"
 * />
 * ```
 */
export default function CartPreview({
  initialCartCount,
  className = '',
  testId = 'nav-cart',
}: CartPreviewProps) {
  // Live cart count state with initial value from props
  const [liveCartCount, setLiveCartCount] = useState<number>(initialCartCount);

  // Loading state for cart updates
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  /**
   * Fetches current cart count from API
   * Handles errors gracefully and updates state
   *
   * @returns Promise that resolves when cart count is updated
   */
  const refreshCartCount = async (): Promise<void> => {
    try {
      setIsUpdating(true);

      // Fetch cart data with no-cache to ensure fresh data
      const response = await fetch('/api/cart', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        console.warn(
          `Cart API returned ${response.status}: ${response.statusText}`,
        );
        return;
      }

      // Parse and validate response
      const data = (await response.json()) as CartApiResponse;
      const newCount = data.cart?.totalQuantity ?? 0;

      // Update state with new count
      setLiveCartCount(newCount);

      // Log successful update in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cart count updated: ${newCount}`);
      }
    } catch (error) {
      // Log error but don't break the UI
      console.error('Failed to refresh cart count:', error);

      // Could emit an event or show a toast notification here
      // For now, we fail silently to maintain UX
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Effect hook to set up cart update listeners
   * Listens for custom 'cart:updated' events and refreshes count
   */
  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCartCount();
    };

    // Listen for cart update events
    window.addEventListener('cart:updated', handleCartUpdate);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('cart:updated', handleCartUpdate);
    };
  }, []);

  /**
   * Effect hook for periodic cart count refresh
   * Polls the cart API every 30 seconds to ensure accuracy
   */
  useEffect(() => {
    // Set up periodic refresh interval (30 seconds)
    const interval = setInterval(() => {
      refreshCartCount();
    }, 30000);

    // Clear interval on unmount
    return () => clearInterval(interval);
  }, []);

  /**
   * Generates accessible aria-label based on cart count
   * Provides meaningful description for screen readers
   *
   * @param count - Current cart count
   * @returns Accessible label string
   */
  const getCartAriaLabel = (count: number): string => {
    if (count === 0) {
      return 'Shopping cart is empty';
    }
    if (count === 1) {
      return 'Shopping cart with 1 item';
    }
    return `Shopping cart with ${count} items`;
  };

  /**
   * Determines if cart count badge should be visible
   * Hides badge when cart is empty for cleaner UI
   *
   * @param count - Current cart count
   * @returns Whether badge should be shown
   */
  const shouldShowBadge = (count: number): boolean => count > 0;

  return (
    <Button
      asChild
      variant="ghost"
      className={`relative h-14 w-14 rounded-full hover:bg-[hsl(var(--brand))] hover:text-white transition-colors duration-200 ${className}`}
      disabled={isUpdating}
    >
      <Link
        href="/cart"
        aria-label={getCartAriaLabel(liveCartCount)}
        data-test-id={testId}
        className="relative"
      >
        {/* Cart Icon */}
        <ShoppingCart
          className={`h-9 w-9 transition-transform duration-200 ${
            isUpdating ? 'scale-95' : 'hover:scale-105'
          }`}
        />

        {/* Cart Count Badge */}
        {shouldShowBadge(liveCartCount) && (
          <span
            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium z-10 transition-all duration-200 transform"
            data-test-id="cart-count"
            aria-hidden="true" // Hidden from screen readers since it's in the aria-label
            style={{
              // Ensure badge is always visible and properly sized
              minWidth: liveCartCount > 99 ? '24px' : '20px',
              fontSize: liveCartCount > 99 ? '10px' : '12px',
            }}
          >
            {/* Display 99+ for counts over 99 */}
            {liveCartCount > 99 ? '99+' : liveCartCount}
          </span>
        )}

        {/* Loading indicator for updates */}
        {isUpdating && (
          <div className="absolute inset-0 bg-black/10 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Link>
    </Button>
  );
}

/**
 * Custom hook for cart count management
 * Can be used in other components that need cart count functionality
 *
 * @param initialCount - Initial cart count
 * @returns Object with cart count and refresh function
 *
 * @example
 * ```tsx
 * const { cartCount, refreshCount, isLoading } = useCartCount(0);
 * ```
 */
export function useCartCount(initialCount: number = 0) {
  const [cartCount, setCartCount] = useState<number>(initialCount);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCount = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart', { cache: 'no-store' });

      if (!response.ok) return;

      const data = (await response.json()) as CartApiResponse;
      setCartCount(data.cart?.totalQuantity ?? 0);
    } catch (error) {
      console.error('Failed to refresh cart count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleCartUpdate = () => refreshCount();
    window.addEventListener('cart:updated', handleCartUpdate);
    return () => window.removeEventListener('cart:updated', handleCartUpdate);
  }, []);

  return { cartCount, refreshCount, isLoading };
}
