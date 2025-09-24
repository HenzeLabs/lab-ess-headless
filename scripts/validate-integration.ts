#!/usr/bin/env npx tsx

/**
 * Validate Shopify Integration End-to-End
 * Tests all critical functionality with real Shopify data
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test results tracker
const results: any = {
  passed: 0,
  failed: 0,
  tests: [],
};

async function test(name: string, fn: () => Promise<boolean>) {
  console.log(`\n🧪 Testing: ${name}`);
  try {
    const result = await fn();
    if (result) {
      console.log(`✅ PASSED: ${name}`);
      results.passed++;
      results.tests.push({ name, status: 'passed' });
    } else {
      console.log(`❌ FAILED: ${name}`);
      results.failed++;
      results.tests.push({ name, status: 'failed' });
    }
  } catch (error: any) {
    console.log(`❌ ERROR: ${name} - ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'error', error: error.message });
  }
}

// Test 1: Products API returns real data
async function testProductsAPI() {
  const response = await fetch(`${BASE_URL}/api/products`);
  const data = await response.json();

  return (
    response.ok &&
    data.products &&
    data.products.length > 0 &&
    data.products[0].handle !== 'test-product' &&
    !data.products[0].title.includes('Sample Product')
  );
}

// Test 2: Collections API works
async function testCollectionsAPI() {
  const response = await fetch(`${BASE_URL}/api/collections`);
  const data = await response.json();

  return response.ok && data.collections && Array.isArray(data.collections);
}

// Test 3: Cart operations work
async function testCartAPI() {
  // Create cart
  const createResponse = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      variantId: 'gid://shopify/ProductVariant/42338583380027', // Real variant ID
      quantity: 1,
    }),
  });

  return createResponse.ok;
}

// Test 4: Checkout API validates cart
async function testCheckoutAPI() {
  const response = await fetch(`${BASE_URL}/api/checkout`, {
    method: 'GET',
  });
  const data = await response.json();

  return response.ok && data.hasCart !== undefined;
}

// Test 5: Featured products returns real products
async function testFeaturedProducts() {
  const response = await fetch(`${BASE_URL}/api/featured-products`);
  const data = await response.json();

  return (
    response.ok &&
    data.products &&
    data.products.length > 0 &&
    !data.products[0].handle.includes('placeholder')
  );
}

// Test 6: Search API works
async function testSearchAPI() {
  const response = await fetch(`${BASE_URL}/api/search?q=centrifuge`);
  const data = await response.json();

  return response.ok && (data.products || data.results) && (Array.isArray(data.products) || Array.isArray(data.results));
}

// Test 7: Product by handle returns real data
async function testProductByHandle() {
  const response = await fetch(`${BASE_URL}/api/product-by-handle?handle=centrifuges`);
  const data = await response.json();

  return (
    response.ok &&
    data.product &&
    data.product.handle === 'centrifuges' &&
    data.product.title !== 'Sample Product'
  );
}

// Test 8: Health check passes
async function testHealthCheck() {
  const response = await fetch(`${BASE_URL}/api/health-check`);
  const data = await response.json();

  return response.ok && data.status === 'healthy';
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Shopify Integration Validation\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('=' .repeat(50));

  await test('Products API returns real Shopify data', testProductsAPI);
  await test('Collections API is functional', testCollectionsAPI);
  await test('Cart operations work correctly', testCartAPI);
  await test('Checkout API validates cart state', testCheckoutAPI);
  await test('Featured products are real products', testFeaturedProducts);
  await test('Search API returns results', testSearchAPI);
  await test('Product by handle works', testProductByHandle);
  await test('Health check passes', testHealthCheck);

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 RESULTS:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Shopify integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }

  return results.failed === 0;
}

// Execute if run directly
if (require.main === module) {
  runTests()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}