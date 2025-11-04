'use client';

import { useEffect } from 'react';
import { initClarity } from '@/lib/clarity/events';

export default function AnalyticsWrapper() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      __labAnalytics?: Record<string, unknown>;
    };

    // Initialize dataLayer and gtag immediately (before GTM script loads)
    win.dataLayer = win.dataLayer || [];
    win.gtag =
      win.gtag ||
      function (...args) {
        win.dataLayer = win.dataLayer || [];
        win.dataLayer.push(args);
      };

    // Configure Consent Mode V2 (granted by default for analytics tracking)
    // Note: Change back to 'denied' if you need explicit GDPR consent
    if (win.gtag) {
      win.gtag('consent', 'default', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
        security_storage: 'granted',
      });
    }

    // Initialize Microsoft Clarity for session recordings and heatmaps
    initClarity();

    // Load analytics helpers lazily after idle - reduces TBT
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import('@/lib/analytics')
          .then((analytics) => {
            win.__labAnalytics = {
              trackViewItem: analytics.trackViewItem,
              trackViewItemList: analytics.trackViewItemList,
              trackSelectItem: analytics.trackSelectItem,
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
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        import('@/lib/analytics')
          .then((analytics) => {
            win.__labAnalytics = {
              trackViewItem: analytics.trackViewItem,
              trackViewItemList: analytics.trackViewItemList,
              trackSelectItem: analytics.trackSelectItem,
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
      }, 1000);
    }
  }, []);

  return (
    <>
      {/* GTM now loads inline in layout.tsx <head> for immediate execution */}
      {/* This component initializes dataLayer and configures Consent Mode V2 */}
    </>
  );
}
