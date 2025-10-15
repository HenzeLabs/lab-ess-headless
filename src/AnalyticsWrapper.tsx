'use client';

import { useEffect } from 'react';

const GTM_ID = 'GTM-WNG6Z9ZD';
const GA4_MEASUREMENT_ID = 'G-QCSHJ4TDMY';
// Clarity Project ID: m5xby3pax0 (configured in GTM)
const TABOOLA_ID = 1759164;
const META_PIXEL_ID = '940971967399612';

function loadScriptOnce(id: string, build: () => HTMLScriptElement | null) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) {
    return;
  }

  const script = build();
  if (script) {
    script.id = id;
    document.head.appendChild(script);
  }
}

export default function AnalyticsWrapper() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const win = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      _tfa?: unknown[];
      clarity?: (...args: unknown[]) => void;
      fbq?: {
        (...args: unknown[]): void;
        callMethod?: (...args: unknown[]) => void;
        queue?: unknown[];
        push?: unknown;
        loaded?: boolean;
        version?: string;
      };
      __labAnalytics?: Record<string, unknown>;
    };

    // Initialise dataLayer
    win.dataLayer = win.dataLayer || [];
    if (typeof win.dataLayer.push === 'function') {
      win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    }

    loadScriptOnce('gtm-script', () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      return script;
    });

    if (!document.getElementById('gtm-noscript')) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      const noscript = document.createElement('noscript');
      noscript.id = 'gtm-noscript';
      noscript.appendChild(iframe);
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    // Google Analytics 4 - Direct tracking (in addition to GTM)
    // Initialize gtag function
    win.gtag =
      win.gtag ||
      function (...args) {
        win.dataLayer = win.dataLayer || [];
        win.dataLayer.push(args);
      };

    // Load GA4 script
    loadScriptOnce('ga4-script', () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
      return script;
    });

    // Configure GA4
    if (win.gtag) {
      win.gtag('js', new Date());
      win.gtag('config', GA4_MEASUREMENT_ID, {
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure',
      });
    }

    // Microsoft Clarity is configured in GTM (GTM-WNG6Z9ZD)
    // No direct Clarity script needed to avoid conflicts

    // Taboola base pixel
    win._tfa = win._tfa || [];
    win._tfa.push({ notify: 'event', name: 'page_view', id: TABOOLA_ID });

    loadScriptOnce('taboola-script', () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://cdn.taboola.com/libtrc/unipixel/${TABOOLA_ID}/tfa.js`;
      return script;
    });

    // Meta Pixel base pixel
    win.fbq =
      win.fbq ||
      function (...args) {
        const fbqInstance = win.fbq as any;
        fbqInstance.callMethod
          ? fbqInstance.callMethod.apply(win.fbq, args)
          : fbqInstance.queue.push(args);
      };
    const fbqInstance = win.fbq as any;
    fbqInstance.push = win.fbq;
    fbqInstance.loaded = true;
    fbqInstance.version = '2.0';
    fbqInstance.queue = [];

    win.fbq('init', META_PIXEL_ID);
    win.fbq('track', 'PageView');

    loadScriptOnce('meta-pixel-script', () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      return script;
    });

    import('@/lib/analytics')
      .then((analytics) => {
        win.__labAnalytics = {
          trackViewItem: analytics.trackViewItem,
          trackViewItemList: analytics.trackViewItemList,
          trackViewCart: analytics.trackViewCart,
          trackAddToCart: analytics.trackAddToCart,
          trackRemoveFromCart: analytics.trackRemoveFromCart,
          trackBeginCheckout: analytics.trackBeginCheckout,
          trackPurchase: analytics.trackPurchase,
          trackNewsletterSignup: analytics.trackNewsletterSignup,
          trackDownload: analytics.trackDownload,
        };
      })
      .catch((error) => {
        console.error('Failed to initialize analytics helpers', error);
      });
  }, []);

  return null;
}
