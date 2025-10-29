import { NextRequest, NextResponse } from 'next/server';
// @ts-expect-error - lib is at project root
import { measureConfigImpact } from '../../../../../lib/ga4/metrics';
import { getAllConfig, ConfigRecord } from '@/lib/configStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const configKey = searchParams.get('key');

    // If no specific key provided, get the most recently changed config
    let targetKey = configKey;
    let changeDate: string;

    if (!targetKey) {
      const allConfigs = await getAllConfig();

      // Sort by updated_at to get most recent
      const sortedConfigs = allConfigs.sort(
        (a: ConfigRecord, b: ConfigRecord) => {
          const dateA = new Date(a.updated_at).getTime();
          const dateB = new Date(b.updated_at).getTime();
          return dateB - dateA;
        },
      );

      if (sortedConfigs.length === 0) {
        return NextResponse.json(
          { error: 'No configuration changes found' },
          { status: 404 },
        );
      }

      targetKey = sortedConfigs[0].key;
      changeDate = sortedConfigs[0].updated_at;
    } else {
      // Get change date for specific key
      const allConfigs = await getAllConfig();
      const config = allConfigs.find((c: ConfigRecord) => c.key === targetKey);

      if (!config) {
        return NextResponse.json(
          { error: `Configuration key '${targetKey}' not found` },
          { status: 404 },
        );
      }

      changeDate = config.updated_at;
    }

    // Measure impact with 7 days before/after
    if (!targetKey) {
      return NextResponse.json(
        { error: 'No target key available' },
        { status: 400 },
      );
    }

    const impact = await measureConfigImpact(targetKey, changeDate, 7, 7);

    if (!impact) {
      return NextResponse.json(
        { error: 'GA4 not configured or insufficient data to measure impact' },
        { status: 503 },
      );
    }

    return NextResponse.json({
      configKey: targetKey,
      changeDate,
      impact,
    });
  } catch (error) {
    console.error('Error measuring config impact:', error);
    return NextResponse.json(
      {
        error: 'Failed to measure configuration impact',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
