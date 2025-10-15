/**
 * Centralized test configuration
 * All test data and settings in one place
 */

import { TEST_PRODUCTS } from './utils/test-products';
import { TEST_CREDENTIALS } from './utils/test-credentials';

export const TEST_CONFIG = {
  // Base URL for tests
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  // Shopify configuration
  shopify: {
    domain: process.env.SHOPIFY_STORE_DOMAIN || 'labessentials.myshopify.com',
    storefrontToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },

  // Test products from real Shopify data
  products: TEST_PRODUCTS,

  // Test user credentials
  credentials: TEST_CREDENTIALS,

  // Test timeouts
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
    navigation: 15000,
  },

  // Feature flags for tests
  features: {
    runAuthTests: true,
    runCartTests: true,
    runCheckoutTests: true,
    runOrderTests: true,
    runPerformanceTests: false, // Disable for speed
  },
};

export default TEST_CONFIG;