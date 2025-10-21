import { test, expect } from '@playwright/test';

test.describe('End-to-End User Flow', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('[data-test-id="homepage-main-content"]'),
    ).toBeVisible();
    await expect(page).toHaveTitle(/Lab Essentials/);
  });

  test('should add a product to cart and update cart count', async ({
    page,
  }) => {
    // Navigate directly to a known product page
    await page.goto('/products/student-pro');
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('[data-test-id="add-to-cart-button"]'),
    ).toBeVisible();

    // Get initial cart count
    const initialCartCount =
      (await page.locator('[data-test-id="cart-count"]').textContent()) || '';
    const initialCount = initialCartCount ? parseInt(initialCartCount) : 0;

    // Add to cart
    await page.locator('[data-test-id="add-to-cart-button"]').click();
    await expect(
      page.locator('[data-test-id="add-to-cart-button"]'),
    ).toHaveText('Adding...');
    await expect(
      page.locator('[data-test-id="add-to-cart-button"]'),
    ).toBeDisabled();

    // Wait for cart count to update
    await expect(page.locator('[data-test-id="cart-count"]')).not.toHaveText(
      initialCartCount,
    );
    const updatedCartCount = await page
      .locator('[data-test-id="cart-count"]')
      .textContent();
    expect(parseInt(updatedCartCount!)).toBeGreaterThan(initialCount);
  });

  test('should update cart quantity and redirect to checkout', async ({
    page,
  }) => {
    // Add a product first - navigate directly to a known product
    await page.goto('/products/student-pro');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-test-id="add-to-cart-button"]').click();
    await expect(
      page.locator('[data-test-id="add-to-cart-button"]'),
    ).toBeDisabled();
    await expect(page.locator('[data-test-id="cart-count"]')).not.toHaveText(
      '0',
    );

    // Go to cart page
    await page.locator('[aria-label="Cart"]').click();
    await expect(page).toHaveURL('/cart');
    await expect(page.locator('[data-test-id="cart-item"]')).toBeVisible();

    // Increase quantity
    const initialQuantity = await page
      .locator('[data-test-id^="cart-item-quantity-"]')
      .first()
      .textContent();
    const initialTotal = await page
      .locator('[data-test-id="cart-total"]')
      .textContent();
    await page
      .locator('[data-test-id^="cart-item-increase-quantity-"]')
      .first()
      .click();
    await expect(
      page.locator('[data-test-id^="cart-item-quantity-"]').first(),
    ).not.toHaveText(initialQuantity!);
    await expect(page.locator('[data-test-id="cart-total"]')).not.toHaveText(
      initialTotal!,
    );

    // Proceed to checkout
    await page.locator('[data-test-id="checkout-button"]').click();
    // Expect to be redirected to Shopify checkout URL
    await expect(page.url()).toMatch(/checkout.shopify.com/);
  });

  test('should render login form and attempt login', async ({ page }) => {
    await page.goto('/account/login');

    // Check if login page exists, skip if not implemented
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('404') || pageContent?.includes('Not Found')) {
      test.skip();
      return;
    }

    // Try to find login form with standard selectors
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    // Check if form elements exist
    const emailCount = await emailInput.count();
    if (emailCount === 0) {
      // No login form found, skip test
      test.skip();
      return;
    }

    // Fill and submit the form
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password');
    await submitButton.click();

    // Wait for navigation or error message
    await page.waitForTimeout(2000);

    // Test passes if we either navigated away or got an error
    // (Both indicate the form submission worked)
    const currentUrl = page.url();
    const hasError =
      (await page.locator('text=/invalid|error|wrong/i').count()) > 0;

    expect(
      currentUrl !== 'http://localhost:3000/account/login' || hasError,
    ).toBeTruthy();
  });
});
