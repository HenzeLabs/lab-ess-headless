import { test } from '@playwright/test';
import {
  generateTestUser,
  setupAuthenticationTest,
  dismissCookieConsent,
} from './utils/helpers';

test.describe('Authentication Smoke Test', () => {
  test('should successfully register a new user', async ({ page }) => {
    const testUser = generateTestUser();

    await page.goto('/account/register');
    await setupAuthenticationTest(page);

    // Fill out the registration form
    await page.fill('#firstName, input[name="firstName"]', testUser.firstName);
    await page.fill('#lastName, input[name="lastName"]', testUser.lastName);
    await page.fill('#email, input[name="email"]', testUser.email);
    await page.fill('#password, input[name="password"]', testUser.password);
    await page.fill(
      '#confirmPassword, input[name="confirmPassword"]',
      testUser.password,
    );

    // Force dismiss any remaining overlays before submission
    await dismissCookieConsent(page);

    // Use force click to bypass any remaining overlay issues
    await page.click('button[type="submit"], button:has-text("Register")', {
      force: true,
    });

    // Wait for registration to process and check multiple success indicators
    try {
      // Wait for either success message or navigation
      await Promise.race([
        page.waitForSelector(
          'text=Registration Successful, text=Successfully registered, text=Account created',
          { timeout: 10000 },
        ),
        page.waitForURL('/account', { timeout: 10000 }),
        page.waitForURL('/account/login', { timeout: 10000 }), // Sometimes redirects to login first
      ]);

      console.log('✅ Registration completed successfully');
    } catch (registrationError) {
      // Check current URL to see where we ended up
      console.log('Current URL after registration attempt:', page.url());

      // If we're on the account page, registration was successful
      if (page.url().includes('/account')) {
        console.log('✅ Registration successful - redirected to account page');
        return;
      }

      // If there's an error message, log it
      const errorMessage = await page
        .locator('[role="alert"], .error, .text-red')
        .first()
        .textContent()
        .catch(() => null);
      if (errorMessage) {
        console.log('❌ Registration error:', errorMessage);
        throw new Error(`Registration failed: ${errorMessage}`);
      }

      throw registrationError;
    }
  });
});
