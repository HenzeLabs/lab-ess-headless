'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { abTestManager } from './manager';
import { UserContext, ExperimentVariant } from './types';

interface ABTestContextType {
  userContext: UserContext | null;
  getVariant: (experimentId: string) => ExperimentVariant | null;
  isFeatureEnabled: (flagId: string) => boolean;
  getFeatureVariant: (flagId: string) => unknown;
  trackEvent: (
    experimentId: string,
    variantId: string,
    event: string,
    value?: number,
  ) => void;
  setUserContext: (context: UserContext) => void;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

interface ABTestProviderProps {
  children: ReactNode;
  initialUserContext?: Partial<UserContext>;
}

export function ABTestProvider({
  children,
  initialUserContext,
}: ABTestProviderProps) {
  const [userContext, setUserContextState] = useState<UserContext | null>(null);

  useEffect(() => {
    // Initialize user context
    const context: UserContext = {
      userId: generateUserId(),
      sessionId: generateSessionId(),
      device: detectDevice(),
      browser: detectBrowser(),
      country: detectCountry(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...initialUserContext,
    };

    setUserContextState(context);
  }, [initialUserContext]);

  const getVariant = (experimentId: string): ExperimentVariant | null => {
    if (!userContext) return null;
    return abTestManager.getVariant(experimentId, userContext);
  };

  const isFeatureEnabled = (flagId: string): boolean => {
    if (!userContext) return false;
    return abTestManager.isFeatureEnabled(flagId, userContext);
  };

  const getFeatureVariant = (flagId: string): unknown => {
    if (!userContext) return null;
    return abTestManager.getFeatureVariant(flagId, userContext);
  };

  const trackEvent = (
    experimentId: string,
    variantId: string,
    event: string,
    value?: number,
  ): void => {
    abTestManager.trackExperimentEvent(
      experimentId,
      variantId,
      event,
      value,
      userContext || undefined,
    );
  };

  const setUserContext = (context: UserContext): void => {
    setUserContextState(context);
  };

  const value: ABTestContextType = {
    userContext,
    getVariant,
    isFeatureEnabled,
    getFeatureVariant,
    trackEvent,
    setUserContext,
  };

  return (
    <ABTestContext.Provider value={value}>{children}</ABTestContext.Provider>
  );
}

export function useABTest() {
  const context = useContext(ABTestContext);
  if (context === undefined) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
}

// Convenience hooks for specific use cases
export function useExperiment(experimentId: string) {
  const { getVariant, trackEvent } = useABTest();
  const variant = getVariant(experimentId);

  const track = (event: string, value?: number) => {
    if (variant) {
      trackEvent(experimentId, variant.id, event, value);
    }
  };

  return {
    variant,
    isControl: variant?.isControl || false,
    config: variant?.config || {},
    track,
  };
}

export function useFeatureFlag(flagId: string) {
  const { isFeatureEnabled, getFeatureVariant } = useABTest();

  return {
    enabled: isFeatureEnabled(flagId),
    variant: getFeatureVariant(flagId),
  };
}

// Utility functions
function generateUserId(): string {
  // Try to get existing user ID from localStorage
  const stored = localStorage.getItem('ab_user_id');
  if (stored) return stored;

  // Generate new user ID
  const userId =
    'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  localStorage.setItem('ab_user_id', userId);
  return userId;
}

function generateSessionId(): string {
  return (
    'session_' +
    Math.random().toString(36).substr(2, 9) +
    Date.now().toString(36)
  );
}

function detectDevice(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  const userAgent = navigator.userAgent;

  // Check for tablet patterns
  if (/iPad|Android.*(?!.*Mobile)|Tablet/i.test(userAgent)) {
    return 'tablet';
  }

  // Check for mobile patterns or small screen
  if (
    /Mobile|iPhone|iPod|BlackBerry|Opera Mini|IEMobile/i.test(userAgent) ||
    width < 768
  ) {
    return 'mobile';
  }

  return 'desktop';
}

function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'unknown';

  const userAgent = navigator.userAgent;

  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome') && !userAgent.includes('Chromium'))
    return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
    return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';

  return 'unknown';
}

function detectCountry(): string | undefined {
  // In a real implementation, you might use:
  // - Cloudflare CF-IPCountry header
  // - AWS CloudFront CloudFront-Viewer-Country header
  // - GeoIP service
  // - User's locale as fallback

  if (typeof navigator !== 'undefined' && navigator.language) {
    const locale = navigator.language;
    const countryCode = locale.split('-')[1];
    return countryCode?.toUpperCase();
  }

  return undefined;
}
