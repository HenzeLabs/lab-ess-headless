'use client';

import { useEffect } from 'react';

const GTM_ID = 'GTM-WNG6Z9ZD';
const CLARITY_ID = 'm5xby3pax0';
const TABOOLA_ID = 1759164;

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
      _tfa?: unknown[];
      clarity?: (...args: unknown[]) => void;
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

    // Microsoft Clarity snippet
    loadScriptOnce('clarity-script', () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode?.insertBefore(t,y);
        })(window, document, 'clarity', 'script', '${CLARITY_ID}');
      `;
      return script;
    });

    // Taboola base pixel
    win._tfa = win._tfa || [];
    win._tfa.push({ notify: 'event', name: 'page_view', id: TABOOLA_ID });

    loadScriptOnce('taboola-script', () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://cdn.taboola.com/libtrc/unipixel/${TABOOLA_ID}/tfa.js`;
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
