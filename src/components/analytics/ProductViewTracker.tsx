'use client';

import { useEffect } from 'react';
import type { AnalyticsItem } from '@/lib/analytics';
import { trackViewItem } from '@/lib/analytics';

interface ProductViewTrackerProps {
  product: AnalyticsItem;
  currency?: string | null;
}

export default function ProductViewTracker({ product, currency }: ProductViewTrackerProps) {
  const { id } = product;

  useEffect(() => {
    if (!product || !id) {
      return;
    }

    trackViewItem({ ...product, currency });
  }, [currency, id, product]);

  return null;
}
