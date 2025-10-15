'use client';

import { useState, useEffect, useRef } from 'react';
// Analytics imported via window.__labAnalytics global
// import { analytics } from '@/lib/analytics';

// A/B Testing Configuration
export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage
  component?: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ABTestConfig {
  testId: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  targetAudience?:
    | 'all'
    | 'mobile'
    | 'desktop'
    | 'new_users'
    | 'returning_users';
  startDate?: Date;
  endDate?: Date;
  conversionGoal: string; // Event name to track
  isActive: boolean;
}

// A/B Testing Hook
export function useABTest(testId: string): {
  variant: ABTestVariant | null;
  isLoading: boolean;
} {
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasAssigned = useRef(false);

  useEffect(() => {
    if (hasAssigned.current) return;
    hasAssigned.current = true;

    const assignVariant = async () => {
      try {
        // Check for existing assignment in localStorage
        const existingAssignment = localStorage.getItem(`ab_test_${testId}`);
        if (existingAssignment) {
          const parsedAssignment = JSON.parse(existingAssignment);
          setVariant(parsedAssignment.variant);
          setIsLoading(false);
          return;
        }

        // Get test configuration
        const testConfig = await getABTestConfig(testId);
        if (!testConfig || !testConfig.isActive) {
          setVariant(null);
          setIsLoading(false);
          return;
        }

        // Check target audience
        if (!isInTargetAudience(testConfig.targetAudience)) {
          setVariant(testConfig.variants[0]); // Default to control
          setIsLoading(false);
          return;
        }

        // Assign variant based on weights
        const assignedVariant = assignVariantByWeight(testConfig.variants);

        // Store assignment
        const assignment = {
          testId,
          variant: assignedVariant,
          assignedAt: new Date().toISOString(),
          sessionId: getSessionId(),
        };
        localStorage.setItem(`ab_test_${testId}`, JSON.stringify(assignment));

        // Track assignment event
        if (typeof window !== 'undefined' && window.analytics) {
          window.analytics.track('ab_test_assigned', {
            test_id: testId,
            variant_id: assignedVariant.id,
            variant_name: assignedVariant.name,
          });
        }

        setVariant(assignedVariant);
      } catch (error) {
        console.error('A/B Test assignment error:', error);
        setVariant(null);
      } finally {
        setIsLoading(false);
      }
    };

    assignVariant();
  }, [testId]);

  return { variant, isLoading };
}

// A/B Test Component Wrapper
interface ABTestProps {
  testId: string;
  children: (
    variant: ABTestVariant | null,
    isLoading: boolean,
  ) => React.ReactNode;
}

export function ABTest({ testId, children }: ABTestProps) {
  const { variant, isLoading } = useABTest(testId);
  return <>{children(variant, isLoading)}</>;
}

// A/B Test Configuration Manager
class ABTestManager {
  private tests: Map<string, ABTestConfig> = new Map();

  registerTest(config: ABTestConfig) {
    this.tests.set(config.testId, config);
  }

  getTest(testId: string): ABTestConfig | undefined {
    return this.tests.get(testId);
  }

  getAllTests(): ABTestConfig[] {
    return Array.from(this.tests.values());
  }

  trackConversion(testId: string, conversionEvent: string, value?: number) {
    const assignment = localStorage.getItem(`ab_test_${testId}`);
    if (!assignment) return;

    const parsedAssignment = JSON.parse(assignment);

    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('ab_test_conversion', {
        test_id: testId,
        variant_id: parsedAssignment.variant.id,
        variant_name: parsedAssignment.variant.name,
        conversion_event: conversionEvent,
        conversion_value: value,
        time_to_conversion:
          Date.now() - new Date(parsedAssignment.assignedAt).getTime(),
      });
    }
  }
}

export const abTestManager = new ABTestManager();

// Utility Functions
async function getABTestConfig(testId: string): Promise<ABTestConfig | null> {
  try {
    const response = await fetch(`/api/ab-tests/${testId}`);
    if (!response.ok) {
      // Fallback to registered tests if API not available
      return abTestManager.getTest(testId) || null;
    }
    return response.json();
  } catch (error) {
    // Fallback to registered tests
    return abTestManager.getTest(testId) || null;
  }
}

function isInTargetAudience(targetAudience?: string): boolean {
  if (!targetAudience || targetAudience === 'all') return true;

  const isMobile = window.innerWidth <= 768;
  const isNewUser = !localStorage.getItem('returning_user');

  switch (targetAudience) {
    case 'mobile':
      return isMobile;
    case 'desktop':
      return !isMobile;
    case 'new_users':
      return isNewUser;
    case 'returning_users':
      return !isNewUser;
    default:
      return true;
  }
}

function assignVariantByWeight(variants: ABTestVariant[]): ABTestVariant {
  const totalWeight = variants.reduce(
    (sum, variant) => sum + variant.weight,
    0,
  );
  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    if (random <= cumulativeWeight) {
      return variant;
    }
  }

  return variants[0]; // Fallback to first variant
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Conversion Tracking Hook
export function useABTestConversion(testId: string, conversionEvent: string) {
  return (value?: number) => {
    abTestManager.trackConversion(testId, conversionEvent, value);
  };
}

// A/B Test Results Interface
export interface ABTestResults {
  testId: string;
  variants: Array<{
    variantId: string;
    name: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    averageValue: number;
    confidence: number;
    isWinner: boolean;
  }>;
  totalParticipants: number;
  startDate: string;
  endDate?: string;
  status: 'running' | 'completed' | 'paused';
}

// Default A/B Tests Configuration
export const DEFAULT_AB_TESTS: ABTestConfig[] = [
  {
    testId: 'hero_cta_text',
    name: 'Hero CTA Button Text',
    description: 'Test different call-to-action button text on homepage hero',
    variants: [
      { id: 'control', name: 'Shop Microscopes', weight: 50 },
      { id: 'variant_a', name: 'Browse Lab Equipment', weight: 25 },
      { id: 'variant_b', name: 'Find Your Equipment', weight: 25 },
    ],
    conversionGoal: 'view_item_list',
    isActive: true,
  },
  {
    testId: 'product_card_layout',
    name: 'Product Card Design',
    description: 'Test different product card layouts for conversion',
    variants: [
      { id: 'control', name: 'Current Design', weight: 50 },
      { id: 'variant_a', name: 'Compact Layout', weight: 50 },
    ],
    conversionGoal: 'view_item',
    isActive: true,
  },
  {
    testId: 'pricing_display',
    name: 'Price Display Format',
    description: 'Test different ways to display product pricing',
    variants: [
      { id: 'control', name: 'Standard Format', weight: 50 },
      { id: 'variant_a', name: 'Emphasized Price', weight: 50 },
    ],
    conversionGoal: 'add_to_cart',
    isActive: true,
  },
];

// Initialize default tests
DEFAULT_AB_TESTS.forEach((test) => abTestManager.registerTest(test));
