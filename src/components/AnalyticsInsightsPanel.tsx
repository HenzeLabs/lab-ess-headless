/**
 * Analytics Dashboard Enhancement - Simple Version
 * Displays search and customer account event tracking in a clean interface
 */
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AnalyticsTracker } from '@/lib/analytics-tracking-enhanced';

interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_category: string;
  timestamp: number;
  parameters: Record<string, string | number | boolean>;
}

interface AnalyticsInsights {
  totalSearches: number;
  topSearchTerms: { term: string; count: number }[];
  searchAbandonmentRate: number;
  customerLoginCount: number;
  activeSearchSessions: number;
  recentEvents: AnalyticsEvent[];
}

export default function AnalyticsInsightsPanel() {
  const [insights, setInsights] = useState<AnalyticsInsights>({
    totalSearches: 0,
    topSearchTerms: [],
    searchAbandonmentRate: 0,
    customerLoginCount: 0,
    activeSearchSessions: 0,
    recentEvents: [],
  });

  useEffect(() => {
    // Initialize analytics tracking
    AnalyticsTracker.initialize();

    // Generate demo analytics data
    const generateDemoInsights = () => {
      const demoEvents: AnalyticsEvent[] = [
        {
          id: '1',
          event_name: 'search_query',
          event_category: 'search',
          timestamp: Date.now() - 30000,
          parameters: {
            search_term: 'lab equipment',
            search_results_count: 24,
            search_source: 'header',
          },
        },
        {
          id: '2',
          event_name: 'search_result_click',
          event_category: 'search',
          timestamp: Date.now() - 60000,
          parameters: {
            search_term: 'microscopes',
            result_type: 'product',
            result_position: 2,
          },
        },
        {
          id: '3',
          event_name: 'customer_login',
          event_category: 'customer_account',
          timestamp: Date.now() - 120000,
          parameters: {
            customer_id: 'cust_123',
            login_method: 'email',
          },
        },
      ];

      setInsights({
        totalSearches: 156,
        topSearchTerms: [
          { term: 'lab equipment', count: 45 },
          { term: 'microscopes', count: 28 },
          { term: 'glassware', count: 22 },
          { term: 'chemicals', count: 18 },
        ],
        searchAbandonmentRate: 12.5,
        customerLoginCount: 34,
        activeSearchSessions: 8,
        recentEvents: demoEvents,
      });
    };

    generateDemoInsights();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enhanced Analytics Dashboard
        </h2>
        <p className="text-gray-600">
          Real-time tracking of search and customer account interactions
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Total Searches
            </h3>
            <span className="text-2xl">🔍</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {insights.totalSearches}
          </div>
          <p className="text-xs text-green-600">+12% from last week</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Search Abandonment
            </h3>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {insights.searchAbandonmentRate}%
          </div>
          <p className="text-xs text-green-600">-3% from last week</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Customer Logins
            </h3>
            <span className="text-2xl">👤</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {insights.customerLoginCount}
          </div>
          <p className="text-xs text-green-600">+8% from last week</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Active Sessions
            </h3>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {insights.activeSearchSessions}
          </div>
          <p className="text-xs text-blue-600">Real-time</p>
        </div>
      </div>

      {/* Top Search Terms */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Search Terms
        </h3>
        <div className="space-y-3">
          {insights.topSearchTerms.map((term, index) => (
            <div key={term.term} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-400">
                  #{index + 1}
                </span>
                <span className="font-medium text-gray-900">{term.term}</span>
              </div>
              <Badge className="bg-gray-100 text-gray-800">
                {term.count} searches
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Analytics Integration Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="font-medium text-gray-900">
                Google Analytics 4
              </div>
              <div className="text-sm text-gray-600">
                Events: search_query, customer_login, search_result_click
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <div className="font-medium text-gray-900">Microsoft Clarity</div>
              <div className="text-sm text-gray-600">
                Heat maps, session recordings, custom tags
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Tracked Events Include:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
            <div>• Search queries & results</div>
            <div>• Customer login/logout</div>
            <div>• Search result clicks</div>
            <div>• Profile updates</div>
            <div>• Search abandonment</div>
            <div>• Order history views</div>
            <div>• Filter applications</div>
            <div>• Registration events</div>
          </div>
        </div>
      </div>

      {/* Testing Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Test Analytics Integration
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              🔍 Test Search Analytics:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Click the search icon in the header</li>
              <li>Type a search query (e.g., lab equipment)</li>
              <li>Click on a predictive result or press Enter</li>
              <li>Check browser console for GA4/Clarity events</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              👤 Test Customer Account Analytics:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Go to /account/login</li>
              <li>Try logging in with test@example.com / password</li>
              <li>Try with invalid credentials</li>
              <li>Check browser console for login events</li>
            </ol>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> In production, these events will be sent to
              your GA4 property and Clarity project. For testing, check the
              browser console for tracking confirmations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
