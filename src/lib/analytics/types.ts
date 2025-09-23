// Core Analytics Types
export interface AnalyticsEvent {
  id: string;
  name: string;
  category: 'ecommerce' | 'engagement' | 'conversion' | 'experiment' | 'custom';
  properties: Record<string, unknown>;
  value?: number;
  currency?: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  source?: string;
  medium?: string;
  campaign?: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  events: string[];
  referrer?: string;
  landingPage: string;
  exitPage?: string;
  deviceInfo: DeviceInfo;
  location?: LocationInfo;
  isConverted?: boolean;
  conversionValue?: number;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os?: string;
  browser?: string;
  screenResolution?: string;
  userAgent?: string;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// E-commerce Analytics
export interface ProductEvent {
  eventType:
    | 'view_item'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'begin_checkout'
    | 'purchase';
  productId: string;
  productName: string;
  category: string;
  brand?: string;
  variant?: string;
  price: number;
  currency: string;
  quantity: number;
  position?: number; // Position in list
  listName?: string; // Collection or search results
}

export interface PurchaseEvent {
  transactionId: string;
  items: ProductEvent[];
  totalValue: number;
  currency: string;
  couponCode?: string;
  shippingCost?: number;
  tax?: number;
  paymentMethod?: string;
  customerType?: 'new' | 'returning';
}

// Funnel Analytics
export interface FunnelStep {
  id: string;
  name: string;
  description: string;
  order: number;
  event: string;
  conditions?: FunnelCondition[];
}

export interface FunnelCondition {
  property: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface Funnel {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  timeWindow: number; // Hours
  createdAt: Date;
  updatedAt: Date;
}

export interface FunnelAnalysis {
  funnelId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalUsers: number;
  stepAnalysis: FunnelStepAnalysis[];
  conversionRate: number;
  averageTimeToConvert: number;
  dropoffPoints: Array<{
    step: string;
    dropoffRate: number;
    reasons?: string[];
  }>;
}

export interface FunnelStepAnalysis {
  stepId: string;
  stepName: string;
  users: number;
  completionRate: number;
  averageTime: number;
  dropoffRate: number;
  conversionRate: number;
}

// Cohort Analytics
export interface CohortAnalysis {
  id: string;
  name: string;
  cohortType: 'acquisition' | 'behavioral';
  period: 'daily' | 'weekly' | 'monthly';
  metric: 'retention' | 'revenue' | 'frequency';
  data: CohortData[];
  createdAt: Date;
}

export interface CohortData {
  cohortPeriod: string;
  cohortSize: number;
  periods: Array<{
    period: number;
    users: number;
    value: number;
    rate: number;
  }>;
}

// Custom Events
export interface CustomEventDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  properties: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
    description: string;
  }>;
  isActive: boolean;
  createdAt: Date;
}

