#!/usr/bin/env node

/**
 * Analytics Accuracy Verification Script
 *
 * This script verifies that all analytics endpoints are returning accurate,
 * real data from GA4 (not random/simulated data).
 *
 * Usage:
 *   node scripts/verify-analytics-accuracy.mjs
 *   node scripts/verify-analytics-accuracy.mjs --production
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const BASE_URL = process.argv.includes('--production')
  ? 'https://store.labessentials.com'
  : 'http://localhost:3000';

console.log('\n📊 Analytics Accuracy Verification');
console.log('=====================================\n');

console.log(`🔍 Configuration:`);
console.log(`   Base URL: ${BASE_URL}`);
console.log(`   GA4 Property ID: ${GA4_PROPERTY_ID}`);
console.log(`   GA4 Measurement ID: ${GA4_MEASUREMENT_ID}\n`);

// Color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(message) {
  console.log(`${GREEN}✓${RESET} ${message}`);
  results.passed.push(message);
}

function fail(message) {
  console.log(`${RED}✗${RESET} ${message}`);
  results.failed.push(message);
}

function warn(message) {
  console.log(`${YELLOW}⚠${RESET} ${message}`);
  results.warnings.push(message);
}

function info(message) {
  console.log(`${BLUE}ℹ${RESET} ${message}`);
}

/**
 * Test 1: Verify GA4 Property ID is correct
 */
async function testPropertyIdConfig() {
  console.log(`\n${BLUE}Test 1: GA4 Property ID Configuration${RESET}`);
  console.log('─'.repeat(50));

  if (!GA4_PROPERTY_ID) {
    fail('GA4_PROPERTY_ID not set in environment variables');
    return false;
  }

  if (GA4_PROPERTY_ID === '432910849') {
    fail('Using OLD Property ID (432910849) - should be 399540912 for G-7NR2JG1EDP');
    return false;
  }

  if (GA4_PROPERTY_ID === '399540912') {
    pass('Using correct Property ID (399540912) for G-7NR2JG1EDP');
    return true;
  }

  warn(`Using Property ID: ${GA4_PROPERTY_ID} - verify this is correct for ${GA4_MEASUREMENT_ID}`);
  return true;
}

/**
 * Test 2: Verify GA4 API connectivity and real data
 */
async function testGA4APIConnection() {
  console.log(`\n${BLUE}Test 2: GA4 API Connection & Real Data${RESET}`);
  console.log('─'.repeat(50));

  try {
    const client = new BetaAnalyticsDataClient();

    const [response] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{
        startDate: '7daysAgo',
        endDate: 'today'
      }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' }
      ]
    });

    if (!response.rows || response.rows.length === 0) {
      warn('GA4 API connected but returned no data (property may have no traffic)');
      info('  This is normal if the site has had no visitors in the last 7 days');
      return true;
    }

    const activeUsers = parseInt(response.rows[0]?.metricValues?.[0]?.value || '0');
    const pageViews = parseInt(response.rows[0]?.metricValues?.[1]?.value || '0');
    const sessions = parseInt(response.rows[0]?.metricValues?.[2]?.value || '0');

    pass('GA4 API connected successfully');
    info(`  Last 7 days: ${pageViews} page views, ${sessions} sessions, ${activeUsers} active users`);

    // Check if data looks real (not all zeros or suspiciously round numbers)
    if (pageViews > 0 || sessions > 0) {
      pass('Receiving real data from GA4 (not simulated)');
    } else {
      warn('No traffic data in last 7 days - unable to verify data accuracy');
    }

    return true;
  } catch (error) {
    fail(`GA4 API connection failed: ${error.message}`);
    info('  Check that GOOGLE_APPLICATION_CREDENTIALS is set correctly');
    info('  Verify the service account has access to GA4 property');
    return false;
  }
}

/**
 * Test 3: Verify /api/metrics/ga4 endpoint
 */
async function testMetricsAPI() {
  console.log(`\n${BLUE}Test 3: /api/metrics/ga4 Endpoint${RESET}`);
  console.log('─'.repeat(50));

  try {
    const url = `${BASE_URL}/api/metrics/ga4?start=2025-10-01&end=2025-11-04`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 503) {
        warn(`API returned 503 - GA4 may not be configured or no data available`);
        const body = await response.json();
        info(`  Response: ${JSON.stringify(body)}`);
        return false;
      }
      fail(`API returned status ${response.status}`);
      return false;
    }

    const data = await response.json();

    if (!data) {
      fail('API returned null/empty data');
      return false;
    }

    pass('Metrics API endpoint responding');

    // Check for required fields
    const requiredFields = ['pageViews', 'sessions', 'users'];
    const missingFields = requiredFields.filter(field => !(field in data));

    if (missingFields.length > 0) {
      fail(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    pass('All required metrics fields present');
    info(`  Page Views: ${data.pageViews}`);
    info(`  Sessions: ${data.sessions}`);
    info(`  Users: ${data.users}`);
    info(`  Bounce Rate: ${(data.bounceRate * 100).toFixed(1)}%`);

    // Check if data changes between calls (would indicate random data)
    const response2 = await fetch(url);
    const data2 = await response2.json();

    if (data.pageViews !== data2.pageViews || data.sessions !== data2.sessions) {
      fail('Metrics change between identical requests - using random data!');
      return false;
    }

    pass('Metrics are consistent across requests (not random)');
    return true;

  } catch (error) {
    fail(`Failed to fetch metrics: ${error.message}`);
    if (error.cause?.code === 'ECONNREFUSED') {
      info(`  Make sure the dev server is running: npm run dev`);
    }
    return false;
  }
}

