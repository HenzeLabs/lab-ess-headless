import { NextRequest, NextResponse } from 'next/server';
import { fetchRedditMetrics } from '../../../../../lib/reddit/metrics';
import { format, subDays } from 'date-fns';

/**
 * GET /api/metrics/reddit
 *
 * Fetch Reddit Ads campaign metrics for a date range
 *
 * Query params:
 *   - start: Start date (YYYY-MM-DD), defaults to 7 days ago
 *   - end: End date (YYYY-MM-DD), defaults to today
 *
 * Response:
 *   - 200: RedditMetrics object
 *   - 503: Reddit Ads not configured or error
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const startDate =
    searchParams.get('start') || format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const endDate = searchParams.get('end') || format(new Date(), 'yyyy-MM-dd');

  try {
    const metrics = await fetchRedditMetrics(startDate, endDate);

    if (!metrics) {
      return NextResponse.json(
        { error: 'Reddit Ads not configured or no data available' },
        { status: 503 },
      );
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('[Reddit Ads API] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch Reddit Ads metrics',
      },
      { status: 500 },
    );
  }
}
