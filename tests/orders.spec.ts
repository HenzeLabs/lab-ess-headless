import { test, expect } from '@playwright/test';

test.describe('Orders Management', () => {
  test.describe('Orders List', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto('/account/orders');

      // Should redirect to login
      await expect(page).toHaveURL(/\/account\/login/);
    });

    test('should show empty state for users with no orders', async ({ page }) => {
      // Mock authentication
      await page.addInitScript(() => {
        localStorage.setItem('accessToken', 'mock-access-token');
      });

      // Mock API response for empty orders
      await page.route('/api/orders*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            orders: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
            },
            totalCount: 0,
          }),
        });
      });

      await page.goto('/account/orders');

      // Check for empty state
      await expect(page.locator('text=You have no orders yet')).toBeVisible();
      await expect(page.locator('text=Start Shopping')).toBeVisible();
    });

    test('should display list of orders', async ({ page }) => {
      // Mock authentication
      await page.addInitScript(() => {
        localStorage.setItem('accessToken', 'mock-access-token');
      });

      // Mock API response with orders
      await page.route('/api/orders*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            orders: [
              {
                id: 'gid://shopify/Order/123',
                cursor: 'cursor1',
                name: '#1001',
                orderNumber: 1001,
                processedAt: '2024-01-15T10:00:00Z',
                fulfillmentStatus: 'FULFILLED',
                financialStatus: 'PAID',
                currentTotalPrice: {
                  amount: '99.99',
                  currencyCode: 'USD',
                },
                lineItems: {
                  edges: [
                    {
                      node: {
                        title: 'Test Product',
                        quantity: 2,
                      },
                    },
                  ],
                },
              },
              {
                id: 'gid://shopify/Order/124',
                cursor: 'cursor2',
                name: '#1002',
                orderNumber: 1002,
                processedAt: '2024-01-10T10:00:00Z',
                fulfillmentStatus: 'UNFULFILLED',
                financialStatus: 'PENDING',
                currentTotalPrice: {
                  amount: '149.99',
                  currencyCode: 'USD',
                },
                lineItems: {
                  edges: [
                    {
                      node: {
                        title: 'Another Product',
                        quantity: 1,
                      },
                    },
                  ],
                },
              },
            ],
            pageInfo: {
              hasNextPage: true,
              hasPreviousPage: false,
              endCursor: 'cursor2',
            },
            totalCount: 2,
          }),
        });
      });

      await page.goto('/account/orders');

      // Check that orders are displayed
      await expect(page.locator('text=Order #1001')).toBeVisible();
      await expect(page.locator('text=Order #1002')).toBeVisible();

      // Check order details
      await expect(page.locator('text=$99.99')).toBeVisible();
      await expect(page.locator('text=$149.99')).toBeVisible();

      // Check status badges
      await expect(page.locator('text=PAID')).toBeVisible();
      await expect(page.locator('text=FULFILLED')).toBeVisible();
      await expect(page.locator('text=PENDING')).toBeVisible();
      await expect(page.locator('text=UNFULFILLED')).toBeVisible();

      // Check pagination
      await expect(page.locator('button:has-text("Next")')).toBeEnabled();
      await expect(page.locator('button:has-text("Previous")')).toBeDisabled();
    });

    test('should handle token refresh when access token expires', async ({ page }) => {
      // Mock authentication
      await page.addInitScript(() => {
        localStorage.setItem('accessToken', 'expired-token');
      });

      let apiCallCount = 0;

      // Mock API responses
      await page.route('/api/orders*', async (route) => {
        apiCallCount++;

        if (apiCallCount === 1) {
          // First call returns 401 (expired token)
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Invalid token' }),
          });
        } else {
          // Second call (after refresh) returns success
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              orders: [],
              pageInfo: { hasNextPage: false, hasPreviousPage: false },
              totalCount: 0,
            }),
          });
        }
      });

      // Mock refresh token endpoint
      await page.route('/api/auth/refresh', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accessToken: 'new-access-token',
            expiresIn: 900,
          }),
        });
      });

      await page.goto('/account/orders');

      // Should successfully display orders after token refresh
      await expect(page.locator('text=You have no orders yet')).toBeVisible();

      // Verify new token was stored
      const newToken = await page.evaluate(() => localStorage.getItem('accessToken'));
      expect(newToken).toBe('new-access-token');
    });

    test('should navigate to order detail page', async ({ page }) => {
      // Mock authentication
      await page.addInitScript(() => {
        localStorage.setItem('accessToken', 'mock-access-token');
      });

      // Mock API response
      await page.route('/api/orders*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            orders: [
              {
                id: 'gid://shopify/Order/123',
                cursor: 'cursor1',
                name: '#1001',
                orderNumber: 1001,
                processedAt: '2024-01-15T10:00:00Z',
                fulfillmentStatus: 'FULFILLED',
                financialStatus: 'PAID',
                currentTotalPrice: {
                  amount: '99.99',
                  currencyCode: 'USD',
                },
                lineItems: {
                  edges: [
                    {
                      node: {
                        title: 'Test Product',
                        quantity: 2,
                      },
                    },
                  ],
                },
              },
            ],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
            },
            totalCount: 1,
          }),
        });
      });

      await page.goto('/account/orders');

      // Click on View Details link
      await page.click('text=View Details');

      // Should navigate to order detail page
      await expect(page).toHaveURL(/\/account\/orders\/123/);
    });
  });

  test.describe('Order Detail', () => {
    test('should display full order details', async ({ page }) => {
      // Mock authentication
      await page.addInitScript(() => {
        localStorage.setItem('accessToken', 'mock-access-token');
      });

      // Mock API response for order detail
      await page.route('/api/orders/123', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            order: {
              id: 'gid://shopify/Order/123',
              name: '#1001',
              orderNumber: 1001,
              processedAt: '2024-01-15T10:00:00Z',
              fulfillmentStatus: 'FULFILLED',
              financialStatus: 'PAID',
              customerUrl: 'https://shop.example.com/customer/order/123',
              statusUrl: 'https://shop.example.com/order/status/123',
              currentTotalPrice: {
                amount: '99.99',
                currencyCode: 'USD',
              },
              totalShippingPrice: {
                amount: '10.00',
                currencyCode: 'USD',
              },
              totalTax: {
                amount: '8.99',
                currencyCode: 'USD',
              },
              subtotalPrice: {
                amount: '81.00',
                currencyCode: 'USD',
              },
              totalRefunded: {
                amount: '0.00',
                currencyCode: 'USD',
              },
              shippingAddress: {
                firstName: 'John',
                lastName: 'Doe',
                address1: '123 Main St',
                city: 'New York',
                province: 'NY',
                country: 'United States',
                zip: '10001',
                phone: '+1 555-1234',
              },
              billingAddress: {
                firstName: 'John',
                lastName: 'Doe',
                address1: '123 Main St',
                city: 'New York',
                province: 'NY',
                country: 'United States',
                zip: '10001',
              },
              lineItems: {
                edges: [
                  {
                    node: {
                      title: 'Test Product',
                      quantity: 2,
                      variant: {
                        id: 'variant1',
                        title: 'Size M',
                        price: {
                          amount: '40.50',
                          currencyCode: 'USD',
                        },
                        image: {
                          url: 'https://example.com/product.jpg',
                          altText: 'Test Product',
                        },
                        product: {
                          id: 'product1',
                          title: 'Test Product',
                          handle: 'centrifuges',
                        },
                      },
                      originalTotalPrice: {
                        amount: '81.00',
                        currencyCode: 'USD',
                      },
                      discountedTotalPrice: {
                        amount: '81.00',
                        currencyCode: 'USD',
                      },
                    },
                  },
                ],
              },
              fulfillments: [
                {
                  trackingCompany: 'FedEx',
                  trackingInfo: [
                    {
                      number: '123456789',
                      url: 'https://fedex.com/track/123456789',
                    },
                  ],
                  fulfillmentLineItems: {
                    edges: [
                      {
                        node: {
                          quantity: 2,
                          lineItem: {
                            title: 'Test Product',
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          }),
        });
      });

      await page.goto('/account/orders/123');

      // Check order header
      await expect(page.locator('h1:has-text("Order #1001")')).toBeVisible();
      await expect(page.locator('text=Placed on January 15, 2024')).toBeVisible();

      // Check status badges
      await expect(page.locator('text=Payment: PAID')).toBeVisible();
      await expect(page.locator('text=Fulfillment: FULFILLED')).toBeVisible();

      // Check order items
      await expect(page.locator('text=Test Product')).toBeVisible();
      await expect(page.locator('text=Size M')).toBeVisible();
      await expect(page.locator('text=Quantity: 2')).toBeVisible();

      // Check order summary
      await expect(page.locator('text=Subtotal').locator('..')).toContainText('$81.00');
      await expect(page.locator('text=Shipping').locator('..')).toContainText('$10.00');
      await expect(page.locator('text=Tax').locator('..')).toContainText('$8.99');
      await expect(page.locator('text=Total').locator('..')).toContainText('$99.99');

      // Check addresses
      await expect(page.locator('h2:has-text("Shipping Address")')).toBeVisible();
      await expect(page.locator('text=John Doe')).toBeVisible();
      await expect(page.locator('text=123 Main St')).toBeVisible();
      await expect(page.locator('text=New York, NY 10001')).toBeVisible();

      // Check tracking information
      await expect(page.locator('text=Carrier: FedEx')).toBeVisible();
      await expect(page.locator('text=Tracking #: 123456789')).toBeVisible();
      await expect(page.locator('a:has-text("Track Package")')).toBeVisible();
    });

    test('should handle order not found', async ({ page }) => {
      // Mock authentication
      await page.addInitScript(() => {
        localStorage.setItem('accessToken', 'mock-access-token');
      });

      // Mock API response for order not found
      await page.route('/api/orders/999', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Order not found',
          }),
        });
      });

      await page.goto('/account/orders/999');

      // Should show error message
      await expect(page.locator('text=Order not found')).toBeVisible();
      await expect(page.locator('text=Back to Orders')).toBeVisible();
    });
  });
});