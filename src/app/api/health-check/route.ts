import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

/**
 * Health Check Endpoint
 * Validates application and Shopify connectivity
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      app: 'operational',
      shopify: 'checking',
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
  };

  // Test Shopify connectivity
  try {
    const testQuery = `
      query HealthCheck {
        shop {
          name
        }
      }
    `;

    const response = await shopifyFetch<{ shop: { name: string } }>({
      query: testQuery,
    });

    if (response.data?.shop?.name) {
      health.services.shopify = 'operational';
    } else {
      health.services.shopify = 'degraded';
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.shopify = 'unavailable';
    health.status = 'unhealthy';
    console.error('Health check - Shopify connection failed:', error);
  }

  // Return appropriate status code based on health
  const statusCode = health.status === 'healthy' ? 200 :
                     health.status === 'degraded' ? 206 : 503;

  return NextResponse.json(health, { status: statusCode });
}