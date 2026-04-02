'use client';

/**
 * Klaviyo client-side integration.
 *
 * Loads the Klaviyo JS SDK only after marketing cookie consent is granted.
 * Provides typed wrappers for identify, track, and subscribe.
 */

const KLAVIYO_PUBLIC_KEY = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY ?? '';

let isLoaded = false;
let isLoading = false;
const pendingCalls: Array<() => void> = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getKlaviyo(): KlaviyoObject | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as KlaviyoWindow).klaviyo;
}

/** Queue a call; if Klaviyo is ready run it immediately, otherwise buffer. */
function enqueue(fn: () => void) {
  const kl = getKlaviyo();
  if (kl) {
    fn();
  } else {
    pendingCalls.push(fn);
  }
}

function flushQueue() {
  while (pendingCalls.length > 0) {
    const fn = pendingCalls.shift();
    fn?.();
  }
}

// ---------------------------------------------------------------------------
// Script loader
// ---------------------------------------------------------------------------

/** Load the Klaviyo JS snippet. Safe to call multiple times. */
export function loadKlaviyo(): void {
  if (typeof window === 'undefined') return;
  if (!KLAVIYO_PUBLIC_KEY) {
    console.warn('[klaviyo] NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY is not set — skipping');
    return;
  }
  if (isLoaded || isLoading) return;

  isLoading = true;

  const script = document.createElement('script');
  script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${KLAVIYO_PUBLIC_KEY}`;
  script.async = true;
  script.onload = () => {
    isLoaded = true;
    isLoading = false;
    flushQueue();
  };
  script.onerror = () => {
    isLoading = false;
    console.error('[klaviyo] Failed to load script');
  };

  document.head.appendChild(script);
}

// ---------------------------------------------------------------------------
// Check marketing consent
// ---------------------------------------------------------------------------

export function hasMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem('cookie-preferences');
    if (!saved) return false;
    const prefs = JSON.parse(saved);
    return prefs.marketing === true;
  } catch {
    return false;
  }
}

/**
 * Initialize Klaviyo if marketing consent is already granted,
 * otherwise listen for the consent event.
 */
export function initKlaviyo(): void {
  if (typeof window === 'undefined') return;

  if (hasMarketingConsent()) {
    loadKlaviyo();
    return;
  }

  // Listen for consent granted later
  const handler = () => {
    loadKlaviyo();
    window.removeEventListener('marketing-consent-granted', handler);
  };
  window.addEventListener('marketing-consent-granted', handler);
}

// ---------------------------------------------------------------------------
// Identify
// ---------------------------------------------------------------------------

export function klaviyoIdentify(email: string, properties?: Record<string, unknown>): void {
  enqueue(() => {
    const kl = getKlaviyo();
    if (!kl) return;
    kl.push(['identify', { $email: email, ...properties }]);
  });
}

// ---------------------------------------------------------------------------
// Event tracking
// ---------------------------------------------------------------------------

export function klaviyoTrack(event: string, properties?: Record<string, unknown>): void {
  enqueue(() => {
    const kl = getKlaviyo();
    if (!kl) return;
    kl.push(['track', event, properties]);
  });
}

// ---------------------------------------------------------------------------
// Convenience wrappers matching Klaviyo's expected event names
// ---------------------------------------------------------------------------

export function trackKlaviyoViewedProduct(product: {
  id: string;
  name: string;
  price?: number;
  currency?: string;
  category?: string;
  brand?: string;
  url?: string;
  imageUrl?: string;
}): void {
  klaviyoTrack('Viewed Product', {
    ProductName: product.name,
    ProductID: product.id,
    Price: product.price,
    Currency: product.currency ?? 'USD',
    Categories: product.category ? [product.category] : undefined,
    Brand: product.brand,
    URL: product.url ?? (typeof window !== 'undefined' ? window.location.href : undefined),
    ImageURL: product.imageUrl,
  });
}

export function trackKlaviyoAddedToCart(item: {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  currency?: string;
  category?: string;
  brand?: string;
  url?: string;
  imageUrl?: string;
}): void {
  klaviyoTrack('Added to Cart', {
    ProductName: item.name,
    ProductID: item.id,
    Price: item.price,
    Quantity: item.quantity ?? 1,
    Currency: item.currency ?? 'USD',
    Categories: item.category ? [item.category] : undefined,
    Brand: item.brand,
    URL: item.url ?? (typeof window !== 'undefined' ? window.location.href : undefined),
    ImageURL: item.imageUrl,
  });
}

export function trackKlaviyoStartedCheckout(items: Array<{
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  currency?: string;
}>, totalValue?: number): void {
  klaviyoTrack('Started Checkout', {
    $value: totalValue,
    ItemNames: items.map((i) => i.name),
    Items: items.map((i) => ({
      ProductID: i.id,
      ProductName: i.name,
      Quantity: i.quantity ?? 1,
      ItemPrice: i.price,
    })),
    Currency: items[0]?.currency ?? 'USD',
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type KlaviyoPushArgs = ['identify', Record<string, unknown>] | ['track', string, Record<string, unknown> | undefined];

interface KlaviyoObject {
  push(args: KlaviyoPushArgs): void;
}

interface KlaviyoWindow extends Window {
  klaviyo?: KlaviyoObject;
}
