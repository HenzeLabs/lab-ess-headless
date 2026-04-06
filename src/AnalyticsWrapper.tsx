'use client';

import { useEffect } from 'react';
import { initClarity } from '@/lib/clarity-events';
import { hasAnalyticsConsent } from '@/components/CookieConsent';
import { initKlaviyo } from '@/lib/klaviyo';

export default function AnalyticsWrapper() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      __labAnalytics?: Record<string, unknown>;
    };

    // dataLayer and consent defaults are set inline in layout.tsx <head>
    // before GTM loads — no need to initialize or set consent here.

    // Check if user already granted consent (returning visitor)
    const consentAlreadyGranted = hasAnalyticsConsent();

    if (consentAlreadyGranted) {
      activateAnalytics(win);
    }

    // Listen for consent granted event from CookieConsent component
    const handleConsentGranted = () => {
      activateAnalytics(win);
    };

    window.addEventListener('analytics-consent-granted', handleConsentGranted);

    // Initialize Klaviyo (respects marketing consent internally)
    initKlaviyo();

    return () => {
      window.removeEventListener(
        'analytics-consent-granted',
        handleConsentGranted,
      );
    };
  }, []);

  return (
    <>
      {/* Consent defaults + GTM load inline in layout.tsx <head> */}
      {/* This component handles consent updates and lazy-loads analytics helpers */}
    </>
  );
}

/** Update consent state and initialize analytics scripts */
function activateAnalytics(
  win: typeof window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __labAnalytics?: Record<string, unknown>;
  },
) {
  // Update Consent Mode V2 to granted
  if (win.gtag) {
    win.gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted',
      personalization_storage: 'granted',
    });
  }

  // Initialize Microsoft Clarity for session recordings and heatmaps
  initClarity();

  // Load analytics helpers lazily after idle - reduces TBT
  const loadAnalytics = () => {
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
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadAnalytics);
  } else {
    setTimeout(loadAnalytics, 1000);
  }
}
