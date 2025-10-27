#!/usr/bin/env node

/**
 * GTM Analytics Audit Runner
 *
 * Runs comprehensive validation of GTM installation and analytics stack
 * Generates detailed reports for:
 * - GTM container installation
 * - GA4 event tracking
 * - Ad platform integrations (Reddit, Taboola, Clarity)
 * - DataLayer integrity
 * - Network request validation
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPORT_DIR = 'reports/analytics';
const TIMESTAMP = new Date().toISOString().replace(/:/g, '-').split('.')[0];

console.log('🔍 Starting GTM Analytics Audit...\n');

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

try {
  // Run the Playwright tests
  console.log('📊 Running comprehensive analytics validation tests...\n');

  const testCommand = 'npx playwright test tests/gtm-validation.spec.ts --reporter=list';

  try {
    const output = execSync(testCommand, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });
  } catch (error) {
    // Tests may fail if some validations don't pass
    console.log('\n⚠️  Some validations did not pass. Check the output above.\n');
  }

  console.log('\n✅ Audit complete!\n');
  console.log('📋 Summary:');
  console.log('━'.repeat(60));
  console.log('   GTM Container ID: GTM-WNG6Z9ZD');
  console.log('   GA4 Measurement ID: G-QCSHJ4TDMY (configured in GTM)');
  console.log('   Reddit Pixel ID: a2_hwuo2umsdjch');
  console.log('   Taboola Pixel: Official tag configured');
  console.log('   Microsoft Clarity: Custom + Official tags');
  console.log('━'.repeat(60));

  console.log('\n📖 Next Steps:');
  console.log('   1. Review test output above for any ❌ failures');
  console.log('   2. Check GTM Preview mode for live debugging');
  console.log('   3. Verify events in GA4 DebugView');
  console.log('   4. Test Reddit conversions in Reddit Ads Manager');
  console.log('   5. Validate Taboola events in Taboola dashboard\n');

  console.log('💡 Useful GTM Debug Commands:');
  console.log('   • Enable GTM Preview: https://tagmanager.google.com/#/container/accounts/6133846297/containers/223663862/workspaces/8');
  console.log('   • GA4 DebugView: https://analytics.google.com/analytics/web/#/a291625854p401686673/admin/debugview/overview');
  console.log('   • Test with GTM Preview + Browser DevTools Network tab\n');

} catch (error) {
  console.error('❌ Error running audit:', error.message);
  process.exit(1);
}
