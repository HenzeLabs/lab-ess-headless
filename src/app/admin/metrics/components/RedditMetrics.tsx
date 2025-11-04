'use client';

import { useState, useEffect } from 'react';

interface RedditMetricsData {
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  cpc: number;
  conversions: number;
  conversionRate: number;
  roas: number;
  videoViews: number;
  engagement: number;
  topCampaigns: Array<{
    id: string;
    name: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
}

interface RedditMetricsProps {
  startDate: string;
  endDate: string;
}

export default function RedditMetrics({
  startDate,
  endDate,
}: RedditMetricsProps) {
  const [data, setData] = useState<RedditMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/metrics/reddit?start=${startDate}&end=${endDate}`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch Reddit metrics');
        }

        const metricsData = await response.json();
        setData(metricsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-600 flex-shrink-0"
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
          <div>
            <h3 className="text-lg font-semibold text-yellow-900">
              Reddit Ads Not Configured
            </h3>
            <p className="text-sm text-yellow-800 mt-1">
              {error || 'Configure Reddit Ads API credentials in Vercel'}
            </p>
            <div className="mt-3 text-xs text-yellow-700">
              Required environment variables:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>REDDIT_CLIENT_ID</li>
                <li>REDDIT_CLIENT_SECRET</li>
                <li>REDDIT_REFRESH_TOKEN</li>
                <li>REDDIT_ACCOUNT_ID</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Ad Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Impressions */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Impressions</h3>
            <span className="text-2xl">👁️</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatNumber(data.impressions)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total ad views</p>
        </div>

        {/* Clicks */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Clicks</h3>
            <span className="text-2xl">🖱️</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatNumber(data.clicks)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            CTR: {formatPercent(data.ctr)}
          </p>
        </div>

        {/* Spend */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Ad Spend</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(data.spend)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            CPC: {formatCurrency(data.cpc)}
          </p>
        </div>

        {/* Conversions */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Conversions</h3>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatNumber(data.conversions)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Rate: {formatPercent(data.conversionRate)}
          </p>
        </div>
      </div>

      {/* ROAS Card */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium opacity-90">
              Return on Ad Spend (ROAS)
            </h3>
            <p className="text-4xl font-bold mt-2">{formatPercent(data.roas)}</p>
            <p className="text-xs opacity-75 mt-2">
              Revenue generated per dollar spent
            </p>
          </div>
          <div className="text-6xl opacity-20">📈</div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video Views */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Video Views</h3>
            <span className="text-2xl">🎬</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatNumber(data.videoViews)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Total video completions
          </p>
        </div>

        {/* Engagement */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">
              Post Engagement
            </h3>
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatNumber(data.engagement)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Upvotes, comments, shares
          </p>
        </div>
      </div>

      {/* Top Campaigns */}
      {data.topCampaigns && data.topCampaigns.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Campaigns by Spend
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spend
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                      {formatNumber(campaign.impressions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                      {formatNumber(campaign.clicks)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                      {formatCurrency(campaign.spend)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                      {formatNumber(campaign.conversions)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Summary */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Campaign Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {data.topCampaigns.length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Active Campaigns</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatPercent(data.ctr)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Avg CTR</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.cpc)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Avg CPC</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatPercent(data.conversionRate)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Conv. Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
