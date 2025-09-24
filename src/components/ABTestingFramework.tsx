'use client';

import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import {
  Beaker,
  TrendingUp,
  Users,
  Target,
  BarChart,
  Zap,
  CheckCircle,
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  variants: ABVariant[];
  trafficSplit: number;
  startDate: string;
  endDate?: string;
  goal: 'conversion' | 'engagement' | 'revenue' | 'retention';
  significance: number;
  winner?: string;
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number;
  conversions: number;
  visitors: number;
  revenue: number;
  isControl: boolean;
}

interface ABTestContext {
  currentTests: ABTest[];
  getVariant: (testId: string) => string | null;
  trackConversion: (testId: string, variant: string, value?: number) => void;
  isInTest: (testId: string) => boolean;
}

const ABTestingContext = createContext<ABTestContext | null>(null);

// Mock AB Tests Data
const mockABTests: ABTest[] = [
  {
    id: 'add-to-cart-button',
    name: 'Add to Cart Button Color',
    description: 'Testing button color impact on conversions',
    status: 'active',
    variants: [
      {
        id: 'control',
        name: 'Blue Button (Control)',
        description: 'Current blue add to cart button',
        trafficAllocation: 50,
        conversions: 125,
        visitors: 2100,
        revenue: 312500,
        isControl: true,
      },
      {
        id: 'variant-a',
        name: 'Green Button',
        description: 'Green add to cart button',
        trafficAllocation: 50,
        conversions: 142,
        visitors: 2080,
        revenue: 355000,
        isControl: false,
      },
    ],
    trafficSplit: 100,
    startDate: '2024-09-15',
    goal: 'conversion',
    significance: 94.2,
  },
  {
    id: 'product-description',
    name: 'Product Description Length',
    description: 'Testing short vs detailed descriptions',
    status: 'active',
    variants: [
      {
        id: 'control',
        name: 'Standard Description',
        description: 'Current product descriptions',
        trafficAllocation: 50,
        conversions: 89,
        visitors: 1850,
        revenue: 267000,
        isControl: true,
      },
      {
        id: 'variant-a',
        name: 'Detailed Technical Specs',
        description: 'Enhanced technical descriptions',
        trafficAllocation: 50,
        conversions: 112,
        visitors: 1820,
        revenue: 336000,
        isControl: false,
      },
    ],
    trafficSplit: 100,
    startDate: '2024-09-10',
    goal: 'conversion',
    significance: 87.3,
  },
  {
    id: 'pricing-display',
    name: 'Price Display Format',
    description: 'Testing different price display methods',
    status: 'completed',
    variants: [
      {
        id: 'control',
        name: 'Standard Pricing',
        description: 'Current price display',
        trafficAllocation: 50,
        conversions: 78,
        visitors: 1650,
        revenue: 234000,
        isControl: true,
      },
      {
        id: 'variant-a',
        name: 'Financing Options',
        description: 'Price with financing breakdown',
        trafficAllocation: 50,
        conversions: 98,
        visitors: 1630,
        revenue: 294000,
        isControl: false,
      },
    ],
    trafficSplit: 100,
    startDate: '2024-08-15',
    endDate: '2024-09-05',
    goal: 'conversion',
    significance: 96.8,
    winner: 'variant-a',
  },
];

export function ABTestingProvider({ children }: { children: ReactNode }) {
  const [currentTests] = useState<ABTest[]>(mockABTests);
  const [userVariants, setUserVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize user variants from localStorage or assign new ones
    const savedVariants = localStorage.getItem('ab-test-variants');
    if (savedVariants) {
      setUserVariants(JSON.parse(savedVariants));
    } else {
      // Assign user to variants for active tests
      const newVariants: Record<string, string> = {};
      currentTests
        .filter((test) => test.status === 'active')
        .forEach((test) => {
          // Simple random assignment based on traffic allocation
          const random = Math.random() * 100;
          let cumulative = 0;
          for (const variant of test.variants) {
            cumulative += variant.trafficAllocation;
            if (random <= cumulative) {
              newVariants[test.id] = variant.id;
              break;
            }
          }
        });
      setUserVariants(newVariants);
      localStorage.setItem('ab-test-variants', JSON.stringify(newVariants));
    }
  }, [currentTests]);

  const getVariant = (testId: string): string | null => {
    return userVariants[testId] || null;
  };

  const isInTest = (testId: string): boolean => {
    const test = currentTests.find((t) => t.id === testId);
    return test?.status === 'active' && testId in userVariants;
  };

  const trackConversion = (testId: string, variant: string, value = 0) => {
    // Track conversion event
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (
        window as {
          gtag: (event: string, action: string, params: object) => void;
        }
      ).gtag;
      gtag('event', 'ab_test_conversion', {
        event_category: 'ab_testing',
        test_id: testId,
        variant_id: variant,
        conversion_value: value,
      });
    }
  };

  const contextValue: ABTestContext = {
    currentTests,
    getVariant,
    trackConversion,
    isInTest,
  };

  return (
    <ABTestingContext.Provider value={contextValue}>
      {children}
    </ABTestingContext.Provider>
  );
}

export function useABTest() {
  const context = useContext(ABTestingContext);
  if (!context) {
    throw new Error('useABTest must be used within ABTestingProvider');
  }
  return context;
}

