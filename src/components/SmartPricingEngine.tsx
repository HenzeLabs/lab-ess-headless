'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  AlertTriangle,
  Crown,
} from 'lucide-react';

// Types for smart pricing engine
interface PricingData {
  productId: string;
  basePrice: number;
  currentPrice: number;
  recommendedPrice: number;
  currency: string;
  demandScore: number;
  competitorAnalysis: CompetitorPrice[];
  priceHistory: PricePoint[];
  elasticity: number;
  marginImpact: number;
  revenueProjection: number;
  confidence: number;
}

interface CompetitorPrice {
  competitor: string;
  price: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  lastUpdated: Date;
  marketShare: number;
  qualityScore: number;
}

interface PricePoint {
  date: Date;
  price: number;
  volume: number;
  revenue: number;
  conversionRate: number;
}

interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  type: 'dynamic' | 'competitive' | 'value_based' | 'premium' | 'penetration';
  isActive: boolean;
  performance: {
    revenueChange: number;
    marginChange: number;
    volumeChange: number;
    competitivePosition: number;
  };
  rules: PricingRule[];
}

interface PricingRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
}

interface MarketInsight {
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  urgency: 'immediate' | 'short_term' | 'long_term';
  actionRequired?: string;
}

// Main smart pricing engine component
export const SmartPricingEngine: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [activePricingData, setActivePricingData] = useState<PricingData[]>([]);
  const [pricingStrategies, setPricingStrategies] = useState<PricingStrategy[]>(
    [],
  );
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);

  // Sample pricing data
  const samplePricingData: PricingData[] = useMemo(
    () => [
      {
        productId: 'spec_1',
        basePrice: 15999,
        currentPrice: 15199,
        recommendedPrice: 16299,
        currency: 'USD',
        demandScore: 87.3,
        competitorAnalysis: [
          {
            competitor: 'Agilent',
            price: 16599,
            availability: 'in_stock',
            lastUpdated: new Date(),
            marketShare: 28.5,
            qualityScore: 92,
          },
          {
            competitor: 'Waters',
            price: 15899,
            availability: 'limited',
            lastUpdated: new Date(),
            marketShare: 15.2,
            qualityScore: 89,
          },
          {
            competitor: 'Shimadzu',
            price: 14799,
            availability: 'in_stock',
            lastUpdated: new Date(),
            marketShare: 12.8,
            qualityScore: 85,
          },
        ],
        priceHistory: [
          {
            date: new Date('2024-09-01'),
            price: 15999,
            volume: 12,
            revenue: 191988,
            conversionRate: 3.2,
          },
          {
            date: new Date('2024-09-08'),
            price: 15199,
            volume: 18,
            revenue: 273582,
            conversionRate: 4.1,
          },
          {
            date: new Date('2024-09-15'),
            price: 15199,
            volume: 22,
            revenue: 334378,
            conversionRate: 4.8,
          },
        ],
        elasticity: -1.8,
        marginImpact: 12.4,
        revenueProjection: 387500,
        confidence: 94.2,
      },
      {
        productId: 'chrom_1',
        basePrice: 45999,
        currentPrice: 41399,
        recommendedPrice: 43999,
        currency: 'USD',
        demandScore: 76.8,
        competitorAnalysis: [
          {
            competitor: 'Thermo Fisher',
            price: 47999,
            availability: 'in_stock',
            lastUpdated: new Date(),
            marketShare: 34.2,
            qualityScore: 95,
          },
          {
            competitor: 'PerkinElmer',
            price: 42999,
            availability: 'in_stock',
            lastUpdated: new Date(),
            marketShare: 18.7,
            qualityScore: 88,
          },
        ],
        priceHistory: [
          {
            date: new Date('2024-09-01'),
            price: 45999,
            volume: 8,
            revenue: 367992,
            conversionRate: 2.1,
          },
          {
            date: new Date('2024-09-08'),
            price: 41399,
            volume: 14,
            revenue: 579586,
            conversionRate: 3.2,
          },
          {
            date: new Date('2024-09-15'),
            price: 41399,
            volume: 16,
            revenue: 662384,
            conversionRate: 3.7,
          },
        ],
        elasticity: -2.3,
        marginImpact: 8.7,
        revenueProjection: 751920,
        confidence: 89.6,
      },
    ],
    [],
  );

  // Sample pricing strategies
  const sampleStrategies: PricingStrategy[] = useMemo(
    () => [
      {
        id: 'dynamic_demand',
        name: 'Dynamic Demand Pricing',
        description:
          'Adjust prices based on real-time demand signals and inventory levels',
        type: 'dynamic',
        isActive: true,
        performance: {
          revenueChange: 23.7,
          marginChange: 15.2,
          volumeChange: 6.8,
          competitivePosition: 92.1,
        },
        rules: [
          {
            id: 'rule_1',
            condition: 'Demand Score > 85',
            action: 'Increase price by 5%',
            priority: 1,
            isActive: true,
          },
          {
            id: 'rule_2',
            condition: 'Inventory < 10 units',
            action: 'Increase price by 3%',
            priority: 2,
            isActive: true,
          },
          {
            id: 'rule_3',
            condition: 'Competitor price > Our price + 10%',
            action: 'Increase price by 2%',
            priority: 3,
            isActive: true,
          },
        ],
      },
      {
        id: 'competitive_match',
        name: 'Competitive Price Matching',
        description: 'Maintain competitive position while maximizing margin',
        type: 'competitive',
        isActive: true,
        performance: {
          revenueChange: 18.4,
          marginChange: 8.9,
          volumeChange: 12.3,
          competitivePosition: 87.5,
        },
        rules: [
          {
            id: 'rule_4',
            condition: 'Competitor undercuts by > 5%',
            action: 'Match competitor price',
            priority: 1,
            isActive: true,
          },
          {
            id: 'rule_5',
            condition: 'Market leader price increase',
            action: 'Increase price by 70% of their increase',
            priority: 2,
            isActive: true,
          },
        ],
      },
      {
        id: 'value_premium',
        name: 'Premium Value Positioning',
        description: 'Premium pricing based on superior features and quality',
        type: 'premium',
        isActive: false,
        performance: {
          revenueChange: 31.2,
          marginChange: 28.6,
          volumeChange: -8.1,
          competitivePosition: 96.8,
        },
        rules: [
          {
            id: 'rule_6',
            condition: 'Quality score > 90',
            action: 'Price 15% above market average',
            priority: 1,
            isActive: false,
          },
          {
            id: 'rule_7',
            condition: 'Unique features available',
            action: 'Add 10% premium',
            priority: 2,
            isActive: false,
          },
        ],
      },
    ],
    [],
  );

  // Sample market insights
  const sampleInsights: MarketInsight[] = useMemo(
    () => [
      {
        type: 'opportunity',
        title: 'Spectrophotometer Price Gap',
        description:
          'Competitors have raised prices 8% above market average, creating opportunity for strategic positioning',
        impact: 'high',
        confidence: 92.3,
        urgency: 'immediate',
        actionRequired:
          'Increase price by 5% to capture additional margin while maintaining competitive advantage',
      },
      {
        type: 'threat',
        title: 'New Market Entrant',
        description:
          'Emerging competitor launched similar HPLC system at 15% lower price point',
        impact: 'medium',
        confidence: 87.1,
        urgency: 'short_term',
        actionRequired:
          'Consider value-added bundle or temporary promotion to maintain market share',
      },
      {
        type: 'trend',
        title: 'Seasonal Demand Increase',
        description:
          'Historical data shows 25% demand increase approaching Q4 academic purchasing cycle',
        impact: 'high',
        confidence: 95.7,
        urgency: 'short_term',
        actionRequired:
          'Prepare for price optimization during peak demand period',
      },
      {
        type: 'recommendation',
        title: 'Bundle Optimization',
        description:
          'Cross-sell analysis suggests 40% higher conversion when pricing accessories as bundle',
        impact: 'medium',
        confidence: 89.4,
        urgency: 'long_term',
        actionRequired:
          'Develop strategic product bundles with optimized pricing',
      },
    ],
    [],
  );

  // Initialize data
  useEffect(() => {
    setActivePricingData(samplePricingData);
    setPricingStrategies(sampleStrategies);
    setMarketInsights(sampleInsights);
  }, [samplePricingData, sampleStrategies, sampleInsights]);

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const totalRevenue = activePricingData.reduce(
      (sum, item) => sum + item.revenueProjection,
      0,
    );
    const averageMarginImpact =
      activePricingData.reduce((sum, item) => sum + item.marginImpact, 0) /
      activePricingData.length;
    const averageConfidence =
      activePricingData.reduce((sum, item) => sum + item.confidence, 0) /
      activePricingData.length;
    const priceOptimizationOpportunity =
      activePricingData.reduce((sum, item) => {
        return (
          sum +
          ((item.recommendedPrice - item.currentPrice) / item.currentPrice) *
            100
        );
      }, 0) / activePricingData.length;

    return {
      totalRevenue,
      averageMarginImpact,
      averageConfidence,
      priceOptimizationOpportunity,
      activeStrategies: pricingStrategies.filter((s) => s.isActive).length,
    };
  }, [activePricingData, pricingStrategies]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Smart Pricing Engine</h3>
              <p className="text-green-100">
                Dynamic pricing with AI-powered market analysis & competitor
                intelligence
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${overallMetrics.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Projected Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {overallMetrics.averageMarginImpact.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Margin Impact</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {overallMetrics.averageConfidence.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">AI Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {overallMetrics.priceOptimizationOpportunity.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Price Opportunity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {overallMetrics.activeStrategies}
            </div>
            <div className="text-sm text-gray-600">Active Strategies</div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="p-6 space-y-6">
          {/* Market Insights */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-red-500" />
              AI Market Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'opportunity'
                      ? 'bg-green-50 border-green-500'
                      : insight.type === 'threat'
                      ? 'bg-red-50 border-red-500'
                      : insight.type === 'trend'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-purple-50 border-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5
                      className={`font-medium ${
                        insight.type === 'opportunity'
                          ? 'text-green-800'
                          : insight.type === 'threat'
                          ? 'text-red-800'
                          : insight.type === 'trend'
                          ? 'text-blue-800'
                          : 'text-purple-800'
                      }`}
                    >
                      {insight.title}
                    </h5>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.urgency === 'immediate'
                            ? 'bg-red-100 text-red-800'
                            : insight.urgency === 'short_term'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {insight.urgency}
                      </span>
                      <span className="text-xs text-gray-600">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>
                  <p
                    className={`text-sm mb-2 ${
                      insight.type === 'opportunity'
                        ? 'text-green-700'
                        : insight.type === 'threat'
                        ? 'text-red-700'
                        : insight.type === 'trend'
                        ? 'text-blue-700'
                        : 'text-purple-700'
                    }`}
                  >
                    {insight.description}
                  </p>
                  {insight.actionRequired && (
                    <div
                      className={`text-xs p-2 rounded ${
                        insight.type === 'opportunity'
                          ? 'bg-green-100 text-green-800'
                          : insight.type === 'threat'
                          ? 'bg-red-100 text-red-800'
                          : insight.type === 'trend'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      <strong>Action:</strong> {insight.actionRequired}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Pricing Strategies */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Active Pricing Strategies
            </h4>
            <div className="space-y-4">
              {pricingStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`p-4 rounded-lg border ${
                    strategy.isActive
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h5 className="font-medium text-gray-900">
                        {strategy.name}
                      </h5>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          strategy.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {strategy.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {strategy.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div
                          className={`font-bold ${
                            strategy.performance.revenueChange > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {strategy.performance.revenueChange > 0 ? '+' : ''}
                          {strategy.performance.revenueChange}%
                        </div>
                        <div className="text-gray-600">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`font-bold ${
                            strategy.performance.marginChange > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {strategy.performance.marginChange > 0 ? '+' : ''}
                          {strategy.performance.marginChange}%
                        </div>
                        <div className="text-gray-600">Margin</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {strategy.description}
                  </p>
                  <div className="space-y-2">
                    <h6 className="text-sm font-medium text-gray-700">
                      Active Rules:
                    </h6>
                    {strategy.rules
                      .filter((rule) => rule.isActive)
                      .map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded border"
                        >
                          <span className="text-gray-700">
                            {rule.condition} → {rule.action}
                          </span>
                          <span className="text-gray-500">
                            Priority {rule.priority}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Pricing Analysis */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Product Pricing Analysis
            </h4>
            <div className="space-y-4">
              {activePricingData.map((product) => (
                <div
                  key={product.productId}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">
                        Product ID: {product.productId}
                      </h5>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          Demand Score: {product.demandScore}/100
                        </span>
                        <span className="text-sm text-gray-600">
                          Confidence: {product.confidence}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-600">
                          ${product.currentPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Current Price
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          ${product.recommendedPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          AI Recommended
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-lg font-bold ${
                            product.recommendedPrice > product.currentPrice
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {product.recommendedPrice > product.currentPrice
                            ? '+'
                            : ''}
                          {(
                            ((product.recommendedPrice - product.currentPrice) /
                              product.currentPrice) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                        <div className="text-sm text-gray-500">
                          Price Change
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          ${product.revenueProjection.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Revenue Projection
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h6 className="font-medium text-gray-700 mb-3">
                      Competitor Analysis
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {product.competitorAnalysis.map((competitor, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800">
                              {competitor.competitor}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                competitor.availability === 'in_stock'
                                  ? 'bg-green-100 text-green-800'
                                  : competitor.availability === 'limited'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {competitor.availability.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            ${competitor.price.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Market Share: {competitor.marketShare}%</span>
                            <span>Quality: {competitor.qualityScore}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Elasticity & Impact Analysis */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-purple-500" />
              Advanced Analytics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-3">
                  Price Elasticity Analysis
                </h5>
                <div className="space-y-2">
                  {activePricingData.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-blue-700">
                        {product.productId}
                      </span>
                      <span
                        className={`font-bold ${
                          product.elasticity < -2
                            ? 'text-red-600'
                            : product.elasticity < -1
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {product.elasticity.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-blue-600">
                  Lower values indicate higher price sensitivity
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800 mb-3">
                  Margin Impact Forecast
                </h5>
                <div className="space-y-2">
                  {activePricingData.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-green-700">
                        {product.productId}
                      </span>
                      <span className="font-bold text-green-600">
                        +{product.marginImpact.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-green-600">
                  Projected margin improvement with AI pricing
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-800 mb-3">
                  Revenue Optimization
                </h5>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    ${overallMetrics.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-700 mb-2">
                    Total Projected Revenue
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">
                      +24.7% vs baseline
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Alerts */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Pricing Alerts & Recommendations
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-800">
                      Competitor Price Drop Detected
                    </div>
                    <div className="text-sm text-yellow-700">
                      Shimadzu reduced HPLC price by 8% - consider response
                      strategy
                    </div>
                  </div>
                </div>
                <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium">
                  Review
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">
                      Optimization Opportunity
                    </div>
                    <div className="text-sm text-green-700">
                      Price increase recommended for spec_1 based on demand
                      surge
                    </div>
                  </div>
                </div>
                <button className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-sm font-medium">
                  Apply
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-800">
                      Market Analysis Complete
                    </div>
                    <div className="text-sm text-blue-700">
                      Updated competitive intelligence available for 15 products
                    </div>
                  </div>
                </div>
                <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartPricingEngine;
