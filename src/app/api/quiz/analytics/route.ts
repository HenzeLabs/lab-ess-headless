import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: Get Quiz Analytics
 *
 * GET /api/quiz/analytics
 *
 * Returns aggregated quiz performance metrics
 */

interface QuizCompletion {
  sessionId: string;
  timestamp: string;
  answers: Record<string, unknown>;
  results: {
    topMatch: {
      productHandle: string;
      score: number;
    };
  };
}

interface UserAction {
  sessionId: string;
  action: string;
  selectedProduct?: string;
  timestamp: string;
}

export async function GET(_request: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), 'quiz-testing', 'data');
    const completionsFile = path.join(dataDir, 'completions.jsonl');
    const actionsFile = path.join(dataDir, 'actions.jsonl');

    // Check if data files exist
    if (!fs.existsSync(completionsFile)) {
      return NextResponse.json({
        totalCompletions: 0,
        averageAccuracy: 0,
        topMatchViewRate: 0,
        topMatchPurchaseRate: 0,
        restartRate: 0,
        message: 'No data available yet',
      });
    }

    // Load completions
    const completionsData = fs.readFileSync(completionsFile, 'utf-8');
    const completions: QuizCompletion[] = completionsData
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));

    // Load actions
    let actions: UserAction[] = [];
    if (fs.existsSync(actionsFile)) {
      const actionsData = fs.readFileSync(actionsFile, 'utf-8');
      actions = actionsData
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));
    }

    // Calculate metrics
    const totalCompletions = completions.length;

    // Map actions to sessions
    const sessionActions = new Map<string, UserAction[]>();
    actions.forEach((action) => {
      const existing = sessionActions.get(action.sessionId) || [];
      existing.push(action);
      sessionActions.set(action.sessionId, existing);
    });

    // Calculate rates
    let viewCount = 0;
    let purchaseCount = 0;
    let restartCount = 0;

    completions.forEach((completion) => {
      const userActions = sessionActions.get(completion.sessionId) || [];

      if (userActions.some((a) => a.action === 'viewed_product')) {
        viewCount++;
      }

      if (userActions.some((a) => a.action === 'purchased')) {
        purchaseCount++;
      }

      if (userActions.some((a) => a.action === 'restarted')) {
        restartCount++;
      }
    });

    const topMatchViewRate = totalCompletions > 0 ? viewCount / totalCompletions : 0;
    const topMatchPurchaseRate = totalCompletions > 0 ? purchaseCount / totalCompletions : 0;
    const restartRate = totalCompletions > 0 ? restartCount / totalCompletions : 0;

    // Calculate average score (as proxy for accuracy)
    const avgScore =
      completions.reduce((sum, c) => sum + c.results.topMatch.score, 0) / totalCompletions;

    // Question metrics
    const questionMetrics: Record<string, Record<string, number>> = {};

    // Analyze Q1 (sample type)
    const q1Counts: Record<string, number> = {};
    completions.forEach((c) => {
      const answer = c.answers.q1;
      q1Counts[String(answer)] = (q1Counts[String(answer)] || 0) + 1;
    });
    questionMetrics.q1_distribution = q1Counts;

    // Analyze Q5 (persona)
    const q5Counts: Record<string, number> = {};
    completions.forEach((c) => {
      const answer = c.answers.q5;
      q5Counts[String(answer)] = (q5Counts[String(answer)] || 0) + 1;
    });
    questionMetrics.q5_distribution = q5Counts;

    const analytics = {
      totalCompletions,
      averageAccuracy: avgScore * 100, // Convert to percentage
      topMatchViewRate: topMatchViewRate * 100,
      topMatchPurchaseRate: topMatchPurchaseRate * 100,
      restartRate: restartRate * 100,
      questionMetrics,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
