import { test, expect } from '@playwright/test';

test.describe('End-to-End User Flow', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test-id="homepage-main-content"]')).toBeVisible();
    await expect(page).toHaveTitle(/Lab Essentials/);
  });

  test('should add a product to cart and update cart count', async ({ page }) => {
    await page.goto('/');
    // Navigate to a product page (assuming the first product card)
    await page.locator('[data-test-id^="product-card-"]').first().click();
    await expect(page.locator('[data-test-id="add-to-cart-button"]')).toBeVisible();

    // Get initial cart count
    const initialCartCount = await page.locator('[data-test-id="cart-count"]').textContent();
    const initialCount = initialCartCount ? parseInt(initialCartCount) : 0;

    // Add to cart
    await page.locator('[data-test-id="add-to-cart-button"]').click();
    await expect(page.locator('[data-test-id="add-to-cart-button"]')).toHaveText('Adding...');
    await expect(page.locator('[data-test-id="add-to-cart-button"]')).toBeDisabled();

    // Wait for cart count to update
    await expect(page.locator('[data-test-id="cart-count"]')).not.toHaveText(initialCartCount);
    const updatedCartCount = await page.locator('[data-test-id="cart-count"]').textContent();
    expect(parseInt(updatedCartCount!)).toBeGreaterThan(initialCount);
  });

  test('should update cart quantity and redirect to checkout', async ({ page }) => {
    // Add a product first
    await page.goto('/');
    await page.locator('[data-test-id^="product-card-"]').first().click();
    await page.locator('[data-test-id="add-to-cart-button"]').click();
    await expect(page.locator('[data-test-id="add-to-cart-button"]')).toBeDisabled();
    await expect(page.locator('[data-test-id="cart-count"]')).not.toHaveText('0');

    // Go to cart page
    await page.locator('[aria-label="Cart"]').click();
    await expect(page).toHaveURL('/cart');
    await expect(page.locator('[data-test-id="cart-item"]')).toBeVisible();

    // Increase quantity
    const initialQuantity = await page.locator('[data-test-id^="cart-item-quantity-"]').first().textContent();
    const initialTotal = await page.locator('[data-test-id="cart-total"]').textContent();
    await page.locator('[data-test-id^="cart-item-increase-quantity-"]').first().click();
    await expect(page.locator('[data-test-id^="cart-item-quantity-"]').first()).not.toHaveText(initialQuantity!);
    await expect(page.locator('[data-test-id="cart-total"]')).not.toHaveText(initialTotal!);

    // Proceed to checkout
    await page.locator('[data-test-id="checkout-button"]').click();
    // Expect to be redirected to Shopify checkout URL
    await expect(page.url()).toMatch(/checkout.shopify.com/);
  });

  test('should render login form and attempt login', async ({ page }) => {
    await page.goto('/account/login');
    await expect(page.locator('[data-test-id="login-page-title"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-form"]')).toBeVisible();

    await page.locator('[data-test-id="email-input"]').fill('test@example.com');
    await page.locator('[data-test-id="password-input"]').fill('password');
    await page.locator('[data-test-id="submit-login-button"]').click();

    // Assuming a successful login redirects to /account
    // If login fails, it should show an error message
    // For this test, we'll check for the error message as the login logic is mocked
    await expect(page.locator('[data-test-id="login-error-message"]')).toBeVisible();
    await expect(page.locator('[data-test-id="login-error-message"]')).toHaveText('Invalid email or password.');
  });
});