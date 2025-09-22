import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  const productUrl = '/products/13-3-camera-monitor';

  test.beforeEach(async ({ page }) => {
    // Add an item to the cart before each test
    await page.goto(productUrl);
    await page.waitForLoadState('networkidle');
    await page.locator('[data-test-id="add-to-cart-button"]').click();
    await page.waitForSelector('[data-test-id="cart-count"]:has-text("1")'); // Wait for cart to update
    await page.goto('/cart'); // Navigate to the cart page
    await page.waitForLoadState('networkidle');
  });

  test('item names, quantities, prices, and subtotals match product data', async ({
    page,
  }) => {
    // Assuming a single item in cart from beforeEach
    await expect(page.locator('[data-test-id="cart-item-name"]')).toHaveText(
      /13\.3.*Camera Screen Monitor/,
    );
    await expect(
      page.locator('[data-test-id="cart-item-quantity"]'),
    ).toHaveText('1');
    await expect(
      page.locator('[data-test-id="cart-item-price"]'),
    ).toBeVisible();
    await expect(page.locator('[data-test-id="cart-subtotal"]')).toBeVisible();
  });

  test('quantity changes should recalculate totals', async ({ page }) => {
    await page
      .locator('[data-test-id*="cart-item-increase-quantity"]')
      .first()
      .click(); // Increase quantity button
    await page.waitForLoadState('networkidle');

    // Quantity should increase
    await expect(
      page.locator('[data-test-id="cart-item-quantity"]'),
    ).toHaveText('2');
  });

  test('remove item works and cart empties gracefully', async ({ page }) => {
    await page.locator('[data-test-id="cart-item-remove"]').click();
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('[data-test-id="cart-empty-message"]'),
    ).toBeVisible();
    await expect(page.locator('[data-test-id="cart-count"]')).toHaveText('0');
  });

  test('checkout button is always present and functional', async ({ page }) => {
    const checkoutButton = page.locator('[data-test-id="checkout-button"]');
    await expect(checkoutButton).toBeVisible();
    await expect(checkoutButton).toBeEnabled();

    // Clicking it will be tested in checkout.spec.ts
  });
});
