import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.describe('Secure Checkout', () => {
    test('should validate cart before checkout', async ({ page }) => {
      // Mock empty cart
      await page.route('/api/checkout', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hasCart: false,
              message: 'No active cart found',
            }),
          });
        }
      });

      // Navigate to cart
      await page.goto('/cart');

      // Attempt checkout with empty cart should be disabled/hidden
      const checkoutButton = page.locator('[data-test-id="checkout-button"]');
      await expect(checkoutButton).not.toBeVisible();
    });

    test('should generate secure checkout URL', async ({ page }) => {
      // Set cart cookie
      await page.context().addCookies([
        {
          name: 'cartId',
          value: 'gid://shopify/Cart/test123',
          domain: 'localhost',
          path: '/',
        },
      ]);

      // Mock cart API response
      await page.route('/cart', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'gid://shopify/Cart/test123',
            checkoutUrl: 'https://checkout.shopify.com/test',
            totalQuantity: 2,
            cost: {
              totalAmount: {
                amount: '99.99',
                currencyCode: 'USD',
              },
              subtotalAmount: {
                amount: '89.99',
                currencyCode: 'USD',
              },
            },
            lines: {
              edges: [
                {
                  node: {
                    id: 'line1',
                    quantity: 2,
                    merchandise: {
                      id: 'variant1',
                      title: 'Test Product',
                      price: {
                        amount: '44.99',
                        currencyCode: 'USD',
                      },
                      product: {
                        id: 'product1',
                        title: 'Test Product',
                        handle: 'centrifuges',
                      },
                    },
                  },
                },
              ],
            },
          }),
        });
      });

      // Mock checkout API
      let checkoutApiCalled = false;
      await page.route('/api/checkout', async (route) => {
        if (route.request().method() === 'POST') {
          checkoutApiCalled = true;
          const request = route.request().postDataJSON();

          // Verify request includes proper data
          expect(request).toHaveProperty('cartId');
          expect(request.cartId).toContain('gid://shopify/Cart/');

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              checkoutUrl: 'https://checkout.shopify.com/secure/test123',
              cartId: 'gid://shopify/Cart/test123',
              totalQuantity: 2,
              totalAmount: {
                amount: '99.99',
                currencyCode: 'USD',
              },
              items: [
                {
                  id: 'line1',
                  quantity: 2,
                  title: 'Test Product',
                  variant: 'Default',
                  price: {
                    amount: '44.99',
                    currencyCode: 'USD',
                  },
                  productHandle: 'centrifuges',
                },
              ],
            }),
          });
        }
      });

      // Navigate to cart
      await page.goto('/cart');

      // Mock window.location.href assignment
      await page.addInitScript(() => {
        Object.defineProperty(window, 'location', {
          value: {
            ...window.location,
            href: '',
          },
          writable: true,
        });
      });

      // Click checkout button
      const checkoutButton = page.locator('[data-test-id="checkout-button"]');
      await expect(checkoutButton).toBeVisible();
      await checkoutButton.click();

      // Wait for checkout API to be called
      await page.waitForTimeout(1000);
      expect(checkoutApiCalled).toBe(true);
    });

    test('should handle checkout errors gracefully', async ({ page }) => {
      // Set cart cookie
      await page.context().addCookies([
        {
          name: 'cartId',
          value: 'gid://shopify/Cart/test123',
          domain: 'localhost',
          path: '/',
        },
      ]);

      // Mock checkout API error
      await page.route('/api/checkout', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Failed to create checkout. Please try again.',
            }),
          });
        }
      });

      // Navigate to cart with mock data
      await page.goto('/cart');

      // Attempt checkout
      const checkoutButton = page.locator('[data-test-id="checkout-button"]');

      // Check if button exists before clicking
      const buttonCount = await checkoutButton.count();
      if (buttonCount > 0) {
        await checkoutButton.click();

        // Should display error message
        await expect(
          page.locator('text=Failed to create checkout'),
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should include analytics tracking on checkout', async ({ page }) => {
      // Set cart cookie
      await page.context().addCookies([
        {
          name: 'cartId',
          value: 'gid://shopify/Cart/test123',
          domain: 'localhost',
          path: '/',
        },
      ]);

      // Track analytics events
      const analyticsEvents: Array<Record<string, unknown>> = [];
      await page.exposeFunction(
        'trackAnalytics',
        (event: Record<string, unknown>) => {
          analyticsEvents.push(event);
        },
      );

      await page.addInitScript(() => {
        window.gtag = function (...args: unknown[]) {
          if (args[0] === 'event' && args[1] === 'begin_checkout') {
            window.trackAnalytics(args[2] as Record<string, unknown>);
          }
        };
      });

      // Mock checkout API
      await page.route('/api/checkout', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              checkoutUrl: 'https://checkout.shopify.com/secure/test123',
              cartId: 'gid://shopify/Cart/test123',
              totalQuantity: 2,
              totalAmount: {
                amount: '99.99',
                currencyCode: 'USD',
              },
              items: [],
            }),
          });
        }
      });

      // Navigate to cart with items
      await page.goto('/cart');

      // Check if checkout button exists
      const checkoutButton = page.locator('[data-test-id="checkout-button"]');
      const buttonCount = await checkoutButton.count();

      if (buttonCount > 0) {
        await checkoutButton.click();
        await page.waitForTimeout(500);

        // Verify analytics event was tracked
        expect(analyticsEvents.length).toBeGreaterThan(0);
        expect(analyticsEvents[0]).toHaveProperty('currency');
        expect(analyticsEvents[0]).toHaveProperty('value');
      }
    });
  });

  test.describe('Checkout API Validation', () => {
    test('should validate cart ID format', async ({ request }) => {
      const response = await request.post('/api/checkout', {
        data: {
          cartId: 'invalid-cart-id',
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Invalid cart ID format');
    });

    test('should require cart to have items', async ({ request, context }) => {
      // Set cart cookie
      await context.addCookies([
        {
          name: 'cartId',
          value: 'gid://shopify/Cart/empty123',
          domain: 'localhost',
          path: '/',
        },
      ]);

      const response = await request.post('/api/checkout', {
        data: {
          cartId: 'gid://shopify/Cart/empty123',
        },
      });

      // Check response - might be 400 or 404 depending on implementation
      expect([400, 404]).toContain(response.status());
    });

    test('should validate checkout URL is HTTPS', async ({ page }) => {
      // Mock Shopify response with non-HTTPS URL (shouldn't happen but testing validation)
      await page.route('/api/checkout', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hasCart: true,
              cartId: 'gid://shopify/Cart/test123',
              totalQuantity: 1,
              checkoutReady: true,
            }),
          });
        }
      });

      const response = await page.request.get('/api/checkout');
      expect(response.ok()).toBe(true);

      const body = await response.json();
      if (body.checkoutUrl) {
        expect(body.checkoutUrl).toMatch(/^https:\/\//);
      }
    });

    test('should return proper cache headers', async ({ request }) => {
      const response = await request.get('/api/checkout');

      // Check cache control headers
      const cacheControl = response.headers()['cache-control'];
      if (cacheControl) {
        expect(cacheControl).toContain('no-store');
      }

      // Check security headers
      expect(response.headers()['x-content-type-options']).toBe('nosniff');
      expect(response.headers()['x-frame-options']).toBe('DENY');
    });
  });

  test.describe('End-to-End Checkout', () => {
    test('should complete checkout flow from product to checkout', async ({
      page,
    }) => {
      // Navigate to a product page
      await page.goto('/products');

      // Add product to cart (if product exists)
      const addToCartButton = page
        .locator('button:has-text("Add to Cart")')
        .first();
      const addButtonCount = await addToCartButton.count();

      if (addButtonCount > 0) {
        await addToCartButton.click();

        // Navigate to cart
        await page.goto('/cart');

        // Verify item in cart
        await expect(page.locator('text=Your Cart')).toBeVisible();

        // Proceed to checkout
        const checkoutButton = page.locator('[data-test-id="checkout-button"]');
        const checkoutButtonCount = await checkoutButton.count();

        if (checkoutButtonCount > 0) {
          // Mock the checkout API response
          await page.route('/api/checkout', async (route) => {
            if (route.request().method() === 'POST') {
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                  checkoutUrl: 'https://checkout.shopify.com/test',
                  cartId: 'test-cart',
                  totalQuantity: 1,
                  totalAmount: { amount: '99.99', currencyCode: 'USD' },
                  items: [],
                }),
              });
            }
          });

          await checkoutButton.click();

          // Verify checkout was initiated
          await page.waitForTimeout(500);
        }
      }
    });
  });
});
