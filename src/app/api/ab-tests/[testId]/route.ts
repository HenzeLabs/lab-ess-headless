import { NextRequest, NextResponse } from 'next/server';
import {
  abTestManager,
  ABTestConfig,
} from '@/components/optimization/ABTestingFramework';
import { requireAdmin } from '@/lib/api/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ testId: string }> },
) {
  try {
    const { testId } = await params;

    const test = abTestManager.getTest(testId);
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error fetching A/B test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> },
) {
  // Require admin authentication for creating/updating tests
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { testId } = await params;
    const testConfig: ABTestConfig = await request.json();

    if (testConfig.testId !== testId) {
      return NextResponse.json({ error: 'Test ID mismatch' }, { status: 400 });
    }

    abTestManager.registerTest(testConfig);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating/updating A/B test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
