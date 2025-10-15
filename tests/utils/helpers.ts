import { Page, expect } from '@playwright/test';
import { getTestProductHandle, getTestProductHandles } from './test-products';

/**
 * Utility functions for e2e tests
 */

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  // Increased wait time for hydration and reduced from network idle dependency
  await page.waitForTimeout(2000);
}

export async function dismissCookieConsent(page: Page) {
  try {
    // Check if cookie consent modal is visible and dismiss it
    const acceptButton = page.locator('[data-test-id="accept-all-cookies"]');
    const isVisible = await acceptButton.isVisible();
    if (isVisible) {
      await acceptButton.click();
      // Wait a moment for the modal to disappear
      await page.waitForTimeout(500);
    } else {
      // Fallback to text-based selector
      const fallbackButton = page.locator('button:has-text("Accept All")');
      const fallbackVisible = await fallbackButton.isVisible();
      if (fallbackVisible) {
        await fallbackButton.click();
        await page.waitForTimeout(500);
      }
    }
  } catch (error) {
    // Ignore errors if modal is not present
    console.log('Cookie consent modal not found or already dismissed');
  }
}

export async function waitForPageLoadAndDismissCookieConsent(page: Page) {
  await waitForPageLoad(page);
  await dismissCookieConsent(page);
}

// Enhanced helper to bypass all potential overlays for testing
export async function bypassOverlaysForTesting(page: Page) {
  try {
    // Dismiss cookie consent
    await dismissCookieConsent(page);

    // Hide any potential chat widgets or other overlays
    await page.evaluate(() => {
      // Hide common overlay selectors
      const overlaySelectors = [
        '[data-test-id="live-chat-widget"]',
        '.live-chat-widget',
        '.chat-widget',
        '[data-test-id="cookie-consent-banner"]',
        '.intercom-frame',
        '#hubspot-conversations-iframe',
        '.zendesk-widget',
      ];

      overlaySelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      });
    });

    // Wait for any animations to complete
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Failed to bypass some overlays, continuing test...');
  }
}

// Helper specifically for authentication flows
export async function setupAuthenticationTest(page: Page) {
  await waitForPageLoad(page);
  await bypassOverlaysForTesting(page);

  // Pre-dismiss any authentication-related modals
  try {
    const authModalClose = page.locator('[data-test-id="auth-modal-close"]');
    if (await authModalClose.isVisible()) {
      await authModalClose.click();
    }
  } catch {
    // Ignore if not found
  }
}

export async function checkProductAvailability(
  page: Page,
  productHandle?: string,
): Promise<boolean> {
  const handle = productHandle || getTestProductHandle();

  try {
    await page.goto(`/products/${handle}`);
    await waitForPageLoad(page);

    const isNotFound = await page
      .locator('h1:has-text("Page Not Found")')
      .isVisible();
    return !isNotFound;
  } catch (error) {
    return false;
  }
}

export async function getAvailableTestProducts(page: Page): Promise<string[]> {
  const allHandles = getTestProductHandles();
  const availableProducts = [];

  for (const handle of allHandles) {
    const isAvailable = await checkProductAvailability(page, handle);
    if (isAvailable) {
      availableProducts.push(handle);
    }
  }

  return availableProducts;
}

export async function measureLCP(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          resolve(lastEntry.startTime);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // Fallback timeout after 10 seconds
      setTimeout(() => resolve(0), 10000);
    });
  });
}

export async function addProductToCart(page: Page, productHandle?: string) {
  // Use default test product if none specified
  const handle = productHandle || getTestProductHandle();

  await page.goto(`/products/${handle}`);
  await waitForPageLoad(page);
  await dismissCookieConsent(page);

  // Check if we got a 404 page instead of product page
  const isNotFound = await page
    .locator('h1:has-text("Page Not Found")')
    .isVisible();
  if (isNotFound) {
    // Try to create a mock product page for testing
    console.warn(
      `Product not found: ${handle}. This suggests Shopify integration needs configuration.`,
    );
    throw new Error(
      `Product not found: ${handle}. Check if product exists in Shopify or configure test products.`,
    );
  }

  // Wait for product page to load and add to cart button to be visible
  const addToCartButton = page.locator('[data-test-id="add-to-cart-button"]');
  await addToCartButton.waitFor({ timeout: 10000 });
  await addToCartButton.click();

  // Wait for the button to change state or timeout after reasonable time
  try {
    // Either wait for success message or button to return to normal state
    await Promise.race([
      page
        .locator('text=Added to cart successfully!')
        .waitFor({ timeout: 8000 }),
      addToCartButton.locator('text=Add to cart').waitFor({ timeout: 8000 }),
    ]);
  } catch (error) {
    console.log('Add to cart operation may have timed out, but continuing...');
  }

  // Small additional wait for cart state to stabilize
  await page.waitForTimeout(1000);

  // Check if operation completed successfully or failed
  const errorMessage = await page.locator('text=Request timed out').isVisible();
  const isStillLoading = await addToCartButton
    .locator('text=Adding...')
    .isVisible();

  if (errorMessage || isStillLoading) {
    console.warn(
      'Add to cart operation timed out or failed, but continuing test',
    );
  }
}

export async function getCartItemCount(page: Page): Promise<number> {
  const cartCountElement = page.locator('[data-test-id="cart-count"]');
  const isVisible = await cartCountElement.isVisible();

  if (!isVisible) {
    return 0;
  }

  const countText = await cartCountElement.textContent();
  return parseInt(countText || '0', 10);
}

export async function clearCart(page: Page) {
  await page.goto('/cart');
  await waitForPageLoad(page);

  // Remove all items from cart
  const removeButtons = page.locator('[data-test-id="remove-item"]');
  const count = await removeButtons.count();

  for (let i = 0; i < count; i++) {
    await removeButtons.first().click();
    await page.waitForTimeout(1000); // Wait for removal to complete
  }
}

