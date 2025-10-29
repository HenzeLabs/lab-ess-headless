import { NextRequest, NextResponse } from 'next/server';
// @ts-expect-error - lib is at project root
import { fetchGA4Metrics } from '../../../../../lib/ga4/metrics';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate =
      searchParams.get('start') || format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const endDate = searchParams.get('end') || format(new Date(), 'yyyy-MM-dd');

    const metrics = await fetchGA4Metrics(startDate, endDate);

    if (!metrics) {
      return NextResponse.json(
        { error: 'GA4 not configured or no data available' },
        { status: 503 },
      );
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching GA4 metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Helper functions (normally would import from date-fns)
function format(date: Date, _formatStr: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}
