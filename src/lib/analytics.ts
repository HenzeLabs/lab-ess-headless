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

function pushClarity(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }
  const win = window as typeof window & {
    clarity?: (...args: unknown[]) => void;
  };
  if (win.clarity) {
    win.clarity('event', event, payload);
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
  pushClarity('product_view', {
    product_id: product.id,
    product_name: product.name,
    category: product.category || 'lab-equipment',
    price: toNumber(product.price),
    currency,
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
  pushClarity('collection_view', {
    collection_name: listName,
    product_count: products.length,
    categories: [...new Set(products.map((p) => p.category).filter(Boolean))],
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
  pushClarity('product_select', {
    product_id: product.id,
    product_name: product.name,
    list_name: listName || 'direct',
    category: product.category || 'lab-equipment',
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
  pushDataLayer('add_to_cart', {
    currency,
    value: (toNumber(item.price) || 0) * (item.quantity ?? 1),
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
    value: (toNumber(item.price) || 0) * (item.quantity ?? 1),
    currency,
  });
  pushClarity('add_to_cart', {
    product_id: item.id,
    product_name: item.name,
    category: item.category || 'lab-equipment',
    price: toNumber(item.price),
    quantity: item.quantity ?? 1,
    cart_value: (toNumber(item.price) || 0) * (item.quantity ?? 1),
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
  pushClarity('purchase_complete', {
    order_id: order.orderId,
    order_value: value,
    currency,
    item_count: order.items.length,
    categories: [
      ...new Set(order.items.map((item) => item.category).filter(Boolean)),
    ],
    product_types: order.items.map((item) => item.name),
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
