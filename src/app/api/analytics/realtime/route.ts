import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Initialize GA4 client with service account
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient() {
  if (analyticsDataClient) return analyticsDataClient;

  const serviceAccountJson = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('GA4_SERVICE_ACCOUNT_JSON not configured');
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials,
    });
    return analyticsDataClient;
  } catch (error) {
    console.error('Failed to parse GA4 service account JSON:', error);
    throw new Error('Invalid GA4_SERVICE_ACCOUNT_JSON format');
  }
}

export async function GET() {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'GA4_PROPERTY_ID not configured' },
        { status: 500 }
      );
    }

    const client = getAnalyticsClient();

    // Fetch real-time metrics (last 30 minutes)
    const [realtimeResponse] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'eventCount' },
      ],
      dimensions: [
        { name: 'deviceCategory' },
      ],
    });

    // Fetch today's metrics
    const today = new Date().toISOString().split('T')[0];
    const [todayResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: today, endDate: today }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
      ],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' },
      ],
    });

    // Fetch last 7 days metrics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [weekResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{
        startDate: sevenDaysAgo.toISOString().split('T')[0],
        endDate: today,
      }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    // Parse real-time data
    const activeUsers = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
    const realtimePageViews = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[1]?.value || '0');
    const realtimeEvents = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[2]?.value || '0');

    // Parse device breakdown from realtime
    const deviceBreakdown: Record<string, number> = {};
    realtimeResponse.rows?.forEach((row) => {
      const device = row.dimensionValues?.[0]?.value || 'unknown';
      const users = parseInt(row.metricValues?.[0]?.value || '0');
      deviceBreakdown[device.toLowerCase()] = users;
    });

    // Parse today's data
    const todayUsers = parseInt(todayResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
    const todayPageViews = parseInt(todayResponse.rows?.[0]?.metricValues?.[1]?.value || '0');
    const todaySessions = parseInt(todayResponse.rows?.[0]?.metricValues?.[2]?.value || '0');
    const todayConversions = parseInt(todayResponse.rows?.[0]?.metricValues?.[3]?.value || '0');
    const todayRevenue = parseFloat(todayResponse.rows?.[0]?.metricValues?.[4]?.value || '0');

    // Parse traffic sources
    const trafficSources: Array<{ source: string; users: number }> = [];
    todayResponse.rows?.forEach((row) => {
      const source = row.dimensionValues?.[0]?.value || 'Direct';
      const users = parseInt(row.metricValues?.[0]?.value || '0');
      trafficSources.push({ source, users });
    });

    // Parse last 7 days data
    const weekUsers = parseInt(weekResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
    const weekPageViews = parseInt(weekResponse.rows?.[0]?.metricValues?.[1]?.value || '0');
    const weekSessions = parseInt(weekResponse.rows?.[0]?.metricValues?.[2]?.value || '0');
    const weekConversions = parseInt(weekResponse.rows?.[0]?.metricValues?.[3]?.value || '0');
    const weekRevenue = parseFloat(weekResponse.rows?.[0]?.metricValues?.[4]?.value || '0');
    const avgSessionDuration = parseFloat(weekResponse.rows?.[0]?.metricValues?.[5]?.value || '0');
    const bounceRate = parseFloat(weekResponse.rows?.[0]?.metricValues?.[6]?.value || '0');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      realtime: {
        activeUsers,
        pageViews: realtimePageViews,
        events: realtimeEvents,
        deviceBreakdown,
      },
      today: {
        users: todayUsers,
        pageViews: todayPageViews,
        sessions: todaySessions,
        conversions: todayConversions,
        revenue: todayRevenue,
        conversionRate: todaySessions > 0 ? (todayConversions / todaySessions * 100).toFixed(2) : '0',
        trafficSources,
      },
      week: {
        users: weekUsers,
        pageViews: weekPageViews,
        sessions: weekSessions,
        conversions: weekConversions,
        revenue: weekRevenue,
        avgSessionDuration: Math.round(avgSessionDuration),
        bounceRate: (bounceRate * 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error fetching GA4 realtime data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