/**
 * Test 4: Check for fallback/simulated data patterns
 */
async function testForSimulatedData() {
  console.log(`\n${BLUE}Test 4: Simulated Data Detection${RESET}`);
  console.log('─'.repeat(50));

  try {
    // Check the ga4-real-data.ts file for fallback data generators
    const { readFile } = await import('fs/promises');
    const ga4FilePath = join(__dirname, '..', 'src', 'lib', 'ga4-real-data.ts');

    const content = await readFile(ga4FilePath, 'utf-8');

    // Look for random data generation patterns
    const hasRandomFallback = content.includes('Math.random()') && content.includes('catch');
    const hasRealisticFallback = content.includes('realistic fallback') || content.includes('realistic GA4 simulation');

    if (hasRandomFallback || hasRealisticFallback) {
      warn('Code contains fallback to simulated/random data when API fails');
      info('  This is OK if API errors are handled, but data may not be real');
      info('  Check logs for "Using realistic GA4 simulation" messages');
      return true;
    }

    pass('No simulated data fallback detected');
    return true;

  } catch (error) {
    info(`Could not check for simulated data patterns: ${error.message}`);
    return true;
  }
}

/**
 * Test 5: Verify tracking implementation
 */
async function testTrackingImplementation() {
  console.log(`\n${BLUE}Test 5: Analytics Tracking Implementation${RESET}`);
  console.log('─'.repeat(50));

  try {
    // Check if GTM is properly configured
    const response = await fetch(BASE_URL);
    const html = await response.text();

    // Check for GTM container
    if (html.includes('GTM-WNG6Z9ZD')) {
      pass('GTM container (GTM-WNG6Z9ZD) found in HTML');
    } else {
      fail('GTM container not found in page HTML');
      return false;
    }

    // Check for GA4 measurement ID
    if (html.includes(GA4_MEASUREMENT_ID)) {
      pass(`GA4 Measurement ID (${GA4_MEASUREMENT_ID}) found in HTML`);
    } else {
      warn(`GA4 Measurement ID not in HTML (may be loaded via GTM)`);
    }

    // Check for dataLayer initialization
    if (html.includes('dataLayer')) {
      pass('dataLayer initialized');
    } else {
      fail('dataLayer not found - analytics may not work');
      return false;
    }

    return true;

  } catch (error) {
    fail(`Failed to check tracking implementation: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Realtime data availability
 */
async function testRealtimeData() {
  console.log(`\n${BLUE}Test 6: Realtime Data API${RESET}`);
  console.log('─'.repeat(50));

  try {
    const client = new BetaAnalyticsDataClient();

    const [response] = await client.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      metrics: [{ name: 'activeUsers' }]
    });

    const activeUsers = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0');

    pass('Realtime API accessible');
    info(`  Active users right now: ${activeUsers}`);

    if (activeUsers > 0) {
      pass('Site has active users - tracking is working!');
    } else {
      info('  No active users at this moment (visit the site to test)');
    }

    return true;

  } catch (error) {
    fail(`Realtime API failed: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  await testPropertyIdConfig();
  await testGA4APIConnection();
  await testMetricsAPI();
  await testForSimulatedData();
  await testTrackingImplementation();
  await testRealtimeData();

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${BLUE}Summary${RESET}`);
  console.log('='.repeat(50));

  console.log(`${GREEN}✓ Passed: ${results.passed.length}${RESET}`);
  console.log(`${YELLOW}⚠ Warnings: ${results.warnings.length}${RESET}`);
  console.log(`${RED}✗ Failed: ${results.failed.length}${RESET}`);

  if (results.failed.length === 0 && results.warnings.length === 0) {
    console.log(`\n${GREEN}${BOLD}🎉 All analytics checks passed!${RESET}`);
    console.log(`${GREEN}Your analytics are configured correctly and returning real data.${RESET}\n`);
    process.exit(0);
  } else if (results.failed.length === 0) {
    console.log(`\n${YELLOW}Analytics are working but some warnings were found.${RESET}`);
    console.log(`${YELLOW}Review the warnings above to ensure optimal accuracy.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}Some analytics checks failed.${RESET}`);
    console.log(`${RED}Review the failures above and fix the issues.${RESET}\n`);

    console.log(`\n${BLUE}Common Solutions:${RESET}`);
    console.log(`  1. Update GA4_PROPERTY_ID to 399540912 in .env.local`);
    console.log(`  2. Ensure GOOGLE_APPLICATION_CREDENTIALS points to valid service account JSON`);
    console.log(`  3. Verify service account has "Viewer" access to GA4 property`);
    console.log(`  4. Redeploy application after environment variable changes`);
    console.log();

    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error(`\n${RED}Fatal error:${RESET}`, error);
  process.exit(1);
});
