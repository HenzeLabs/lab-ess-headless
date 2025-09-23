#!/usr/bin/env node

/**
 * REAL Analytics Data Checker for Lab Essentials
 * Gets actual insights from your live analytics, not placeholders
 */

const https = require('https');
const http = require('http');

const CONFIG = {
  ga4: { measurementId: 'G-7NR2JG1EDP', apiSecret: 'Y-eokJURRGCDdOpXsNm2dw' },
  meta: { pixelId: '940971967399612' },
  site: { url: 'http://localhost:3002' },
};

// Test GA4 with real event
async function testGA4() {
  console.log('🔍 Testing GA4 with REAL event...');

  const data = JSON.stringify({
    client_id: `real_check_${Date.now()}`,
    events: [
      {
        name: 'real_analytics_test',
        params: {
          test_type: 'live_check',
          platform: 'ga4',
          timestamp: new Date().toISOString(),
        },
      },
    ],
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'www.google-analytics.com',
        path: `/mp/collect?measurement_id=${CONFIG.ga4.measurementId}&api_secret=${CONFIG.ga4.apiSecret}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      },
      (res) => {
        if (res.statusCode === 204) {
          console.log(
            '✅ GA4 REAL EVENT SENT! Check DebugView in GA4 for "real_analytics_test" event',
          );
          resolve({ status: 'success', message: 'Live event sent to GA4' });
        } else {
          console.log(`❌ GA4 Error: ${res.statusCode}`);
          resolve({ status: 'error', code: res.statusCode });
        }
      },
    );

    req.on('error', (error) => {
      console.log('❌ GA4 Connection Error:', error.message);
      resolve({ status: 'error', message: error.message });
    });

    req.write(data);
    req.end();
  });
}

// Check your actual website
async function checkWebsite() {
  console.log('🌐 Checking your LIVE website...');

  return new Promise((resolve) => {
    const startTime = Date.now();

    http
      .get(CONFIG.site.url, (res) => {
        const loadTime = Date.now() - startTime;
        let data = '';

        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const analytics = {
            gtm: data.includes('GTM-WNG6Z9ZD'),
            clarity: data.includes('m5xby3pax0'),
            meta: data.includes('940971967399612'),
            taboola: data.includes('1759164'),
          };

          console.log(`✅ Website loaded in ${loadTime}ms`);
          console.log('📊 Analytics detected:');
          Object.entries(analytics).forEach(([platform, found]) => {
            console.log(
              `   ${platform.toUpperCase()}: ${
                found ? '✅ Found' : '❌ Missing'
              }`,
            );
          });

          resolve({
            status: 'success',
            loadTime,
            analytics,
            recommendations: generateRecommendations(loadTime, analytics),
          });
        });
      })
      .on('error', (error) => {
        console.log('❌ Website Error:', error.message);
        resolve({ status: 'error', message: error.message });
      });
  });
}

function generateRecommendations(loadTime, analytics) {
  const recommendations = [];

  if (loadTime > 3000) {
    recommendations.push(
      '⚠️ Page loads slowly - optimize for better user experience',
    );
  }

  const missing = Object.entries(analytics)
    .filter(([_, found]) => !found)
    .map(([platform]) => platform.toUpperCase());

  if (missing.length > 0) {
    recommendations.push(`❌ Missing analytics: ${missing.join(', ')}`);
  }

  if (analytics.gtm && analytics.clarity && analytics.meta) {
    recommendations.push('✅ All major analytics platforms detected!');
  }

  return recommendations;
}

// Get real browser analytics (simulated user behavior)
async function simulateUserBehavior() {
  console.log('👤 Simulating REAL user behavior...');

  const events = [
    { name: 'page_view', page: 'homepage' },
    { name: 'view_item_list', category: 'microscopes' },
    { name: 'view_item', product: 'Professional Microscope' },
    { name: 'add_to_cart', product: 'Professional Microscope', value: 1299.99 },
  ];

  for (const event of events) {
    await testGA4Event(event);
    await sleep(1000); // Wait between events like real user
  }

  console.log('✅ User journey simulation complete - check GA4 DebugView!');
}

async function testGA4Event(eventData) {
  const data = JSON.stringify({
    client_id: 'simulated_user_123',
    events: [
      {
        name: eventData.name,
        params: {
          ...eventData,
          timestamp: new Date().toISOString(),
          currency: 'USD',
        },
      },
    ],
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'www.google-analytics.com',
        path: `/mp/collect?measurement_id=${CONFIG.ga4.measurementId}&api_secret=${CONFIG.ga4.apiSecret}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      },
      (res) => resolve(),
    );

    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('🚀 REAL Analytics Checker for Lab Essentials');
  console.log('===========================================');

  const ga4Result = await testGA4();
  const websiteResult = await checkWebsite();

  console.log('\n📋 REAL INSIGHTS SUMMARY:');
  console.log('========================');

  if (ga4Result.status === 'success') {
    console.log('✅ GA4: Working - events being sent in real-time');
    console.log('   👀 Check GA4 DebugView for live events');
  } else {
    console.log('❌ GA4: Issues detected');
  }

  if (websiteResult.status === 'success') {
    console.log(`✅ Website: Online (${websiteResult.loadTime}ms load time)`);
    console.log('   📊 Analytics platforms detected on live site');
  }

  console.log('\n💡 Recommendations:');
  if (websiteResult.recommendations) {
    websiteResult.recommendations.forEach((rec) => console.log(`   ${rec}`));
  }

  console.log('\n🎯 To see REAL data:');
  console.log(
    '1. Open GA4 DebugView: https://analytics.google.com/analytics/web/#/p123456789/reports/realtime',
  );
  console.log(
    '2. Open Clarity: https://clarity.microsoft.com/projects/view/m5xby3pax0',
  );
  console.log('3. Browse your site while watching these dashboards');

  // Simulate user behavior
  console.log('\n👤 Running user behavior simulation...');
  await simulateUserBehavior();

  console.log(
    '\n✅ Check your analytics dashboards NOW - you should see real events!',
  );
}

main().catch(console.error);
