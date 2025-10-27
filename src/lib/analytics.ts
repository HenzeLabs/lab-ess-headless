'use client';

import type {
  AnalyticsItemInput,
  AnalyticsOrderInput,
  LabAnalytics,
} from '@/lib/types';

export const TABOOLA_PIXEL_ID = 1759164;
const DEFAULT_CURRENCY = 'USD';

type Numeric = number | string | null | undefined;

function toNumber(value: Numeric): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normaliseCurrency(currency?: string | null): string {
  return currency?.toUpperCase() || DEFAULT_CURRENCY;
}

function mapItem(input: AnalyticsItemInput) {
  return {
    item_id: input.id,
    item_name: input.name,
    price: toNumber(input.price),
    quantity: input.quantity ?? 1,
    item_category: input.category || undefined,
    item_brand: input.brand || undefined,
    item_variant: input.variant || undefined,
  };
}

function pushDataLayer(event: string, ecommerce?: Record<string, unknown>) {
  if (typeof window === 'undefined') {
    return;
  }
  const win = window as typeof window & {
    dataLayer?: Record<string, unknown>[];
  };
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ ecommerce: null });
  const payload: Record<string, unknown> = { event };
  if (ecommerce) {
    payload.ecommerce = ecommerce;
  }
  win.dataLayer.push(payload);
}

function pushTaboola(name: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }
  const win = window as typeof window & { _tfa?: Record<string, unknown>[] };
  win._tfa = win._tfa || [];
  win._tfa.push({ notify: 'event', name, id: TABOOLA_PIXEL_ID, ...payload });
}

function pushMeta(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }
  const win = window as typeof window & { fbq?: (...args: unknown[]) => void };
  if (win.fbq) {
    win.fbq('track', event, payload);
  }
}

function pushReddit(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }
  const win = window as typeof window & { rdt?: (...args: unknown[]) => void };
  if (win.rdt) {
    win.rdt('track', event, payload);
  }
}

export function trackViewItem(product: AnalyticsItemInput) {
  const items = [mapItem(product)];
  const currency = normaliseCurrency(product.currency);
  pushDataLayer('view_item', { currency, items });
  pushTaboola('view_item', {
    item_id: product.id,
    item_name: product.name,
    price: toNumber(product.price),
    currency,
  });
  pushMeta('ViewContent', {
    content_type: 'product',
    content_ids: [product.id],
    content_name: product.name,
    value: toNumber(product.price),
    currency,
  });
  pushReddit('ViewContent', {
    itemCount: 1,
    value: toNumber(product.price),
    currency,
    products: [{
      id: product.id,
      name: product.name,
      category: product.category,
    }],
  });
}

export function trackViewItemList(
  listName: string,
  products: AnalyticsItemInput[],
) {
  const items = products.map(mapItem);
  const currency = normaliseCurrency(products[0]?.currency || undefined);
  pushDataLayer('view_item_list', {
    item_list_name: listName,
    currency,
    items,
  });
  pushTaboola('view_item_list', {
    list_name: listName,
    item_ids: products.map((item) => item.id),
  });
}

export function trackSelectItem(
  product: AnalyticsItemInput,
  listName?: string,
) {
  const items = [mapItem(product)];
  const currency = normaliseCurrency(product.currency);
  pushDataLayer('select_item', {
    item_list_name: listName || undefined,
    currency,
    items,
  });
  pushTaboola('select_item', {
    item_id: product.id,
    item_name: product.name,
    list_name: listName || undefined,
  });
}

export function trackViewCart(items: AnalyticsItemInput[]) {
  const ecommerceItems = items.map(mapItem);
  const currency = normaliseCurrency(items[0]?.currency || undefined);
  const value = items.reduce((acc, item) => {
    const price = toNumber(item.price) || 0;
    const qty = item.quantity ?? 1;
    return acc + price * qty;
  }, 0);
  pushDataLayer('view_cart', { currency, value, items: ecommerceItems });
  pushTaboola('view_cart', {
    item_ids: items.map((item) => item.id),
    currency,
    value,
  });
}

