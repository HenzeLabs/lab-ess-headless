#!/usr/bin/env node

/**
 * Production Analytics Validation
 *
 * Checks if analytics are properly configured on the live site
 */

console.log('🔍 Checking Production Analytics Configuration\n');
console.log('='.repeat(60));

const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://store.labessentials.com';

console.log(`\n📍 Production URL: ${PRODUCTION_URL}`);
console.log('\n📋 Manual Validation Checklist:\n');

console.log('1️⃣  Verify GTM Container Loads');
console.log('   • Open: ' + PRODUCTION_URL);
console.log('   • Open browser DevTools Console');
console.log('   • Run: window.dataLayer');
console.log('   • Expected: Array with events\n');

console.log('2️⃣  Verify Reddit Pixel');
console.log('   • Run: window.rdt');
console.log('   • Expected: ƒ () { ... }');
console.log('   • Confirms Reddit base script loaded from GTM\n');

console.log('3️⃣  Verify Taboola');
console.log('   • Run: window._tfa');
console.log('   • Expected: Array\n');

console.log('4️⃣  Verify Microsoft Clarity');
console.log('   • Run: window.clarity');
console.log('   • Expected: function or object\n');

console.log('5️⃣  Check GTM Container');
console.log('   • Run: document.querySelector(\'script[src*="googletagmanager.com/gtm.js"]\')');
console.log('   • Expected: <script> element');
console.log('   • Verify only ONE instance (no duplicates)\n');

console.log('6️⃣  Verify Debug Console Available');
console.log('   • Visit: ' + PRODUCTION_URL + '/gtm-debug.html');
console.log('   • Check status indicators (should all be green)');
console.log('   • Test event buttons\n');

console.log('7️⃣  GTM Preview Mode');
console.log('   • Go to: https://tagmanager.google.com/');
console.log('   • Container: GTM-WNG6Z9ZD');
console.log('   • Click "Preview"');
console.log('   • Enter: ' + PRODUCTION_URL);
console.log('   • Verify tags fire:\n');
console.log('     - GA4 – Config (All Pages)');
console.log('     - Reddit – Base Pixel (All Pages)');
console.log('     - GA4 – Event tags (on user actions)');
console.log('     - Reddit – Purchase Event (/thank_you only)\n');

console.log('8️⃣  Network Tab Verification');
console.log('   • Open DevTools → Network tab');
console.log('   • Filter: "g/collect" (GA4)');
console.log('   • Filter: "reddit" or "tr" (Reddit)');
console.log('   • Filter: "tfa" (Taboola)');
console.log('   • Filter: "clarity.ms" (Clarity)');
console.log('   • Perform test actions');
console.log('   • Verify HTTP 200 responses\n');

console.log('9️⃣  GA4 DebugView (Real-time)');
console.log('   • Visit: https://analytics.google.com/analytics/web/#/a291625854p401686673/admin/debugview/overview');
console.log('   • Keep open while testing');
console.log('   • Events should appear in real-time\n');

console.log('🔟 Platform Dashboards');
console.log('   • Reddit Ads: https://ads.reddit.com/ → Pixels & Conversions');
console.log('   • Taboola: https://backstage.taboola.com/ → Conversions');
console.log('   • Clarity: Check session recordings\n');

console.log('='.repeat(60));
console.log('\n✅ Automated Code Check (Local):');
console.log('   npm run check:gtm\n');

console.log('🎯 Expected Results:');
console.log('   ✅ No console errors');
console.log('   ✅ GTM container loads once');
console.log('   ✅ window.rdt is a function');
console.log('   ✅ window.dataLayer is an array');
console.log('   ✅ window._tfa is an array');
console.log('   ✅ Debug console shows all platforms green');
console.log('   ✅ Network requests return HTTP 200');
console.log('   ✅ Events appear in GA4 DebugView\n');

console.log('📊 Test Purchase Flow:');
console.log('   1. View a product page');
console.log('   2. Add to cart');
console.log('   3. Proceed to checkout');
console.log('   4. Complete test purchase');
console.log('   5. Verify on /thank_you page:');
console.log('      - GA4 purchase event');
console.log('      - Reddit Purchase event');
console.log('      - Taboola purchase event');
console.log('      - All with correct transaction_id, value, currency\n');

console.log('🐛 Common Issues:');
console.log('   • If window.rdt is undefined:');
console.log('     → Reddit base script not loaded from GTM');
console.log('     → Check GTM Preview, verify "Reddit – Base Pixel" fires\n');
console.log('   • If events not in dataLayer:');
console.log('     → Analytics helpers may not be loaded yet');
console.log('     → Wait a few seconds, check window.__labAnalytics\n');
console.log('   • If duplicate GTM containers:');
console.log('     → Check layout.tsx and AnalyticsWrapper.tsx');
console.log('     → Should only load GTM once\n');

console.log('📖 Full Documentation:');
console.log('   • docs/GTM_VALIDATION_GUIDE.md');
console.log('   • docs/GTM_AUDIT_SUMMARY.md');
console.log('   • docs/GTM_VALIDATION_RESULTS.md\n');
