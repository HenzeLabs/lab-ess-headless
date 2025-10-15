/**
 * Test credentials for authentication tests
 * IMPORTANT: These should only be used in test environment
 */

export const TEST_CREDENTIALS = {
  // Valid test user (should exist in Shopify)
  validUser: {
    email: process.env.TEST_USER_EMAIL || 'test@labessentials.com',
    password: process.env.TEST_USER_PASSWORD || 'TestUser123!',
    firstName: 'Test',
    lastName: 'User',
  },

  // New user for registration tests (should not exist)
  newUser: {
    email: `test${Date.now()}@example.com`,
    password: 'NewUser123!',
    firstName: 'New',
    lastName: 'TestUser',
  },

  // Invalid credentials for negative tests
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
};

/**
 * Get test user credentials
 */
export function getTestUser() {
  return TEST_CREDENTIALS.validUser;
}

/**
 * Generate a unique test user for registration
 */
export function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    email: `test${timestamp}${random}@labessentials.test`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: `User${timestamp}`,
  };
}