'use client';

import { useEffect, useRef, useCallback } from 'react';
import { analytics } from './manager';
import { ProductEvent, PurchaseEvent } from './types';

// Hook for tracking page views
export function usePageTracking() {
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== previousPathRef.current) {
        analytics.trackPageView(currentPath);
        previousPathRef.current = currentPath;
      }
    };

    // Track initial page view
    handleRouteChange();

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    // For client-side routing, you might need to listen to router events
    // This depends on your routing solution (Next.js, React Router, etc.)

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
}

// Hook for tracking analytics events
export function useAnalytics() {
  const track = useCallback(
    (
      eventName: string,
      properties?: Record<string, unknown>,
      value?: number,
    ) => {
      analytics.track(eventName, properties, value);
    },
    [],
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      analytics.identify(userId, traits);
    },
    [],
  );

  const trackPageView = useCallback(
    (path: string, title?: string, referrer?: string) => {
      analytics.trackPageView(path, title, referrer);
    },
    [],
  );

  const trackProductView = useCallback(
    (product: Omit<ProductEvent, 'eventType'>) => {
      analytics.trackProductView(product);
    },
    [],
  );

  const trackAddToCart = useCallback(
    (product: Omit<ProductEvent, 'eventType'>) => {
      analytics.trackAddToCart(product);
    },
    [],
  );

  const trackPurchase = useCallback((purchase: PurchaseEvent) => {
    analytics.trackPurchase(purchase);
  }, []);

  const trackCustomEvent = useCallback(
    (eventId: string, properties?: Record<string, unknown>) => {
      analytics.track(`custom_${eventId}`, {
        custom_event_id: eventId,
        ...properties,
      });
    },
    [],
  );

  return {
    track,
    identify,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackCustomEvent,
  };
}

// Hook for tracking e-commerce events
export function useEcommerceTracking() {
  const { trackProductView, trackAddToCart, trackPurchase } = useAnalytics();

  const trackProductInteraction = useCallback(
    (
      interaction: 'view' | 'add_to_cart' | 'remove_from_cart',
      product: {
        id: string;
        name: string;
        category: string;
        price: number;
        currency: string;
        quantity?: number;
        brand?: string;
        variant?: string;
      },
    ) => {
      const productEvent = {
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: product.price,
        currency: product.currency,
        quantity: product.quantity || 1,
        brand: product.brand,
        variant: product.variant,
      };

      switch (interaction) {
        case 'view':
          trackProductView(productEvent);
          break;
        case 'add_to_cart':
          trackAddToCart(productEvent);
          break;
        // Add more interactions as needed
      }
    },
    [trackProductView, trackAddToCart],
  );

  return {
    trackProductInteraction,
    trackPurchase,
  };
}

