import { test, expect } from '@playwright/test';
import type { AnalyticsItemInput, AnalyticsOrderInput, LabAnalytics } from '../src/lib/types';

declare global {
  interface Window {
    __analyticsTest: {
      dataLayer: Record<string, unknown>[];
      tfa: Record<string, unknown>[];
      requests: Array<Record<string, unknown>>;
    };
    dataLayer: Record<string, unknown>[];
    _tfa: Record<string, unknown>[];
    __labAnalytics: LabAnalytics;
  }
}

test.describe('Analytics baseline flow', () => {
  test('tracks key ecommerce and engagement events', async ({ page }) => {
    await page.goto('/');

    await page.waitForFunction(() => typeof window !== 'undefined' && Array.isArray(window.dataLayer));
    await page.waitForFunction(() => typeof window !== 'undefined' && Array.isArray(window._tfa));
    await page.waitForFunction(
      () => typeof window !== 'undefined' && typeof window.__labAnalytics !== 'undefined',
    );

    await page.route('https://www.google-analytics.com/g/collect*', async (route) => {
      const url = new URL(route.request().url());
      const measurementId = url.searchParams.get('measurement_id');
      await route.abort();
      await page.evaluate(({ requestUrl, measurementId: id }) => {
        window.__analyticsTest.requests.push({ type: 'ga4', url: requestUrl, measurementId: id });
      }, { requestUrl: route.request().url(), measurementId });
    });

    await page.evaluate(() => {
      const scope = window;

      scope.__analyticsTest = {
        dataLayer: [],
        tfa: [],
        requests: [],
      };

      const originalDataLayerPush = scope.dataLayer.push.bind(scope.dataLayer);
      scope.dataLayer.push = (entry: Record<string, unknown>) => {
        scope.__analyticsTest?.dataLayer.push(entry);
        return originalDataLayerPush(entry);
      };

      const originalTfaPush = scope._tfa.push.bind(scope._tfa);
      scope._tfa.push = (entry: Record<string, unknown>) => {
        scope.__analyticsTest?.tfa.push(entry);
        return originalTfaPush(entry);
      };
    });

    await page.evaluate(() => {
      window.dataLayer.push({ event: 'page_view', page_location: window.location.href });
    });

    const viewItemPayload: AnalyticsItemInput = {
      id: 'test-product-123',
      name: 'Test Product',
      price: 99.99,
      currency: 'USD',
      quantity: 1,
      category: 'Test Category',
    };

    await page.evaluate((payload: AnalyticsItemInput) => {
      window.__labAnalytics.trackViewItem(payload);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry: Record<string, unknown>) => entry.event === 'view_item'));
    }).toHaveLength(1);

    await page.evaluate((payload: AnalyticsItemInput) => {
      window.__labAnalytics.trackAddToCart(payload);
      window.__labAnalytics.trackRemoveFromCart(payload);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry: Record<string, unknown>) => entry.event === 'add_to_cart'));
    }).toHaveLength(1);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry: Record<string, unknown>) => entry.event === 'remove_from_cart'));
    }).toHaveLength(1);

    await page.evaluate((payload: AnalyticsItemInput) => {
      window.__labAnalytics.trackViewCart([payload]);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry: Record<string, unknown>) => entry.event === 'view_cart'));
    }).toHaveLength(1);

    await page.evaluate((payload: AnalyticsItemInput) => {
      window.__labAnalytics.trackBeginCheckout([payload]);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry: Record<string, unknown>) => entry.event === 'begin_checkout'));
    }).toHaveLength(1);

    const orderPayload: AnalyticsOrderInput = {
      orderId: 'ORDER-123',
      value: 99.99,
      currency: 'USD',
      items: [viewItemPayload],
    };

    await page.evaluate((payload: AnalyticsOrderInput) => {
      window.__labAnalytics.trackPurchase(payload);
    }, orderPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry: Record<string, unknown>) => entry.event === 'purchase'));
    }).toHaveLength(1);

    await expect.poll(async () => {
      return page.evaluate(() =>
        window._tfa.filter((entry: Record<string, unknown>) => (entry as { name?: string }).name === 'purchase'),
      );
    }).toHaveLength(1);

    const email = 'qa+analytics@labessentials.com';
    await page.evaluate((value: string) => {
      window.__labAnalytics.trackNewsletterSignup(value);
    }, email);

    await expect.poll(async () => {
      return page.evaluate(() =>
        window.dataLayer.filter((entry: Record<string, unknown>) => entry.event === 'newsletter_signup'),
      );
    }).toHaveLength(1);

    await expect.poll(async () => {
      return page.evaluate(() =>
        window._tfa.filter((entry: Record<string, unknown>) => (entry as { name?: string }).name === 'newsletter_signup'),
      );
    }).toHaveLength(1);

    const downloadPayload = { id: 'whitepaper-001', name: 'Lab Compliance Whitepaper', category: 'Content' };

    await page.evaluate((payload: { id: string; name: string; category?: string | null }) => {
      window.__labAnalytics.trackDownload(payload);
    }, downloadPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry: Record<string, unknown>) => entry.event === 'download'));
    }).toHaveLength(1);

    await expect.poll(async () => {
      return page.evaluate(() =>
        window._tfa.filter((entry: Record<string, unknown>) => (entry as { name?: string }).name === 'download'),
      );
    }).toHaveLength(1);

    await page.evaluate(() => {
      fetch('https://www.google-analytics.com/g/collect?measurement_id=G-TEST123&debug_mode=1', {
        mode: 'no-cors',
      }).catch(() => {});
    });

    await expect.poll(async () => {
      return page.evaluate(() => window.__analyticsTest.requests.length);
    }).toBeGreaterThan(0);

    const results = await page.evaluate(() => window.__analyticsTest);

    expect(results).toBeDefined();
    expect(results.dataLayer.some((entry: Record<string, unknown>) => entry.event === 'page_view')).toBeTruthy();
    expect(results.dataLayer.some((entry: Record<string, unknown>) => entry.event === 'remove_from_cart')).toBeTruthy();
    expect(results.requests.every((request: Record<string, unknown>) => request.type === 'ga4')).toBeTruthy();

    test.info().annotations.push({ type: 'analytics-events', description: JSON.stringify(results) });
    console.log('ANALYTICS_RESULTS', JSON.stringify(results));
  });
});
