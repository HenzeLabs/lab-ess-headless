'use client';

import { useState, useEffect } from 'react';
import { AnalyticsTracker } from '@/lib/analytics-tracking-enhanced';

interface AnalyticsEvent {
  name: string;
  timestamp: string;
  value?: number;
  properties?: Record<string, unknown>;
}

interface Experiment {
  id: string;
  name: string;
  status: string;
  startDate?: string;
  variants?: Array<{ id: string; name: string }>;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'product' | 'test';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface RealAnalyticsData {
  metrics: {
    totalRevenue: number;
    activeUsers: number;
    conversionRate: number;
    orders: number;
    pageViews: number;
    activeTests: number;
  };
  chartData: Array<{
    label: string;
    value: number;
  }>;
  recentActivities: RecentActivity[];
  loading: boolean;
  error: string | null;
}

export function useRealAnalytics(
  timeRange: '24h' | '7d' | '30d' | '90d' = '7d',
): RealAnalyticsData {
  const [data, setData] = useState<RealAnalyticsData>({
    metrics: {
      totalRevenue: 0,
      activeUsers: 0,
      conversionRate: 0,
      orders: 0,
      pageViews: 0,
      activeTests: 0,
    },
    chartData: [],
    recentActivities: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Initialize analytics tracking on first load
    AnalyticsTracker.initialize();

    async function fetchRealData() {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        // Try to fetch enhanced analytics (Shopify + GA4 + Clarity) first
        const [enhancedResponse, experimentsResponse] = await Promise.all([
          fetch(`/api/analytics/enhanced?timeRange=${timeRange}`),
          fetch('/api/experiments'),
        ]);

        let analyticsData;

        if (enhancedResponse.ok) {
          // Use enhanced analytics data (Shopify + GA4 + Clarity)
          analyticsData = await enhancedResponse.json();
          console.log(
            'Using enhanced analytics data (Shopify + GA4 + Clarity):',
            analyticsData.summary,
          );
        } else {
          // Fallback to Shopify-only data
          console.warn('Enhanced analytics failed, trying Shopify data...');
          const shopifyResponse = await fetch(
            `/api/analytics/shopify?timeRange=${timeRange}`,
          );

          if (shopifyResponse.ok) {
            analyticsData = await shopifyResponse.json();
            console.log('Using Shopify-only data:', analyticsData.summary);
          } else {
            // Final fallback to demo analytics
            console.warn('Shopify API failed, falling back to demo analytics');
            const fallbackResponse = await fetch(
              `/api/analytics?type=dashboard&timeRange=${timeRange}`,
            );
            if (!fallbackResponse.ok) {
              throw new Error('Failed to fetch analytics data');
            }
            analyticsData = await fallbackResponse.json();
          }
        }
        const experimentsData = experimentsResponse.ok
          ? await experimentsResponse.json()
          : { experiments: [] };

        // Process data based on source (Enhanced, Shopify, or demo analytics)
        let processedData;

        if (analyticsData.dataSource === 'enhanced') {
          // Enhanced analytics data format (Shopify + GA4 + Clarity)
          processedData = {
            metrics: {
              totalRevenue: analyticsData.summary?.totalRevenue || 0,
              activeUsers: analyticsData.summary?.activeUsers || 0,
              conversionRate: analyticsData.summary?.conversionRate || 0,
              orders: analyticsData.summary?.totalOrders || 0,
              pageViews: analyticsData.summary?.pageViews || 0,
              activeTests:
                (experimentsData.experiments as Experiment[])?.filter(
                  (exp) => exp.status === 'running',
                ).length || 0,
            },
            chartData: analyticsData.chartData || [],
            recentActivities: analyticsData.recentActivities || [],
            loading: false,
            error: null,
          };
        } else if (analyticsData.dataSource === 'shopify') {
          // Real Shopify data format
          processedData = {
            metrics: {
              totalRevenue: analyticsData.summary?.totalRevenue || 0,
              activeUsers: analyticsData.summary?.activeCustomers || 0,
              conversionRate: analyticsData.summary?.conversionRate || 0,
              orders: analyticsData.summary?.totalOrders || 0,
              pageViews: analyticsData.summary?.totalProducts || 0, // Using products as proxy for page views
              activeTests:
                (experimentsData.experiments as Experiment[])?.filter(
                  (exp) => exp.status === 'running',
                ).length || 0,
            },
            chartData: analyticsData.chartData || [],
            recentActivities: analyticsData.recentActivities || [],
            loading: false,
            error: null,
          };
        } else {
          // Demo analytics data format (fallback)
          processedData = {
            metrics: {
              totalRevenue: analyticsData.summary?.totalRevenue || 0,
              activeUsers: analyticsData.summary?.totalUsers || 0,
              conversionRate: analyticsData.summary?.conversionRate || 0,
              orders: analyticsData.summary?.purchaseEvents || 0,
              pageViews: analyticsData.summary?.totalEvents || 0,
              activeTests:
                (experimentsData.experiments as Experiment[])?.filter(
                  (exp) => exp.status === 'running',
                ).length || 0,
            },
            chartData: generateChartDataFromEvents(
              analyticsData.events || [],
              timeRange,
            ),
            recentActivities: generateRecentActivities(
              analyticsData.events || [],
              experimentsData.experiments || [],
            ),
            loading: false,
            error: null,
          };
        }

        setData(processedData);
      } catch (error) {
        console.error('Error fetching real analytics:', error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    }

    fetchRealData();
  }, [timeRange]);

  return data;
}

function generateChartDataFromEvents(
  events: AnalyticsEvent[],
  timeRange: string,
) {
  const days =
    timeRange === '24h'
      ? 1
      : timeRange === '7d'
      ? 7
      : timeRange === '30d'
      ? 30
      : 90;
  const now = new Date();
  const chartData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.timestamp);
      return eventDate.toDateString() === date.toDateString();
    });

    chartData.push({
      label:
        days === 1
          ? date.getHours().toString().padStart(2, '0')
          : days === 7
          ? date.toLocaleDateString('en', { weekday: 'short' })
          : date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: dayEvents.length,
    });
  }

  return chartData;
}

function generateRecentActivities(
  events: AnalyticsEvent[],
  experiments: Experiment[],
): RecentActivity[] {
  const activities: RecentActivity[] = [];

  // Add recent events
  const recentEvents = events
    .filter(
      (event) => event.name === 'purchase' || event.name === 'user_signup',
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 3);

  recentEvents.forEach((event, index) => {
    if (event.name === 'purchase') {
      activities.push({
        id: `purchase_${index}`,
        type: 'order',
        title: 'New Order Received',
        description: `Order value: $${event.value?.toFixed(2) || '0.00'}`,
        timestamp: new Date(event.timestamp),
        status: 'success',
      });
    } else if (event.name === 'user_signup') {
      activities.push({
        id: `signup_${index}`,
        type: 'user',
        title: 'New User Registered',
        description: 'User completed registration',
        timestamp: new Date(event.timestamp),
        status: 'success',
      });
    }
  });

  // Add recent experiment updates
  experiments
    .filter((exp) => exp.status === 'running')
    .slice(0, 2)
    .forEach((exp, index) => {
      activities.push({
        id: `experiment_${index}`,
        type: 'test',
        title: `A/B Test: ${exp.name}`,
        description: `Currently running with ${
          exp.variants?.length || 0
        } variants`,
        timestamp: new Date(
          exp.startDate || Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        ),
        status: 'info',
      });
    });

  return activities.slice(0, 5);
}
