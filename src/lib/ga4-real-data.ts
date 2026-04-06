/**
 * Real Google Analytics 4 Data Integration
 * Uses Google Analytics Data API to fetch actual analytics data
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

// GA4 property ID for Lab Essentials (measurement ID: G-QCSHJ4TDMY)
// Property ID: 394300830 (from GA4 Admin → Property Settings)
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '399540912';

let analyticsDataClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient() {
  if (!analyticsDataClient) {
    analyticsDataClient = new BetaAnalyticsDataClient({
      // Uses GOOGLE_APPLICATION_CREDENTIALS environment variable
    });
  }
  return analyticsDataClient;
}

export interface GA4MetricsData {
  activeUsers: number;
  totalUsers: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  ecommerceRevenue: number;
  purchaseEvents: number;
  addToCartEvents: number;
}

export interface GA4DimensionData {
  date: string;
  pageTitle: string;
  source: string;
  medium: string;
  device: string;
  country: string;
}

export async function fetchGA4Analytics(
  startDate: Date,
  endDate: Date,
): Promise<GA4MetricsData | null> {
  try {
    const client = getAnalyticsClient();

    // Format dates for GA4 API (YYYY-MM-DD)
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    console.log('📊 Fetching real GA4 data for Lab Essentials...');

    // Core metrics request
    const [coreMetricsResponse] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
    });

    // E-commerce metrics request
    const [ecommerceResponse] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      metrics: [
        { name: 'purchaseRevenue' },
        { name: 'purchaseToDetailRate' },
        { name: 'addToCarts' },
        { name: 'purchases' },
      ],
    });

    // Extract metrics data
    const coreMetrics = coreMetricsResponse.rows?.[0]?.metricValues || [];
    const ecommerceMetrics = ecommerceResponse.rows?.[0]?.metricValues || [];

    const metrics: GA4MetricsData = {
      activeUsers: parseInt(coreMetrics[0]?.value || '0'),
      totalUsers: parseInt(coreMetrics[1]?.value || '0'),
      pageViews: parseInt(coreMetrics[2]?.value || '0'),
      sessions: parseInt(coreMetrics[3]?.value || '0'),
      bounceRate: parseFloat(coreMetrics[4]?.value || '0'),
      averageSessionDuration: parseFloat(coreMetrics[5]?.value || '0'),
      conversions: parseInt(coreMetrics[6]?.value || '0'),
      revenue: parseFloat(coreMetrics[7]?.value || '0'),
      ecommerceRevenue: parseFloat(ecommerceMetrics[0]?.value || '0'),
      conversionRate: parseFloat(ecommerceMetrics[1]?.value || '0'),
      addToCartEvents: parseInt(ecommerceMetrics[2]?.value || '0'),
      purchaseEvents: parseInt(ecommerceMetrics[3]?.value || '0'),
    };

    console.log('✅ Real GA4 data fetched successfully:');
    console.log(`   👥 Active Users: ${metrics.activeUsers.toLocaleString()}`);
    console.log(`   📄 Page Views: ${metrics.pageViews.toLocaleString()}`);
    console.log(`   🔄 Sessions: ${metrics.sessions.toLocaleString()}`);
    console.log(`   💰 Revenue: $${metrics.revenue.toLocaleString()}`);
    console.log(`   🛒 Purchases: ${metrics.purchaseEvents.toLocaleString()}`);

    return metrics;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ GA4 API Error:', errorMessage);
    console.error('📊 Analytics data unavailable - check GA4 API configuration');

    // Return null instead of fake data - let dashboards handle the error state
    return null;
  }
}

export async function fetchGA4ConversionEvents(
  startDate: Date,
  endDate: Date,
): Promise<Array<{ date: string; conversions: number; revenue: number }>> {
  try {
    const client = getAnalyticsClient();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const [response] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'conversions' }, { name: 'totalRevenue' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });

    return (
      response.rows?.map((row) => ({
        date: row.dimensionValues?.[0]?.value || '',
        conversions: parseInt(row.metricValues?.[0]?.value || '0'),
        revenue: parseFloat(row.metricValues?.[1]?.value || '0'),
      })) || []
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ GA4 Conversion Events Error:', errorMessage);

    // Return empty array instead of fake data
    return [];
  }
}

export async function fetchGA4TopPages(
  startDate: Date,
  endDate: Date,
): Promise<Array<{ page: string; views: number; users: number }>> {
  try {
    const client = getAnalyticsClient();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const [response] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    return (
      response.rows?.map((row) => ({
        page: row.dimensionValues?.[0]?.value || 'Unknown Page',
        views: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
      })) || []
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ GA4 Top Pages Error:', errorMessage);

    // Return empty array instead of fake data
    return [];
  }
}
