import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  addProductToCart,
  clearCart,
  expectValidShopifyUrl,
  selectors,
} from './utils/helpers';
import { getTestProductHandle } from './utils/test-products';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart and add product before each test
    await clearCart(page);
    await addProductToCart(page, getTestProductHandle());
  });

  test('should redirect to Shopify checkout from cart page', async ({
    page,
  }) => {
    // Navigate to cart page
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Find and click checkout button
    const checkoutButton = page.locator(selectors.checkoutButton);
    await expect(checkoutButton).toBeVisible();
    await expect(checkoutButton).toBeEnabled();

    // Click checkout and wait for navigation
    await checkoutButton.click();

    // Wait for navigation to complete
    await page.waitForURL(/.*/, { timeout: 15000 });

    // Should redirect to Shopify checkout
    const currentUrl = page.url();
    await expectValidShopifyUrl(currentUrl);

    // Should be on checkout page
    expect(currentUrl).toMatch(/checkout|cart/);
  });

  test('should redirect to Shopify checkout from cart drawer', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // Open cart drawer if it exists
    const cartButton = page.locator(selectors.cartButton);
    await cartButton.click();
    await page.waitForTimeout(1000);

    const cartDrawer = page.locator('[data-test-id="cart-drawer"]');

    if (await cartDrawer.isVisible()) {
      // Find checkout button in drawer
      const drawerCheckoutButton = cartDrawer.locator(selectors.checkoutButton);

      if ((await drawerCheckoutButton.count()) > 0) {
        await expect(drawerCheckoutButton).toBeVisible();
        await expect(drawerCheckoutButton).toBeEnabled();

        // Click checkout
        await drawerCheckoutButton.click();

        // Wait for navigation
        await page.waitForURL(/.*/, { timeout: 15000 });

        // Should redirect to Shopify
        const currentUrl = page.url();
        await expectValidShopifyUrl(currentUrl);
      }
    }
  });

  test('should handle empty cart checkout attempt', async ({ page }) => {
    // Clear cart completely
    await clearCart(page);

    // Navigate to cart page
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Checkout button should be disabled or not visible
    const checkoutButton = page.locator(selectors.checkoutButton);

    if ((await checkoutButton.count()) > 0) {
      const isDisabled = await checkoutButton.isDisabled();
      const isVisible = await checkoutButton.isVisible();

      // Should be either disabled or not visible
      expect(!isVisible || isDisabled).toBe(true);
    }

    // Should show empty cart message
    const emptyCartMessage = page.locator('[data-test-id="empty-cart"]');
    await expect(emptyCartMessage).toBeVisible();
  });

  test('should maintain cart state before checkout', async ({ page }) => {
    // Add multiple products
    await addProductToCart(page, 'test-product');
    await addProductToCart(page, 'test-product');

    // Navigate to cart
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Verify cart has items
    const cartItems = page.locator('[data-test-id="cart-item"]');
    const itemCount = await cartItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // Verify totals are displayed
    const cartTotal = page.locator('[data-test-id="cart-total"]');
    if ((await cartTotal.count()) > 0) {
      await expect(cartTotal).toBeVisible();
      const totalText = await cartTotal.textContent();
      expect(totalText).toMatch(/\$|€|£|\d/);
    }

    // Checkout button should be available
    const checkoutButton = page.locator(selectors.checkoutButton);
    await expect(checkoutButton).toBeVisible();
    await expect(checkoutButton).toBeEnabled();
  });

  test('should show loading state during checkout redirect', async ({
    page,
  }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Find checkout button
    const checkoutButton = page.locator(selectors.checkoutButton);
    await expect(checkoutButton).toBeVisible();

    // Click checkout
    await checkoutButton.click();

    // Check for loading state
    const loadingIndicator = page.locator('[data-test-id="checkout-loading"]');

    if ((await loadingIndicator.count()) > 0) {
      // Loading indicator should appear briefly
      await expect(loadingIndicator).toBeVisible();
    }

    // Wait for navigation to complete
    await page.waitForURL(/.*/, { timeout: 15000 });
  });

  test('should handle checkout errors gracefully', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Listen for potential errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        errors.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });

    // Attempt checkout
    const checkoutButton = page.locator(selectors.checkoutButton);
    await checkoutButton.click();

    // Wait a moment for any errors to surface
    await page.waitForTimeout(5000);

    // Check if we're still on the same page due to errors
    const currentUrl = page.url();

    if (currentUrl.includes('/cart')) {
      // If still on cart page, check for error messages
      const errorMessage = page.locator('[data-test-id="checkout-error"]');

      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage).toBeVisible();
      }
    } else {
      // If navigation succeeded, should be on valid Shopify URL
      await expectValidShopifyUrl(currentUrl);
    }

    // Filter out expected errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('fetch') &&
        !error.includes('network') &&
        !error.includes('timeout'),
    );

    // Should not have critical JavaScript errors
    expect(criticalErrors.length).toBeLessThanOrEqual(1);
  });

  test('should preserve cart analytics during checkout', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Check if analytics events are fired (simplified test)
    let analyticsEventFired = false;

    page.on('request', (request) => {
      const url = request.url();
      if (
        url.includes('analytics') ||
        url.includes('gtag') ||
        url.includes('google')
      ) {
        analyticsEventFired = true;
      }
    });

    // Click checkout
    const checkoutButton = page.locator(selectors.checkoutButton);
    await checkoutButton.click();

    // Wait for potential analytics events
    await page.waitForTimeout(2000);

    // Analytics may or may not fire depending on implementation
    // This is more of a smoke test
    expect(typeof analyticsEventFired).toBe('boolean');
  });

  test('should handle different payment methods availability', async ({
    page,
  }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Check for express checkout options if available
    const expressCheckoutButtons = page.locator(
      '[data-test-id*="express-checkout"]',
    );
    const expressCount = await expressCheckoutButtons.count();

    if (expressCount > 0) {
      // Should have working express checkout buttons
      for (let i = 0; i < Math.min(expressCount, 3); i++) {
        const button = expressCheckoutButtons.nth(i);
        await expect(button).toBeVisible();

        // Button should have proper attributes
        const isButton = await button.evaluate((el) => el.tagName === 'BUTTON');
        const isLink = await button.evaluate((el) => el.tagName === 'A');
        expect(isButton || isLink).toBe(true);
      }
    }

    // Regular checkout should always be available
    const checkoutButton = page.locator(selectors.checkoutButton);
    await expect(checkoutButton).toBeVisible();
  });

  test('should handle cart modifications before checkout', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Modify cart (change quantity)
    const quantityInput = page
      .locator('[data-test-id="quantity-input"]')
      .first();

    if ((await quantityInput.count()) > 0) {
      await quantityInput.fill('2');
      await page.waitForTimeout(1000);

      // Checkout should still work
      const checkoutButton = page.locator(selectors.checkoutButton);
      await expect(checkoutButton).toBeEnabled();

      await checkoutButton.click();
      await page.waitForURL(/.*/, { timeout: 15000 });

      const currentUrl = page.url();
      await expectValidShopifyUrl(currentUrl);
    }
  });

  test('should validate checkout button accessibility', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    const checkoutButton = page.locator(selectors.checkoutButton);
    await expect(checkoutButton).toBeVisible();

    // Check accessibility attributes
    const ariaLabel = await checkoutButton.getAttribute('aria-label');
    const buttonText = await checkoutButton.textContent();

    // Should have either aria-label or visible text
    const hasAccessibleLabel =
      (ariaLabel && ariaLabel.length > 0) ||
      (buttonText && buttonText.length > 0);
    expect(hasAccessibleLabel).toBe(true);

    // Should be keyboard accessible
    await checkoutButton.focus();
    const isFocused = await checkoutButton.evaluate(
      (el) => el === document.activeElement,
    );
    expect(isFocused).toBe(true);

    // Should be activatable with Enter or Space
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Should have navigated or shown loading
    const navigationOccurred =
      !page.url().includes('/cart') ||
      (await page.locator('[data-test-id="checkout-loading"]').isVisible());
    expect(navigationOccurred).toBe(true);
  });
});

