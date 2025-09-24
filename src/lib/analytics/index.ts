// Core analytics
export * from './types';
export { analytics, AdvancedAnalytics } from './manager';

// React hooks
export * from './hooks';

// Legacy compatibility - import the singleton and types
import { analytics } from './manager';
import type { PurchaseEvent } from './types';

// Type adapters for legacy compatibility
type LegacyAnalyticsItem = {
  id: string;
  name: string;
  price?: number | string | null;
  currency?: string | null;
  quantity?: number | null;
  category?: string | null;
};

type LegacyOrderInput = {
  orderId: string;
  value: number | string | null;
  currency?: string | null;
  items: LegacyAnalyticsItem[];
};

// Utility function to normalize legacy data
function normalizePrice(price?: number | string | null): number {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function normalizeQuantity(quantity?: number | null): number {
  return typeof quantity === 'number' ? quantity : 1;
}

function normalizeCategory(category?: string | null): string {
  return category || 'unknown';
}

function normalizeLegacyItem(item: LegacyAnalyticsItem) {
  return {
    id: item.id,
    name: item.name,
    price: normalizePrice(item.price),
    quantity: normalizeQuantity(item.quantity),
    category: normalizeCategory(item.category),
  };
}

// Legacy compatibility exports with proper type conversion
export const trackViewItem = (product: LegacyAnalyticsItem) => {
  const normalized = normalizeLegacyItem(product);
  analytics.trackViewItem(normalized);
};

export const trackViewItemList = (
  listName: string,
  products: LegacyAnalyticsItem[],
) => {
  const normalized = products.map(normalizeLegacyItem);
  analytics.trackViewItemList(listName, normalized);
};

export const trackViewCart = (items: LegacyAnalyticsItem[]) => {
  const normalized = items.map((item) => ({
    ...normalizeLegacyItem(item),
    quantity: normalizeQuantity(item.quantity) || 1,
  }));
  analytics.trackViewCart(normalized);
};

export const trackAddToCart = (item: LegacyAnalyticsItem) => {
  const normalized = normalizeLegacyItem(item);
  analytics.trackAddToCart({
    productId: normalized.id,
    productName: normalized.name,
    price: normalized.price,
    currency: 'USD',
    category: normalized.category,
    quantity: normalized.quantity,
  });
};

export const trackRemoveFromCart = (item: LegacyAnalyticsItem) => {
  const normalized = {
    ...normalizeLegacyItem(item),
    quantity: normalizeQuantity(item.quantity) || 1,
  };
  analytics.trackRemoveFromCart(normalized);
};

export const trackBeginCheckout = (items: LegacyAnalyticsItem[]) => {
  const normalized = items.map((item) => ({
    ...normalizeLegacyItem(item),
    quantity: normalizeQuantity(item.quantity) || 1,
  }));
  analytics.trackBeginCheckout(normalized);
};

export const trackPurchase = (order: LegacyOrderInput) => {
  const purchaseEvent: PurchaseEvent = {
    transactionId: order.orderId,
    totalValue: normalizePrice(order.value),
    currency: order.currency || 'USD',
    items: order.items.map((item) => ({
      eventType: 'purchase' as const,
      productId: item.id,
      productName: item.name,
      price: normalizePrice(item.price),
      currency: order.currency || 'USD',
      quantity: normalizeQuantity(item.quantity),
      category: normalizeCategory(item.category),
    })),
  };
  analytics.trackPurchase(purchaseEvent);
};

export const trackNewsletterSignup = (email?: string) =>
  analytics.trackNewsletterSignup(email);

export const trackDownload = (payload: {
  id?: string;
  name: string;
  url?: string;
  category?: string | null;
  type?: string;
}) =>
  analytics.trackDownload({
    name: payload.name,
    url: payload.url || payload.name, // fallback for old API
    type: payload.type || payload.category || 'unknown',
  });

// Legacy type exports for backward compatibility
export type AnalyticsItem = LegacyAnalyticsItem;
export type AnalyticsItemInput = LegacyAnalyticsItem;
export type AnalyticsOrderInput = LegacyOrderInput;
