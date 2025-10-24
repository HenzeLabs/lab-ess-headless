/**
 * Quiz Logging System
 *
 * Tracks real user quiz completions for continuous improvement
 */

export interface QuizCompletion {
  sessionId: string;
  timestamp: string;
  answers: {
    q1: string;
    q2: string;
    q3: boolean;
    q4: number;
    q5: string;
    q6: number;
    q7: string[];
  };
  results: {
    topMatch: {
      productId: string;
      productHandle: string;
      productTitle: string;
      score: number;
    };
    otherMatches: Array<{
      productId: string;
      productHandle: string;
      productTitle: string;
      score: number;
    }>;
  };
  userAction?: 'viewed_product' | 'added_to_cart' | 'purchased' | 'restarted' | 'exited';
  selectedProduct?: string; // If user chose a different product
}

export interface QuizAnalytics {
  totalCompletions: number;
  averageAccuracy: number;
  topMatchViewRate: number;
  topMatchPurchaseRate: number;
  restartRate: number;
  questionMetrics: Record<string, any>;
}

class QuizLogger {
  private static STORAGE_KEY = 'quiz_completions';
  private static ANALYTICS_ENDPOINT = '/api/quiz/analytics';

  /**
   * Log a quiz completion
   */
  static async logCompletion(completion: Omit<QuizCompletion, 'sessionId' | 'timestamp'>): Promise<void> {
    const sessionId = this.generateSessionId();
    const timestamp = new Date().toISOString();

    const fullCompletion: QuizCompletion = {
      sessionId,
      timestamp,
      ...completion,
    };

    // Store locally (for backup/offline support)
    this.storeLocally(fullCompletion);

    // Send to server
    try {
      await this.sendToServer(fullCompletion);
    } catch (error) {
      console.error('Failed to send quiz completion to server:', error);
      // Data is still stored locally
    }
  }

  /**
   * Log user action after seeing results
   */
  static async logUserAction(
    sessionId: string,
    action: QuizCompletion['userAction'],
    selectedProduct?: string
  ): Promise<void> {
    try {
      await fetch('/api/quiz/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action,
          selectedProduct,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }

  /**
   * Get quiz analytics
   */
  static async getAnalytics(): Promise<QuizAnalytics | null> {
    try {
      const response = await fetch(this.ANALYTICS_ENDPOINT);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return null;
    }
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Store completion locally
   */
  private static storeLocally(completion: QuizCompletion): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const completions: QuizCompletion[] = stored ? JSON.parse(stored) : [];

      completions.push(completion);

      // Keep only last 100 completions
      if (completions.length > 100) {
        completions.shift();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completions));
    } catch (error) {
      console.error('Failed to store quiz completion locally:', error);
    }
  }

  /**
   * Send completion to server
   */
  private static async sendToServer(completion: QuizCompletion): Promise<void> {
    const response = await fetch('/api/quiz/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completion),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
  }

  /**
   * Get local completions (for debugging)
   */
  static getLocalCompletions(): QuizCompletion[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get local completions:', error);
      return [];
    }
  }

  /**
   * Clear local completions
   */
  static clearLocalCompletions(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export default QuizLogger;
