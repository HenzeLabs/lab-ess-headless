'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

// A/B Test Configuration
export interface ABTestConfig {
  id: string;
  name: string;
  description?: string;
  variants: {
    [key: string]: {
      name: string;
      weight: number; // 0-100
      component: ReactNode;
    };
  };
  conditions?: {
    userAgent?: string[];
    location?: string[];
    timeRange?: {
      start: Date;
      end: Date;
    };
    userSegment?: string[];
  };
  metrics?: string[];
  enabled: boolean;
}

// Feature Flag Configuration
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  conditions?: {
    userSegment?: string[];
    location?: string[];
    userAgent?: string[];
  };
}

// Analytics Event
export interface AnalyticsEvent {
  event: string;
  testId?: string;
  variant?: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
}

// A/B Testing Context
interface ABTestContextValue {
  getVariant: (testId: string) => string | null;
  trackEvent: (event: AnalyticsEvent) => void;
  isFeatureEnabled: (flagId: string) => boolean;
  getUserSegment: () => string[];
}

const ABTestContext = createContext<ABTestContextValue | null>(null);

// A/B Testing Provider
interface ABTestProviderProps {
  children: ReactNode;
  tests: ABTestConfig[];
  featureFlags: FeatureFlag[];
  userId?: string;
  userSegment?: string[];
  onEvent?: (event: AnalyticsEvent) => void;
}

export const ABTestProvider: React.FC<ABTestProviderProps> = ({
  children,
  tests,
  featureFlags,
  userId,
  userSegment = [],
  onEvent,
}) => {
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [userAssignments, setUserAssignments] = useState<
    Record<string, string>
  >({});

  // Generate stable user ID for consistent assignment
  const stableUserId = userId || `anonymous_${sessionId}`;

  // Simple hash function for consistent assignment
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Get user assignment for a test
  const getVariant = (testId: string): string | null => {
    const test = tests.find((t) => t.id === testId);
    if (!test || !test.enabled) return null;

    // Check if already assigned
    if (userAssignments[testId]) {
      return userAssignments[testId];
    }

    // Check conditions
    if (test.conditions) {
      // User agent check
      if (test.conditions.userAgent && typeof navigator !== 'undefined') {
        const userAgent = navigator.userAgent.toLowerCase();
        const matches = test.conditions.userAgent.some((ua) =>
          userAgent.includes(ua.toLowerCase()),
        );
        if (!matches) return null;
      }

      // User segment check
      if (test.conditions.userSegment) {
        const hasSegment = test.conditions.userSegment.some((segment) =>
          userSegment.includes(segment),
        );
        if (!hasSegment) return null;
      }

      // Time range check
      if (test.conditions.timeRange) {
        const now = new Date();
        if (
          now < test.conditions.timeRange.start ||
          now > test.conditions.timeRange.end
        ) {
          return null;
        }
      }
    }

    // Calculate assignment based on user ID hash
    const hash = hashString(`${stableUserId}_${testId}`);
    const bucket = hash % 100;

    let cumulativeWeight = 0;
    const variants = Object.entries(test.variants);

    for (const [variantId, variant] of variants) {
      cumulativeWeight += variant.weight;
      if (bucket < cumulativeWeight) {
        setUserAssignments((prev) => ({ ...prev, [testId]: variantId }));

        // Track assignment
        trackEvent({
          event: 'ab_test_assignment',
          testId,
          variant: variantId,
          properties: {
            testName: test.name,
            variantName: variant.name,
          },
          userId: stableUserId,
          sessionId,
          timestamp: new Date(),
        });

        return variantId;
      }
    }

    return null;
  };

  // Check if feature flag is enabled
  const isFeatureEnabled = (flagId: string): boolean => {
    const flag = featureFlags.find((f) => f.id === flagId);
    if (!flag || !flag.enabled) return false;

    // Check rollout percentage
    const hash = hashString(`${stableUserId}_${flagId}`);
    const bucket = hash % 100;

    if (bucket >= flag.rolloutPercentage) return false;

    // Check conditions
    if (flag.conditions) {
      // User segment check
      if (flag.conditions.userSegment) {
        const hasSegment = flag.conditions.userSegment.some((segment) =>
          userSegment.includes(segment),
        );
        if (!hasSegment) return false;
      }

      // User agent check
      if (flag.conditions.userAgent && typeof navigator !== 'undefined') {
        const userAgent = navigator.userAgent.toLowerCase();
        const matches = flag.conditions.userAgent.some((ua) =>
          userAgent.includes(ua.toLowerCase()),
        );
        if (!matches) return false;
      }
    }

    return true;
  };

  // Track analytics event
  const trackEvent = (event: AnalyticsEvent) => {
    const enrichedEvent = {
      ...event,
      userId: event.userId || stableUserId,
      sessionId: event.sessionId || sessionId,
      timestamp: event.timestamp || new Date(),
    };

    // Send to analytics
    onEvent?.(enrichedEvent);

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('AB Test Event:', enrichedEvent);
    }
  };

  const getUserSegment = () => userSegment;

  const value: ABTestContextValue = {
    getVariant,
    trackEvent,
    isFeatureEnabled,
    getUserSegment,
  };

  return (
    <ABTestContext.Provider value={value}>{children}</ABTestContext.Provider>
  );
};

