import { ABTestConfig, FeatureFlag } from './ABTesting';

// Example A/B Tests Configuration
export const abTests: ABTestConfig[] = [
  {
    id: 'homepage_hero_test',
    name: 'Homepage Hero CTA Test',
    description: 'Testing different CTAs on the homepage hero section',
    enabled: true,
    variants: {
      control: {
        name: 'Original CTA',
        weight: 50,
        component: null, // Components would be rendered based on variant
      },
      variant_a: {
        name: 'Urgent CTA',
        weight: 25,
        component: null,
      },
      variant_b: {
        name: 'Value-focused CTA',
        weight: 25,
        component: null,
      },
    },
    metrics: ['click_through_rate', 'conversion_rate', 'time_on_page'],
  },
  {
    id: 'product_card_layout',
    name: 'Product Card Layout Test',
    description: 'Testing different product card designs',
    enabled: true,
    variants: {
      control: {
        name: 'Standard Layout',
        weight: 50,
        component: null,
      },
      variant_a: {
        name: 'Image-focused Layout',
        weight: 50,
        component: null,
      },
    },
    conditions: {
      userSegment: ['returning_users', 'high_value_customers'],
    },
    metrics: ['click_through_rate', 'add_to_cart_rate'],
  },
  {
    id: 'checkout_flow_test',
    name: 'Checkout Flow Optimization',
    description: 'Testing streamlined vs detailed checkout process',
    enabled: true,
    variants: {
      control: {
        name: 'Standard Checkout',
        weight: 60,
        component: null,
      },
      streamlined: {
        name: 'Streamlined Checkout',
        weight: 40,
        component: null,
      },
    },
    conditions: {
      timeRange: {
        start: new Date('2025-01-01'),
        end: new Date('2025-12-31'),
      },
    },
    metrics: ['completion_rate', 'abandonment_rate', 'conversion_value'],
  },
  {
    id: 'pricing_display_test',
    name: 'Pricing Display Test',
    description: 'Testing different ways to display pricing information',
    enabled: true,
    variants: {
      control: {
        name: 'Standard Pricing',
        weight: 33,
        component: null,
      },
      with_savings: {
        name: 'Show Savings Amount',
        weight: 33,
        component: null,
      },
      with_urgency: {
        name: 'Limited Time Pricing',
        weight: 34,
        component: null,
      },
    },
    metrics: ['click_through_rate', 'purchase_intent', 'conversion_rate'],
  },
];

// Example Feature Flags Configuration
export const featureFlags: FeatureFlag[] = [
  {
    id: 'new_search_functionality',
    name: 'Enhanced Search',
    description: 'New AI-powered search with filters and suggestions',
    enabled: true,
    rolloutPercentage: 50,
    conditions: {
      userSegment: ['beta_users', 'premium_customers'],
    },
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode Theme',
    description: 'Dark theme option for the application',
    enabled: true,
    rolloutPercentage: 100,
  },
  {
    id: 'social_login',
    name: 'Social Media Login',
    description: 'Login with Google, Facebook, and Apple',
    enabled: true,
    rolloutPercentage: 75,
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics Dashboard',
    description: 'Enhanced analytics with detailed insights',
    enabled: true,
    rolloutPercentage: 25,
    conditions: {
      userSegment: ['admin_users', 'premium_customers'],
    },
  },
  {
    id: 'real_time_chat',
    name: 'Real-time Customer Support',
    description: 'Live chat support integration',
    enabled: true,
    rolloutPercentage: 60,
    conditions: {
      userAgent: ['chrome', 'firefox', 'safari'],
    },
  },
  {
    id: 'product_recommendations',
    name: 'AI Product Recommendations',
    description: 'Machine learning powered product suggestions',
    enabled: true,
    rolloutPercentage: 80,
  },
  {
    id: 'subscription_plans',
    name: 'Subscription Model',
    description: 'New subscription-based pricing options',
    enabled: false, // Disabled for now
    rolloutPercentage: 0,
  },
  {
    id: 'mobile_app_promotion',
    name: 'Mobile App Download Banner',
    description: 'Promote mobile app download on mobile web',
    enabled: true,
    rolloutPercentage: 90,
    conditions: {
      userAgent: ['mobile', 'android', 'iphone'],
    },
  },
];

// User Segments Configuration
export const userSegments = {
  new_users: 'Users who registered in the last 30 days',
  returning_users: 'Users who have visited multiple times',
  high_value_customers: 'Users with purchase history > $500',
  premium_customers: 'Users with premium subscriptions',
  beta_users: 'Users who opted into beta testing',
  admin_users: 'Administrative users with special privileges',
  mobile_users: 'Users primarily accessing via mobile devices',
  desktop_users: 'Users primarily accessing via desktop',
  abandoned_cart: 'Users who abandoned items in cart',
  frequent_buyers: 'Users who purchase regularly',
};

