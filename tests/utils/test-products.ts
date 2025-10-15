/**
 * Real product handles from Shopify for testing
 * These products actually exist in the store
 */

import testProducts from '../fixtures/test-products.json';

export const TEST_PRODUCTS = {
  // Primary test product
  primary: {
    handle: testProducts.testProductHandle || 'centrifuges',
    variantId: testProducts.testVariantId || 'gid://shopify/ProductVariant/42338583380027',
    title: 'Centrifuges',
  },

  // Secondary products for various test scenarios
  secondary: {
    handle: 'megavid-wifi-microscope-camera',
    title: 'MegaVID WiFi 12MP Camera',
  },

  // Multiple products for cart tests
  cart: [
    { handle: 'mxu-centrifuge', title: 'MXU Centrifuge' },
    { handle: 'cytoprep', title: 'CytoPrep Fix & Dry Station' },
    { handle: 'e8-combination-centrifuge-test-tube-microhematocrit', title: 'E8 Combination Centrifuge' },
  ],

  // All available products
  all: testProducts.products,
};

/**
 * Get a test product handle that exists in Shopify
 */
export function getTestProductHandle(): string {
  return TEST_PRODUCTS.primary.handle;
}

/**
 * Get multiple test product handles for cart tests
 */
export function getTestProductHandles(): string[] {
  return TEST_PRODUCTS.cart.map(p => p.handle);
}

/**
 * Get a random test product handle
 */
export function getRandomTestProductHandle(): string {
  const availableProducts = TEST_PRODUCTS.all.filter(p => p.available);
  const randomIndex = Math.floor(Math.random() * availableProducts.length);
  return availableProducts[randomIndex].handle;
}

/**
 * Check if a product handle exists in our test products
 */
export function isValidTestProduct(handle: string): boolean {
  return TEST_PRODUCTS.all.some(p => p.handle === handle);
}