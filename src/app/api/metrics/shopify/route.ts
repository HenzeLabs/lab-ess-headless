import { NextRequest, NextResponse } from 'next/server';
import { fetchShopifyMetrics } from '../../../../../lib/shopify/metrics';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate =
      searchParams.get('start') || format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const endDate = searchParams.get('end') || format(new Date(), 'yyyy-MM-dd');

    const metrics = await fetchShopifyMetrics(startDate, endDate);

    if (!metrics) {
      return NextResponse.json(
        { error: 'Shopify not configured or no data available' },
        { status: 503 },
      );
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching Shopify metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Shopify metrics',
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
