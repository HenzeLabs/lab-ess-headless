import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: Log User Action
 *
 * POST /api/quiz/action
 *
 * Tracks user actions after quiz completion (view, add to cart, purchase)
 */

export async function POST(request: NextRequest) {
  try {
    const actionLog = await request.json();

    // Validate required fields
    if (!actionLog.sessionId || !actionLog.action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store in file system
    const dataDir = path.join(process.cwd(), 'quiz-testing', 'data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const actionsFile = path.join(dataDir, 'actions.jsonl');

    // Append to JSONL file
    fs.appendFileSync(actionsFile, JSON.stringify(actionLog) + '\n');

    console.log('User action logged:', {
      sessionId: actionLog.sessionId,
      action: actionLog.action,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging user action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
