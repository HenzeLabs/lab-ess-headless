/**
 * Microsoft Clarity Integration
 *
 * Tracks heatmaps, session recordings, and user behavior
 * to understand how configuration changes affect UX.
 */

// Extend Window interface to include Clarity
declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

export interface ClarityMetrics {
  totalSessions: number;
  deadClicks: number;
  rageClicks: number;
  quickBacks: number;
  avgScrollDepth: number;
  heatmapUrl?: string;
}

export interface ClaritySession {
  id: string;
  url: string;
  duration: number;
  deadClicks: number;
  rageClicks: number;
  scrollDepth: number;
  timestamp: string;
}

/**
 * Initialize Microsoft Clarity tracking
 * Call this on page load to enable Clarity tracking
 */
export function initClarity() {
  if (typeof window === 'undefined') return;

  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  if (!clarityId) {
    console.warn('Clarity Project ID not configured');
    return;
  }

  // Check if Clarity is already loaded
  if (window.clarity) {
    return;
  }

  // Load Clarity script
  (function (
    c: Window & Record<string, unknown>,
    l: Document,
    a: string,
    r: string,
    i: string,
    t?: HTMLScriptElement,
    y?: Element,
  ) {
    c[a] =
      c[a] ||
      function (...args: unknown[]) {
        ((c[a] as { q?: unknown[] }).q =
          (c[a] as { q?: unknown[] }).q || []).push(args);
      };
    t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y?.parentNode?.insertBefore(t, y);
  })(window as Window & Record<string, unknown>, document, 'clarity', 'script', clarityId);
}

/**
 * Track a custom event in Clarity
 * @param eventName - Name of the event
 * @param metadata - Additional event metadata
 */
export function trackClarityEvent(
  eventName: string,
  metadata?: Record<string, string | number>,
) {
  if (typeof window === 'undefined' || !window.clarity) return;

  try {
    window.clarity('event', eventName, metadata);
  } catch (error) {
    console.error('Error tracking Clarity event:', error);
  }
}

/**
 * Set custom tags for the current Clarity session
 * @param tags - Key-value pairs to tag the session
 */
export function setClarityTags(tags: Record<string, string>) {
  if (typeof window === 'undefined' || !window.clarity) return;

  try {
    Object.entries(tags).forEach(([key, value]) => {
      window.clarity?.('set', key, value);
    });
  } catch (error) {
    console.error('Error setting Clarity tags:', error);
  }
}

/**
 * Identify a user in Clarity
 * @param userId - User identifier
 * @param sessionId - Optional session identifier
 * @param pageId - Optional page identifier
 */
export function identifyClarityUser(
  userId: string,
  sessionId?: string,
  pageId?: string,
) {
  if (typeof window === 'undefined' || !window.clarity) return;

  try {
    window.clarity('identify', userId, sessionId, pageId);
  } catch (error) {
    console.error('Error identifying Clarity user:', error);
  }
}

/**
 * Fetch Clarity metrics from the API
 * @param projectId - Clarity project ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Clarity metrics or null if unavailable
 */
