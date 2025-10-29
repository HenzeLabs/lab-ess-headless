/**
 * Google Analytics 4 Data API Integration
 *
 * Pulls configuration-related metrics from GA4 to track
 * the impact of configuration changes on user behavior.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Initialize GA4 client (lazy loaded)
let analyticsClient: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (!analyticsClient) {
    // Initialize with service account credentials
    const credentials = process.env.GA4_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.GA4_SERVICE_ACCOUNT_JSON)
      : undefined;

    analyticsClient = new BetaAnalyticsDataClient({
      credentials,
    });
  }

  return analyticsClient;
}

export interface GA4Metrics {
  pageViews: number;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  topPages: Array<{
    page: string;
    views: number;
    avgTimeOnPage: number;
  }>;
}

export interface ConfigImpactMetrics {
  configKey: string;
  changedAt: string;
  beforeMetrics: GA4Metrics;
  afterMetrics: GA4Metrics;
  percentChange: {
    pageViews: number;
    sessions: number;
    bounceRate: number;
  };
}

/**
 * Fetch GA4 metrics for a date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns GA4 metrics object
 */
export async function fetchGA4Metrics(
  startDate: string,
  endDate: string,
): Promise<GA4Metrics | null> {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!propertyId) {
      console.warn('GA4_PROPERTY_ID not configured');
      return null;
    }

    const client = getClient();

    // Run report for core metrics
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
      ],
    });

    if (!response.rows || response.rows.length === 0) {
      return null;
    }

    const row = response.rows[0];
    const metricValues = row.metricValues || [];

    // Get top pages
    const [pagesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
      limit: 10,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    });

    const topPages =
      pagesResponse.rows?.map((pageRow) => ({
        page: pageRow.dimensionValues?.[0]?.value || '',
        views: parseInt(pageRow.metricValues?.[0]?.value || '0'),
        avgTimeOnPage: parseFloat(pageRow.metricValues?.[1]?.value || '0'),
      })) || [];

    return {
      pageViews: parseInt(metricValues[0]?.value || '0'),
      sessions: parseInt(metricValues[1]?.value || '0'),
      users: parseInt(metricValues[2]?.value || '0'),
      bounceRate: parseFloat(metricValues[3]?.value || '0'),
      avgSessionDuration: parseFloat(metricValues[4]?.value || '0'),
      conversionRate: parseFloat(metricValues[5]?.value || '0'),
      topPages,
    };
  } catch (error) {
    console.error('Error fetching GA4 metrics:', error);
    return null;
  }
}

/**
 * Measure the impact of a configuration change
 * @param configKey - The configuration key that was changed
 * @param changeDate - When the change was made (ISO string)
 * @param daysBefore - Days to measure before change (default 7)
 * @param daysAfter - Days to measure after change (default 7)
 * @returns Impact metrics showing before/after comparison
 */
export async function measureConfigImpact(
  configKey: string,
  changeDate: string,
  daysBefore = 7,
  daysAfter = 7,
): Promise<ConfigImpactMetrics | null> {
  try {
    const changeTimestamp = new Date(changeDate);

    // Calculate date ranges
    const beforeStart = new Date(changeTimestamp);
    beforeStart.setDate(beforeStart.getDate() - daysBefore);
    const beforeEnd = new Date(changeTimestamp);
    beforeEnd.setDate(beforeEnd.getDate() - 1);

    const afterStart = new Date(changeTimestamp);
    const afterEnd = new Date(changeTimestamp);
    afterEnd.setDate(afterEnd.getDate() + daysAfter);

    // Format dates for GA4 API (YYYY-MM-DD)
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Fetch before and after metrics
    const beforeMetrics = await fetchGA4Metrics(
      formatDate(beforeStart),
      formatDate(beforeEnd),
    );

    const afterMetrics = await fetchGA4Metrics(
      formatDate(afterStart),
      formatDate(afterEnd),
    );

    if (!beforeMetrics || !afterMetrics) {
      return null;
    }

    // Calculate percent changes
    const calculateChange = (before: number, after: number) => {
      if (before === 0) return 0;
      return ((after - before) / before) * 100;
    };

    return {
      configKey,
      changedAt: changeDate,
      beforeMetrics,
      afterMetrics,
      percentChange: {
        pageViews: calculateChange(
          beforeMetrics.pageViews,
          afterMetrics.pageViews,
        ),
        sessions: calculateChange(
          beforeMetrics.sessions,
          afterMetrics.sessions,
        ),
        bounceRate: calculateChange(
          beforeMetrics.bounceRate,
          afterMetrics.bounceRate,
        ),
      },
    };
  } catch (error) {
    console.error('Error measuring config impact:', error);
    return null;
  }
}

/**
 * Get real-time active users (last 30 minutes)
 * @returns Number of active users or null if unavailable
 */
export async function getRealtimeUsers(): Promise<number | null> {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!propertyId) {
      return null;
    }

    const client = getClient();

    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [],
      metrics: [{ name: 'activeUsers' }],
    });

    const activeUsers = parseInt(
      response.rows?.[0]?.metricValues?.[0]?.value || '0',
    );
    return activeUsers;
  } catch (error) {
    console.error('Error fetching realtime users:', error);
    return null;
  }
}

/**
 * Track configuration dashboard usage in GA4
 * @param action - The action performed (e.g., 'config_updated', 'config_viewed')
 * @param configKey - The configuration key involved
 * @param metadata - Additional metadata to track
 */
export function trackConfigEvent(
  action: string,
  configKey: string,
  metadata?: Record<string, string | number>,
) {
  // This would typically use gtag or Measurement Protocol
  // For server-side tracking, use Measurement Protocol API
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: 'Configuration',
      event_label: configKey,
      ...metadata,
    });
  }
}
