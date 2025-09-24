'use client';

import { useState, useEffect } from 'react';

interface ShopifyOrder {
  id: string;
  name: string;
  total: number;
  createdAt: string;
  customerEmail?: string;
  items: Array<{
    title: string;
    quantity: number;
  }>;
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  totalSold: number;
  revenue: number;
}

interface ShopifyAnalyticsData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: ShopifyProduct[];
  };
  recentOrders: ShopifyOrder[];
  chartData: Array<{
    label: string;
    value: number;
  }>;
  loading: boolean;
  error: string | null;
}

export function useShopifyAnalytics(
  timeRange: '24h' | '7d' | '30d' | '90d' = '7d',
): ShopifyAnalyticsData {
  const [data, setData] = useState<ShopifyAnalyticsData>({
    metrics: {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topProducts: [],
    },
    recentOrders: [],
    chartData: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchShopifyData() {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Fetch real Shopify analytics data
        const response = await fetch(
          `/api/analytics/shopify?timeRange=${timeRange}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const shopifyData = await response.json();

        // Process the real Shopify data
        const processedData: ShopifyAnalyticsData = {
          metrics: {
            totalRevenue: shopifyData.totalRevenue || 0,
            totalOrders: shopifyData.totalOrders || 0,
            averageOrderValue: shopifyData.averageOrderValue || 0,
            topProducts: shopifyData.topProducts || [],
          },
          recentOrders: shopifyData.recentOrders || [],
          chartData: shopifyData.chartData || [],
          loading: false,
          error: null,
        };

        setData(processedData);
      } catch (error) {
        console.error('Error fetching Shopify analytics:', error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    }

    fetchShopifyData();
  }, [timeRange]);

  return data;
}