export async function fetchClarityMetrics(
  _startDate: string,
  _endDate: string,
): Promise<ClarityMetrics | null> {
  try {
    const projectId = process.env.CLARITY_PROJECT_ID;
    const apiKey = process.env.CLARITY_API;

    if (!projectId || !apiKey) {
      console.warn('Clarity API credentials not configured');
      return null;
    }

    // Clarity API only supports last 1-3 days (numOfDays: 1, 2, or 3)
    // Rate limit: 10 calls per project per day
    // We fetch last 3 days for maximum coverage
    const response = await fetch(
      'https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        // Cache for 24 hours to stay within rate limits (10 calls/day)
        next: { revalidate: 86400 }, // 24 hours
      },
    );

    if (!response.ok) {
      console.warn(
        `Clarity API request failed: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = (await response.json()) as Array<{
      metricName: string;
      information?: Array<Record<string, string>>;
    }>;

    // Extract metrics from Clarity's response structure
    // The API returns an array of metric objects
    const getMetric = (metricName: string, field = 'subTotal') => {
      const metric = data.find((m) => m.metricName === metricName);
      if (!metric || !metric.information || metric.information.length === 0) {
        return 0;
      }
      return parseInt(metric.information[0][field] || '0');
    };

    const getMetricValue = (metricName: string, field: string) => {
      const metric = data.find((m) => m.metricName === metricName);
      if (!metric || !metric.information || metric.information.length === 0) {
        return 0;
      }
      return parseFloat(metric.information[0][field] || '0');
    };

    // Extract traffic data
    const trafficMetric = data.find((m) => m.metricName === 'Traffic');
    const totalSessions = trafficMetric?.information?.[0]?.totalSessionCount
      ? parseInt(trafficMetric.information[0].totalSessionCount)
      : 0;

    return {
      totalSessions,
      deadClicks: getMetric('DeadClickCount'),
      rageClicks: getMetric('RageClickCount'),
      quickBacks: getMetric('QuickbackClick'),
      avgScrollDepth: getMetricValue('ScrollDepth', 'averageScrollDepth'),
      heatmapUrl: `https://clarity.microsoft.com/projects/view/${projectId}/heatmaps`,
    };
  } catch (error) {
    console.error('Error fetching Clarity metrics:', error);
    return null;
  }
}

/**
 * Get Clarity sessions for a specific page
 * @param pageUrl - The page URL to filter by
 * @param limit - Maximum number of sessions to return
 * @returns Array of Clarity sessions
 */
export async function getClaritySessions(
  pageUrl: string,
  limit = 50,
): Promise<ClaritySession[]> {
  try {
    const projectId = process.env.CLARITY_PROJECT_ID;
    const apiKey = process.env.CLARITY_API_KEY;

    if (!projectId || !apiKey) {
      return [];
    }

    // Note: This endpoint may not exist yet in Clarity API
    // This is aspirational code for when the API is enhanced
    const response = await fetch(
      `https://www.clarity.ms/api/v1/projects/${projectId}/sessions?page=${encodeURIComponent(pageUrl)}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      sessions?: Array<{
        id: string;
        url: string;
        duration: number;
        deadClicks?: number;
        rageClicks?: number;
        scrollDepth?: number;
        timestamp: string;
      }>;
    };

    return (data.sessions || []).map((session) => ({
      id: session.id,
      url: session.url,
      duration: session.duration,
      deadClicks: session.deadClicks || 0,
      rageClicks: session.rageClicks || 0,
      scrollDepth: session.scrollDepth || 0,
      timestamp: session.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching Clarity sessions:', error);
    return [];
  }
}

/**
 * Track configuration changes in Clarity
 * This allows correlating UX issues with specific config changes
 */
export function trackConfigChange(
  configKey: string,
  oldValue: string,
  newValue: string,
) {
  trackClarityEvent('config_change', {
    key: configKey,
    old_value_length: oldValue.length,
    new_value_length: newValue.length,
  });

  setClarityTags({
    last_config_change: configKey,
    last_config_timestamp: new Date().toISOString(),
  });
}

/**
 * Track when admin dashboard is accessed
 */
export function trackAdminDashboardAccess(action: string) {
  trackClarityEvent('admin_dashboard', {
    action,
    timestamp: Date.now(),
  });
}

/**
 * Generate heatmap URL for a specific page
 * @param pageUrl - The page URL
 * @returns Clarity dashboard URL for the heatmap
 */
export function getClarityHeatmapUrl(pageUrl: string): string {
  const projectId =
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ||
    process.env.CLARITY_PROJECT_ID;

  if (!projectId) {
    return '';
  }

  const encodedUrl = encodeURIComponent(pageUrl);
  return `https://clarity.microsoft.com/projects/view/${projectId}/heatmaps?url=${encodedUrl}`;
}

/**
 * Get Clarity session replay URL
 * @param sessionId - The Clarity session ID
 * @returns URL to view the session replay
 */
export function getClarityReplayUrl(sessionId: string): string {
  const projectId =
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ||
    process.env.CLARITY_PROJECT_ID;

  if (!projectId) {
    return '';
  }

  return `https://clarity.microsoft.com/projects/view/${projectId}/sessions/${sessionId}`;
}
