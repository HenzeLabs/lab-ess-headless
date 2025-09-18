import { test, expect } from '@playwright/test';

test.describe('Analytics baseline flow', () => {
  test('tracks key ecommerce and engagement events', async ({ page }) => {
    await page.goto('/');

    await page.waitForFunction(() => typeof window !== 'undefined' && Array.isArray(window.dataLayer));
    await page.waitForFunction(() => typeof window !== 'undefined' && Array.isArray(window._tfa));
    await page.waitForFunction(
      () => typeof window !== 'undefined' && typeof window.__labAnalytics !== 'undefined',
    );

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
      };

      analytics.trackViewItem(payload);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry) => entry.event === 'view_item'));
    }).toHaveLength(1);

    await page.evaluate((payload) => {
      const analytics = window.__labAnalytics as {
        trackAddToCart: (p: typeof payload) => void;
      };
      analytics.trackAddToCart(payload);
    }, viewItemPayload);

    await expect.poll(async () => {
      return page.evaluate(() => window.dataLayer.filter((entry) => entry.event === 'add_to_cart'));
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
  });
});