// Hook to use A/B testing
export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider');
  }
  return context;
};

// A/B Test Component
interface ABTestProps {
  testId: string;
  fallback?: ReactNode;
  onRender?: (variant: string) => void;
}

export const ABTest: React.FC<ABTestProps> = ({
  testId,
  fallback,
  onRender,
}) => {
  const { getVariant, trackEvent } = useABTest();
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    const assignedVariant = getVariant(testId);
    setVariant(assignedVariant);

    if (assignedVariant) {
      onRender?.(assignedVariant);

      // Track view
      trackEvent({
        event: 'ab_test_view',
        testId,
        variant: assignedVariant,
        timestamp: new Date(),
      });
    }
  }, [testId, getVariant, trackEvent, onRender]);

  if (!variant) {
    return fallback || null;
  }

  // This would need to be dynamically resolved based on test configuration
  // For now, return null as components should be passed via test config
  return null;
};

// Feature Flag Component
interface FeatureFlagProps {
  flagId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flagId,
  children,
  fallback,
}) => {
  const { isFeatureEnabled } = useABTest();

  return isFeatureEnabled(flagId) ? <>{children}</> : <>{fallback}</>;
};

// Conversion tracking hooks
export const useConversionTracking = () => {
  const { trackEvent } = useABTest();

  const trackConversion = (
    conversionType: string,
    value?: number,
    properties?: Record<string, unknown>,
  ) => {
    trackEvent({
      event: 'conversion',
      properties: {
        conversionType,
        value,
        ...properties,
      },
      timestamp: new Date(),
    });
  };

  const trackPageView = (
    page: string,
    properties?: Record<string, unknown>,
  ) => {
    trackEvent({
      event: 'page_view',
      properties: {
        page,
        ...properties,
      },
      timestamp: new Date(),
    });
  };

  const trackClick = (
    element: string,
    testId?: string,
    variant?: string,
    properties?: Record<string, unknown>,
  ) => {
    trackEvent({
      event: 'click',
      testId,
      variant,
      properties: {
        element,
        ...properties,
      },
      timestamp: new Date(),
    });
  };

  const trackFormSubmit = (
    formId: string,
    success: boolean,
    properties?: Record<string, unknown>,
  ) => {
    trackEvent({
      event: 'form_submit',
      properties: {
        formId,
        success,
        ...properties,
      },
      timestamp: new Date(),
    });
  };

  const trackPurchase = (
    orderId: string,
    value: number,
    currency: string = 'USD',
    items?: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>,
  ) => {
    trackEvent({
      event: 'purchase',
      properties: {
        orderId,
        value,
        currency,
        items,
      },
      timestamp: new Date(),
    });
  };

  return {
    trackConversion,
    trackPageView,
    trackClick,
    trackFormSubmit,
    trackPurchase,
  };
};

// Performance tracking hook
export const usePerformanceTracking = () => {
  const { trackEvent } = useABTest();

  useEffect(() => {
    // Track Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track LCP
      if ('LargestContentfulPaint' in window) {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];

          trackEvent({
            event: 'web_vital',
            properties: {
              name: 'LCP',
              value: lastEntry.startTime,
              rating:
                lastEntry.startTime > 4000
                  ? 'poor'
                  : lastEntry.startTime > 2500
                  ? 'needs-improvement'
                  : 'good',
            },
            timestamp: new Date(),
          });
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      }

      // Track FID
      if ('PerformanceEventTiming' in window) {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const eventEntry = entry as PerformanceEventTiming;
            const fid = eventEntry.processingStart - eventEntry.startTime;

            trackEvent({
              event: 'web_vital',
              properties: {
                name: 'FID',
                value: fid,
                rating:
                  fid > 300 ? 'poor' : fid > 100 ? 'needs-improvement' : 'good',
              },
              timestamp: new Date(),
            });
          }
        }).observe({ type: 'first-input', buffered: true });
      }

      // Track CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };

          if (!layoutShift.hadRecentInput && layoutShift.value) {
            clsValue += layoutShift.value;
          }
        }

        trackEvent({
          event: 'web_vital',
          properties: {
            name: 'CLS',
            value: clsValue,
            rating:
              clsValue > 0.25
                ? 'poor'
                : clsValue > 0.1
                ? 'needs-improvement'
                : 'good',
          },
          timestamp: new Date(),
        });
      }).observe({ type: 'layout-shift', buffered: true });
    }
  }, [trackEvent]);
};

// A/B Test Button Component
interface ABTestButtonProps {
  testId: string;
  variant: string;
  children: ReactNode;
  onClick: () => void;
  className?: string;
  trackingLabel?: string;
}

export const ABTestButton: React.FC<ABTestButtonProps> = ({
  testId,
  variant,
  children,
  onClick,
  className = '',
  trackingLabel,
}) => {
  const { trackEvent } = useABTest();

  const handleClick = () => {
    trackEvent({
      event: 'ab_test_button_click',
      testId,
      variant,
      properties: {
        label: trackingLabel,
      },
      timestamp: new Date(),
    });

    onClick();
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};
