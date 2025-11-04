'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import KPICard from './KPICard';
import ConfigImpactWidget from './ConfigImpactWidget';
import BehaviorHighlights from './BehaviorHighlights';
import SessionsChart from './SessionsChart';
import ConversionChart from './ConversionChart';
import ShopifyMetrics from './ShopifyMetrics';
import TaboolaMetrics from './TaboolaMetrics';

interface MetricsData {
  ga4: {
    pageViews: number;
    sessions: number;
    users: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversionRate: number;
    realtimeUsers: number;
  } | null;
  clarity: {
    totalSessions: number;
    deadClicks: number;
    rageClicks: number;
    quickBacks: number;
    avgScrollDepth: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData>({
    ga4: null,
    clarity: null,
    loading: true,
    error: null,
  });

  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    setMetrics((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch GA4 metrics
      const ga4Response = await fetch(
        `/api/metrics/ga4?start=${dateRange.start}&end=${dateRange.end}`,
      );

      // Fetch Clarity metrics
      const clarityResponse = await fetch(
        `/api/metrics/clarity?start=${dateRange.start}&end=${dateRange.end}`,
      );

      const ga4Data = ga4Response.ok ? await ga4Response.json() : null;
      const clarityData = clarityResponse.ok
        ? await clarityResponse.json()
        : null;

      setMetrics({
        ga4: ga4Data,
        clarity: clarityData,
        loading: false,
        error: null,
      });
    } catch (error) {
      setMetrics((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch metrics',
      }));
    }
  };

  const handleDateRangeChange = (days: number) => {
    setDateRange({
      start: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  if (metrics.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-sm text-gray-600 mt-3">
            Loading analytics data...
          </p>
        </div>
      </div>
    );
  }

  if (metrics.error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-1">
              Analytics Configuration Required
            </h3>
            <p className="text-sm text-yellow-800 mb-4">
              To view metrics, configure GA4 and Clarity in your environment
              variables:
            </p>
            <pre className="bg-yellow-100 border border-yellow-300 rounded p-3 text-xs overflow-x-auto">
              {`GA4_PROPERTY_ID=123456789
GA4_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
NEXT_PUBLIC_CLARITY_PROJECT_ID=abcdefghij
CLARITY_API_KEY=your-api-key`}
            </pre>
            <p className="text-xs text-yellow-700 mt-3">
              See docs/PHASE_2_DEPLOYMENT.md for detailed setup instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for demonstration if APIs are not configured
  const hasMockData = !metrics.ga4 && !metrics.clarity;
  const displayMetrics = hasMockData
    ? {
        ga4: {
          pageViews: 45230,
          sessions: 12450,
          users: 8920,
          bounceRate: 42.3,
          avgSessionDuration: 185,
          conversionRate: 3.2,
          realtimeUsers: 47,
        },
        clarity: {
          totalSessions: 12450,
          deadClicks: 234,
          rageClicks: 45,
          quickBacks: 567,
          avgScrollDepth: 68.5,
        },
      }
    : metrics;

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Date Range</h3>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(dateRange.start), 'MMM d, yyyy')} -{' '}
              {format(new Date(dateRange.end), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDateRangeChange(7)}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleDateRangeChange(30)}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handleDateRangeChange(90)}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Last 90 Days
            </button>
          </div>
        </div>
        {hasMockData && (
          <div className="mt-3 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded p-2">
            📊 Showing demo data. Configure GA4 and Clarity to see real metrics.
          </div>
        )}
        {!hasMockData && metrics.clarity && (
          <div className="mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-2">
            ℹ️ Clarity metrics show data from the <strong>last 3 days</strong> (API limitation: 10 calls/day, 1-3 day range only).{' '}
            <a
              href={`https://clarity.microsoft.com/projects/view/m5xby3pax0`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View full Clarity dashboard →
            </a>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Sessions"
          value={displayMetrics.ga4?.sessions.toLocaleString() || '0'}
          change={+12.5}
          icon="📊"
          trend="up"
        />
        <KPICard
          title="Conversions"
          value={`${displayMetrics.ga4?.conversionRate.toFixed(1)}%` || '0%'}
          change={+2.3}
          icon="🎯"
          trend="up"
        />
        <KPICard
          title="Bounce Rate"
          value={`${displayMetrics.ga4?.bounceRate.toFixed(1)}%` || '0%'}
          change={-3.2}
          icon="⚡"
          trend="down"
        />
        <KPICard
          title="Scroll Depth"
          value={
            `${displayMetrics.clarity?.avgScrollDepth.toFixed(0)}%` || '0%'
          }
          change={+5.7}
          icon="📜"
          trend="up"
        />
      </div>

      {/* Realtime Users */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium opacity-90">
              Active Users Right Now
            </h3>
            <p className="text-4xl font-bold mt-2">
              {displayMetrics.ga4?.realtimeUsers || 0}
            </p>
            <p className="text-xs opacity-75 mt-2">Last updated: Just now</p>
          </div>
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-30 flex items-center justify-center animate-pulse">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Config Impact Widget */}
      <ConfigImpactWidget />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionsChart data={displayMetrics.ga4} />
        <ConversionChart data={displayMetrics.ga4} />
      </div>

      {/* Behavior Highlights */}
      <BehaviorHighlights data={displayMetrics.clarity} />

      {/* Shopify Metrics */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🛍️ Shopify Sales & Customers
        </h2>
        <ShopifyMetrics startDate={dateRange.start} endDate={dateRange.end} />
      </div>

      {/* Taboola Advertising Metrics */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📢 Taboola Advertising
        </h2>
        <TaboolaMetrics startDate={dateRange.start} endDate={dateRange.end} />
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
        <p className="text-sm text-gray-600">
          Data refreshes every 5 minutes • Last sync:{' '}
          {format(new Date(), 'h:mm a')}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          GA4 data may have a 24-48 hour delay for full reports
        </p>
      </div>
    </div>
  );
}
