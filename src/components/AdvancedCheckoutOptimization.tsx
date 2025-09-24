'use client';

import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  ShoppingCart,
  CreditCard,
  Clock,
  Shield,
  Zap,
  Save,
  Star,
} from 'lucide-react';

// Types for advanced checkout optimization
interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  nickname?: string;
}

interface SavedAddress {
  id: string;
  type: 'shipping' | 'billing';
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  nickname?: string;
}

interface CheckoutProfile {
  id: string;
  email: string;
  savedPaymentMethods: SavedPaymentMethod[];
  savedAddresses: SavedAddress[];
  preferences: {
    autoFillEnabled: boolean;
    oneClickEnabled: boolean;
    expressCheckoutEnabled: boolean;
    newsletterOptIn: boolean;
    smsNotifications: boolean;
  };
  checkoutHistory: CheckoutAnalytics[];
}

interface CheckoutAnalytics {
  sessionId: string;
  startTime: Date;
  completionTime?: Date;
  steps: CheckoutStep[];
  abandonmentPoint?: string;
  conversionRate: number;
  timeToComplete?: number;
  paymentMethod?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  errors: CheckoutError[];
}

interface CheckoutStep {
  step: 'cart' | 'shipping' | 'payment' | 'review' | 'confirmation';
  entryTime: Date;
  exitTime?: Date;
  timeSpent?: number;
  interactionCount: number;
  errors: string[];
}

interface CheckoutError {
  type: 'validation' | 'payment' | 'shipping' | 'system';
  message: string;
  field?: string;
  timestamp: Date;
  resolved: boolean;
}

interface CheckoutOptimization {
  id: string;
  type: 'layout' | 'messaging' | 'flow' | 'trust_signals';
  name: string;
  description: string;
  isActive: boolean;
  conversionLift: number;
  confidence: number;
  testGroup?: 'A' | 'B';
}

interface CheckoutContextType {
  profile: CheckoutProfile | null;
  currentStep: string;
  optimizations: CheckoutOptimization[];
  analytics: CheckoutAnalytics | null;
  updateProfile: (profile: Partial<CheckoutProfile>) => void;
  setCurrentStep: (step: string) => void;
  trackCheckoutEvent: (event: string, data?: Record<string, unknown>) => void;
  getOptimizedExperience: () => CheckoutOptimization[];
}

// Create checkout optimization context
const CheckoutContext = createContext<CheckoutContextType | null>(null);

