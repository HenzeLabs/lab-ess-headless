import {
  AnalyticsEvent,
  UserSession,
  ProductEvent,
  PurchaseEvent,
  RealTimeMetrics,
  PerformanceMetrics,
  CustomEventDefinition,
} from './types';

// Extend window for global analytics objects
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
    analytics: AdvancedAnalytics;
  }
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_category: string;
  item_brand?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  currency: string;
  index?: number;
  item_list_name?: string;
}

interface LocationInfo {
  timezone: string;
}

export class AdvancedAnalytics {
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private customEvents: Map<string, CustomEventDefinition> = new Map();
  private currentSessionId: string | null = null;
  private userId: string | null = null;
  private gtmEnabled = false;
  private ga4MeasurementId: string | null = null;

  constructor() {
    this.loadFromStorage();
    this.initializeSession();
    this.setupPerformanceTracking();
    this.setupUnloadHandlers();
  }

  // Core Event Tracking
  track(
    eventName: string,
    properties: Record<string, unknown> = {},
    value?: number,
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateId(),
      name: eventName,
      category: this.inferCategory(eventName),
      properties,
      value,
      timestamp: new Date(),
      userId: this.userId || undefined,
      sessionId: this.currentSessionId || undefined,
      deviceType: this.getDeviceType(),
      source: this.getTrafficSource(),
      medium: this.getTrafficMedium(),
      campaign: this.getCampaign(),
    };

    this.events.push(event);
    this.updateSession();
    this.saveToStorage();

    // Send to external analytics services
    this.sendToGA4(event);
    this.sendToGTM(event);

