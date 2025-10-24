import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: Log Quiz Completion
 *
 * POST /api/quiz/completion
 *
 * Stores quiz completion data for analysis and optimization
 */

export async function POST(request: NextRequest) {
  try {
    const completion = await request.json();

    // Validate required fields
    if (!completion.sessionId || !completion.answers || !completion.results) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store in file system (for now - replace with database in production)
    const dataDir = path.join(process.cwd(), 'quiz-testing', 'data');

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dataFile = path.join(dataDir, 'completions.jsonl');

    // Append to JSONL file (one JSON object per line)
    fs.appendFileSync(dataFile, JSON.stringify(completion) + '\n');

    // Log to console for development
    console.log('Quiz completion logged:', {
      sessionId: completion.sessionId,
      timestamp: completion.timestamp,
      topMatch: completion.results.topMatch.productTitle,
    });

    return NextResponse.json({ success: true, sessionId: completion.sessionId });
  } catch (error) {
    console.error('Error logging quiz completion:', error);
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
