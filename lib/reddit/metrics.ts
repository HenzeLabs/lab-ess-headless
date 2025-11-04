/**
 * Reddit Ads API Integration
 *
 * Fetches advertising campaign metrics from Reddit Ads API
 * to display in the admin metrics dashboard.
 *
 * API Documentation: https://ads-api.reddit.com/docs/
 */

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_REFRESH_TOKEN = process.env.REDDIT_REFRESH_TOKEN;
const REDDIT_ACCOUNT_ID = process.env.REDDIT_ACCOUNT_ID;

export interface RedditMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  cpc: number;
  conversions: number;
  conversionRate: number;
  roas: number;
  videoViews: number;
  engagement: number;
  topCampaigns: Array<{
    id: string;
    name: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
}

interface RedditAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface RedditCampaign {
  id: string;
  name: string;
  status: string;
}

interface RedditReportMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  video_views?: number;
  post_engagement?: number;
  conversions?: number;
  revenue?: number;
}

/**
 * Get Reddit Ads API access token using refresh token
 */
async function getRedditAccessToken(): Promise<string | null> {
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_REFRESH_TOKEN) {
    console.error('[Reddit Ads] Missing credentials');
    return null;
  }

  try {
    const auth = Buffer.from(
      `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await fetch('https://ads-api.reddit.com/api/v2.0/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LabEssentials/1.0',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: REDDIT_REFRESH_TOKEN,
      }),
      next: { revalidate: 3000 }, // Cache for 50 minutes (tokens last 60)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Reddit Ads] Token fetch failed: ${response.status}`,
        errorText,
      );
      return null;
    }

    const data: RedditAccessTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[Reddit Ads] Token error:', error);
    return null;
  }
}

/**
 * Fetch campaigns for the account
 */
async function fetchCampaigns(
  accessToken: string,
): Promise<RedditCampaign[]> {
  try {
    const response = await fetch(
      `https://ads-api.reddit.com/api/v2.0/accounts/${REDDIT_ACCOUNT_ID}/campaigns`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'LabEssentials/1.0',
        },
        next: { revalidate: 300 }, // Cache 5 minutes
      },
    );

    if (!response.ok) {
      console.error(
        `[Reddit Ads] Campaigns fetch failed: ${response.status}`,
      );
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[Reddit Ads] Campaigns error:', error);
    return [];
  }
}

/**
 * Fetch campaign metrics from Reddit Ads API
 */
export async function fetchRedditMetrics(
  startDate: string,
  endDate: string,
): Promise<RedditMetrics | null> {
  console.log('[Reddit Ads] Starting fetch...', {
    startDate,
    endDate,
    hasClientId: !!REDDIT_CLIENT_ID,
    hasClientSecret: !!REDDIT_CLIENT_SECRET,
    hasRefreshToken: !!REDDIT_REFRESH_TOKEN,
    hasAccountId: !!REDDIT_ACCOUNT_ID,
  });

  try {
    if (
      !REDDIT_CLIENT_ID ||
      !REDDIT_CLIENT_SECRET ||
      !REDDIT_REFRESH_TOKEN ||
      !REDDIT_ACCOUNT_ID
    ) {
      console.error('[Reddit Ads] Missing credentials');
      return null;
    }

    // Get access token
    const accessToken = await getRedditAccessToken();
    if (!accessToken) {
      console.error('[Reddit Ads] Failed to get access token');
      return null;
    }

    // Fetch campaigns
    const campaigns = await fetchCampaigns(accessToken);
    if (!campaigns.length) {
      console.warn('[Reddit Ads] No campaigns found');
      return {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        spend: 0,
        cpc: 0,
        conversions: 0,
        conversionRate: 0,
        roas: 0,
        videoViews: 0,
        engagement: 0,
        topCampaigns: [],
      };
    }

    console.log(`[Reddit Ads] Found ${campaigns.length} campaigns`);

    // Fetch metrics for all campaigns
    const response = await fetch(
      `https://ads-api.reddit.com/api/v2.0/accounts/${REDDIT_ACCOUNT_ID}/reports`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'LabEssentials/1.0',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          entity_type: 'campaign',
          entity_ids: campaigns.map((c) => c.id),
          metrics: [
            'impressions',
            'clicks',
            'spend',
            'video_views',
            'post_engagement',
            'conversions',
            'revenue',
          ],
          time_zone: 'America/New_York',
        }),
        next: { revalidate: 300 }, // Cache 5 minutes
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Reddit Ads] Reports fetch failed: ${response.status}`,
        errorText,
      );
      return null;
    }

    const reportData = await response.json();
    console.log('[Reddit Ads] Report data received');

    // Aggregate metrics across all campaigns
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalVideoViews = 0;
    let totalEngagement = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    const campaignMetrics: Array<{
      id: string;
      name: string;
      impressions: number;
      clicks: number;
      spend: number;
      conversions: number;
    }> = [];

    // Process report data
    if (reportData.data && Array.isArray(reportData.data)) {
      reportData.data.forEach((row: { campaign_id: string; metrics: RedditReportMetrics }) => {
        const campaign = campaigns.find((c) => c.id === row.campaign_id);
        const metrics = row.metrics;

        totalImpressions += metrics.impressions || 0;
        totalClicks += metrics.clicks || 0;
        totalSpend += metrics.spend || 0;
        totalVideoViews += metrics.video_views || 0;
        totalEngagement += metrics.post_engagement || 0;
        totalConversions += metrics.conversions || 0;
        totalRevenue += metrics.revenue || 0;

        if (campaign) {
          campaignMetrics.push({
            id: campaign.id,
            name: campaign.name,
            impressions: metrics.impressions || 0,
            clicks: metrics.clicks || 0,
            spend: metrics.spend || 0,
            conversions: metrics.conversions || 0,
          });
        }
      });
    }

    // Calculate derived metrics
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend) * 100 : 0;

    // Sort campaigns by spend and take top 5
    const topCampaigns = campaignMetrics
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);

    console.log('[Reddit Ads] Successfully aggregated metrics:', {
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: totalSpend,
      conversions: totalConversions,
      topCampaignsCount: topCampaigns.length,
    });

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr,
      spend: totalSpend,
      cpc,
      conversions: totalConversions,
      conversionRate,
      roas,
      videoViews: totalVideoViews,
      engagement: totalEngagement,
      topCampaigns,
    };
  } catch (error) {
    console.error('[Reddit Ads] Error fetching metrics:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}
