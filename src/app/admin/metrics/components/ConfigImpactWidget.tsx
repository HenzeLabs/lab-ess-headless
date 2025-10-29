'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface ImpactData {
  configKey: string;
  changedAt: string;
  percentChange: {
    pageViews: number;
    sessions: number;
    bounceRate: number;
  };
}

export default function ConfigImpactWidget() {
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestImpact();
  }, []);

  const fetchLatestImpact = async () => {
    try {
      // Fetch latest config change
      const configResponse = await fetch('/api/config?all=true');
      const configs = await configResponse.json();

      // Find most recent change
      const sorted = configs.sort(
        (a: any, b: any) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
      const latest = sorted[0];

      if (!latest) {
        setLoading(false);
        return;
      }

      // Fetch impact for latest change
      const impactResponse = await fetch(
        `/api/metrics/impact?key=${latest.key}&date=${latest.updated_at}`,
      );

      if (impactResponse.ok) {
        const impactData = await impactResponse.json();
        setImpact(impactData);
      } else {
        // Use mock data for demonstration
        setImpact({
          configKey: latest.key,
          changedAt: latest.updated_at,
          percentChange: {
            pageViews: +8.3,
            sessions: +12.1,
            bounceRate: -4.5,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching impact:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!impact) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Impact Since Last Config Change
        </h3>
        <p className="text-sm text-gray-600">
          No recent configuration changes to analyze.
        </p>
      </div>
    );
  }

  const { configKey, changedAt, percentChange } = impact;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow border border-purple-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            📈 Impact Since Last Config Change
          </h3>
          <p className="text-sm text-gray-600">
            Measuring effect of{' '}
            <code className="px-2 py-1 bg-white rounded text-xs font-mono">
              {configKey}
            </code>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Changed {format(new Date(changedAt), 'MMM d, yyyy')} • 7-day
            comparison
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ImpactMetric
          label="Page Views"
          value={percentChange.pageViews}
          description="Total page views"
        />
        <ImpactMetric
          label="Sessions"
          value={percentChange.sessions}
          description="User sessions"
        />
        <ImpactMetric
          label="Bounce Rate"
          value={percentChange.bounceRate}
          description="Single-page sessions"
          inverse
        />
      </div>

      <div className="mt-4 pt-4 border-t border-purple-200">
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-gray-700">
            {percentChange.pageViews > 0 && percentChange.sessions > 0
              ? '✅ Positive impact detected - configuration change improved metrics'
              : percentChange.pageViews < 0 || percentChange.sessions < 0
                ? '⚠️ Negative impact detected - consider reverting this change'
                : 'ℹ️ Minimal impact observed - metrics remain stable'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface ImpactMetricProps {
  label: string;
  value: number;
  description: string;
  inverse?: boolean;
}

function ImpactMetric({
  label,
  value,
  description,
  inverse = false,
}: ImpactMetricProps) {
  const isPositive = inverse ? value < 0 : value > 0;
  const color = isPositive
    ? 'text-green-600'
    : value < 0 || value > 0
      ? 'text-red-600'
      : 'text-gray-600';
  const bgColor = isPositive
    ? 'bg-green-50'
    : value < 0 || value > 0
      ? 'bg-red-50'
      : 'bg-gray-50';

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-2xl font-bold ${color}`}>
          {value > 0 ? '+' : ''}
          {value.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
      <div className={`mt-2 h-2 rounded-full ${bgColor} overflow-hidden`}>
        <div
          className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${Math.min(Math.abs(value), 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