export default function ABTestingDashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'create'>(
    'active',
  );
  const [tests] = useState<ABTest[]>(mockABTests);

  const activeTests = tests.filter((test) => test.status === 'active');
  const completedTests = tests.filter((test) => test.status === 'completed');

  const calculateLift = (variant: ABVariant, control: ABVariant) => {
    const variantCVR = (variant.conversions / variant.visitors) * 100;
    const controlCVR = (control.conversions / control.visitors) * 100;
    return ((variantCVR - controlCVR) / controlCVR) * 100;
  };

  const getSignificanceColor = (significance: number) => {
    if (significance >= 95) return 'text-green-600';
    if (significance >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'active':
        return <Zap className="h-4 w-4 text-green-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'paused':
        return <Target className="h-4 w-4 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6 border-t border-border/50 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Beaker className="h-5 w-5 text-[hsl(var(--brand))]" />
          <h3 className="font-semibold text-foreground">A/B Testing Lab</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {activeTests.length} active experiments
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-xs text-muted-foreground">Avg Lift</span>
          </div>
          <div className="text-lg font-semibold text-foreground">+23.4%</div>
        </div>

        <div className="bg-muted/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3 w-3 text-blue-600" />
            <span className="text-xs text-muted-foreground">Test Traffic</span>
          </div>
          <div className="text-lg font-semibold text-foreground">8,150</div>
        </div>

        <div className="bg-muted/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart className="h-3 w-3 text-purple-600" />
            <span className="text-xs text-muted-foreground">Significance</span>
          </div>
          <div className="text-lg font-semibold text-foreground">94.2%</div>
        </div>

        <div className="bg-muted/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3 w-3 text-orange-600" />
            <span className="text-xs text-muted-foreground">Winners</span>
          </div>
          <div className="text-lg font-semibold text-foreground">3/5</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-background p-1 border border-border/30">
        {(['active', 'completed', 'create'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-[hsl(var(--brand))] text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab} {tab === 'active' && `(${activeTests.length})`}
          </button>
        ))}
      </div>

      {/* Active Tests */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeTests.map((test) => {
            const control = test.variants.find((v) => v.isControl)!;
            const variant = test.variants.find((v) => !v.isControl)!;
            const lift = calculateLift(variant, control);

            return (
              <div
                key={test.id}
                className="border border-border/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(test.status)}
                      <h4 className="font-medium text-foreground">
                        {test.name}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {test.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${getSignificanceColor(
                        test.significance,
                      )}`}
                    >
                      {test.significance.toFixed(1)}% significance
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Since {new Date(test.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Variants Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  {test.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`p-3 rounded-lg border ${
                        variant.isControl
                          ? 'border-gray-300 bg-gray-50 dark:bg-gray-900/50'
                          : 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {variant.name}
                        </span>
                        {variant.isControl && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            Control
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Conversion Rate:
                          </span>
                          <span className="font-medium text-foreground">
                            {(
                              (variant.conversions / variant.visitors) *
                              100
                            ).toFixed(2)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Visitors:
                          </span>
                          <span className="font-medium text-foreground">
                            {variant.visitors.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Revenue:
                          </span>
                          <span className="font-medium text-foreground">
                            ${variant.revenue.toLocaleString()}
                          </span>
                        </div>
                        {!variant.isControl && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Lift:</span>
                            <span
                              className={`font-medium ${
                                lift > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {lift > 0 ? '+' : ''}
                              {lift.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Test Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                  <div className="text-sm text-muted-foreground">
                    Goal: <span className="capitalize">{test.goal}</span>{' '}
                    optimization
                  </div>
                  <div className="flex gap-2">
                    <button className="text-sm text-[hsl(var(--brand))] hover:underline">
                      View Details
                    </button>
                    {test.significance >= 95 && (
                      <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                        Implement Winner
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Tests */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedTests.map((test) => {
            const control = test.variants.find((v) => v.isControl)!;
            const winner = test.variants.find((v) => v.id === test.winner)!;
            const lift = calculateLift(winner, control);

            return (
              <div
                key={test.id}
                className="border border-border/30 rounded-lg p-4 bg-green-50 dark:bg-green-900/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-foreground">
                        {test.name}
                      </h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        WINNER: {winner.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {test.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      +{lift.toFixed(1)}% lift
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {test.significance.toFixed(1)}% significance
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Ran from {new Date(test.startDate).toLocaleDateString()} to{' '}
                  {test.endDate && new Date(test.endDate).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Test */}
      {activeTab === 'create' && (
        <div className="border border-border/30 rounded-lg p-6">
          <h4 className="font-medium text-foreground mb-4">
            Create New A/B Test
          </h4>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="test-name"
                className="text-sm font-medium text-foreground mb-1 block"
              >
                Test Name
              </label>
              <input
                id="test-name"
                type="text"
                placeholder="e.g., Checkout Button Color"
                className="w-full px-3 py-2 border border-border/30 rounded-lg text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="test-goal"
                className="text-sm font-medium text-foreground mb-1 block"
              >
                Test Goal
              </label>
              <select
                id="test-goal"
                className="w-full px-3 py-2 border border-border/30 rounded-lg text-sm"
              >
                <option value="conversion">Conversion Rate</option>
                <option value="engagement">Engagement</option>
                <option value="revenue">Revenue per Visitor</option>
                <option value="retention">User Retention</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="traffic-split"
                className="text-sm font-medium text-foreground mb-1 block"
              >
                Traffic Split
              </label>
              <input
                id="traffic-split"
                type="range"
                min="10"
                max="100"
                defaultValue="50"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <button className="w-full bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/90 text-white rounded-lg px-4 py-2 text-sm font-medium">
              Create A/B Test
            </button>
          </div>
        </div>
      )}

      {/* Testing Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Beaker className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              A/B Testing Best Practices
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>
                • Run tests for at least 1-2 weeks to account for day-of-week
                variations
              </li>
              <li>
                • Aim for 95%+ statistical significance before implementing
                winners
              </li>
              <li>• Test one element at a time for clear attribution</li>
              <li>
                • Consider your lab customer&apos;s typical buying cycles (often
                longer)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
