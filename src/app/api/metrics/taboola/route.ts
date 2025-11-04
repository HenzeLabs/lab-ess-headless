import { NextRequest, NextResponse } from 'next/server';
import { fetchTaboolaMetrics } from '../../../../../lib/taboola/metrics';

export async function GET(req: NextRequest) {
  console.log('[Taboola API Route] Request received', {
    url: req.url,
    method: req.method,
  });

  try {
    const { searchParams } = new URL(req.url);
    const startDate =
      searchParams.get('start') || format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const endDate = searchParams.get('end') || format(new Date(), 'yyyy-MM-dd');

    console.log('[Taboola API Route] Calling fetchTaboolaMetrics...', {
      startDate,
      endDate,
    });

    const metrics = await fetchTaboolaMetrics(startDate, endDate);

    console.log('[Taboola API Route] fetchTaboolaMetrics returned:', {
      isNull: metrics === null,
      hasData: !!metrics,
    });

    if (!metrics) {
      return NextResponse.json(
        { error: 'Taboola not configured or no data available' },
        { status: 503 },
      );
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching Taboola metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Taboola metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Helper functions
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
