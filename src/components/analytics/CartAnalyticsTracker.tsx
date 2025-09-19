'use client';

import { useEffect, useMemo } from 'react';
import type { AnalyticsItem } from '@/lib/analytics';
import { trackBeginCheckout, trackRemoveFromCart, trackViewCart } from '@/lib/analytics';

export interface CartItemAnalytics {
  lineId: string;
  item: AnalyticsItem;
  currency?: string | null;
}

interface CartAnalyticsTrackerProps {
  items: CartItemAnalytics[];
  checkoutSelector?: string;
}

export default function CartAnalyticsTracker({
  items,
  checkoutSelector = '[data-cart-checkout]',
}: CartAnalyticsTrackerProps) {
  const itemsKey = items.map(({ lineId }) => lineId).join('|');
  const enrichedItems = useMemo(
    () => items.map(({ item, currency }) => ({ ...item, currency })),
    [items],
  );

  useEffect(() => {
    if (enrichedItems.length === 0) {
      return;
    }

    trackViewCart(enrichedItems);

    const removeCleanups = items.map(({ lineId, item, currency }) => {
      const selector = `[data-cart-remove="${lineId}"]`;
      const form = document.querySelector<HTMLFormElement>(selector);
      if (!form) {
        return undefined;
      }
      const handler = () => trackRemoveFromCart({ ...item, currency });
      form.addEventListener('submit', handler);
      return () => form.removeEventListener('submit', handler);
    });

    const checkoutNode = document.querySelector<HTMLAnchorElement>(checkoutSelector);
    const checkoutHandler = () => {
      trackBeginCheckout(enrichedItems);
    };
    checkoutNode?.addEventListener('click', checkoutHandler);

    return () => {
      removeCleanups.forEach((cleanup) => cleanup?.());
      checkoutNode?.removeEventListener('click', checkoutHandler);
    };
  }, [checkoutSelector, enrichedItems, items, itemsKey]);

  return null;
}