export function trackAddToCart(item: AnalyticsItemInput) {
  const currency = normaliseCurrency(item.currency);
  const value = (toNumber(item.price) || 0) * (item.quantity ?? 1);
  pushDataLayer('add_to_cart', {
    currency,
    value,
    items: [mapItem(item)],
  });
  pushTaboola('add_to_cart', {
    item_id: item.id,
    quantity: item.quantity ?? 1,
    price: toNumber(item.price),
    currency,
  });
  pushMeta('AddToCart', {
    content_type: 'product',
    content_ids: [item.id],
    content_name: item.name,
    value,
    currency,
  });
  pushReddit('AddToCart', {
    itemCount: item.quantity ?? 1,
    value,
    currency,
    products: [{
      id: item.id,
      name: item.name,
      category: item.category,
    }],
  });
}

export function trackRemoveFromCart(item: AnalyticsItemInput) {
  const currency = normaliseCurrency(item.currency);
  pushDataLayer('remove_from_cart', {
    currency,
    value: (toNumber(item.price) || 0) * (item.quantity ?? 1),
    items: [mapItem(item)],
  });
  pushTaboola('remove_from_cart', {
    item_id: item.id,
    quantity: item.quantity ?? 1,
    price: toNumber(item.price),
    currency,
  });
}

export function trackBeginCheckout(items: AnalyticsItemInput[]) {
  const currency = normaliseCurrency(items[0]?.currency || undefined);
  const value = items.reduce((acc, item) => {
    const price = toNumber(item.price) || 0;
    const qty = item.quantity ?? 1;
    return acc + price * qty;
  }, 0);
  pushDataLayer('begin_checkout', {
    currency,
    value,
    items: items.map(mapItem),
  });
  pushTaboola('begin_checkout', {
    item_ids: items.map((item) => item.id),
    currency,
    value,
  });
}

export function trackPurchase(order: AnalyticsOrderInput) {
  const currency = normaliseCurrency(order.currency);
  const value = toNumber(order.value) || 0;
  pushDataLayer('purchase', {
    transaction_id: order.orderId,
    currency,
    value,
    items: order.items.map(mapItem),
  });
  pushTaboola('purchase', {
    order_id: order.orderId,
    revenue: value,
    currency,
  });
  pushMeta('Purchase', {
    content_type: 'product',
    content_ids: order.items.map((item) => item.id),
    value,
    currency,
  });
  pushReddit('Purchase', {
    transactionId: order.orderId,
    value,
    currency,
    itemCount: order.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    products: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
    })),
  });
}

export function trackNewsletterSignup(email?: string) {
  pushDataLayer('newsletter_signup', {
    engagement_type: 'newsletter',
    items: undefined,
    email,
  });
  pushTaboola('newsletter_signup', {
    email,
  });
  pushReddit('Lead', {
    email,
  });
}

export function trackViewCheckout(items: AnalyticsItemInput[]) {
  trackBeginCheckout(items);
}

export function trackDownload(payload: {
  id: string;
  name: string;
  category?: string | null;
}) {
  pushDataLayer('download', {
    item_id: payload.id,
    item_name: payload.name,
    item_category: payload.category || undefined,
  });
  pushTaboola('download', {
    item_id: payload.id,
    item_name: payload.name,
    item_category: payload.category || undefined,
  });
}

export type { AnalyticsItemInput as AnalyticsItem };

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    _tfa: Record<string, unknown>[];
    rdt?: (...args: unknown[]) => void;
    __labAnalytics: LabAnalytics;
  }
}

if (typeof window !== 'undefined') {
  window.__labAnalytics = {
    trackViewItem,
    trackViewItemList,
    trackSelectItem,
    trackViewCart,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase,
    trackNewsletterSignup,
    trackDownload,
  };
}
