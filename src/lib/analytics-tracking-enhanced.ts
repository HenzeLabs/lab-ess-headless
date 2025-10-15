/**
 * Enhanced Analytics Tracking for Search & Customer Account Events
 * Integrates with GA4 an          window.clarity?.(
            'set',
            'last_search_term',
            String(event.parameters.search_term),
          );rosoft Clarity for comprehensive user behavior tracking
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
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event_name, {
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
    if (typeof window !== 'undefined' && window.clarity) {
      // Track custom event in Clarity
      window.clarity('event', event.event_name, event.parameters);

      // Set custom tags for better session analysis
      if (event.event_category === 'search') {
        window.clarity('set', 'search_active', 'true');
        if (event.parameters.search_term) {
          window.clarity(
            'set',
            'last_search_term',
            String(event.parameters.search_term),
          );
        }
      }

      if (event.event_category === 'customer_account') {
        window.clarity('set', 'account_activity', 'true');
        if (event.parameters.customer_id) {
          window.clarity(
            'set',
            'customer_id',
            String(event.parameters.customer_id),
          );
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
 * Track search query event
 */
export function trackSearchQuery(
  searchTerm: string,
  resultsCount: number,
  source: 'header' | 'page' | 'predictive' = 'header',
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'search_query',
    event_category: 'search',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      search_term: searchTerm,
      search_results_count: resultsCount,
      search_source: source,
      query_length: searchTerm.length,
      has_results: resultsCount > 0,
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Track search result click event
 */
export function trackSearchResultClick(
  searchTerm: string,
  resultType: 'product' | 'collection' | 'page' | 'article',
  resultId: string,
  position: number,
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'search_result_click',
    event_category: 'search',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      search_term: searchTerm,
      result_type: resultType,
      result_id: resultId,
      result_position: position,
      click_through_rate:
        position <= 3 ? 'top_3' : position <= 10 ? 'top_10' : 'below_10',
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Track search filter application
 */
export function trackSearchFilter(
  filterType: string,
  filterValue: string,
  resultsCount: number,
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'search_filter_applied',
    event_category: 'search',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      filter_type: filterType,
      filter_value: filterValue,
      results_after_filter: resultsCount,
      filter_effectiveness: resultsCount > 0 ? 'helpful' : 'too_restrictive',
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Track search abandonment (user searched but didn't click any results)
 */
export function trackSearchAbandonment(
  searchTerm: string,
  resultsCount: number,
  timeSpent: number,
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'search_abandoned',
    event_category: 'search',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      search_term: searchTerm,
      search_results_count: resultsCount,
      time_spent_seconds: timeSpent,
      abandonment_reason:
        resultsCount === 0
          ? 'no_results'
          : timeSpent < 3
          ? 'quick_exit'
          : 'results_not_relevant',
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Track customer login event
 */
export function trackCustomerLogin(
  customerId: string,
  loginMethod: 'email' | 'social' | 'multipass' = 'email',
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'customer_login',
    event_category: 'customer_account',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      customer_id: customerId,
      login_method: loginMethod,
      login_timestamp: new Date().toISOString(),
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Track customer logout event
 */
export function trackCustomerLogout(
  customerId: string,
  sessionDuration: number,
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'customer_logout',
    event_category: 'customer_account',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      customer_id: customerId,
      session_duration_minutes: Math.round(sessionDuration / 60),
      logout_timestamp: new Date().toISOString(),
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Track customer registration event
 */
export function trackCustomerRegistration(
  customerId: string,
  registrationSource: 'header' | 'checkout' | 'account_page' = 'header',
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'customer_register',
    event_category: 'customer_account',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      customer_id: customerId,
      registration_source: registrationSource,
      registration_timestamp: new Date().toISOString(),
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Track order history view event
 */
export function trackOrderHistoryView(
  customerId: string,
  orderCount: number,
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'order_history_view',
    event_category: 'customer_account',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      customer_id: customerId,
      order_count: orderCount,
      customer_segment:
        orderCount === 0 ? 'new' : orderCount <= 5 ? 'regular' : 'vip',
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Track profile update event
 */
export function trackProfileUpdate(
  customerId: string,
  updatedField: string,
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'profile_update',
    event_category: 'customer_account',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      customer_id: customerId,
      updated_field: updatedField,
      update_timestamp: new Date().toISOString(),
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Track failed login attempt
 */
export function trackLoginFailed(
  errorReason: string,
  attemptCount: number = 1,
): void {
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const event: AnalyticsEvent = {
    event_name: 'login_failed',
    event_category: 'customer_account',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      error_reason: errorReason,
      attempt_count: attemptCount,
      security_risk:
        attemptCount >= 3 ? 'high' : attemptCount >= 2 ? 'medium' : 'low',
    },
  };

  trackGA4Event(event);
  trackClarityEvent(event);
}

/**
 * Initialize analytics tracking (call once on app startup)
 */
export function initializeAnalyticsTracking(): void {
  if (typeof window === 'undefined') return;

  // Set up global error tracking for analytics
  window.addEventListener('error', (event) => {
    console.warn('Analytics tracking error:', event.error);
  });

  // Track page views
  const pageContext = getPageContext();
  const sessionId = getSessionId();

  const pageViewEvent: AnalyticsEvent = {
    event_name: 'page_view',
    event_category: 'engagement',
    timestamp: Date.now(),
    session_id: sessionId,
    page_url: pageContext.url,
    page_title: pageContext.title,
    parameters: {
      page_type: pageContext.url.includes('/products/')
        ? 'product'
        : pageContext.url.includes('/collections/')
        ? 'collection'
        : pageContext.url.includes('/search')
        ? 'search'
        : pageContext.url.includes('/account')
        ? 'account'
        : 'other',
    },
  };

  trackGA4Event(pageViewEvent);
  trackClarityEvent(pageViewEvent);

  console.log('🚀 Analytics tracking initialized');
}

/**
 * Export all tracking functions for easy use
 */
export const AnalyticsTracker = {
  // Initialization
  initialize: initializeAnalyticsTracking,

  // Search events
  trackSearchQuery,
  trackSearchResultClick,
  trackSearchFilter,
  trackSearchAbandonment,

  // Customer account events
  trackCustomerLogin,
  trackCustomerLogout,
  trackCustomerRegistration,
  trackOrderHistoryView,
  trackProfileUpdate,
  trackLoginFailed,

  // Utilities
  getSessionId,
  getPageContext,
};
