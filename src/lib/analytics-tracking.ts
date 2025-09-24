/**
 * Enhanced Analytics Tracking for Search & Customer Account Events
 * Integrates with GA4 and Microsoft Clarity for comprehensive user behavior tracking
 */

// Analytics event types for search functionality
export interface SearchEvent {
  event:
    | 'search_query'
    | 'search_result_click'
    | 'search_filter_applied'
    | 'search_abandoned'
    | 'predictive_search_click';
  search_term?: string;
  search_results_count?: number;
  result_position?: number;
  result_type?: 'product' | 'collection' | 'page' | 'article';
  result_id?: string;
  filter_type?: string;
  filter_value?: string;
  session_id?: string;
  search_source?: 'header' | 'page' | 'predictive';
}

// Analytics event types for customer account functionality
export interface CustomerAccountEvent {
  event:
    | 'customer_login'
    | 'customer_logout'
    | 'customer_register'
    | 'profile_update'
    | 'order_history_view'
    | 'address_update'
    | 'login_failed';
  customer_id?: string;
  login_method?: 'email' | 'social' | 'multipass';
  registration_source?: 'header' | 'checkout' | 'account_page';
  profile_field?: string;
  order_count?: number;
  address_type?: 'shipping' | 'billing';
  error_reason?: string;
  session_id?: string;
}

// General analytics event structure
export interface AnalyticsEvent {
  event_name: string;
  event_category: 'search' | 'customer_account' | 'ecommerce' | 'engagement';
  timestamp: number;
  user_id?: string;
  session_id: string;
  page_url: string;
  page_title: string;
  user_agent?: string;
  parameters: Record<string, string | number | boolean>;
}

/**
 * Send event to Google Analytics 4
 */
export function trackGA4Event(event: AnalyticsEvent): void {
  try {
    // Check if gtag is available (Google Analytics is loaded)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as Record<string, unknown>).gtag as (
        ...args: unknown[]
      ) => void;

      gtag('event', event.event_name, {
        event_category: event.event_category,
        event_label: event.page_title,
        custom_map: {
          session_id: event.session_id,
          page_url: event.page_url,
        },
        ...event.parameters,
      });

      console.log('📊 GA4 Event Tracked:', event.event_name, event.parameters);
    } else {
      console.warn('GA4 not available, event not tracked:', event.event_name);
    }
  } catch (error) {
    console.error('Error tracking GA4 event:', error);
  }
}

/**
 * Send event to Microsoft Clarity
 */
export function trackClarityEvent(event: AnalyticsEvent): void {
  try {
    // Check if Microsoft Clarity is available
    if (typeof window !== 'undefined' && 'clarity' in window) {
      const clarity = (window as unknown as Record<string, unknown>)
        .clarity as (...args: unknown[]) => void;

      // Track custom event in Clarity
      clarity('event', event.event_name, event.parameters);

      // Set custom tags for better session analysis
      if (event.event_category === 'search') {
        clarity('set', 'search_active', 'true');
        if (event.parameters.search_term) {
          clarity('set', 'last_search_term', event.parameters.search_term);
        }
      }

      if (event.event_category === 'customer_account') {
        clarity('set', 'account_activity', 'true');
        if (event.parameters.customer_id) {
          clarity('set', 'customer_id', event.parameters.customer_id);
        }
      }

      console.log(
        '🔍 Clarity Event Tracked:',
        event.event_name,
        event.parameters,
      );
    } else {
      console.warn(
        'Microsoft Clarity not available, event not tracked:',
        event.event_name,
      );
    }
  } catch (error) {
    console.error('Error tracking Clarity event:', error);
  }
}

/**
 * Generate session ID for analytics tracking
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId =
      'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Get current page context for analytics
 */
export function getPageContext(): { url: string; title: string } {
  if (typeof window === 'undefined') {
    return { url: '', title: '' };
  }

  return {
    url: window.location.href,
    title: document.title || 'Lab Essentials',
  };
}

/**
 * Export all tracking functions for easy use
 */
export const AnalyticsTracker = {
  // Utilities
  getSessionId,
  getPageContext,
  trackGA4Event,
  trackClarityEvent,
};