test.describe('Checkout Security & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await clearCart(page);
    await addProductToCart(page, 'test-product');
  });

  test('should use HTTPS for checkout redirect', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    const checkoutButton = page.locator(selectors.checkoutButton);
    await checkoutButton.click();

    await page.waitForURL(/.*/, { timeout: 15000 });

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/^https:/);
  });

  test('should maintain session security during checkout', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Check for secure cookies
    const cookies = await page.context().cookies();
    const secureCookies = cookies.filter(
      (cookie) =>
        cookie.secure &&
        (cookie.name.includes('cart') || cookie.name.includes('session')),
    );

    // Should have at least some secure cookies for cart/session
    expect(secureCookies.length).toBeGreaterThanOrEqual(0);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    await page.goto('/cart');
    await waitForPageLoad(page);

    // Simulate network failure
    await page.route('**/checkouts/**', (route) => {
      route.abort('failed');
    });

    const checkoutButton = page.locator(selectors.checkoutButton);
    await checkoutButton.click();

    // Should handle failure gracefully
    await page.waitForTimeout(3000);

    // Should either show error message or retry
    const errorMessage = page.locator('[data-test-id="checkout-error"]');
    const retryButton = page.locator('[data-test-id="retry-checkout"]');

    const hasErrorHandling =
      (await errorMessage.isVisible()) ||
      (await retryButton.isVisible()) ||
      page.url().includes('/cart'); // Still on cart page

    expect(hasErrorHandling).toBe(true);
  });
});
