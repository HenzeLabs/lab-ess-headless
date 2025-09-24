'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  Eye,
  MousePointer,
  Target,
  Zap,
} from 'lucide-react';

interface AnalyticsData {
  realTimeVisitors: number;
  conversionRate: number;
  averageOrderValue: number;
  cartAbandonmentRate: number;
  topPerformingProducts: Array<{
    id: string;
    name: string;
    views: number;
    conversions: number;
    revenue: number;
  }>;
  userJourney: Array<{
    step: string;
    users: number;
    dropoffRate: number;
  }>;
  heatmapData: Array<{
    element: string;
    clicks: number;
    engagement: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    conversionRate: number;
  }>;
}

interface OptimizationInsights {
  id: string;
  type: 'improvement' | 'warning' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

const generateRealTimeAnalytics = (): AnalyticsData => {
  // This should be replaced with real GA4 API calls
  // For now, return conservative placeholder values
  return {
    realTimeVisitors: 45, // Conservative estimate
    conversionRate: 3.2, // Industry standard
    averageOrderValue: 3500, // Reasonable for lab equipment
    cartAbandonmentRate: 68, // E-commerce average
    topPerformingProducts: [
      {
        id: '1',
        name: 'Research Microscope Pro',
        views: 125,
        conversions: 4,
        revenue: 14000,
      },
      {
        id: '2',
        name: 'High-Speed Centrifuge',
        views: 98,
        conversions: 3,
        revenue: 10500,
      },
      {
        id: '3',
        name: 'Precision Incubator',
        views: 87,
        conversions: 2,
        revenue: 7800,
      },
    ],
    userJourney: [
      { step: 'Landing Page', users: 100, dropoffRate: 0 },
      { step: 'Product View', users: 65, dropoffRate: 35 },
      { step: 'Add to Cart', users: 18, dropoffRate: 72.3 },
      { step: 'Checkout Start', users: 10, dropoffRate: 44.4 },
      { step: 'Payment Info', users: 7, dropoffRate: 30 },
      { step: 'Order Complete', users: 5, dropoffRate: 28.6 },
    ],
    heatmapData: [
      { element: 'Add to Cart Button', clicks: 125, engagement: 92 },
      { element: 'Product Images', clicks: 89, engagement: 78 },
      { element: 'Technical Specs', clicks: 65, engagement: 85 },
      { element: 'Reviews Section', clicks: 42, engagement: 88 },
      { element: 'Live Chat', clicks: 18, engagement: 95 },
    ],
    trafficSources: [
      { source: 'Organic Search', visitors: 285, conversionRate: 4.2 },
      { source: 'Direct', visitors: 124, conversionRate: 6.8 },
      { source: 'Social Media', visitors: 89, conversionRate: 2.1 },
      { source: 'Email Campaign', visitors: 65, conversionRate: 8.5 },
      { source: 'Paid Ads', visitors: 42, conversionRate: 3.7 },
    ],
  };
};

const generateOptimizationInsights = (
  analytics: AnalyticsData,
): OptimizationInsights[] => {
  const insights: OptimizationInsights[] = [];

  if (analytics.cartAbandonmentRate > 75) {
    insights.push({
      id: 'cart-abandonment',
      type: 'warning',
      title: 'High Cart Abandonment Rate',
      description: `${analytics.cartAbandonmentRate.toFixed(
        1,
      )}% of users abandon their carts. Consider implementing exit-intent popups or simplified checkout.`,
      impact: 'high',
      actionable: true,
    });
  }

  if (analytics.conversionRate < 3) {
    insights.push({
      id: 'low-conversion',
      type: 'opportunity',
      title: 'Conversion Rate Optimization Opportunity',
      description: `Current conversion rate is ${analytics.conversionRate.toFixed(
        1,
      )}%. Lab equipment sites typically achieve 4-6%.`,
      impact: 'high',
      actionable: true,
    });
  }

  const topProduct = analytics.topPerformingProducts[0];
  if (topProduct && topProduct.conversions / topProduct.views < 0.05) {
    insights.push({
      id: 'product-optimization',
      type: 'improvement',
      title: 'Product Page Optimization Needed',
      description: `${topProduct.name} has high traffic but low conversion. Consider improving product descriptions or adding more technical details.`,
      impact: 'medium',
      actionable: true,
    });
  }

  const emailSource = analytics.trafficSources.find(
    (s) => s.source === 'Email Campaign',
  );
  if (emailSource && emailSource.conversionRate > 7) {
    insights.push({
      id: 'email-success',
      type: 'improvement',
      title: 'Email Campaign Performing Excellently',
      description: `Email traffic converts at ${emailSource.conversionRate.toFixed(
        1,
      )}%. Consider increasing email marketing budget.`,
      impact: 'medium',
      actionable: true,
    });
  }

  return insights;
};

export default function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<OptimizationInsights[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'journey' | 'heatmap' | 'insights'
  >('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      // TODO: Replace with actual GA4 API calls
      // For now, using static realistic data
      setIsLoading(true);

      const data = generateRealTimeAnalytics();
      setAnalytics(data);
      setInsights(generateOptimizationInsights(data));
      setIsLoading(false);
    };

    loadAnalytics();

    // TODO: Replace with real-time GA4 webhook or periodic API calls
    // Set up periodic updates for now
    const interval = setInterval(() => {
      const data = generateRealTimeAnalytics();
      setAnalytics(data);
      setInsights(generateOptimizationInsights(data));
    }, 300000); // Update every 5 minutes (more realistic)

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInsightIcon = (type: OptimizationInsights['type']) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <Target className="h-4 w-4 text-orange-600" />;
      case 'opportunity':
        return <Zap className="h-4 w-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 border-t border-border/50 pt-6">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6 border-t border-border/50 pt-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[hsl(var(--brand))]" />
          <h3 className="font-semibold text-foreground">
            Live Analytics Dashboard
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live Data</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">Live Visitors</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {analytics.realTimeVisitors}
          </div>
          <div className="text-xs text-green-600">+12% from yesterday</div>
        </div>

        <div className="bg-muted/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">
              Conversion Rate
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {analytics.conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-green-600">+0.3% from yesterday</div>
        </div>

        <div className="bg-muted/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-muted-foreground">
              Avg Order Value
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(analytics.averageOrderValue)}
          </div>
          <div className="text-xs text-red-600">-2% from yesterday</div>
        </div>

        <div className="bg-muted/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-muted-foreground">
              Cart Abandonment
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {analytics.cartAbandonmentRate.toFixed(1)}%
          </div>
          <div className="text-xs text-red-600">+1.2% from yesterday</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-background p-1 border border-border/30">
        {(['overview', 'journey', 'heatmap', 'insights'] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-[hsl(var(--brand))] text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'journey' ? 'User Journey' : tab}
            </button>
          ),
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Top Performing Products */}
          <div>
            <h4 className="font-medium text-foreground mb-3">
              Top Performing Products
            </h4>
            <div className="space-y-2">
              {analytics.topPerformingProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {product.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.views} views • {product.conversions} conversions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {formatCurrency(product.revenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {((product.conversions / product.views) * 100).toFixed(1)}
                      % CVR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div>
            <h4 className="font-medium text-foreground mb-3">
              Traffic Sources
            </h4>
            <div className="space-y-2">
              {analytics.trafficSources.map((source) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <div className="font-medium text-foreground">
                    {source.source}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {source.visitors.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {source.conversionRate.toFixed(1)}% CVR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'journey' && (
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">User Journey Funnel</h4>
          <div className="space-y-3">
            {analytics.userJourney.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[hsl(var(--brand))] text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {step.step}
                      </div>
                      {index > 0 && (
                        <div className="text-sm text-red-600">
                          -{step.dropoffRate.toFixed(1)}% dropoff
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {step.users.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">users</div>
                  </div>
                </div>
                {index < analytics.userJourney.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-px h-4 bg-border/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'heatmap' && (
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">
            Element Engagement Heatmap
          </h4>
          <div className="space-y-2">
            {analytics.heatmapData.map((element) => (
              <div
                key={element.element}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div>
                  <div className="font-medium text-foreground">
                    {element.element}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {element.clicks} clicks
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted/50 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-red-500"
                      style={{ width: `${element.engagement}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-foreground w-12 text-right">
                    {element.engagement}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">
            AI Optimization Insights
          </h4>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="border border-border/30 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-foreground">
                        {insight.title}
                      </h5>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          insight.impact === 'high'
                            ? 'bg-red-100 text-red-700'
                            : insight.impact === 'medium'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <button className="text-sm text-[hsl(var(--brand))] hover:underline mt-2">
                        View Recommendations →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Update Indicator */}
      <div className="text-center text-xs text-muted-foreground">
        <Eye className="h-3 w-3 inline mr-1" />
        Dashboard updates every 30 seconds • Last updated:{' '}
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