    console.log('Analytics Event:', event);
  }

  // E-commerce Tracking
  trackProductView(product: Omit<ProductEvent, 'eventType'>): void {
    const productEvent = { ...product, eventType: 'view_item' as const };
    const productProps = { ...productEvent };
    this.track('view_item', productProps, product.price);
  }

  trackAddToCart(product: Omit<ProductEvent, 'eventType'>): void {
    const productEvent = { ...product, eventType: 'add_to_cart' as const };
    const productProps = { ...productEvent };
    this.track('add_to_cart', productProps, product.price * product.quantity);
  }

  trackPurchase(purchase: PurchaseEvent): void {
    const purchaseProps = { ...purchase };
    this.track('purchase', purchaseProps, purchase.totalValue);

    // Mark session as converted
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session) {
        session.isConverted = true;
        session.conversionValue = purchase.totalValue;
      }
    }
  }

  // Page Tracking
  trackPageView(path: string, title?: string, referrer?: string): void {
    this.track('page_view', {
      page_path: path,
      page_title:
        title || (typeof document !== 'undefined' ? document.title : ''),
      page_referrer:
        referrer || (typeof document !== 'undefined' ? document.referrer : ''),
    });

    // Update session
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session) {
        session.pageViews++;
        if (!session.exitPage || session.pageViews === 1) {
          session.exitPage = path;
        }
      }
    }
  }

  // User Identification
  identify(userId: string, traits?: Record<string, unknown>): void {
    this.userId = userId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('analytics_user_id', userId);
    }

    if (traits) {
      this.track('identify', traits);
    }

    this.saveToStorage();
  }

  // Real-time Metrics
  getRealTimeMetrics(): RealTimeMetrics {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentEvents = this.events.filter(
      (event) => event.timestamp >= oneMinuteAgo,
    );

    return {
      timestamp: now,
      activeUsers: new Set(recentEvents.map((e) => e.userId).filter(Boolean))
        .size,
      pageViews: recentEvents.filter((e) => e.name === 'page_view').length,
      eventsPerMinute: recentEvents.length,
      conversionRate: 0,
      revenue: recentEvents
        .filter((e) => e.name === 'purchase')
        .reduce((sum, e) => sum + (e.value || 0), 0),
      topPages: [],
      topEvents: [],
      deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
      trafficSources: [],
    };
  }

  // Session Management
  private initializeSession(): void {
    this.currentSessionId = this.generateSessionId();
    const session: UserSession = {
      id: this.currentSessionId,
      userId: this.userId || undefined,
      startTime: new Date(),
      pageViews: 0,
      events: [],
      landingPage:
        typeof window !== 'undefined' ? window.location.pathname : '/',
      deviceInfo: {
        type: this.getDeviceType(),
        os: this.getOS(),
        browser: this.getBrowser(),
        screenResolution:
          typeof screen !== 'undefined'
            ? `${screen.width}x${screen.height}`
            : 'unknown',
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      },
      location: this.getLocation(),
    };

    this.sessions.set(this.currentSessionId, session);
    this.saveToStorage();
  }

  private updateSession(): void {
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session) {
        session.events.push(this.events[this.events.length - 1]?.id || '');
      }
    }
  }

  // External Service Integration
  initializeGA4(measurementId: string): void {
    this.ga4MeasurementId = measurementId;
  }

  initializeGTM(_containerId: string): void {
    this.gtmEnabled = true;
  }

  private sendToGA4(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', event.name, {
        ...event.properties,
        value: event.value,
        event_category: event.category,
        user_id: event.userId,
      });
    }
  }

  private sendToGTM(event: AnalyticsEvent): void {
    if (this.gtmEnabled && typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: event.name,
        ...event.properties,
        event_category: event.category,
        event_value: event.value,
        user_id: event.userId,
        session_id: event.sessionId,
      });
    }
  }

  // Performance Tracking
  private setupPerformanceTracking(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation',
          )[0] as PerformanceNavigationTiming;
          const metrics: Partial<PerformanceMetrics> = {
            timestamp: new Date(),
            pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
            page: window.location.pathname,
            deviceType: this.getDeviceType(),
          };

          this.track('page_performance', metrics);
        }, 0);
      });
    }
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  private generateSessionId(): string {
    return 'session_' + this.generateId();
  }

  private inferCategory(eventName: string): AnalyticsEvent['category'] {
    if (
      eventName.includes('purchase') ||
      eventName.includes('cart') ||
      eventName.includes('checkout')
    ) {
      return 'ecommerce';
    }
    if (
      eventName.includes('view') ||
      eventName.includes('click') ||
      eventName.includes('scroll')
    ) {
      return 'engagement';
    }
    if (
      eventName.includes('signup') ||
      eventName.includes('subscribe') ||
      eventName.includes('convert')
    ) {
      return 'conversion';
    }
    if (eventName.includes('experiment') || eventName.includes('variant')) {
      return 'experiment';
    }
    return 'custom';
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getOS(): string {
    if (typeof navigator === 'undefined') return 'Unknown';

    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) return 'Windows';
    if (platform.includes('mac')) return 'macOS';
    if (platform.includes('linux')) return 'Linux';
    if (platform.includes('iphone') || platform.includes('ipad')) return 'iOS';
    if (platform.includes('android')) return 'Android';
    return 'Unknown';
  }

  private getBrowser(): string {
    if (typeof navigator === 'undefined') return 'Unknown';

    const userAgent = navigator.userAgent;
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome') && !userAgent.includes('Chromium'))
      return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
      return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private getLocation(): LocationInfo {
    return {
      timezone:
        typeof Intl !== 'undefined'
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : 'UTC',
    };
  }

  private getTrafficSource(): string {
    if (typeof document === 'undefined') return 'direct';

    const referrer = document.referrer;
    if (!referrer || referrer.includes(window.location.hostname))
      return 'direct';

    if (referrer.includes('google.com')) return 'google';
    if (referrer.includes('facebook.com')) return 'facebook';
    if (referrer.includes('twitter.com')) return 'twitter';
    if (referrer.includes('linkedin.com')) return 'linkedin';

    return 'referral';
  }

  private getTrafficMedium(): string {
    if (typeof window === 'undefined') return 'organic';

    const params = new URLSearchParams(window.location.search);
    return params.get('utm_medium') || 'organic';
  }

  private getCampaign(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    const params = new URLSearchParams(window.location.search);
    return params.get('utm_campaign') || undefined;
  }

  private setupUnloadHandlers(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.endSession();
      });

      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.endSession();
        }
      });
    }
  }

  private endSession(): void {
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session) {
        session.endTime = new Date();
        session.duration =
          session.endTime.getTime() - session.startTime.getTime();
        if (typeof window !== 'undefined') {
          session.exitPage = window.location.pathname;
        }
      }
    }
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem('advanced_analytics_data');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.events) {
          this.events = data.events.map(
            (e: AnalyticsEvent & { timestamp: string }) => ({
              ...e,
              timestamp: new Date(e.timestamp),
            }),
          );
        }
        if (data.sessions) {
          this.sessions = new Map(
            Object.entries(data.sessions).map(([id, session]) => [
              id,
              {
                ...(session as UserSession),
                startTime: new Date(
                  (session as UserSession & { startTime: string }).startTime,
                ),
                endTime: (session as UserSession & { endTime?: string }).endTime
                  ? new Date(
                      (session as UserSession & { endTime: string }).endTime,
                    )
                  : undefined,
              },
            ]),
          );
        }
      }

      const userId = localStorage.getItem('analytics_user_id');
      if (userId) {
        this.userId = userId;
      }
    } catch (error) {
      console.warn('Failed to load analytics data from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const data = {
        events: this.events.slice(-1000),
        sessions: Object.fromEntries(
          Array.from(this.sessions.entries()).slice(-50),
        ),
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem('advanced_analytics_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save analytics data to storage:', error);
    }
  }

  // Public API for getting analytics data
  getEvents(filter?: {
    category?: string;
    dateRange?: { start: Date; end: Date };
    userId?: string;
  }): AnalyticsEvent[] {
    let filtered = this.events;

    if (filter?.category) {
      filtered = filtered.filter((e) => e.category === filter.category);
    }

    if (filter?.dateRange) {
      filtered = filtered.filter(
        (e) =>
          e.timestamp >= filter.dateRange!.start &&
          e.timestamp <= filter.dateRange!.end,
      );
    }

    if (filter?.userId) {
      filtered = filtered.filter((e) => e.userId === filter.userId);
    }

    return filtered;
  }

  getSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }

  // Clear data (useful for testing)
  reset(): void {
    this.events = [];
    this.sessions.clear();
    this.customEvents.clear();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('advanced_analytics_data');
      localStorage.removeItem('analytics_user_id');
    }
  }
}

// Singleton instance
export const analytics = new AdvancedAnalytics();

// Global analytics object for easy access
if (typeof window !== 'undefined') {
  (window as unknown as { analytics: AdvancedAnalytics }).analytics = analytics;
}
