'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Cart } from '@/lib/types';

type RefreshOptions = {
  silent?: boolean;
  cartIdOverride?: string | null;
};

type CartContextValue = {
  cart: Cart | null;
  cartId: string | null;
  isRefreshing: boolean;
  refreshCart: (options?: RefreshOptions) => Promise<Cart | null>;
  updateCartState: (next: Cart | null) => Cart | null;
};

const STORAGE_KEY = 'shopify_cart_id';

const CartContext = createContext<CartContextValue | null>(null);

function isValidCartId(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith('gid://shopify/Cart/'));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inFlight = useRef<Promise<Cart | null> | null>(null);
  const cartRef = useRef<Cart | null>(null);

  const applyCart = useCallback((next: Cart | null) => {
    cartRef.current = next;
    setCart(next);

    if (typeof window !== 'undefined') {
      if (next?.id && isValidCartId(next.id)) {
        window.localStorage.setItem(STORAGE_KEY, next.id);
        setCartId(next.id);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
        setCartId(null);
      }
    }

    return next;
  }, []);

  const refreshCart = useCallback(
    async (options: RefreshOptions = {}) => {
      const { silent = false, cartIdOverride } = options;

      if (inFlight.current) {
        return inFlight.current;
      }

      const targetCartId =
        typeof cartIdOverride === 'string' && cartIdOverride.length > 0
          ? cartIdOverride
          : cartId;

      const doRefresh = (async () => {
        if (!silent) setIsRefreshing(true);
        try {
          const query = targetCartId
            ? `?cartId=${encodeURIComponent(targetCartId)}`
            : '';

          const response = await fetch(`/api/cart${query}`, {
            cache: 'no-store',
          });

          if (!response.ok) {
            if (response.status === 404) {
              return applyCart(null);
            }
            console.warn(
              `cart refresh failed: ${response.status} ${response.statusText}`,
            );
            return cartRef.current;
          }

          const json = (await response.json()) as { cart: Cart | null };
          return applyCart(json.cart ?? null);
        } catch (error) {
          console.error('cart refresh threw', error);
          return cartRef.current;
        } finally {
          if (!silent) setIsRefreshing(false);
          inFlight.current = null;
        }
      })();

      inFlight.current = doRefresh;
      return doRefresh;
    },
    [applyCart, cartId],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedCartId = window.localStorage.getItem(STORAGE_KEY);
    if (storedCartId && isValidCartId(storedCartId)) {
      setCartId(storedCartId);
      void refreshCart({ silent: true, cartIdOverride: storedCartId });
    } else {
      void refreshCart({ silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - refreshCart is stable but we don't want to re-run

  // NOTE: We removed the 'cart:updated' event listener because we now update
  // the cart state directly via updateCartState() instead of using events.
  // This eliminates race conditions from stale API responses.

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      cartId,
      isRefreshing,
      refreshCart,
      updateCartState: applyCart,
    }),
    [applyCart, cart, cartId, isRefreshing, refreshCart],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used inside a CartProvider');
  }
  return context;
}
