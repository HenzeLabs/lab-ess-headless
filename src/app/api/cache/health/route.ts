import { NextResponse } from 'next/server';
import { getCacheManager } from '@/lib/cache/manager';

export async function GET() {
  try {
    const cache = getCacheManager();
    const stats = cache.getStats();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      cache: stats,
    });
  } catch (error) {
    console.error('Cache health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Cache health check failed',
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const cache = getCacheManager();
    await cache.clear();

    return NextResponse.json({
      status: 'cache cleared',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache clear failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to clear cache',
      },
      { status: 500 },
    );
  }
}