// Real-time Analytics
export interface RealTimeMetrics {
  timestamp: Date;
  activeUsers: number;
  pageViews: number;
  eventsPerMinute: number;
  conversionRate: number;
  revenue: number;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  topEvents: Array<{
    name: string;
    count: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trafficSources: Array<{
    source: string;
    users: number;
    percentage: number;
  }>;
}

// A/B Testing Integration
export interface ExperimentAnalytics {
  experimentId: string;
  variants: Array<{
    id: string;
    name: string;
    users: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    averageOrderValue: number;
    significance: number;
    confidenceInterval: [number, number];
  }>;
  winner?: string;
  status: 'running' | 'completed' | 'inconclusive';
  startDate: Date;
  endDate?: Date;
  primaryMetric: string;
  secondaryMetrics: Array<{
    name: string;
    variants: Array<{
      variantId: string;
      value: number;
      improvement: number;
    }>;
  }>;
}

// Performance Analytics
export interface PerformanceMetrics {
  timestamp: Date;
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  page: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  connectionType?: string;
}

// Attribution Analytics
export interface AttributionModel {
  id: string;
  name: string;
  type:
    | 'first_click'
    | 'last_click'
    | 'linear'
    | 'time_decay'
    | 'position_based'
    | 'custom';
  lookbackWindow: number; // Days
  touchpointWeights: Array<{
    position: number;
    weight: number;
  }>;
}

export interface TouchpointData {
  channel: string;
  campaign?: string;
  medium: string;
  source: string;
  timestamp: Date;
  value?: number;
}

export interface ConversionPath {
  userId: string;
  conversionId: string;
  touchpoints: TouchpointData[];
  conversionEvent: string;
  conversionValue: number;
  pathLength: number;
  timeToConversion: number; // Hours
  attributedValue: Record<string, number>; // Channel attribution
}

// Predefined Funnels for Lab Equipment E-commerce
export const ECOMMERCE_FUNNELS: Record<string, Partial<Funnel>> = {
  'product-discovery-purchase': {
    name: 'Product Discovery to Purchase',
    description: 'Track users from product page view to completed purchase',
    steps: [
      {
        id: 'product-view',
        name: 'Product View',
        description: 'User views a product page',
        order: 1,
        event: 'view_item',
      },
      {
        id: 'add-to-cart',
        name: 'Add to Cart',
        description: 'User adds product to cart',
        order: 2,
        event: 'add_to_cart',
      },
      {
        id: 'begin-checkout',
        name: 'Begin Checkout',
        description: 'User starts checkout process',
        order: 3,
        event: 'begin_checkout',
      },
      {
        id: 'purchase',
        name: 'Purchase',
        description: 'User completes purchase',
        order: 4,
        event: 'purchase',
      },
    ],
    timeWindow: 72, // 3 days
  },

  'collection-browse-purchase': {
    name: 'Collection Browse to Purchase',
    description: 'Track users from collection page to purchase',
    steps: [
      {
        id: 'collection-view',
        name: 'Collection View',
        description: 'User views a collection page',
        order: 1,
        event: 'view_item_list',
      },
      {
        id: 'product-click',
        name: 'Product Click',
        description: 'User clicks on a product',
        order: 2,
        event: 'select_item',
      },
      {
        id: 'add-to-cart',
        name: 'Add to Cart',
        description: 'User adds product to cart',
        order: 3,
        event: 'add_to_cart',
      },
      {
        id: 'purchase',
        name: 'Purchase',
        description: 'User completes purchase',
        order: 4,
        event: 'purchase',
      },
    ],
    timeWindow: 48, // 2 days
  },

  'search-purchase': {
    name: 'Search to Purchase',
    description: 'Track users from search to purchase',
    steps: [
      {
        id: 'search',
        name: 'Search',
        description: 'User performs a search',
        order: 1,
        event: 'search',
      },
      {
        id: 'search-result-click',
        name: 'Result Click',
        description: 'User clicks on search result',
        order: 2,
        event: 'select_item',
      },
      {
        id: 'add-to-cart',
        name: 'Add to Cart',
        description: 'User adds product to cart',
        order: 3,
        event: 'add_to_cart',
      },
      {
        id: 'purchase',
        name: 'Purchase',
        description: 'User completes purchase',
        order: 4,
        event: 'purchase',
      },
    ],
    timeWindow: 24, // 1 day
  },

  'newsletter-signup': {
    name: 'Newsletter Signup Funnel',
    description: 'Track users who sign up for newsletter',
    steps: [
      {
        id: 'homepage-visit',
        name: 'Homepage Visit',
        description: 'User visits homepage',
        order: 1,
        event: 'page_view',
        conditions: [
          {
            property: 'page_path',
            operator: 'equals',
            value: '/',
          },
        ],
      },
      {
        id: 'newsletter-view',
        name: 'Newsletter Form View',
        description: 'User sees newsletter signup form',
        order: 2,
        event: 'newsletter_form_view',
      },
      {
        id: 'newsletter-signup',
        name: 'Newsletter Signup',
        description: 'User completes newsletter signup',
        order: 3,
        event: 'newsletter_signup',
      },
    ],
    timeWindow: 1, // Same session
  },
};

// Predefined Custom Events
export const CUSTOM_EVENTS: Record<string, Partial<CustomEventDefinition>> = {
  product_specification_view: {
    name: 'Product Specification View',
    description: 'User views detailed product specifications',
    category: 'engagement',
    properties: [
      {
        name: 'product_id',
        type: 'string',
        required: true,
        description: 'Product identifier',
      },
      {
        name: 'section',
        type: 'string',
        required: true,
        description: 'Specification section viewed',
      },
      {
        name: 'time_spent',
        type: 'number',
        required: false,
        description: 'Time spent viewing in seconds',
      },
    ],
    isActive: true,
  },

  live_chat_interaction: {
    name: 'Live Chat Interaction',
    description: 'User interacts with live chat support',
    category: 'engagement',
    properties: [
      {
        name: 'interaction_type',
        type: 'string',
        required: true,
        description: 'Type of interaction (open, message, close)',
      },
      {
        name: 'session_duration',
        type: 'number',
        required: false,
        description: 'Chat session duration in seconds',
      },
      {
        name: 'agent_id',
        type: 'string',
        required: false,
        description: 'Support agent identifier',
      },
      {
        name: 'satisfaction_score',
        type: 'number',
        required: false,
        description: 'Customer satisfaction rating 1-5',
      },
    ],
    isActive: true,
  },

  product_comparison: {
    name: 'Product Comparison',
    description: 'User compares multiple products',
    category: 'engagement',
    properties: [
      {
        name: 'product_ids',
        type: 'string',
        required: true,
        description: 'Comma-separated product IDs',
      },
      {
        name: 'comparison_type',
        type: 'string',
        required: true,
        description: 'Type of comparison (features, price, specifications)',
      },
      {
        name: 'duration',
        type: 'number',
        required: false,
        description: 'Time spent comparing in seconds',
      },
    ],
    isActive: true,
  },

  quote_request: {
    name: 'Quote Request',
    description: 'User requests a price quote for equipment',
    category: 'conversion',
    properties: [
      {
        name: 'product_ids',
        type: 'string',
        required: true,
        description: 'Products included in quote',
      },
      {
        name: 'contact_method',
        type: 'string',
        required: true,
        description: 'Preferred contact method',
      },
      {
        name: 'urgency',
        type: 'string',
        required: false,
        description: 'Quote urgency level',
      },
      {
        name: 'estimated_value',
        type: 'number',
        required: false,
        description: 'Estimated quote value',
      },
    ],
    isActive: true,
  },

  technical_document_download: {
    name: 'Technical Document Download',
    description: 'User downloads technical documentation',
    category: 'engagement',
    properties: [
      {
        name: 'document_type',
        type: 'string',
        required: true,
        description: 'Type of document (manual, datasheet, certificate)',
      },
      {
        name: 'product_id',
        type: 'string',
        required: true,
        description: 'Related product identifier',
      },
      {
        name: 'file_size',
        type: 'number',
        required: false,
        description: 'File size in bytes',
      },
    ],
    isActive: true,
  },

  equipment_filter_usage: {
    name: 'Equipment Filter Usage',
    description: 'User applies filters when browsing equipment',
    category: 'engagement',
    properties: [
      {
        name: 'filter_type',
        type: 'string',
        required: true,
        description: 'Type of filter applied',
      },
      {
        name: 'filter_value',
        type: 'string',
        required: true,
        description: 'Selected filter value',
      },
      {
        name: 'results_count',
        type: 'number',
        required: false,
        description: 'Number of results after filtering',
      },
      {
        name: 'collection',
        type: 'string',
        required: false,
        description: 'Collection being filtered',
      },
    ],
    isActive: true,
  },
};
