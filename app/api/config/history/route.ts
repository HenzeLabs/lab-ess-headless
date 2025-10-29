import { NextRequest, NextResponse } from 'next/server';
import { getConfigHistory } from '@/lib/configHistory';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 },
      );
    }

    const history = await getConfigHistory(key);

    if (!history) {
      return NextResponse.json(
        { error: 'Configuration key not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching config history:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch configuration history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
