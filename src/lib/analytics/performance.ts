'use client';

import { useEffect, useCallback } from 'react';
import { analytics } from './manager';

// Performance metrics collection
export interface ExtendedPerformanceEntry extends PerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
  value?: number;
  element?: Element;
  url?: string;
}

export interface NavigatorConnection {
  effectiveType?: string;
}

export interface ExtendedNavigator extends Navigator {
  connection?: NavigatorConnection;
}

class AdvancedPerformanceTracker {
  private navigationEntry: PerformanceNavigationTiming | null = null;

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;

    // Track navigation timing
    this.trackNavigationTiming();

    // Track Core Web Vitals
    this.trackWebVitals();

    // Track resource loading
    this.trackResourceTiming();

    // Track user interactions
    this.trackUserInteractions();
  }

  private trackNavigationTiming() {
    if (!('performance' in window)) return;

    const navigationTiming = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming;
    if (!navigationTiming) return;

    this.navigationEntry = navigationTiming;

    // Calculate key metrics
    const metrics = {
      dns_lookup:
        navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
      tcp_connection:
        navigationTiming.connectEnd - navigationTiming.connectStart,
      ssl_negotiation:
        navigationTiming.connectEnd - navigationTiming.secureConnectionStart,
      ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
      response_time:
        navigationTiming.responseEnd - navigationTiming.responseStart,
      dom_processing:
        navigationTiming.domContentLoadedEventStart -
        navigationTiming.responseEnd,
      total_load_time:
        navigationTiming.loadEventEnd - navigationTiming.fetchStart,
    };

    analytics.track('navigation_timing', {
      ...metrics,
      page_path: window.location.pathname,
      connection_type:
        (navigator as ExtendedNavigator).connection?.effectiveType || 'unknown',
    });
  }

  private trackWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    // Track LCP (Largest Contentful Paint)
    this.trackLCP();

    // Track FID (First Input Delay)
    this.trackFID();

    // Track CLS (Cumulative Layout Shift)
    this.trackCLS();

    // Track FCP (First Contentful Paint)
    this.trackFCP();

    // Track TTFB (Time to First Byte)
    this.trackTTFB();
  }

  private trackLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const extendedEntry = lastEntry as ExtendedPerformanceEntry;

      const rating = this.getRating('LCP', lastEntry.startTime);

      analytics.track('core_web_vitals', {
        metric: 'LCP',
        value: Math.round(lastEntry.startTime),
        rating,
        page_path: window.location.pathname,
        element: extendedEntry.element?.tagName || 'unknown',
        url: extendedEntry.url || window.location.href,
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private trackFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        const extendedEntry = entry as ExtendedPerformanceEntry;
        const fid =
          (extendedEntry.processingStart || entry.startTime) - entry.startTime;
        const rating = this.getRating('FID', fid);

        analytics.track('core_web_vitals', {
          metric: 'FID',
          value: Math.round(fid),
          rating,
          page_path: window.location.pathname,
          event_type: extendedEntry.name || 'unknown',
        });
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  private trackCLS() {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        const extendedEntry = entry as ExtendedPerformanceEntry;
        if (!extendedEntry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (
            sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += extendedEntry.value || 0;
            sessionEntries.push(entry);
          } else {
            sessionValue = extendedEntry.value || 0;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;

            const rating = this.getRating('CLS', clsValue);

            analytics.track('core_web_vitals', {
              metric: 'CLS',
              value: Math.round(clsValue * 1000) / 1000,
              rating,
              page_path: window.location.pathname,
              entries_count: sessionEntries.length,
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  private trackFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === 'first-contentful-paint',
      );

      if (fcpEntry) {
        const rating = this.getRating('FCP', fcpEntry.startTime);

        analytics.track('core_web_vitals', {
          metric: 'FCP',
          value: Math.round(fcpEntry.startTime),
          rating,
          page_path: window.location.pathname,
        });
      }
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  private trackTTFB() {
    if (!this.navigationEntry) return;

    const ttfb =
      this.navigationEntry.responseStart - this.navigationEntry.requestStart;
    const rating = this.getRating('TTFB', ttfb);

    analytics.track('core_web_vitals', {
      metric: 'TTFB',
      value: Math.round(ttfb),
      rating,
      page_path: window.location.pathname,
    });
  }

  private trackResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;

        // Track slow resources (>1s)
        if (resource.duration > 1000) {
          analytics.track('slow_resource', {
            name: resource.name,
            duration: Math.round(resource.duration),
            type: resource.initiatorType,
            size: resource.transferSize || 0,
            page_path: window.location.pathname,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private trackUserInteractions() {
    let interactionCount = 0;

    // Track clicks
    document.addEventListener('click', (event) => {
      interactionCount++;
      const target = event.target as Element;

      analytics.track('user_interaction', {
        type: 'click',
        element: target.tagName,
        class: target.className,
        id: target.id,
        page_path: window.location.pathname,
        interaction_count: interactionCount,
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100,
      );

      if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
        maxScrollDepth = scrollDepth;

        analytics.track('scroll_depth', {
          depth: scrollDepth,
          page_path: window.location.pathname,
        });
      }
    });
  }

  private getRating(
    metric: string,
    value: number,
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Public method to track custom performance metrics
  trackCustomMetric(
    name: string,
    value: number,
    context?: Record<string, unknown>,
  ) {
    analytics.track('custom_performance', {
      metric_name: name,
      value,
      page_path: window.location.pathname,
      timestamp: Date.now(),
      ...context,
    });
  }
}

// Global performance tracker instance
let globalTracker: AdvancedPerformanceTracker | null = null;

// React hook for performance tracking
export function useAdvancedPerformanceTracking() {
  const trackCustomMetric = useCallback(
    (name: string, value: number, context?: Record<string, unknown>) => {
      if (typeof window !== 'undefined') {
        if (!globalTracker) {
          globalTracker = new AdvancedPerformanceTracker();
        }
        globalTracker.trackCustomMetric(name, value, context);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!globalTracker) {
      globalTracker = new AdvancedPerformanceTracker();
    }

    // Track page visibility changes
    const handleVisibilityChange = () => {
      analytics.track('page_visibility', {
        state: document.hidden ? 'hidden' : 'visible',
        page_path: window.location.pathname,
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { trackCustomMetric };
}

export default AdvancedPerformanceTracker;
