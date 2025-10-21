'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const GTM_ID = 'GTM-WNG6Z9ZD';
const TABOOLA_ID = 1759164;
const META_PIXEL_ID = '940971967399612';

export default function AnalyticsWrapper() {
  // Check if on admin route to skip heavy third-party scripts
  const isAdminRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      _tfa?: unknown[];
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

    // Initialize dataLayer and gtag immediately (before scripts load)
    win.dataLayer = win.dataLayer || [];
    win.gtag =
      win.gtag ||
      function (...args) {
        win.dataLayer = win.dataLayer || [];
        win.dataLayer.push(args);
      };

    // Configure Consent Mode V2 (default denied for GDPR/privacy)
    if (win.gtag) {
      win.gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted',
        wait_for_update: 500,
      });

      // Auto-grant consent on user interaction (or wire to cookie consent UI)
      const grantConsent = () => {
        if (win.gtag) {
          win.gtag('consent', 'update', {
            ad_storage: 'granted',
            analytics_storage: 'granted',
            functionality_storage: 'granted',
            personalization_storage: 'granted',
          });
        }
      };

      // Grant on first interaction (click/scroll/touch)
      const events = ['click', 'scroll', 'touchstart'];
      const handleInteraction = () => {
        grantConsent();
        events.forEach((e) =>
          document.removeEventListener(e, handleInteraction),
        );
      };
      events.forEach((e) =>
        document.addEventListener(e, handleInteraction, {
          once: true,
          passive: true,
        }),
      );
    }

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
      {/* Google Tag Manager - afterInteractive (loads after page is interactive, ~2-3s LCP improvement)
          Note: GTM configuration already includes GA4 via dataLayer - no need for separate GA4 script */}
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />

      {/* Taboola - lazyOnload (deferred to idle, no LCP impact) - Skip on admin routes */}
      {!isAdminRoute && (
        <>
          <Script
            id="taboola-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window._tfa = window._tfa || [];
                window._tfa.push({notify: 'event', name: 'page_view', id: ${TABOOLA_ID}});
              `,
            }}
          />
          <Script
            id="taboola-script"
            strategy="lazyOnload"
            src={`https://cdn.taboola.com/libtrc/unipixel/${TABOOLA_ID}/tfa.js`}
          />
        </>
      )}

      {/* Meta Pixel - lazyOnload (deferred to idle) - Skip on admin routes */}
      {!isAdminRoute && (
        <Script
          id="meta-pixel-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* GTM noscript fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
