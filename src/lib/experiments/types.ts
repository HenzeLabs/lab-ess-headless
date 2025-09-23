export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  targeting: ExperimentTargeting;
  metrics: ExperimentMetric[];
  startDate?: Date;
  endDate?: Date;
  trafficAllocation: number; // 0-100 percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  allocation: number; // 0-100 percentage
  config: Record<string, unknown>; // Variant-specific configuration
  isControl: boolean;
}

export interface ExperimentTargeting {
  audiences: string[]; // Audience IDs
  countries?: string[];
  devices?: ('desktop' | 'mobile' | 'tablet')[];
  browsers?: string[];
  userSegments?: string[];
  customRules?: TargetingRule[];
}

export interface TargetingRule {
  property: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: string | number | string[] | number[];
}

export interface ExperimentMetric {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'custom';
  event: string; // Analytics event name
  goal: 'increase' | 'decrease';
  isPrimary: boolean;
}

export interface ExperimentAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  metric: string;
  value: number;
  count: number;
  conversionRate?: number;
  confidenceInterval?: [number, number];
  significance?: number;
  timestamp: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  targeting: ExperimentTargeting;
  variants?: Record<string, unknown>; // For multivariate flags
  createdAt: Date;
  updatedAt: Date;
}

export interface UserContext {
  userId: string;
  sessionId: string;
  country?: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  userAgent?: string;
  customProperties?: Record<string, unknown>;
}

// Built-in experiment configurations
export const EXPERIMENT_CONFIGS: Record<string, Partial<ExperimentConfig>> = {
  'hero-cta-test': {
    name: 'Hero CTA Button Test',
    description:
      'Test different CTA button text and colors on the homepage hero',
    variants: [
      {
        id: 'control',
        name: 'Original',
        description: 'Shop Microscopes',
        allocation: 50,
        config: { buttonText: 'Shop Microscopes', buttonColor: 'primary' },
        isControl: true,
      },
      {
        id: 'variant-a',
        name: 'Urgent CTA',
        description: 'Browse Equipment Now',
        allocation: 50,
        config: { buttonText: 'Browse Equipment Now', buttonColor: 'accent' },
        isControl: false,
      },
    ],
    metrics: [
      {
        id: 'cta-clicks',
        name: 'CTA Click Rate',
        type: 'conversion',
        event: 'hero_cta_click',
        goal: 'increase',
        isPrimary: true,
      },
      {
        id: 'product-views',
        name: 'Product Page Views',
        type: 'engagement',
        event: 'view_item',
        goal: 'increase',
        isPrimary: false,
      },
    ],
    trafficAllocation: 50, // Only test on 50% of traffic
  },

  'pricing-display-test': {
    name: 'Pricing Display Format',
    description: 'Test different ways to display product pricing',
    variants: [
      {
        id: 'control',
        name: 'Standard Pricing',
        description: 'Regular price format',
        allocation: 33,
        config: { showSavings: false, emphasizeDiscount: false },
        isControl: true,
      },
      {
        id: 'variant-savings',
        name: 'Show Savings',
        description: 'Highlight amount saved',
        allocation: 33,
        config: { showSavings: true, emphasizeDiscount: false },
        isControl: false,
      },
      {
        id: 'variant-discount',
        name: 'Emphasize Discount',
        description: 'Large discount percentage',
        allocation: 34,
        config: { showSavings: true, emphasizeDiscount: true },
        isControl: false,
      },
    ],
    metrics: [
      {
        id: 'add-to-cart',
        name: 'Add to Cart Rate',
        type: 'conversion',
        event: 'add_to_cart',
        goal: 'increase',
        isPrimary: true,
      },
      {
        id: 'purchase-conversion',
        name: 'Purchase Conversion',
        type: 'conversion',
        event: 'purchase',
        goal: 'increase',
        isPrimary: true,
      },
    ],
    trafficAllocation: 75,
  },

  'newsletter-signup-test': {
    name: 'Newsletter Signup Optimization',
    description: 'Test different newsletter signup approaches',
    variants: [
      {
        id: 'control',
        name: 'Standard Form',
        description: 'Basic email signup',
        allocation: 50,
        config: { showIncentive: false, placement: 'footer' },
        isControl: true,
      },
      {
        id: 'variant-incentive',
        name: 'With Incentive',
        description: '10% off first order',
        allocation: 50,
        config: {
          showIncentive: true,
          incentiveText: '10% off your first order',
          placement: 'popup',
        },
        isControl: false,
      },
    ],
    metrics: [
      {
        id: 'newsletter-signups',
        name: 'Newsletter Signup Rate',
        type: 'conversion',
        event: 'newsletter_signup',
        goal: 'increase',
        isPrimary: true,
      },
    ],
    trafficAllocation: 100,
  },
};

// Built-in feature flags
export const FEATURE_FLAGS: Record<string, Partial<FeatureFlag>> = {
  'new-product-page': {
    name: 'New Product Page Design',
    description: 'Enable the redesigned product page layout',
    enabled: false,
    rolloutPercentage: 10,
  },

  'live-chat': {
    name: 'Live Chat Widget',
    description: 'Show live chat support widget',
    enabled: true,
    rolloutPercentage: 100,
  },

  'express-checkout': {
    name: 'Express Checkout',
    description: 'Enable one-click checkout for returning customers',
    enabled: false,
    rolloutPercentage: 25,
  },

  'product-recommendations': {
    name: 'AI Product Recommendations',
    description: 'Show AI-powered product recommendations',
    enabled: true,
    rolloutPercentage: 80,
  },

  'advanced-filters': {
    name: 'Advanced Product Filters',
    description: 'Enhanced filtering options on collection pages',
    enabled: false,
    rolloutPercentage: 0,
  },
};
