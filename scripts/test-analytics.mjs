#!/usr/bin/env node

/**
 * Test Analytics Configuration
 * Verifies that GA4 and GTM are properly configured and tracking
 */

import { chromium } from 'playwright';

const SITE_URL = 'http://localhost:3000';
const GA4_MEASUREMENT_ID = 'G-7NR2JG1EDP';
const GTM_CONTAINER_ID = 'GTM-WNG6Z9ZD';

console.log('🧪 Testing Analytics Configuration...\n');

async function testAnalytics() {
  const browser = await chromium.launch({ headless: false }); // Set to true for CI
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track network requests
  const analyticsRequests = [];
  page.on('request', (request) => {
    const url = request.url();
    if (
      url.includes('google-analytics.com') ||
      url.includes('googletagmanager.com') ||
      url.includes('/collect') ||
      url.includes('/g/collect')
    ) {
      analyticsRequests.push({
        url,
        method: request.method(),
        timestamp: new Date().toISOString(),
      });
    }
  });

  try {
    console.log(`1️⃣  Navigating to ${SITE_URL}...`);
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });

    // Wait for analytics to initialize
    await page.waitForTimeout(2000);

    console.log('\n2️⃣  Checking GTM Installation...');
    const gtmInstalled = await page.evaluate(() => {
      return typeof window.google_tag_manager !== 'undefined';
    });
    console.log(
      gtmInstalled
        ? '   ✅ GTM Container Loaded'
        : '   ❌ GTM Container Not Found',
    );

    console.log('\n3️⃣  Checking dataLayer...');
    const dataLayerInfo = await page.evaluate(() => {
      const dl = window.dataLayer || [];
      return {
        exists: Array.isArray(dl),
        length: dl.length,
        events: dl
          .filter((item) => item.event)
          .map((item) => item.event)
          .slice(0, 5),
      };
    });

    if (dataLayerInfo.exists) {
      console.log('   ✅ dataLayer initialized');
      console.log(`   📊 Events in dataLayer: ${dataLayerInfo.length}`);
      if (dataLayerInfo.events.length > 0) {
        console.log(`   📋 Sample events: ${dataLayerInfo.events.join(', ')}`);
      }
    } else {
      console.log('   ❌ dataLayer not found');
    }

    console.log('\n4️⃣  Checking gtag function...');
    const gtagExists = await page.evaluate(() => {
      return typeof window.gtag === 'function';
    });
    console.log(
      gtagExists ? '   ✅ gtag() function available' : '   ❌ gtag() not found',
    );

    console.log('\n5️⃣  Checking Consent Mode...');
    const consentStatus = await page.evaluate(() => {
      // Try to read consent state from dataLayer
      const dl = window.dataLayer || [];
      const consentEvents = dl.filter(
        (item) => Array.isArray(item) && item[0] === 'consent',
      );
      return {
        hasConsentEvents: consentEvents.length > 0,
        lastConsent: consentEvents[consentEvents.length - 1] || null,
      };
    });

    if (consentStatus.hasConsentEvents) {
      console.log('   ✅ Consent Mode configured');
      console.log(
        `   📋 Consent state:`,
        JSON.stringify(consentStatus.lastConsent, null, 2),
      );
    } else {
      console.log('   ⚠️  No consent events found in dataLayer');
    }

    console.log('\n6️⃣  Checking Network Requests...');
    const gtmRequests = analyticsRequests.filter((r) =>
      r.url.includes('googletagmanager.com'),
    );
    const ga4Requests = analyticsRequests.filter(
      (r) =>
        r.url.includes('google-analytics.com') || r.url.includes('/collect'),
    );

    console.log(`   📡 GTM Requests: ${gtmRequests.length}`);
    if (gtmRequests.length > 0) {
      console.log('   ✅ GTM script loaded');
    }

    console.log(`   📡 GA4 Requests: ${ga4Requests.length}`);
    if (ga4Requests.length > 0) {
      console.log('   ✅ GA4 tracking requests sent');
      ga4Requests.forEach((req, i) => {
        console.log(`      ${i + 1}. ${req.method} ${req.url.substring(0, 100)}...`);
      });
    } else {
      console.log('   ⚠️  No GA4 tracking requests detected');
      console.log(
        '      This may be normal if GTM tags are not configured yet',
      );
    }

    console.log('\n7️⃣  Testing Page View Event...');
    await page.evaluate(() => {
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
      }
    });

    await page.waitForTimeout(1000);

    console.log('\n8️⃣  Testing Custom Event...');
    await page.evaluate(() => {
      if (window.gtag) {
        window.gtag('event', 'test_event', {
          event_category: 'test',
          event_label: 'analytics_test',
          value: 1,
        });
      }
    });

    await page.waitForTimeout(1000);

    console.log('\n📊 Final Network Request Count:');
    console.log(`   Total Analytics Requests: ${analyticsRequests.length}`);

    console.log('\n✅ SUMMARY:');
    console.log('═══════════════════════════════════════════');
    console.log(`Site URL: ${SITE_URL}`);
    console.log(`GA4 Measurement ID: ${GA4_MEASUREMENT_ID}`);
    console.log(`GTM Container: ${GTM_CONTAINER_ID}`);
    console.log(`GTM Installed: ${gtmInstalled ? '✅' : '❌'}`);
    console.log(`dataLayer Active: ${dataLayerInfo.exists ? '✅' : '❌'}`);
    console.log(`gtag() Available: ${gtagExists ? '✅' : '❌'}`);
    console.log(`Analytics Requests: ${analyticsRequests.length}`);
    console.log('═══════════════════════════════════════════');

    if (gtmInstalled && gtagExists && dataLayerInfo.exists) {
      console.log(
        '\n✅ Analytics setup is working! GTM and dataLayer are properly initialized.',
      );
      if (ga4Requests.length === 0) {
        console.log(
          '\n⚠️  However, no GA4 requests were detected. This means:',
        );
        console.log(
          '   1. You may need to configure GA4 tags inside your GTM container',
        );
        console.log('   2. Or GA4 Configuration tag may not be firing');
        console.log(
          '\n💡 Next steps:',
        );
        console.log('   1. Go to https://tagmanager.google.com');
        console.log(`   2. Open container ${GTM_CONTAINER_ID}`);
        console.log('   3. Add a GA4 Configuration tag with Measurement ID: ' + GA4_MEASUREMENT_ID);
        console.log('   4. Set trigger to "All Pages"');
        console.log('   5. Publish the container');
      } else {
        console.log(
          '\n🎉 Excellent! GA4 tracking requests are being sent.',
        );
        console.log('   Check GA4 Realtime report to see live data.');
      }
    } else {
      console.log('\n❌ Some components are not working correctly.');
      console.log('   Review the checks above to identify the issues.');
    }

    console.log('\n📚 Resources:');
    console.log(
      `   • GA4 Realtime: https://analytics.google.com/analytics/web/#/p399540912/realtime`,
    );
    console.log(`   • GTM Workspace: https://tagmanager.google.com`);
    console.log('   • Add ?gtm_debug=true to URL for GTM debug mode');

    // Keep browser open for manual inspection
    console.log('\n⏳ Browser will close in 10 seconds...');
    await page.waitForTimeout(10000);
  } catch (error) {
    console.error('\n❌ Error during test:', error);
  } finally {
    await browser.close();
  }
}

testAnalytics().catch(console.error);
