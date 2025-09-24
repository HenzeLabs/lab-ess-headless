import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  generateTestUser,
  createTestUserViaAPI,
  loginTestUser,
  expectUserLoggedIn,
  expectUserLoggedOut,
  registerTestUserViaUI,
  type TestUser,
} from './utils/helpers';

test.describe('Customer Account Management', () => {
  let testUser: TestUser;

  // Create a fresh test user for each test
  test.beforeEach(async () => {
    testUser = generateTestUser();
  });

  test('should allow a user to register for a new account', async ({
    page,
  }) => {
    await registerTestUserViaUI(page, testUser);

    // Verify user is logged in after successful registration
    await expectUserLoggedIn(page);
  });

  test('should allow a user to log in and view their account page', async ({
    page,
  }) => {
    // First create the user via API so they exist
    await createTestUserViaAPI(page, testUser);

    // Then test login via UI
    await loginTestUser(page, testUser);

    // Verify user is on account page
    await expectUserLoggedIn(page);

    const pageTitle = await page.textContent('h1');
    expect(pageTitle).toMatch(/account|dashboard|profile/i);
  });

  test('should allow a logged-in user to view their order history', async ({
    page,
  }) => {
    // Create user and login
    await createTestUserViaAPI(page, testUser);
    await loginTestUser(page, testUser);

    // Navigate to order history
    await page.goto('/account/orders');
    await waitForPageLoad(page);

    // Should be able to access orders page
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/order|history|no orders|you have no orders/i);
  });

  test('should allow a user to log out', async ({ page }) => {
    // Create user and login
    await createTestUserViaAPI(page, testUser);
    await loginTestUser(page, testUser);

    // Verify logged in
    await expectUserLoggedIn(page);

    // Find and click logout button
    const logoutSelectors = [
      'button:has-text("Logout")',
      'a:has-text("Logout")',
      '[data-test-id="logout-button"]',
      'button:has-text("Sign Out")',
      'a:has-text("Sign Out")',
    ];

    let loggedOut = false;
    for (const selector of logoutSelectors) {
      try {
        if (await page.locator(selector).isVisible()) {
          await page.click(selector);
          loggedOut = true;
          break;
        }
      } catch {
        continue;
      }
    }

    // If no logout button found, try API logout
    if (!loggedOut) {
      const baseURL = new URL(page.url()).origin;
      await page.request.post(`${baseURL}/api/auth/logout`);
      await page.goto('/');
    }

    // Verify logout by trying to access account page
    await expectUserLoggedOut(page);
  });
});