// Hook for tracking scroll depth
export function useScrollTracking(thresholds: number[] = [25, 50, 75, 100]) {
  const trackedThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100,
      );

      thresholds.forEach((threshold) => {
        if (
          scrollPercent >= threshold &&
          !trackedThresholds.current.has(threshold)
        ) {
          analytics.track('scroll_depth', {
            page_path: window.location.pathname,
            scroll_depth: threshold,
          });
          trackedThresholds.current.add(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [thresholds]);

  // Reset tracked thresholds when path changes
  useEffect(() => {
    trackedThresholds.current.clear();
  }, []);
}

// Hook for tracking form interactions
export function useFormTracking(formName: string) {
  const trackFormStart = useCallback(() => {
    analytics.track('form_start', {
      form_name: formName,
      page_path: window.location.pathname,
    });
  }, [formName]);

  const trackFormComplete = useCallback(
    (formData?: Record<string, unknown>) => {
      analytics.track('form_complete', {
        form_name: formName,
        page_path: window.location.pathname,
        ...formData,
      });
    },
    [formName],
  );

  const trackFormError = useCallback(
    (error: string, field?: string) => {
      analytics.track('form_error', {
        form_name: formName,
        error_message: error,
        error_field: field,
        page_path: window.location.pathname,
      });
    },
    [formName],
  );

  const trackFieldFocus = useCallback(
    (fieldName: string) => {
      analytics.track('form_field_focus', {
        form_name: formName,
        field_name: fieldName,
        page_path: window.location.pathname,
      });
    },
    [formName],
  );

  return {
    trackFormStart,
    trackFormComplete,
    trackFormError,
    trackFieldFocus,
  };
}

// Hook for tracking video interactions
export function useVideoTracking(videoId: string, videoTitle: string) {
  const progressMarkers = useRef<Set<number>>(new Set());

  const trackVideoStart = useCallback(() => {
    analytics.track('video_start', {
      video_id: videoId,
      video_title: videoTitle,
      page_path: window.location.pathname,
    });
  }, [videoId, videoTitle]);

  const trackVideoProgress = useCallback(
    (percentComplete: number) => {
      const marker = Math.floor(percentComplete / 25) * 25; // Track every 25%
      if (marker > 0 && !progressMarkers.current.has(marker)) {
        analytics.track('video_progress', {
          video_id: videoId,
          video_title: videoTitle,
          progress_percent: marker,
          page_path: window.location.pathname,
        });
        progressMarkers.current.add(marker);
      }
    },
    [videoId, videoTitle],
  );

  const trackVideoComplete = useCallback(() => {
    analytics.track('video_complete', {
      video_id: videoId,
      video_title: videoTitle,
      page_path: window.location.pathname,
    });
  }, [videoId, videoTitle]);

  const trackVideoPause = useCallback(
    (currentTime: number) => {
      analytics.track('video_pause', {
        video_id: videoId,
        video_title: videoTitle,
        current_time: currentTime,
        page_path: window.location.pathname,
      });
    },
    [videoId, videoTitle],
  );

  return {
    trackVideoStart,
    trackVideoProgress,
    trackVideoComplete,
    trackVideoPause,
  };
}

// Hook for tracking search interactions
export function useSearchTracking() {
  const trackSearch = useCallback(
    (query: string, filters?: Record<string, unknown>, results?: number) => {
      analytics.track('search', {
        search_term: query,
        search_filters: filters,
        search_results: results,
        page_path: window.location.pathname,
      });
    },
    [],
  );

  const trackSearchResultClick = useCallback(
    (
      query: string,
      resultId: string,
      position: number,
      resultType?: string,
    ) => {
      analytics.track('search_result_click', {
        search_term: query,
        result_id: resultId,
        result_position: position,
        result_type: resultType,
        page_path: window.location.pathname,
      });
    },
    [],
  );

  const trackSearchNoResults = useCallback(
    (query: string, filters?: Record<string, unknown>) => {
      analytics.track('search_no_results', {
        search_term: query,
        search_filters: filters,
        page_path: window.location.pathname,
      });
    },
    [],
  );

  return {
    trackSearch,
    trackSearchResultClick,
    trackSearchNoResults,
  };
}

// Hook for tracking user engagement
export function useEngagementTracking() {
  const startTime = useRef<number>(Date.now());
  const lastActivity = useRef<number>(Date.now());
  const isActive = useRef<boolean>(true);

  useEffect(() => {
    const handleActivity = () => {
      lastActivity.current = Date.now();
      if (!isActive.current) {
        isActive.current = true;
        analytics.track('user_active', {
          page_path: window.location.pathname,
          time_inactive: Date.now() - lastActivity.current,
        });
      }
    };

    const handleInactivity = () => {
      if (Date.now() - lastActivity.current > 30000) {
        // 30 seconds
        if (isActive.current) {
          isActive.current = false;
          analytics.track('user_inactive', {
            page_path: window.location.pathname,
            time_active: Date.now() - startTime.current,
          });
        }
      }
    };

    // Track user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Check for inactivity
    const inactivityTimer = setInterval(handleInactivity, 5000); // Check every 5 seconds

    // Track time on page when leaving
    const handleBeforeUnload = () => {
      analytics.track('time_on_page', {
        page_path: window.location.pathname,
        time_spent: Date.now() - startTime.current,
        is_active: isActive.current,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(inactivityTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}

// Hook for performance tracking
export function usePerformanceTracking() {
  useEffect(() => {
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Track Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            analytics.track('core_web_vitals', {
              metric: 'LCP',
              value: entry.startTime,
              page_path: window.location.pathname,
            });
          }

          if (entry.entryType === 'first-input') {
            analytics.track('core_web_vitals', {
              metric: 'FID',
              value:
                (entry as PerformanceEventTiming).processingStart -
                entry.startTime,
              page_path: window.location.pathname,
            });
          }

          if (
            entry.entryType === 'layout-shift' &&
            !(entry as PerformanceEntry & { hadRecentInput?: boolean })
              .hadRecentInput
          ) {
            analytics.track('core_web_vitals', {
              metric: 'CLS',
              value: (entry as PerformanceEntry & { value: number }).value,
              page_path: window.location.pathname,
            });
          }
        }
      });

      observer.observe({
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'],
      });

      return () => {
        observer.disconnect();
      };
    }
  }, []);
}
