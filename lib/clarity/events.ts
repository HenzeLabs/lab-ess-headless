/**
 * Microsoft Clarity Integration
 *
 * Tracks heatmaps, session recordings, and user behavior
 * to understand how configuration changes affect UX.
 */

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
  if ((window as any).clarity) {
    return;
  }

  // Load Clarity script
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (function (c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
    c[a] =
      c[a] ||
      // eslint-disable-next-line prefer-rest-params
      function () {
        // eslint-disable-next-line prefer-rest-params
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', clarityId);
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
  if (typeof window === 'undefined' || !(window as any).clarity) return;

  try {
    (window as any).clarity('event', eventName, metadata);
  } catch (error) {
    console.error('Error tracking Clarity event:', error);
  }
}

/**
 * Set custom tags for the current Clarity session
 * @param tags - Key-value pairs to tag the session
 */
export function setClarityTags(tags: Record<string, string>) {
  if (typeof window === 'undefined' || !(window as any).clarity) return;

  try {
    Object.entries(tags).forEach(([key, value]) => {
      (window as any).clarity('set', key, value);
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
  if (typeof window === 'undefined' || !(window as any).clarity) return;

  try {
    (window as any).clarity('identify', userId, sessionId, pageId);
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
  startDate: string,
  endDate: string,
): Promise<ClarityMetrics | null> {
  try {
    const projectId = process.env.CLARITY_PROJECT_ID;
    const apiKey = process.env.CLARITY_API_KEY;

    if (!projectId || !apiKey) {
      console.warn('Clarity API credentials not configured');
      return null;
    }

    // Note: Microsoft Clarity API is limited and may not have all these endpoints
    // This is a placeholder for when the API becomes more robust
    // For now, most metrics are viewed through the Clarity dashboard

    const response = await fetch(
      `https://www.clarity.ms/api/v1/projects/${projectId}/metrics?start=${startDate}&end=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      console.warn('Clarity API request failed:', response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      totalSessions: data.totalSessions || 0,
      deadClicks: data.deadClicks || 0,
      rageClicks: data.rageClicks || 0,
      quickBacks: data.quickBacks || 0,
      avgScrollDepth: data.avgScrollDepth || 0,
      heatmapUrl: data.heatmapUrl,
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

    const data = await response.json();

    return (data.sessions || []).map((session: any) => ({
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
