import { test, expect } from '@playwright/test';

test.describe('Account Functionality', () => {
  const accountUrl = '/account/login';
  const registerUrl = '/account/register';
  const loginUrl = '/account/login';

  // TODO: Set these as environment variables for CI/CD
  const TEST_EMAIL = process.env.TEST_EMAIL || 'testuser@example.com';
  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    await page.goto(accountUrl);
    await page.waitForLoadState('networkidle');
  });

  test('/account/login page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(accountUrl);
    await expect(page.locator('h1')).toHaveText(/Login/); // Adjust selector and text as needed
  });

  test.skip('register form works with temp email', async ({ page }) => {
    await page.goto(registerUrl);
    await page.waitForLoadState('networkidle');

    // TODO: Implement a temporary email service integration here
    // For now, we'll just fill out the form and expect a success message
    await page.locator('[data-test-id="register-first-name"]').fill('Test');
    await page.locator('[data-test-id="register-last-name"]').fill('User');
    await page
      .locator('[data-test-id="register-email"]')
      .fill(`temp-${Date.now()}@example.com`); // Unique email
    await page
      .locator('[data-test-id="register-password"]')
      .fill(TEST_PASSWORD);
    await page
      .locator('[data-test-id="register-confirm-password"]')
      .fill(TEST_PASSWORD);
    await page.locator('[data-test-id="register-submit-button"]').click();

    // Expect successful registration (e.g., redirect to account page or success message)
    await page.waitForURL(accountUrl, { timeout: 10000 });
    await expect(page).toHaveURL(accountUrl);
    await expect(
      page.locator('[data-test-id="registration-success-message"]'),
    ).toBeVisible(); // Adjust selector
  });

  test('login form works with env-provided test credentials', async ({
    page,
  }) => {
    await page.goto(loginUrl);
    await page.waitForLoadState('networkidle');

    await page.locator('[data-test-id="login-email"]').fill(TEST_EMAIL);
    await page.locator('[data-test-id="login-password"]').fill(TEST_PASSWORD);
    await page.locator('[data-test-id="login-submit-button"]').click();

    // Expect successful login (e.g., redirect to account page or dashboard)
    await page.waitForURL(accountUrl, { timeout: 10000 });
    await expect(page).toHaveURL(accountUrl);
  });

  test.skip('logout restores guest state', async ({ page }) => {
    // First, log in
    await page.goto(loginUrl);
    await page.waitForLoadState('networkidle');
    await page.locator('[data-test-id="login-email"]').fill(TEST_EMAIL);
    await page.locator('[data-test-id="login-password"]').fill(TEST_PASSWORD);
    await page.locator('[data-test-id="login-submit-button"]').click();
    await page.waitForURL(accountUrl, { timeout: 10000 });

    // Then, log out
    await page.locator('[data-test-id="logout-button"]').click(); // Adjust selector
    await page.waitForLoadState('networkidle');

    // Expect to be redirected to login page or homepage as a guest
    await expect(page).toHaveURL(loginUrl); // Or homepage, depending on your site's behavior
    await expect(
      page.locator('[data-test-id="logged-in-user-display"]'),
    ).not.toBeVisible(); // Should not be visible
  });
});
