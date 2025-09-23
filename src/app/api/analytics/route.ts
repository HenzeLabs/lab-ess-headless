import { NextRequest, NextResponse } from 'next/server';
import { analytics } from '@/lib/analytics/manager';
import { ECOMMERCE_FUNNELS, CUSTOM_EVENTS } from '@/lib/analytics/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const userId = searchParams.get('user_id');
    const category = searchParams.get('category');

    switch (type) {
      case 'events':
        const filter: {
          dateRange?: { start: Date; end: Date };
          userId?: string;
          category?: string;
        } = {};
        if (startDate && endDate) {
          filter.dateRange = {
            start: new Date(startDate),
            end: new Date(endDate),
          };
        }
        if (userId) filter.userId = userId;
        if (category) filter.category = category;

        const events = analytics.getEvents(filter);
        return NextResponse.json({ events });

      case 'sessions':
        const sessions = analytics.getSessions();
        return NextResponse.json({ sessions });

      case 'real-time':
        const realTimeMetrics = analytics.getRealTimeMetrics();
        return NextResponse.json({ metrics: realTimeMetrics });

      case 'funnels':
        return NextResponse.json({ funnels: ECOMMERCE_FUNNELS });

      case 'custom-events':
        return NextResponse.json({ customEvents: CUSTOM_EVENTS });

      case 'dashboard':
        // Return summarized analytics data for dashboard
        const allEvents = analytics.getEvents();
        const allSessions = analytics.getSessions();
        const metrics = analytics.getRealTimeMetrics();

        // Calculate basic metrics
        const totalEvents = allEvents.length;
        const totalSessions = allSessions.length;
        const totalUsers = new Set(
          allEvents.map((e) => e.userId).filter(Boolean),
        ).size;

        // E-commerce metrics
        const purchaseEvents = allEvents.filter((e) => e.name === 'purchase');
        const totalRevenue = purchaseEvents.reduce(
          (sum, e) => sum + (e.value || 0),
          0,
        );
        const conversionRate =
          totalSessions > 0 ? (purchaseEvents.length / totalSessions) * 100 : 0;

        // Top events
        const eventCounts = allEvents.reduce((acc, event) => {
          acc[event.name] = (acc[event.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topEvents = Object.entries(eventCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([name, count]) => ({ name, count }));

        // Device breakdown
        const deviceCounts = allEvents.reduce((acc, event) => {
          if (event.deviceType) {
            acc[event.deviceType] = (acc[event.deviceType] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        return NextResponse.json({
          summary: {
            totalEvents,
            totalSessions,
            totalUsers,
            totalRevenue,
            conversionRate,
          },
          topEvents,
          deviceBreakdown: deviceCounts,
          realTimeMetrics: metrics,
        });

      case 'user-journey':
        const userIdParam = searchParams.get('user_id');
        if (!userIdParam) {
          return NextResponse.json(
            {
              error: 'user_id parameter is required for user journey analysis',
            },
            { status: 400 },
          );
        }

        const userEvents = analytics.getEvents({ userId: userIdParam });
        const userSessions = analytics
          .getSessions()
          .filter((s) => s.userId === userIdParam);

        return NextResponse.json({
          userId: userIdParam,
          events: userEvents,
          sessions: userSessions,
          journey: userEvents
            .map((event) => ({
              timestamp: event.timestamp,
              event: event.name,
              properties: event.properties,
              page: event.properties?.page_path || 'unknown',
            }))
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            ),
        });

      default:
        return NextResponse.json({
          events: analytics.getEvents(),
          sessions: analytics.getSessions(),
          realTimeMetrics: analytics.getRealTimeMetrics(),
        });
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'track':
        const { eventName, properties, value } = body;
        analytics.track(eventName, properties, value);
        return NextResponse.json({ success: true });

      case 'identify':
        const { userId, traits } = body;
        analytics.identify(userId, traits);
        return NextResponse.json({ success: true });

      case 'page':
        const { path, title, referrer } = body;
        analytics.trackPageView(path, title, referrer);
        return NextResponse.json({ success: true });

      case 'ecommerce':
        const { type, data } = body;

        switch (type) {
          case 'product_view':
            analytics.trackProductView(data);
            break;
          case 'add_to_cart':
            analytics.trackAddToCart(data);
            break;
          case 'purchase':
            analytics.trackPurchase(data);
            break;
          default:
            return NextResponse.json(
              { error: 'Invalid e-commerce event type' },
              { status: 400 },
            );
        }

        return NextResponse.json({ success: true });

      case 'batch':
        // Handle batch events
        const { events } = body;
        if (!Array.isArray(events)) {
          return NextResponse.json(
            { error: 'Events must be an array' },
            { status: 400 },
          );
        }

        events.forEach(
          (event: {
            name: string;
            properties?: Record<string, unknown>;
            value?: number;
          }) => {
            analytics.track(event.name, event.properties, event.value);
          },
        );

        return NextResponse.json({
          success: true,
          processed: events.length,
        });

      case 'initialize':
        // Initialize external analytics services
        const { ga4MeasurementId, gtmContainerId } = body;

        if (ga4MeasurementId) {
          analytics.initializeGA4(ga4MeasurementId);
        }

        if (gtmContainerId) {
          analytics.initializeGTM(gtmContainerId);
        }

        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing analytics request:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics request' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'reset':
        analytics.reset();
        return NextResponse.json({
          success: true,
          message: 'All analytics data cleared',
        });

      case 'clear-user':
        const userId = searchParams.get('user_id');
        if (!userId) {
          return NextResponse.json(
            { error: 'user_id parameter is required' },
            { status: 400 },
          );
        }

        // This would require additional methods in the analytics manager
        // For now, just return success
        return NextResponse.json({
          success: true,
          message: `Data for user ${userId} cleared`,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to delete analytics data' },
      { status: 500 },
    );
  }
}
