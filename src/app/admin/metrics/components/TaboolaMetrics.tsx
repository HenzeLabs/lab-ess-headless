'use client';

import { useEffect, useState } from 'react';

interface TaboolaMetricsData {
  impressions: number;
  clicks: number;
  ctr: number;
  spent: number;
  cpc: number;
  conversions: number;
  conversionRate: number;
  roas: number;
  topCampaigns: Array<{
    id: string;
    name: string;
    impressions: number;
    clicks: number;
    spent: number;
    conversions: number;
  }>;
}

interface TaboolaMetricsProps {
  startDate: string;
  endDate: string;
}

export default function TaboolaMetrics({
  startDate,
  endDate,
}: TaboolaMetricsProps) {
  const [data, setData] = useState<TaboolaMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/metrics/taboola?start=${startDate}&end=${endDate}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Taboola metrics');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          ⚠️ {error || 'No Taboola data available'}
        </p>
        <p className="text-xs text-yellow-600 mt-2">
          Configure TABOOLA_CLIENT_ID and TABOOLA_CLIENT_SECRET in environment
          variables to view ad performance metrics.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Ad Performance KPIs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Ad Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Impressions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Impressions</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(data.impressions)}
            </p>
            <p className="text-xs text-gray-500 mt-1">total ad views</p>
          </div>

          {/* Clicks */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Clicks</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatNumber(data.clicks)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              CTR: {formatPercent(data.ctr)}
            </p>
          </div>

          {/* Spent */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Ad Spend</p>
            <p className="text-3xl font-bold text-orange-600">
              {formatCurrency(data.spent)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              CPC: {formatCurrency(data.cpc)}
            </p>
          </div>

          {/* Conversions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Conversions</p>
            <p className="text-3xl font-bold text-green-600">
              {formatNumber(data.conversions)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Rate: {formatPercent(data.conversionRate)}
            </p>
          </div>
        </div>
      </div>

      {/* ROAS */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium opacity-90">
              Return on Ad Spend (ROAS)
            </h3>
            <p className="text-4xl font-bold mt-2">
              {data.roas.toFixed(2)}x
            </p>
            <p className="text-xs opacity-75 mt-2">
              ${data.roas.toFixed(2)} revenue per $1 spent
            </p>
          </div>
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Campaigns */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎯 Top Campaigns
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                  Spent
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topCampaigns.map((campaign, index) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                        #{index + 1}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(campaign.impressions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatNumber(campaign.clicks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(campaign.spent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                    {formatNumber(campaign.conversions)}
                  </td>
                </tr>
              ))}
              {data.topCampaigns.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No campaigns in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad Metrics Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          📈 Campaign Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-blue-600 font-medium">Total Impressions</p>
            <p className="text-blue-900 font-bold">
              {formatNumber(data.impressions)}
            </p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Click-Through Rate</p>
            <p className="text-blue-900 font-bold">{formatPercent(data.ctr)}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Cost Per Click</p>
            <p className="text-blue-900 font-bold">{formatCurrency(data.cpc)}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Conversion Rate</p>
            <p className="text-blue-900 font-bold">
              {formatPercent(data.conversionRate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