// Checkout optimization provider
export const CheckoutOptimizationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [profile, setProfile] = useState<CheckoutProfile | null>(null);
  const [currentStep, setCurrentStep] = useState('cart');
  const [analytics, setAnalytics] = useState<CheckoutAnalytics | null>(null);
  const [optimizations] = useState<CheckoutOptimization[]>([
    {
      id: 'trust-signals',
      type: 'trust_signals',
      name: 'Enhanced Trust Signals',
      description:
        'Display security badges, money-back guarantee, and customer reviews',
      isActive: true,
      conversionLift: 18.7,
      confidence: 96.2,
    },
    {
      id: 'progress-indicator',
      type: 'layout',
      name: 'Smart Progress Indicator',
      description: 'Show estimated time remaining and step completion status',
      isActive: true,
      conversionLift: 12.4,
      confidence: 94.8,
    },
    {
      id: 'guest-checkout',
      type: 'flow',
      name: 'Optimized Guest Checkout',
      description: 'Streamlined guest checkout with optional account creation',
      isActive: true,
      conversionLift: 23.1,
      confidence: 98.3,
    },
    {
      id: 'smart-defaults',
      type: 'flow',
      name: 'Smart Form Defaults',
      description: 'Auto-populate fields based on user behavior and location',
      isActive: true,
      conversionLift: 15.9,
      confidence: 91.7,
    },
    {
      id: 'urgency-messaging',
      type: 'messaging',
      name: 'Dynamic Urgency Messaging',
      description: 'Show stock levels and time-sensitive offers',
      isActive: true,
      conversionLift: 21.3,
      confidence: 95.1,
    },
  ]);

  // Initialize checkout session
  useEffect(() => {
    const initializeSession = () => {
      // Load saved profile
      const savedProfile = localStorage.getItem('checkout_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      // Start analytics tracking
      const sessionId = `checkout_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newAnalytics: CheckoutAnalytics = {
        sessionId,
        startTime: new Date(),
        steps: [],
        conversionRate: 0,
        deviceType:
          window.innerWidth < 768
            ? 'mobile'
            : window.innerWidth < 1024
            ? 'tablet'
            : 'desktop',
        errors: [],
      };
      setAnalytics(newAnalytics);
    };

    initializeSession();
  }, []);

  const updateProfile = (profileUpdates: Partial<CheckoutProfile>) => {
    const updatedProfile = { ...profile, ...profileUpdates } as CheckoutProfile;
    setProfile(updatedProfile);
    localStorage.setItem('checkout_profile', JSON.stringify(updatedProfile));
  };

  const trackCheckoutEvent = (
    event: string,
    data?: Record<string, unknown>,
  ) => {
    if (!analytics) return;

    const updatedAnalytics = { ...analytics };

    // Track step transitions
    if (event === 'step_enter') {
      const step: CheckoutStep = {
        step: data?.step as CheckoutStep['step'],
        entryTime: new Date(),
        interactionCount: 0,
        errors: [],
      };
      updatedAnalytics.steps.push(step);
    }

    // Track errors
    if (event === 'checkout_error') {
      const error: CheckoutError = {
        type: data?.type as CheckoutError['type'],
        message: data?.message as string,
        field: data?.field as string,
        timestamp: new Date(),
        resolved: false,
      };
      updatedAnalytics.errors.push(error);
    }

    setAnalytics(updatedAnalytics);
  };

  const getOptimizedExperience = () => {
    return optimizations.filter((opt) => opt.isActive);
  };

  return (
    <CheckoutContext.Provider
      value={{
        profile,
        currentStep,
        optimizations,
        analytics,
        updateProfile,
        setCurrentStep,
        trackCheckoutEvent,
        getOptimizedExperience,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

// Main checkout optimization component
export const AdvancedCheckoutOptimization: React.FC = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error(
      'AdvancedCheckoutOptimization must be used within CheckoutOptimizationProvider',
    );
  }

  const { optimizations } = context;
  const [showOptimizations, setShowOptimizations] = useState(false);

  // Sample data for demonstration
  const checkoutMetrics = {
    conversionRate: 73.2,
    averageTime: '2:34',
    abandonmentRate: 26.8,
    mobileConversion: 68.9,
    topAbandonmentPoint: 'Payment Information',
    revenueImpact: '+$47,320',
  };

  const savedPaymentMethods: SavedPaymentMethod[] = [
    {
      id: 'card_1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
      nickname: 'Work Card',
    },
    {
      id: 'paypal_1',
      type: 'paypal',
      isDefault: false,
      nickname: 'PayPal Account',
    },
  ];

  const recentOptimizations = [
    {
      test: 'One-Click Checkout Button',
      improvement: '+34.7% conversion',
      impact: 'High',
      status: 'Active',
    },
    {
      test: 'Trust Badge Placement',
      improvement: '+18.2% conversion',
      impact: 'Medium',
      status: 'Active',
    },
    {
      test: 'Guest Checkout Flow',
      improvement: '+23.1% conversion',
      impact: 'High',
      status: 'Active',
    },
    {
      test: 'Smart Form Validation',
      improvement: '+15.9% conversion',
      impact: 'Medium',
      status: 'Testing',
    },
  ];

  const checkoutTrends = [
    { period: 'This Week', conversion: 73.2, change: +5.4 },
    { period: 'Last Week', conversion: 67.8, change: +2.1 },
    { period: 'Last Month', conversion: 65.7, change: -1.3 },
    { period: '3 Months Ago', conversion: 66.0, change: +8.7 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Advanced Checkout Optimization
              </h3>
              <p className="text-purple-100">
                One-click purchases & express checkout for lab professionals
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOptimizations(!showOptimizations)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {showOptimizations ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {checkoutMetrics.conversionRate}%
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {checkoutMetrics.averageTime}
            </div>
            <div className="text-sm text-gray-600">Avg Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {checkoutMetrics.abandonmentRate}%
            </div>
            <div className="text-sm text-gray-600">Abandonment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {checkoutMetrics.mobileConversion}%
            </div>
            <div className="text-sm text-gray-600">Mobile Conv.</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">Payment</div>
            <div className="text-sm text-gray-600">Top Exit Point</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {checkoutMetrics.revenueImpact}
            </div>
            <div className="text-sm text-gray-600">Revenue Impact</div>
          </div>
        </div>
      </div>

      {showOptimizations && (
        <div className="p-6 space-y-6">
          {/* Express Checkout Options */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Express Checkout Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center space-x-2 bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-black text-xs font-bold">Pay</span>
                </div>
                <span>Apple Pay</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-bold">G</span>
                </div>
                <span>Google Pay</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-yellow-400 text-black p-3 rounded-lg hover:bg-yellow-500 transition-colors">
                <span className="font-bold">PayPal</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors">
                <Zap className="h-4 w-4" />
                <span>One-Click</span>
              </button>
            </div>
          </div>

          {/* Saved Payment Methods */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Save className="h-5 w-5 mr-2 text-green-500" />
              Saved Payment Methods
            </h4>
            <div className="space-y-3">
              {savedPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      {method.type === 'card'
                        ? method.brand?.slice(0, 2).toUpperCase()
                        : 'PP'}
                    </div>
                    <div>
                      <div className="font-medium">
                        {method.type === 'card'
                          ? `•••• •••• •••• ${method.last4}`
                          : method.nickname}
                      </div>
                      <div className="text-sm text-gray-600">
                        {method.type === 'card'
                          ? `Expires ${method.expiryMonth}/${method.expiryYear}`
                          : 'PayPal Account'}
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Use This
                  </button>
                </div>
              ))}
              <button className="w-full border-2 border-dashed border-gray-300 p-4 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors">
                + Add New Payment Method
              </button>
            </div>
          </div>

          {/* Active Optimizations */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Active Optimizations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optimizations
                .filter((opt) => opt.isActive)
                .map((optimization) => (
                  <div
                    key={optimization.id}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-green-800">
                        {optimization.name}
                      </h5>
                      <span className="text-green-600 font-bold text-sm">
                        +{optimization.conversionLift}%
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                      {optimization.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">
                        Confidence: {optimization.confidence}%
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Test Results */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Recent A/B Test Results
            </h4>
            <div className="space-y-3">
              {recentOptimizations.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-blue-800">{test.test}</div>
                    <div className="text-sm text-blue-600">
                      {test.improvement}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {test.status}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        test.impact === 'High'
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {test.impact} Impact
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Trends */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-purple-500" />
              Conversion Trends
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {checkoutTrends.map((trend, index) => (
                <div
                  key={index}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  <div className="text-sm text-purple-600 font-medium">
                    {trend.period}
                  </div>
                  <div className="text-2xl font-bold text-purple-800">
                    {trend.conversion}%
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      trend.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trend.change > 0 ? '+' : ''}
                    {trend.change}% change
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Signals */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Trust & Security Signals
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium">SSL Secured</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-sm font-medium">256-bit Encryption</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">💳</div>
                <div className="text-sm font-medium">PCI Compliant</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">↩️</div>
                <div className="text-sm font-medium">30-Day Returns</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCheckoutOptimization;
