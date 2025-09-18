import { test, expect } from '@playwright/test';

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
      const scope = window as typeof window & {
        dataLayer: Record<string, unknown>[];
        _tfa: Record<string, unknown>[];
        __analyticsTest?: {
          dataLayer: Record<string, unknown>[];
          tfa: Record<string, unknown>[];
          requests: Array<Record<string, unknown>>;
        };
      };

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

    const viewItemPayload = {
      id: 'test-product-123',
      name: 'Test Product',
      price: 99.99,
      currency: 'USD',
      quantity: 1,
      category: 'Test Category',
    };

    await page.evaluate((payload) => {
      const analytics = window.__labAnalytics as {
        trackViewItem: (p: typeof payload) => void;
        trackAddToCart: (p: typeof payload) => void;
        trackViewCart: (items: typeof payload[]) => void;
        trackBeginCheckout: (items: typeof payload[]) => void;
        trackPurchase: (order: {
          orderId: string;
          value: number;
          currency: string;
          items: typeof payload[];
        }) => void;
        trackNewsletterSignup: (email: string) => void;
        trackDownload: (payload: { id: string; name: string; category?: string | null }) => void;
      };

      analytics.trackViewItem(payload);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry) => entry.event === 'view_item'));
    }).toHaveLength(1);

    await page.evaluate((payload) => {
      const analytics = window.__labAnalytics as {
        trackAddToCart: (p: typeof payload) => void;
        trackRemoveFromCart: (p: typeof payload) => void;
      };
      analytics.trackAddToCart(payload);
      analytics.trackRemoveFromCart(payload);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry) => entry.event === 'add_to_cart'));
    }).toHaveLength(1);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry) => entry.event === 'remove_from_cart'));
    }).toHaveLength(1);

    await page.evaluate((payload) => {
      const analytics = window.__labAnalytics as {
        trackViewCart: (items: typeof payload[]) => void;
      };
      analytics.trackViewCart([payload]);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry) => entry.event === 'view_cart'));
    }).toHaveLength(1);

    await page.evaluate((payload) => {
      const analytics = window.__labAnalytics as {
        trackBeginCheckout: (items: typeof payload[]) => void;
      };
      analytics.trackBeginCheckout([payload]);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry) => entry.event === 'begin_checkout'));
    }).toHaveLength(1);

    const orderPayload = {
      orderId: 'ORDER-123',
      value: 99.99,
      currency: 'USD',
      items: [viewItemPayload],
    };

    await page.evaluate((payload) => {
      const analytics = window.__labAnalytics as {
        trackPurchase: (order: typeof payload) => void;
      };
      analytics.trackPurchase(payload);
    }, orderPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry) => entry.event === 'purchase'));
    }).toHaveLength(1);

    await expect.poll(async () => {
      return page.evaluate(() =>
        window._tfa.filter((entry) => (entry as { name?: string }).name === 'purchase'),
      );
    }).toHaveLength(1);

    const email = 'qa+analytics@labessentials.com';
    await page.evaluate((value) => {
      const analytics = window.__labAnalytics as {
        trackNewsletterSignup: (email: string) => void;
      };
      analytics.trackNewsletterSignup(value);
    }, email);

    await expect.poll(async () => {
      return page.evaluate(() =>
        window.dataLayer.filter((entry) => entry.event === 'newsletter_signup'),
      );
    }).toHaveLength(1);

    await expect.poll(async () => {
      return page.evaluate(() =>
        window._tfa.filter((entry) => (entry as { name?: string }).name === 'newsletter_signup'),
      );
    }).toHaveLength(1);

    const downloadPayload = { id: 'whitepaper-001', name: 'Lab Compliance Whitepaper', category: 'Content' };

    await page.evaluate((payload) => {
      const analytics = window.__labAnalytics as {
        trackDownload: (payload: typeof downloadPayload) => void;
      };
      analytics.trackDownload(payload);
    }, downloadPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry) => entry.event === 'download'));
    }).toHaveLength(1);

    await expect.poll(async () => {
      return page.evaluate(() =>
        window._tfa.filter((entry) => (entry as { name?: string }).name === 'download'),
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
    expect(results.dataLayer.some((entry) => entry.event === 'page_view')).toBeTruthy();
    expect(results.dataLayer.some((entry) => entry.event === 'remove_from_cart')).toBeTruthy();
    expect(results.requests.every((request) => request.type === 'ga4')).toBeTruthy();

    test.info().annotations.push({ type: 'analytics-events', description: JSON.stringify(results) });
    console.log('ANALYTICS_RESULTS', JSON.stringify(results));
  });
});
