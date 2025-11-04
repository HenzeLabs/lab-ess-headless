/**
 * Taboola Backstage API Integration
 *
 * Fetches advertising performance metrics from Taboola Backstage API
 * for display in the admin metrics dashboard.
 */

const TABOOLA_CLIENT_ID = process.env.TABOOLA_CLIENT_ID;
const TABOOLA_CLIENT_SECRET = process.env.TABOOLA_CLIENT_SECRET;
const TABOOLA_ACCOUNT_ID = process.env.TABOOLA_ADVERTISER_ID;

export interface TaboolaMetrics {
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  spent: number;
  cpc: number; // Cost per click
  conversions: number;
  conversionRate: number;
  roas: number; // Return on ad spend
  topCampaigns: Array<{
    id: string;
    name: string;
    impressions: number;
    clicks: number;
    spent: number;
    conversions: number;
  }>;
}

interface TaboolaAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface TaboolaReportRow {
  impressions: string;
  clicks: string;
  ctr: string;
  spent: string;
  cpc: string;
  conversions_value: string;
  campaign_name: string;
  campaign: string;
}

/**
 * Get Taboola access token using OAuth2
 */
async function getTaboolaAccessToken(): Promise<string | null> {
  if (!TABOOLA_CLIENT_ID || !TABOOLA_CLIENT_SECRET) {
    console.warn('[Taboola] Missing API credentials');
    return null;
  }

  try {
    const response = await fetch('https://backstage.taboola.com/backstage/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TABOOLA_CLIENT_ID,
        client_secret: TABOOLA_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
      next: { revalidate: 3000 }, // Cache for 50 minutes (tokens last 60 minutes)
    });

    if (!response.ok) {
      console.error('[Taboola] Auth failed:', response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as TaboolaAuthResponse;
    return data.access_token;
  } catch (error) {
    console.error('[Taboola] Auth error:', error);
    return null;
  }
}

/**
 * Fetch Taboola metrics for a date range
 */
export async function fetchTaboolaMetrics(
  startDate: string,
  endDate: string,
): Promise<TaboolaMetrics | null> {
  console.log('[Taboola Metrics] Starting fetch...', {
    startDate,
    endDate,
    hasClientId: !!TABOOLA_CLIENT_ID,
    hasClientSecret: !!TABOOLA_CLIENT_SECRET,
    hasAccountId: !!TABOOLA_ACCOUNT_ID,
  });

  try {
    if (!TABOOLA_ACCOUNT_ID) {
      console.warn('[Taboola Metrics] Missing account ID');
      return null;
    }

    const accessToken = await getTaboolaAccessToken();
    if (!accessToken) {
      console.warn('[Taboola Metrics] Could not get access token');
      return null;
    }

    // Fetch campaign performance report
    const reportUrl = `https://backstage.taboola.com/backstage/api/1.0/${TABOOLA_ACCOUNT_ID}/reports/campaign-summary/dimensions/campaign_day_breakdown`;

    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });

    console.log('[Taboola Metrics] Fetching report...', {
      url: reportUrl,
      params: params.toString(),
    });

    const response = await fetch(`${reportUrl}?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error('[Taboola Metrics] Report fetch failed:', response.status, response.statusText);
      // Try to read error details
      const errorText = await response.text();
      console.error('[Taboola Metrics] Error details:', errorText);
      return null;
    }

    const data = (await response.json()) as {
      results: TaboolaReportRow[];
    };

    console.log('[Taboola Metrics] Report fetched:', {
      rowCount: data.results?.length || 0,
    });

    if (!data.results || data.results.length === 0) {
      console.warn('[Taboola Metrics] No data in response');
      return {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        spent: 0,
        cpc: 0,
        conversions: 0,
        conversionRate: 0,
        roas: 0,
        topCampaigns: [],
      };
    }

    // Aggregate metrics
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpent = 0;
    let totalConversions = 0;

    const campaignMap = new Map<
      string,
      { name: string; impressions: number; clicks: number; spent: number; conversions: number }
    >();

    data.results.forEach((row) => {
      const impressions = parseInt(row.impressions) || 0;
      const clicks = parseInt(row.clicks) || 0;
      const spent = parseFloat(row.spent) || 0;
      const conversions = parseFloat(row.conversions_value) || 0;

      totalImpressions += impressions;
      totalClicks += clicks;
      totalSpent += spent;
      totalConversions += conversions;

      // Aggregate by campaign
      const campaignId = row.campaign || 'unknown';
      const campaignName = row.campaign_name || 'Unknown Campaign';

      const existing = campaignMap.get(campaignId) || {
        name: campaignName,
        impressions: 0,
        clicks: 0,
        spent: 0,
        conversions: 0,
      };

      existing.impressions += impressions;
      existing.clicks += clicks;
      existing.spent += spent;
      existing.conversions += conversions;

      campaignMap.set(campaignId, existing);
    });

    // Calculate derived metrics
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const roas = totalSpent > 0 ? totalConversions / totalSpent : 0;

    // Get top 5 campaigns by spent
    const topCampaigns = Array.from(campaignMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);

    const metrics = {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr,
      spent: totalSpent,
      cpc,
      conversions: totalConversions,
      conversionRate,
      roas,
      topCampaigns,
    };

    console.log('[Taboola Metrics] Returning metrics:', {
      impressions: totalImpressions,
      clicks: totalClicks,
      spent: totalSpent,
      campaignCount: campaignMap.size,
    });

    return metrics;
  } catch (error) {
    console.error('[Taboola Metrics] Error fetching metrics:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}
