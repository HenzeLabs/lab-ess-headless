import { NextRequest, NextResponse } from 'next/server';
import { fetchGA4Analytics as fetchRealGA4Analytics } from '@/lib/ga4-real-data';

interface ChartDataPoint {
  label: string;
  value: number;
  revenue?: number;
  users?: number;
}

// Enhanced analytics integration that combines multiple data sources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const daysBack =
      timeRange === '24h'
        ? 1
        : timeRange === '7d'
        ? 7
        : timeRange === '30d'
        ? 30
        : 90;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    console.log(
      `Fetching enhanced analytics data (Shopify + GA4 + Clarity) for last ${daysBack} days...`,
    );

    // Fetch data from multiple sources in parallel
    const [shopifyData, ga4Data, clarityData] = await Promise.all([
      fetchShopifyAnalytics(timeRange),
      fetchRealGA4Analytics(startDate, endDate),
      fetchClarityAnalytics(daysBack),
    ]);

    // Combine and enhance the data
    const enhancedMetrics = {
      // E-commerce metrics (Shopify)
      totalRevenue: shopifyData.summary?.totalRevenue || 0,
      totalOrders: shopifyData.summary?.totalOrders || 0,
      avgOrderValue: shopifyData.summary?.avgOrderValue || 0,

      // User behavior metrics (GA4) - using real data structure
      activeUsers: ga4Data?.activeUsers || 0,
      totalUsers: ga4Data?.totalUsers || 0,
      newUsers: Math.floor((ga4Data?.totalUsers || 0) * 0.6), // Estimate new users as 60%
      returningUsers: Math.floor((ga4Data?.totalUsers || 0) * 0.4), // Estimate returning users as 40%
      pageViews: ga4Data?.pageViews || 0,
      sessions: ga4Data?.sessions || 0,
      bounceRate: ga4Data?.bounceRate || 0,
      avgSessionDuration: ga4Data?.averageSessionDuration || 0,

      // Conversion metrics (combined)
      conversionRate: shopifyData.summary?.conversionRate || 0,
      ecommerceConversionRate: ga4Data?.conversionRate || 0,

      // User experience metrics (Clarity)
      clarityInsights: clarityData.insights || {},
      heatmapMetrics: clarityData.heatmaps || {},
      userJourneyMetrics: clarityData.journeys || {},

      // Combined performance
      totalActiveCustomers: shopifyData.summary?.activeCustomers || 0,
      topPerformingPages: [], // Will fetch separately from GA4 if needed
      topProducts: shopifyData.topProducts || [],
      trafficSources: {}, // Will add traffic source data later
    };

    // Enhanced chart data combining revenue and traffic
    const enhancedChartData = combineChartData(
      shopifyData.chartData || [],
      [], // ga4Data doesn't have chartData, will generate from metrics
      daysBack,
    );

    // Enhanced recent activities
    const enhancedActivities = [
      ...(shopifyData.recentActivities || []),
      // ga4Data doesn't have recentEvents, will generate from metrics if needed
      ...(clarityData.recentInsights || []),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      summary: enhancedMetrics,
      chartData: enhancedChartData,
      recentActivities: enhancedActivities,
      detailedInsights: {
        shopify: shopifyData.storeInfo || {},
        ga4: {
          activeUsers: ga4Data?.activeUsers || 0,
          pageViews: ga4Data?.pageViews || 0,
          sessions: ga4Data?.sessions || 0,
          conversionRate: ga4Data?.conversionRate || 0,
          revenue: ga4Data?.revenue || 0,
        },
        clarity: clarityData.fullReport || {},
      },
      timeRange,
      dataSource: 'enhanced', // Shopify + GA4 + Clarity
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching enhanced analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch enhanced analytics data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Fetch Shopify data
async function fetchShopifyAnalytics(timeRange: string) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }/api/analytics/shopify?timeRange=${timeRange}`,
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Shopify analytics fetch failed:', error);
  }
  return { summary: {}, chartData: [], recentActivities: [] };
}

// Fetch GA4 data using Measurement Protocol (for demo - in production use GA4 Reporting API)
// Fetch Microsoft Clarity data (placeholder - implement real Clarity API in production)
async function fetchClarityAnalytics(daysBack: number) {
  try {
    // TODO: Implement real Microsoft Clarity API integration
    // For now, return conservative placeholder values
    const baseRecordings = 100; // Conservative estimate based on daysBack
    const recordings = Math.floor(baseRecordings * (daysBack / 7));

    return {
      insights: {
        totalRecordings: recordings,
        deadClicks: Math.floor(recordings * 0.03), // 3% conservative estimate
        rageClicks: Math.floor(recordings * 0.01), // 1% conservative estimate
        excessiveScrolling: Math.floor(recordings * 0.05), // 5% conservative estimate
        clarityScore: 88, // Conservative good score
        topIssues: [
          {
            type: 'dead_clicks',
            count: Math.floor(recordings * 0.03),
            page: '/checkout',
          },
          {
            type: 'rage_clicks',
            count: Math.floor(recordings * 0.01),
            page: '/cart',
          },
          {
            type: 'excessive_scrolling',
            count: Math.floor(recordings * 0.05),
            page: '/products',
          },
        ],
      },
      heatmaps: {
        clickHeatmaps: 12,
        scrollHeatmaps: 8,
        attentionHeatmaps: 5,
      },
      journeys: {
        conversionFunnels: 3,
        dropoffPoints: ['cart', 'checkout_shipping', 'payment'],
        completionRate: 78.5,
      },
      recentInsights: [
        {
          id: 'clarity_insight_1',
          type: 'test' as const,
          title: 'UX Issue Detected',
          description: 'Users experiencing difficulty with checkout button',
          timestamp: new Date(Date.now() - Math.random() * 7200000),
          status: 'warning' as const,
        },
      ],
      fullReport: {
        clarity_id: 'm5xby3pax0',
        heatmaps_generated: true,
        session_recordings: true,
        insights_available: true,
      },
    };
  } catch (error) {
    console.warn('Clarity analytics fetch failed:', error);
    return { insights: {}, heatmaps: {}, journeys: {} };
  }
}

// Combine chart data from different sources
function combineChartData(
  shopifyData: ChartDataPoint[],
  ga4Data: ChartDataPoint[],
  daysBack: number,
) {
  const combined = [];

  for (let i = 0; i < daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (daysBack - 1 - i));

    const label = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const shopifyValue = shopifyData.find((d) => d.label === label)?.value || 0;
    const ga4Value = ga4Data.find((d) => d.label === label)?.value || 0;

    combined.push({
      label,
      revenue: shopifyValue,
      users: ga4Value,
      value: shopifyValue, // Primary metric for chart display
    });
  }

  return combined;
}
