'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, Star, Truck } from 'lucide-react';

interface ConversionBoostersProps {
  productId: string;
  inStock?: boolean;
}

export default function ConversionBoosters({
  productId,
  inStock = true,
}: ConversionBoostersProps) {
  const [viewersCount, setViewersCount] = useState(0);
  const [recentPurchases, setRecentPurchases] = useState<string[]>([]);

  useEffect(() => {
    // Simulate real-time viewers (you can replace with actual data)
    const baseViewers = Math.floor(Math.random() * 8) + 3; // 3-10 viewers
    setViewersCount(baseViewers);

    // Simulate recent purchases
    const samplePurchases = [
      'Dr. Sarah M. from UCLA',
      'Research Lab at MIT',
      'Lab Tech at Johns Hopkins',
      'Prof. Chen from Stanford',
      'BioTech Corp Lab',
    ];

    setRecentPurchases(samplePurchases.slice(0, 2));

    // Update viewers periodically
    const interval = setInterval(() => {
      setViewersCount((prev) => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.max(1, Math.min(15, prev + change));
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [productId]);

  return (
    <div className="space-y-4 border-t border-border/50 pt-6">
      {/* Social Proof */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>
          <strong className="text-foreground">{viewersCount}</strong>{' '}
          researchers viewing this now
        </span>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-muted/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Recent Activity
          </span>
        </div>
        {recentPurchases.map((purchase, index) => (
          <div key={index} className="text-xs text-muted-foreground mb-1">
            {purchase} purchased this 2 hours ago
          </div>
        ))}
      </div>

      {/* Urgency Indicator */}
      {inStock && (
        <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
          <Clock className="h-4 w-4" />
          <span>
            Only <strong>3 units</strong> left at this price - Order within 24h
            for fastest shipping
          </span>
        </div>
      )}

      {/* Trust Signals */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 text-sm">
          <Truck className="h-4 w-4 text-blue-600" />
          <span className="text-muted-foreground">
            Free shipping on orders over $300
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-muted-foreground">
            Used by 1,200+ research labs worldwide
          </span>
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
        <h4 className="font-semibold text-green-800 mb-2">
          Lab Satisfaction Guarantee
        </h4>
        <p className="text-sm text-green-700">
          120-day trial period. If your lab isn&apos;t completely satisfied with
          the precision and reliability, we&apos;ll take it back - no questions
          asked.
        </p>
      </div>
    </div>
  );
}
