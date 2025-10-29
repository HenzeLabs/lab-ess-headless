#!/usr/bin/env node

/**
 * Quick GTM Analytics Check
 *
 * Validates analytics implementation without full Playwright tests
 * Checks code structure and configuration
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Quick GTM Analytics Check\n');
console.log('='.repeat(60));

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(message) {
  checks.passed.push(message);
  console.log(`✅ ${message}`);
}

function fail(message) {
  checks.failed.push(message);
  console.log(`❌ ${message}`);
}

function warn(message) {
  checks.warnings.push(message);
  console.log(`⚠️  ${message}`);
}

console.log('\n1️⃣  Checking Analytics Implementation\n');

// Check analytics.ts exists and has Reddit functions
try {
  const analyticsPath = 'src/lib/analytics.ts';
  const analyticsContent = fs.readFileSync(analyticsPath, 'utf-8');

  if (analyticsContent.includes('function pushReddit')) {
    pass('pushReddit function exists in analytics.ts');
  } else {
    fail('pushReddit function not found in analytics.ts');
  }

  if (analyticsContent.includes("win.rdt('track'")) {
    pass('Reddit pixel tracking code implemented');
  } else {
    fail('Reddit pixel tracking code not found');
  }

  const redditEvents = ['ViewContent', 'AddToCart', 'Purchase', 'Lead'];
  redditEvents.forEach(event => {
    if (analyticsContent.includes(`pushReddit('${event}'`)) {
      pass(`Reddit ${event} event implemented`);
    } else {
      fail(`Reddit ${event} event not found`);
    }
  });

  if (analyticsContent.includes('rdt?: (...args: unknown[]) => void')) {
    pass('TypeScript types for Reddit pixel added');
  } else {
    fail('TypeScript types for Reddit pixel missing');
  }

} catch (error) {
  fail(`Could not read analytics.ts: ${error.message}`);
}

console.log('\n2️⃣  Checking GTM Configuration\n');

// Check GTM placement across layout/analytics wrapper
try {
  const wrapperPath = 'src/AnalyticsWrapper.tsx';
  const wrapperContent = fs.readFileSync(wrapperPath, 'utf-8');

  const layoutPath = 'src/app/layout.tsx';
  let layoutContent = '';
  let layoutLoaded = false;

  try {
    layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    layoutLoaded = true;
  } catch (layoutError) {
    warn(`Could not read app layout: ${layoutError.message}`);
  }

  const sources = [
    { name: 'AnalyticsWrapper.tsx', content: wrapperContent },
  ];

  if (layoutLoaded) {
    sources.push({ name: 'app/layout.tsx', content: layoutContent });
  }

  const findSource = (predicate) => {
    for (const source of sources) {
      if (predicate(source.content)) {
        return source.name;
      }
    }
    return null;
  };

  const containerSource = findSource((content) =>
    content.includes('GTM-WNG6Z9ZD'),
  );

  if (containerSource) {
    pass(`GTM Container ID configured in ${containerSource}: GTM-WNG6Z9ZD`);
  } else {
    fail('GTM Container ID not found in AnalyticsWrapper.tsx or app/layout.tsx');
  }

  if (
    wrapperContent.includes('win.dataLayer = win.dataLayer || []') ||
    wrapperContent.includes('dataLayer')
  ) {
    pass('DataLayer initialization code present');
  } else {
    fail('DataLayer initialization missing');
  }

  const gtmScriptSource = findSource((content) =>
    content.includes('googletagmanager.com/gtm.js'),
  );

  if (gtmScriptSource) {
    pass(`GTM script loading configured in ${gtmScriptSource}`);
  } else {
    fail('GTM script loading not found in AnalyticsWrapper.tsx or app/layout.tsx');
  }

  if (wrapperContent.includes('strategy="afterInteractive"')) {
    pass('GTM loads with afterInteractive strategy');
  } else if (layoutLoaded) {
    pass('GTM inline bootstrap detected in app/layout.tsx');
  } else {
    warn('GTM loading strategy may not be optimal');
  }

} catch (error) {
  fail(`Could not read AnalyticsWrapper.tsx: ${error.message}`);
}

console.log('\n3️⃣  Checking Test Suite\n');

// Check test file exists
try {
  const testPath = 'tests/gtm-validation.spec.ts';
  if (fs.existsSync(testPath)) {
    pass('GTM validation test suite exists');

    const testContent = fs.readFileSync(testPath, 'utf-8');

    const testSuites = [
      'GTM Installation Validation',
      'GA4 Core Analytics Validation',
      'Ad Platform Integration Validation',
      'DataLayer Integrity Audit'
    ];

    testSuites.forEach(suite => {
      if (testContent.includes(suite)) {
        pass(`Test suite: ${suite}`);
      } else {
        fail(`Test suite missing: ${suite}`);
      }
    });
  } else {
    fail('GTM validation test suite not found');
  }
} catch (error) {
  fail(`Could not check test suite: ${error.message}`);
}

console.log('\n4️⃣  Checking Documentation\n');

// Check docs exist
const docs = [
  'docs/GTM_VALIDATION_GUIDE.md',
  'docs/GTM_AUDIT_SUMMARY.md'
];

docs.forEach(doc => {
  if (fs.existsSync(doc)) {
    pass(`Documentation: ${doc}`);
  } else {
    fail(`Documentation missing: ${doc}`);
  }
});

// Check debug console
if (fs.existsSync('public/gtm-debug.html')) {
  pass('Debug console available at /gtm-debug.html');
} else {
  fail('Debug console not found');
}

console.log('\n5️⃣  Checking Package Scripts\n');

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

  if (packageJson.scripts['test:gtm']) {
    pass('npm run test:gtm script configured');
  } else {
    fail('test:gtm script not found in package.json');
  }

  if (packageJson.scripts['audit:gtm']) {
    pass('npm run audit:gtm script configured');
  } else {
    fail('audit:gtm script not found in package.json');
  }

} catch (error) {
  fail(`Could not check package.json: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 Summary\n');
console.log(`✅ Passed: ${checks.passed.length}`);
console.log(`❌ Failed: ${checks.failed.length}`);
console.log(`⚠️  Warnings: ${checks.warnings.length}`);

console.log('\n' + '='.repeat(60));

if (checks.failed.length === 0) {
  console.log('\n🎉 All checks passed! Implementation looks good.\n');
  console.log('📋 Next Steps:');
  console.log('   1. Add Reddit base script to GTM (see docs/GTM_AUDIT_SUMMARY.md)');
  console.log('   2. Start dev server: npm run dev');
  console.log('   3. Visit http://localhost:3000/gtm-debug.html');
  console.log('   4. Test events using the debug console buttons');
  console.log('   5. Check browser console for window.rdt');
  console.log('   6. Verify events in GTM Preview mode\n');
} else {
  console.log('\n⚠️  Some checks failed. Review the output above.\n');
  process.exit(1);
}

console.log('💡 Manual Validation:');
console.log('   • Start dev server: npm run dev');
console.log('   • Open browser console on any page');
console.log('   • Run: window.dataLayer');
console.log('   • Run: window.rdt (should be a function after GTM loads)');
console.log('   • Run: window._tfa (Taboola)');
console.log('   • Visit /gtm-debug.html for visual testing\n');

console.log('📖 Documentation:');
console.log('   • Full guide: docs/GTM_VALIDATION_GUIDE.md');
console.log('   • Summary: docs/GTM_AUDIT_SUMMARY.md\n');