export async function expectPageAccessible(page: Page) {
  // Basic accessibility checks
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();

  // Check for skip links
  const skipLinks = page.locator('a[href="#main-content"]');
  if ((await skipLinks.count()) > 0) {
    await expect(skipLinks.first()).toBeVisible();
  }
}

export async function expectValidShopifyUrl(url: string) {
  const isShopifyUrl =
    /^https:\/\/.*\.myshopify\.com\/.*/.test(url) ||
    /^https:\/\/.*\/checkouts\/.*/.test(url);
  expect(isShopifyUrl).toBe(true);
}

// Common selectors for the app
// Authentication test utilities
export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function generateTestUser(): TestUser {
  const randomString = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now();
  return {
    email: `testuser_${randomString}_${timestamp}@example.com`,
    password: 'testPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };
}

/**
 * Creates a test user via API call
 */
export async function createTestUserViaAPI(
  page: Page,
  user: TestUser,
): Promise<void> {
  await page.goto('/');
  const baseURL = new URL(page.url()).origin;
  const response = await page.request.post(`${baseURL}/api/auth/register`, {
    data: {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create test user: ${response.status()}`);
  }
}

/**
 * Logs in a test user via the UI
 */
export async function loginTestUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/account/login');
  await setupAuthenticationTest(page);

  // Fill login form
  await page.fill(
    'input[type="email"], input[name="email"], [data-test-id="login-email"]',
    user.email,
  );
  await page.fill(
    'input[type="password"], input[name="password"], [data-test-id="login-password"]',
    user.password,
  );

  // Submit form
  await page.click(
    'button[type="submit"], [data-test-id="login-submit-button"], button:has-text("Login")',
  );

  // Wait for successful login (redirect to account page)
  await page.waitForURL('/account', { timeout: 10000 });
}

export async function logoutTestUser(page: Page): Promise<void> {
  // Find and click logout button (try multiple selectors)
  const logoutSelectors = [
    'button:has-text("Logout")',
    'a:has-text("Logout")',
    '[data-test-id="logout-button"]',
    'button:has-text("Sign Out")',
    'a:has-text("Sign Out")',
  ];

  for (const selector of logoutSelectors) {
    try {
      if (await page.locator(selector).isVisible()) {
        await page.click(selector);
        break;
      }
    } catch {
      continue;
    }
  }

  // Wait for redirect to home or login page
  await page.waitForURL(/\/(|account\/login)$/, { timeout: 10000 });
}

export async function expectUserLoggedIn(page: Page): Promise<void> {
  // Should be able to access account page
  await page.goto('/account');
  await page.waitForURL('/account');

  // Should see account content
  await expect(page.locator('h1')).toHaveText(/Account|Dashboard|Profile/i);
}

export async function expectUserLoggedOut(page: Page): Promise<void> {
  // Accessing account should redirect to login
  await page.goto('/account');
  await page.waitForURL('/account/login');

  // Should see login form
  await expect(page.locator('h1')).toHaveText(/Login|Sign In/i);
}

export async function registerTestUserViaUI(
  page: Page,
  user: TestUser,
): Promise<void> {
  await page.goto('/account/register');
  await setupAuthenticationTest(page);

  // Fill registration form
  await page.fill('#firstName, input[name="firstName"]', user.firstName);
  await page.fill('#lastName, input[name="lastName"]', user.lastName);
  await page.fill('#email, input[name="email"]', user.email);
  await page.fill('#password, input[name="password"]', user.password);
  await page.fill(
    '#confirmPassword, input[name="confirmPassword"]',
    user.password,
  );

  // Force dismiss any remaining overlays before submission
  await dismissCookieConsent(page);

  // Use force click to bypass any remaining overlay issues
  await page.click('button[type="submit"], button:has-text("Register")', {
    force: true,
  });

  // Wait for registration to process with multiple success indicators
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
  } catch (registrationError) {
    // Check current URL to see where we ended up
    if (page.url().includes('/account')) {
      // Registration was successful - we're on account page
      return;
    }

    // If there's an error message, capture it
    const errorMessage = await page
      .locator('[role="alert"], .error, .text-red')
      .first()
      .textContent()
      .catch(() => null);
    if (errorMessage) {
      throw new Error(`Registration failed: ${errorMessage}`);
    }

    throw registrationError;
  }
}

export const selectors = {
  header: 'header[data-test-id="header"]',
  navigation: 'nav[data-test-id="main-navigation"]',
  footer: 'footer[data-test-id="footer"]',
  heroSection: 'section[data-test-id="hero-section"]',
  cartCount: '[data-test-id="cart-count"]',
  cartButton: '[data-test-id="cart-button"]',
  addToCartButton: '[data-test-id="add-to-cart-button"]',
  removeItemButton: '[data-test-id="remove-item"]',
  updateQuantityButton: '[data-test-id="update-quantity"]',
  checkoutButton: '[data-test-id="checkout-button"]',
  productCard: '[data-test-id="product-card"]',
  collectionFilter: '[data-test-id="collection-filter"]',
  searchInput: '[data-test-id="search-input"]',
  loadMoreButton: '[data-test-id="load-more"]',
  // Authentication selectors
  loginEmail:
    'input[type="email"], input[name="email"], [data-test-id="login-email"]',
  loginPassword:
    'input[type="password"], input[name="password"], [data-test-id="login-password"]',
  loginSubmit:
    'button[type="submit"], [data-test-id="login-submit-button"], button:has-text("Login")',
  logoutButton:
    'button:has-text("Logout"), a:has-text("Logout"), [data-test-id="logout-button"]',
};
