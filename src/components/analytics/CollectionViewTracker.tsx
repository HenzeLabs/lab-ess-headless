'use client';

import { useEffect, useMemo } from 'react';
import type { AnalyticsItem } from '@/lib/analytics';
import { trackViewItemList } from '@/lib/analytics';

interface CollectionViewTrackerProps {
  collectionName: string;
  products: AnalyticsItem[];
  currency?: string | null;
}

export default function CollectionViewTracker({
  collectionName,
  products,
  currency,
}: CollectionViewTrackerProps) {
  const productKey = useMemo(
    () => products.map((product) => product.id).join('|'),
    [products],
  );
  const enrichedItems = useMemo(
    () => products.map((product) => ({ ...product, currency })),
    [currency, products],
  );

  useEffect(() => {
    if (!collectionName || enrichedItems.length === 0) {
      return;
    }

    trackViewItemList(collectionName, enrichedItems);
  }, [collectionName, enrichedItems, productKey]);

  return null;
}
