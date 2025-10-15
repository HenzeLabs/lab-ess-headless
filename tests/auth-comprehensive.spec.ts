import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  setupAuthenticationTest,
  generateTestUser,
  createTestUserViaAPI,
  loginTestUser,
  logoutTestUser,
  expectUserLoggedIn,
  expectUserLoggedOut,
  registerTestUserViaUI,
  selectors,
  type TestUser,
} from './utils/helpers';

test.describe('Authentication System - Comprehensive Test Suite', () => {
  test.describe('User Registration', () => {
    test('should successfully register a new user via UI', async ({ page }) => {
      const testUser = generateTestUser();

      await registerTestUserViaUI(page, testUser);

      // Verify user is logged in after registration
      await expectUserLoggedIn(page);
    });

    test('should show error for duplicate email registration', async ({
      page,
    }) => {
      const testUser = generateTestUser();

      // First, create the user via API
      await createTestUserViaAPI(page, testUser);

      // Now try to register with same email via UI
      await page.goto('/account/register');
      await setupAuthenticationTest(page);

      await page.fill(
        '#firstName, input[name="firstName"]',
        testUser.firstName,
      );
      await page.fill('#lastName, input[name="lastName"]', testUser.lastName);
      await page.fill('#email, input[name="email"]', testUser.email);
      await page.fill('#password, input[name="password"]', testUser.password);
      await page.fill(
        '#confirmPassword, input[name="confirmPassword"]',
        testUser.password,
      );

      await page.click('button[type="submit"], button:has-text("Register")');

      // Should show error message
      await expect(page.locator('body')).toContainText(
        /already been taken|already exists/i,
      );
    });

    test('should validate password confirmation', async ({ page }) => {
      const testUser = generateTestUser();

      await page.goto('/account/register');
      await setupAuthenticationTest(page);

      await page.fill(
        '#firstName, input[name="firstName"]',
        testUser.firstName,
      );
      await page.fill('#lastName, input[name="lastName"]', testUser.lastName);
      await page.fill('#email, input[name="email"]', testUser.email);
      await page.fill('#password, input[name="password"]', testUser.password);
      await page.fill(
        '#confirmPassword, input[name="confirmPassword"]',
        'differentPassword',
      );

      await page.click('button[type="submit"], button:has-text("Register")');

      // Should show password mismatch error
      const hasValidation = await page.locator('body').textContent();
      expect(hasValidation).toMatch(/passwords.*match|password.*confirm/i);
    });
  });

  test.describe('User Login', () => {
    let testUser: TestUser;

    test.beforeEach(async ({ page }) => {
      testUser = generateTestUser();
      await createTestUserViaAPI(page, testUser);
    });

    test('should successfully log in existing user', async ({ page }) => {
      await loginTestUser(page, testUser);
      await expectUserLoggedIn(page);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const invalidUser = { ...testUser, password: 'wrongPassword' };

      await page.goto('/account/login');
      await setupAuthenticationTest(page);

      await page.fill(selectors.loginEmail, invalidUser.email);
      await page.fill(selectors.loginPassword, invalidUser.password);
      await page.click(selectors.loginSubmit);

      // Should show error message
      await expect(page.locator('body')).toContainText(
        /invalid|incorrect|unidentified/i,
      );
    });

    test('should show error for non-existent user', async ({ page }) => {
      const nonExistentUser = generateTestUser();

      await page.goto('/account/login');
      await setupAuthenticationTest(page);

      await page.fill(selectors.loginEmail, nonExistentUser.email);
      await page.fill(selectors.loginPassword, nonExistentUser.password);
      await page.click(selectors.loginSubmit);

      // Should show error message
      await expect(page.locator('body')).toContainText(
        /unidentified|not found/i,
      );
    });
  });

  test.describe('User Logout', () => {
    let testUser: TestUser;

    test.beforeEach(async ({ page }) => {
      testUser = generateTestUser();
      await createTestUserViaAPI(page, testUser);
    });

    test('should successfully log out user', async ({ page }) => {
      await loginTestUser(page, testUser);
      await expectUserLoggedIn(page);

      await logoutTestUser(page);
      await expectUserLoggedOut(page);
    });

    test('should redirect to login when accessing protected route after logout', async ({
      page,
    }) => {
      await loginTestUser(page, testUser);
      await logoutTestUser(page);

      // Try to access account page after logout
      await page.goto('/account');
      await page.waitForURL('/account/login');

      await expect(page.locator('h1')).toContainText(/login/i);
    });
  });

  test.describe('Protected Routes', () => {
    let testUser: TestUser;

    test.beforeEach(async ({ page }) => {
      testUser = generateTestUser();
      await createTestUserViaAPI(page, testUser);
    });

    test('should redirect to login when accessing account without authentication', async ({
      page,
    }) => {
      await page.goto('/account');
      await page.waitForURL('/account/login');

      await expect(page.locator('h1')).toContainText(/login/i);
    });

    test('should allow access to account page when authenticated', async ({
      page,
    }) => {
      await loginTestUser(page, testUser);

      await page.goto('/account');
      await page.waitForURL('/account');

      await expect(page.locator('h1')).toContainText(
        /account|dashboard|profile/i,
      );
    });

    test('should allow access to order history when authenticated', async ({
      page,
    }) => {
      await loginTestUser(page, testUser);

      // Navigate to order history
      await page.goto('/account/orders');
      await waitForPageLoad(page);

      // Should be able to access orders page
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/order|history|purchase/i);
    });

    test('should redirect order history to login when not authenticated', async ({
      page,
    }) => {
      await page.goto('/account/orders');
      await page.waitForURL('/account/login');

      await expect(page.locator('h1')).toContainText(/login/i);
    });
  });

  test.describe('Complete Authentication Lifecycle', () => {
    test('should complete full auth flow: register → login → logout → login again', async ({
      page,
    }) => {
      const testUser = generateTestUser();

      // Step 1: Register new user
      await registerTestUserViaUI(page, testUser);
      await expectUserLoggedIn(page);

      // Step 2: Logout
      await logoutTestUser(page);
      await expectUserLoggedOut(page);

      // Step 3: Login again with same credentials
      await loginTestUser(page, testUser);
      await expectUserLoggedIn(page);

      // Step 4: Access protected route (order history)
      await page.goto('/account/orders');
      await waitForPageLoad(page);

      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/order|history|no orders/i);

      // Step 5: Final logout
      await logoutTestUser(page);
      await expectUserLoggedOut(page);
    });

    test('should maintain session across page refreshes', async ({ page }) => {
      const testUser = generateTestUser();
      await createTestUserViaAPI(page, testUser);

      // Login
      await loginTestUser(page, testUser);
      await expectUserLoggedIn(page);

      // Refresh page
      await page.reload();
      await waitForPageLoad(page);

      // Should still be logged in
      await expectUserLoggedIn(page);
    });

    test('should handle concurrent login attempts gracefully', async ({
      page,
      context,
    }) => {
      const testUser = generateTestUser();
      await createTestUserViaAPI(page, testUser);

      // Open a second page in same context
      const page2 = await context.newPage();

      // Login on first page
      await loginTestUser(page, testUser);
      await expectUserLoggedIn(page);

      // Try to access account on second page (should also be logged in due to shared cookies)
      await page2.goto('/account');
      await page2.waitForURL('/account');

      // Both pages should show logged in state
      await expectUserLoggedIn(page);
      await expectUserLoggedIn(page2);

      await page2.close();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully during registration', async ({
      page,
    }) => {
      // Mock network failure
      await page.route('/api/auth/register', (route) => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });

      const testUser = generateTestUser();

      await page.goto('/account/register');
      await setupAuthenticationTest(page);

      await page.fill(
        '#firstName, input[name="firstName"]',
        testUser.firstName,
      );
      await page.fill('#lastName, input[name="lastName"]', testUser.lastName);
      await page.fill('#email, input[name="email"]', testUser.email);
      await page.fill('#password, input[name="password"]', testUser.password);
      await page.fill(
        '#confirmPassword, input[name="confirmPassword"]',
        testUser.password,
      );

      await page.click('button[type="submit"], button:has-text("Register")');

      // Should show error message
      await expect(page.locator('body')).toContainText(/error|failed|server/i);
    });

    test('should handle API errors gracefully during login', async ({
      page,
    }) => {
      const testUser = generateTestUser();

      // Mock network failure
      await page.route('/api/auth/login', (route) => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });

      await page.goto('/account/login');
      await setupAuthenticationTest(page);

      await page.fill(selectors.loginEmail, testUser.email);
      await page.fill(selectors.loginPassword, testUser.password);
      await page.click(selectors.loginSubmit);

      // Should show error message
      await expect(page.locator('body')).toContainText(/error|failed|server/i);
    });

    test('should validate required fields on registration', async ({
      page,
    }) => {
      await page.goto('/account/register');
      await setupAuthenticationTest(page);

      // Try to submit empty form
      await page.click('button[type="submit"], button:has-text("Register")');

      // Should show validation errors or prevent submission
      const isStillOnRegistrationPage = page.url().includes('/register');
      expect(isStillOnRegistrationPage).toBe(true);
    });

    test('should validate required fields on login', async ({ page }) => {
      await page.goto('/account/login');
      await setupAuthenticationTest(page);

      // Try to submit empty form
      await page.click(selectors.loginSubmit);

      // Should show validation errors or prevent submission
      const isStillOnLoginPage = page.url().includes('/login');
      expect(isStillOnLoginPage).toBe(true);
    });
  });
});