// Conversion Goals Configuration
export const conversionGoals = {
  email_signup: {
    name: 'Email Newsletter Signup',
    description: 'User subscribes to email newsletter',
    value: 5, // $5 value
  },
  account_creation: {
    name: 'Account Registration',
    description: 'User creates a new account',
    value: 10,
  },
  first_purchase: {
    name: 'First Time Purchase',
    description: 'User makes their first purchase',
    value: 50,
  },
  repeat_purchase: {
    name: 'Repeat Purchase',
    description: 'Existing customer makes another purchase',
    value: 75,
  },
  high_value_purchase: {
    name: 'High Value Purchase',
    description: 'Purchase over $200',
    value: 200,
  },
  product_review: {
    name: 'Product Review Submission',
    description: 'User submits a product review',
    value: 15,
  },
  social_share: {
    name: 'Social Media Share',
    description: 'User shares product or content on social media',
    value: 2,
  },
  referral: {
    name: 'Successful Referral',
    description: 'User refers someone who makes a purchase',
    value: 25,
  },
};

// Analytics Event Types
interface AnalyticsEvent {
  event: string;
  testId: string;
  variant: string;
  properties?: {
    testName?: string;
    value?: number;
    [key: string]: unknown;
  };
}

// Sample Analytics Integration
export const handleAnalyticsEvent = (event: AnalyticsEvent) => {
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', event);
  }

  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;

    if (gtag) {
      gtag('event', event.event, {
        event_category: 'ab_testing',
        event_label: event.testId,
        custom_parameter_1: event.variant,
        custom_parameter_2: event.properties?.testName,
        value: event.properties?.value || 0,
      });
    }
  }

  // Custom analytics endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).catch((err) => {
      console.error('Failed to send analytics event:', err);
    });
  }
};

// Test Results Analysis Helper
interface TestEvent {
  event: string;
  testId: string;
  variant: string;
  timestamp?: number;
}

interface TestVariantResult {
  variant: string;
  views: number;
  conversions: number;
  clicks: number;
  conversionRate: number;
  clickThroughRate: number;
  significance?: {
    zScore: number;
    isSignificant: boolean;
    confidenceLevel: string;
    lift: number;
  };
}

export const analyzeTestResults = (testId: string, events: TestEvent[]) => {
  const testEvents = events.filter((e) => e.testId === testId);
  const variants = [...new Set(testEvents.map((e) => e.variant))];

  const results = variants.map((variant) => {
    const variantEvents = testEvents.filter((e) => e.variant === variant);
    const views = variantEvents.filter(
      (e) => e.event === 'ab_test_view',
    ).length;
    const conversions = variantEvents.filter(
      (e) => e.event === 'conversion',
    ).length;
    const clicks = variantEvents.filter((e) => e.event === 'click').length;

    return {
      variant,
      views,
      conversions,
      clicks,
      conversionRate: views > 0 ? (conversions / views) * 100 : 0,
      clickThroughRate: views > 0 ? (clicks / views) * 100 : 0,
    } as TestVariantResult;
  });

  // Statistical significance calculation (simplified)
  const calculateSignificance = (
    control: TestVariantResult,
    variant: TestVariantResult,
  ) => {
    const controlRate = control.conversionRate / 100;
    const variantRate = variant.conversionRate / 100;
    const pooledRate =
      (control.conversions + variant.conversions) /
      (control.views + variant.views);

    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1 / control.views + 1 / variant.views),
    );

    const zScore = Math.abs(variantRate - controlRate) / standardError;
    const isSignificant = zScore > 1.96; // 95% confidence level

    return {
      zScore,
      isSignificant,
      confidenceLevel: isSignificant ? '95%' : 'Not significant',
      lift:
        controlRate > 0 ? ((variantRate - controlRate) / controlRate) * 100 : 0,
    };
  };

  // Add significance calculations
  if (results.length >= 2) {
    const control = results[0];
    results.slice(1).forEach((variant, index) => {
      const significance = calculateSignificance(control, variant);
      results[index + 1] = { ...variant, significance } as TestVariantResult;
    });
  }

  return {
    testId,
    variants: results,
    totalViews: testEvents.filter((e) => e.event === 'ab_test_view').length,
    totalConversions: testEvents.filter((e) => e.event === 'conversion').length,
    summary: {
      winningVariant: results.reduce((prev, current) =>
        current.conversionRate > prev.conversionRate ? current : prev,
      ),
    },
  };
};
