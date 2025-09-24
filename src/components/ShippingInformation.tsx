'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Clock,
  Shield,
  Calculator,
  MapPin,
  Package,
  AlertCircle,
} from 'lucide-react';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  cost: number;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

interface ShippingCalculatorProps {
  productWeight?: number;
  productValue?: number;
  isDangerous?: boolean;
  requiresSpecialHandling?: boolean;
}

const shippingOptions: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Reliable delivery for most lab equipment',
    estimatedDays: '5-7 business days',
    cost: 0,
    icon: Package,
    features: [
      'Free on orders over $200',
      'Tracking included',
      'Signature required',
    ],
  },
  {
    id: 'expedited',
    name: 'Expedited Shipping',
    description: 'Faster delivery for urgent lab needs',
    estimatedDays: '2-3 business days',
    cost: 25,
    icon: Truck,
    features: ['Priority handling', 'Enhanced tracking', 'Insurance included'],
  },
  {
    id: 'overnight',
    name: 'Overnight Express',
    description: 'Next business day delivery',
    estimatedDays: '1 business day',
    cost: 75,
    icon: Clock,
    features: ['Next day delivery', 'Premium packaging', 'Real-time tracking'],
  },
  {
    id: 'white-glove',
    name: 'White Glove Service',
    description: 'Full installation and setup service',
    estimatedDays: '7-10 business days',
    cost: 200,
    icon: Shield,
    features: [
      'Professional installation',
      'Equipment calibration',
      'Training included',
    ],
  },
];

const shippingPolicies = {
  returns: {
    title: 'Return Policy',
    items: [
      '30-day return window for most equipment',
      'Original packaging required',
      'Equipment must be in new, unused condition',
      'Return shipping costs apply unless defective',
      'Restocking fee may apply to large items',
    ],
  },
  international: {
    title: 'International Shipping',
    items: [
      'Available to 45+ countries worldwide',
      'Customs documentation included',
      'Duty and tax calculations provided',
      'Special permits for controlled items',
      'Extended delivery times apply',
    ],
  },
  handling: {
    title: 'Special Handling',
    items: [
      'Temperature-controlled shipping available',
      'Hazmat certified for dangerous goods',
      'Oversized equipment specialist handling',
      'Fragile item extra protection',
      'Chain of custody documentation',
    ],
  },
};

export default function ShippingInformation({
  productWeight = 10,
  productValue = 500,
  isDangerous = false,
  requiresSpecialHandling = false,
}: ShippingCalculatorProps) {
  const [selectedZip, setSelectedZip] = useState('');
  const [calculatedShipping, setCalculatedShipping] = useState<
    ShippingOption[]
  >([]);
  const [activeTab, setActiveTab] = useState<'calculator' | 'policies'>(
    'calculator',
  );
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateShipping = useCallback(async () => {
    if (!selectedZip || selectedZip.length < 5) return;

    setIsCalculating(true);

    // Simulate shipping calculation
    setTimeout(() => {
      const calculated = shippingOptions.map((option) => {
        let adjustedCost = option.cost;

        // Weight-based adjustments
        if (productWeight > 50) {
          adjustedCost += Math.floor(productWeight / 10) * 5;
        }

        // Value-based adjustments for insurance
        if (productValue > 1000) {
          adjustedCost += Math.floor(productValue / 1000) * 2;
        }

        // Special handling surcharges
        if (isDangerous) {
          adjustedCost += 50;
        }
        if (requiresSpecialHandling) {
          adjustedCost += 25;
        }

        // Free shipping threshold
        if (option.id === 'standard' && productValue >= 200) {
          adjustedCost = 0;
        }

        return {
          ...option,
          cost: adjustedCost,
        };
      });

      setCalculatedShipping(calculated);
      setIsCalculating(false);
    }, 1500);
  }, [
    selectedZip,
    productWeight,
    productValue,
    isDangerous,
    requiresSpecialHandling,
  ]);

  useEffect(() => {
    if (selectedZip.length >= 5) {
      calculateShipping();
    }
  }, [selectedZip, calculateShipping]);

  const formatCurrency = (amount: number) => {
    return amount === 0 ? 'FREE' : `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 border-t border-border/50 pt-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-background p-1 border border-border/30">
        {(['calculator', 'policies'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[hsl(var(--brand))] text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'calculator' && (
              <span className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Shipping Calculator
              </span>
            )}
            {tab === 'policies' && (
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Policies & Info
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Shipping Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* ZIP Code Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Calculate shipping to your location
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter ZIP code"
                value={selectedZip}
                onChange={(e) =>
                  setSelectedZip(e.target.value.replace(/\D/g, '').slice(0, 5))
                }
                className="flex-1 px-3 py-2 border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20 focus:border-[hsl(var(--brand))]"
                maxLength={5}
              />
              <button
                onClick={calculateShipping}
                disabled={selectedZip.length < 5 || isCalculating}
                className="px-4 py-2 bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/90 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg text-sm transition-colors"
              >
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border border-border/30">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Weight</div>
              <div className="text-sm font-medium text-foreground">
                {productWeight} lbs
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Value</div>
              <div className="text-sm font-medium text-foreground">
                ${productValue.toLocaleString()}
              </div>
            </div>
            {(isDangerous || requiresSpecialHandling) && (
              <div className="col-span-2 flex items-center gap-2 text-xs text-orange-600">
                <AlertCircle className="h-3 w-3" />
                <span>Special handling required</span>
              </div>
            )}
          </div>

          {/* Shipping Options */}
          {calculatedShipping.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Available shipping options:
              </h4>
              <div className="space-y-3">
                {calculatedShipping.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.id}
                      className="border border-border/30 rounded-lg p-4 hover:border-[hsl(var(--brand))]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-[hsl(var(--brand))]" />
                          <div>
                            <div className="font-medium text-foreground">
                              {option.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            {formatCurrency(option.cost)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {option.estimatedDays}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {option.features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shipping Guarantee */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Shipping Guarantee
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              All lab equipment ships with full insurance coverage and damage
              protection. If your order arrives damaged, we&apos;ll replace it
              at no cost within 7 days.
            </p>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          {Object.entries(shippingPolicies).map(([key, policy]) => (
            <div key={key} className="border border-border/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">
                {policy.title}
              </h4>
              <ul className="space-y-2">
                {policy.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 bg-[hsl(var(--brand))] rounded-full mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div className="bg-muted/20 border border-border/30 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">
              Need Help with Shipping?
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Our shipping specialists are available to help with:</p>
              <ul className="space-y-1 ml-4">
                <li>• Large equipment delivery coordination</li>
                <li>• International shipping requirements</li>
                <li>• Special handling and packaging</li>
                <li>• Expedited delivery options</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="font-medium text-foreground">
                  Contact: 1-800-LAB-SHIP (522-7447)
                </p>
                <p>Monday - Friday, 8 AM - 6 PM EST</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
