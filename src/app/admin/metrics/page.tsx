import { Suspense } from 'react';
import MetricsDashboard from './components/MetricsDashboard';
import LoadingSkeleton from './components/LoadingSkeleton';

export const metadata = {
  title: 'Analytics Metrics | Lab Essentials Admin',
  description: 'Real-time analytics from GA4, Microsoft Clarity, Shopify, and Taboola',
};

export default function MetricsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Analytics Metrics</h2>
        <p className="mt-2 text-gray-600">
          Real-time performance data from GA4, Clarity, Shopify, and Taboola Ads
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <MetricsDashboard />
      </Suspense>
    </div>
  );
}
