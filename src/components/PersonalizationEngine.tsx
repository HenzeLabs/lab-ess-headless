'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Target, Zap, ArrowRight, Star } from 'lucide-react';

interface PersonalizationData {
  labType: string;
  researchField: string;
  institution: string;
  previousPurchases: string[];
  browsingHistory: string[];
  labSize: 'small' | 'medium' | 'large' | 'enterprise';
}

interface RecommendedProduct {
  id: string;
  title: string;
  price: number;
  confidence: number;
  reason: string;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  discount?: number;
}

interface PersonalizationEngineProps {
  currentProductId: string;
  userId?: string;
  labType?: string;
}

const getPersonalizationData = (): PersonalizationData => {
  // Use real data from localStorage/session or simple defaults
  const stored =
    typeof window !== 'undefined'
      ? localStorage.getItem('user_preferences')
      : null;
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to defaults
    }
  }

  return {
    labType: 'research',
    researchField: 'general',
    institution: 'lab',
    previousPurchases: [],
    browsingHistory: [],
    labSize: 'medium',
  };
};

const generateSmartRecommendations = (
  currentProductId: string,
  personalization: PersonalizationData,
): RecommendedProduct[] => {
  const baseProducts = [
    {
      id: 'gid://shopify/Product/microscope-advanced',
      title: 'Advanced Research Microscope Pro',
      price: 15999,
      category: 'microscopy',
      baseConfidence: 0.95,
    },
    {
      id: 'gid://shopify/Product/centrifuge-high-speed',
      title: 'High-Speed Laboratory Centrifuge',
      price: 8499,
      category: 'sample_prep',
      baseConfidence: 0.88,
    },
    {
      id: 'gid://shopify/Product/incubator-precision',
      title: 'Precision Cell Culture Incubator',
      price: 12750,
      category: 'cell_culture',
      baseConfidence: 0.82,
    },
    {
      id: 'gid://shopify/Product/pipette-set-pro',
      title: 'Professional Pipette Set (6-pack)',
      price: 2299,
      category: 'liquid_handling',
      baseConfidence: 0.75,
    },
    {
      id: 'gid://shopify/Product/autoclave-research',
      title: 'Research-Grade Autoclave System',
      price: 18999,
      category: 'sterilization',
      baseConfidence: 0.7,
    },
  ];

  return baseProducts
    .filter((product) => product.id !== currentProductId)
    .map((product) => {
      let confidence = product.baseConfidence;
      let reason = 'Popular in your research field';
      let urgency: 'high' | 'medium' | 'low' = 'medium';
      let discount: number | undefined;

      // AI-like scoring based on personalization
      if (
        personalization.browsingHistory.includes(product.category.split('_')[0])
      ) {
        confidence += 0.15;
        reason = 'Based on your recent browsing';
        urgency = 'high';
      }

      if (
        personalization.previousPurchases.some(
          (purchase) =>
            product.category.includes(purchase) ||
            purchase.includes(product.category.split('_')[0]),
        )
      ) {
        confidence += 0.1;
        reason = 'Complements your previous purchases';
      }

      if (personalization.researchField === 'molecular_biology') {
        if (
          product.category === 'microscopy' ||
          product.category === 'sample_prep'
        ) {
          confidence += 0.12;
          reason = 'Essential for molecular biology research';
          urgency = 'high';
        }
      }

      if (
        personalization.labSize === 'medium' ||
        personalization.labSize === 'large'
      ) {
        if (product.price > 10000) {
          confidence += 0.08;
          reason = 'Right fit for your lab size and budget';
        }
      }

      // Dynamic discount based on confidence and urgency
      if (confidence > 0.9 && urgency === 'high') {
        discount = 15;
        reason += ' (Limited time: 15% off!)';
      } else if (confidence > 0.85) {
        discount = 10;
        reason += ' (Special offer: 10% off)';
      }

      return {
        ...product,
        confidence: Math.min(confidence, 0.99),
        reason,
        urgency,
        discount,
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 4);
};

export default function PersonalizationEngine({
  currentProductId,
}: PersonalizationEngineProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>(
    [],
  );
  const [personalization, setPersonalization] =
    useState<PersonalizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPersonalization = async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const data = getPersonalizationData();
      setPersonalization(data);

      const recs = generateSmartRecommendations(currentProductId, data);
      setRecommendations(recs);
      setIsLoading(false);
    };

    loadPersonalization();
  }, [currentProductId]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getUrgencyIndicator = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high':
        return <Zap className="h-3 w-3 text-red-500 animate-pulse" />;
      case 'medium':
        return <TrendingUp className="h-3 w-3 text-orange-500" />;
      case 'low':
        return <Target className="h-3 w-3 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 border-t border-border/50 pt-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 border-t border-border/50 pt-6">
      {/* Personalization Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[hsl(var(--brand))]" />
          <h3 className="font-semibold text-foreground">
            Recommended for Your Lab
          </h3>
        </div>
        {personalization && (
          <div className="text-xs text-muted-foreground">
            Based on {personalization.researchField.replace('_', ' ')} research
            • {personalization.labSize} lab setup
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="space-y-3">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="border border-border/30 rounded-lg p-4 hover:border-[hsl(var(--brand))]/50 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground text-sm">
                    {product.title}
                  </h4>
                  {getUrgencyIndicator(product.urgency)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className={getConfidenceColor(product.confidence)}>
                    {Math.round(product.confidence * 100)}% match
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {product.reason}
                </p>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end">
                  {product.discount && (
                    <div className="text-xs text-red-600 font-medium">
                      -{product.discount}% OFF
                    </div>
                  )}
                  <div
                    className={`font-semibold ${
                      product.discount ? 'text-red-600' : 'text-foreground'
                    }`}
                  >
                    $
                    {product.discount
                      ? (
                          product.price *
                          (1 - product.discount / 100)
                        ).toLocaleString()
                      : product.price.toLocaleString()}
                  </div>
                  {product.discount && (
                    <div className="text-xs text-muted-foreground line-through">
                      ${product.price.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <div className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded">
                  {product.category.replace('_', ' ')}
                </div>
                {product.urgency === 'high' && (
                  <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    High Priority
                  </div>
                )}
              </div>

              <button className="flex items-center gap-1 text-xs text-[hsl(var(--brand))] hover:underline">
                View Details
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Target className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              AI Lab Equipment Insight
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Labs similar to yours typically add 2-3 complementary instruments
              within 6 months. Consider bundling for additional savings and
              workflow efficiency.
            </p>
          </div>
        </div>
      </div>

      {/* Personalization Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/20 rounded-lg p-3">
          <div className="text-lg font-semibold text-foreground">
            {personalization?.previousPurchases.length || 0}
          </div>
          <div className="text-xs text-muted-foreground">Previous Orders</div>
        </div>
        <div className="bg-muted/20 rounded-lg p-3">
          <div className="text-lg font-semibold text-foreground">
            {Math.round((recommendations[0]?.confidence || 0) * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Top Match</div>
        </div>
        <div className="bg-muted/20 rounded-lg p-3">
          <div className="text-lg font-semibold text-foreground">
            ${recommendations.reduce((sum, r) => sum + (r.discount || 0), 0)}
          </div>
          <div className="text-xs text-muted-foreground">Total Savings</div>
        </div>
      </div>
    </div>
  );
}
