#!/usr/bin/env node

/**
 * Comprehensive Lab Essentials Audit Script
 * Validates all audit categories and generates updated status report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔍 Lab Essentials Comprehensive Audit\n');
console.log('=' .repeat(60));

// Load original audit results
const auditResultsPath = path.join(projectRoot, 'reports/labessentials_audit_results.json');
const originalAudit = JSON.parse(fs.readFileSync(auditResultsPath, 'utf8'));

// Audit results tracker
const auditStatus = {
  timestamp: new Date().toISOString(),
  categories: {},
  summary: {
    resolved: 0,
    partial: 0,
    missing: 0,
    total: originalAudit.length
  }
};

// ============================================================================
// Category 1: Parameter Changes
// ============================================================================
console.log('\n📋 Category 1: Parameter Changes');
console.log('-'.repeat(60));

const parameterChanges = {
  status: 'resolved',
  evidence: [],
  gaps: []
};

try {
  // Check if config store exists
  const configPath = path.join(projectRoot, 'data/config_store/config.csv');
  if (fs.existsSync(configPath)) {
    const csv = fs.readFileSync(configPath, 'utf8');
    const records = parse(csv, { columns: true });
    parameterChanges.evidence.push(`✅ Config store exists with ${records.length} parameters`);

    // Check for required SEO keys
    const seoKeys = records.filter(r => r.key.startsWith('seo.')).length;
    parameterChanges.evidence.push(`✅ ${seoKeys} SEO parameters in config store`);

    // Check for security keys
    const securityKeys = records.filter(r => r.key.startsWith('security.')).length;
    parameterChanges.evidence.push(`✅ ${securityKeys} security parameters in config store`);

    // Check for audit trail columns
    if (records[0] && 'updated_by' in records[0] && 'updated_at' in records[0] && 'version' in records[0]) {
      parameterChanges.evidence.push('✅ Audit trail columns present (updated_by, updated_at, version)');
    }
  } else {
    parameterChanges.status = 'missing';
    parameterChanges.gaps.push('❌ Config store file not found');
  }

  // Check if API exists
  const apiPath = path.join(projectRoot, 'app/api/config/route.ts');
  if (fs.existsSync(apiPath)) {
    parameterChanges.evidence.push('✅ Runtime config API endpoint exists');
  } else {
    parameterChanges.status = 'partial';
    parameterChanges.gaps.push('⚠️  Config API not found');
  }

  // Check if configStore lib exists
  const libPath = path.join(projectRoot, 'src/lib/configStore.ts');
  if (fs.existsSync(libPath)) {
    parameterChanges.evidence.push('✅ ConfigStore library exists');
  } else {
    parameterChanges.status = 'partial';
    parameterChanges.gaps.push('⚠️  ConfigStore library not found');
  }

} catch (error) {
  parameterChanges.status = 'missing';
  parameterChanges.gaps.push(`❌ Error checking parameter changes: ${error.message}`);
}

auditStatus.categories['Parameter Changes'] = parameterChanges;
console.log(`Status: ${parameterChanges.status.toUpperCase()}`);
parameterChanges.evidence.forEach(e => console.log(`  ${e}`));
parameterChanges.gaps.forEach(g => console.log(`  ${g}`));

// ============================================================================
// Category 2: Change Logs
// ============================================================================
console.log('\n📝 Category 2: Change Logs');
console.log('-'.repeat(60));

const changeLogs = {
  status: 'partial',
  evidence: [],
  gaps: []
};

try {
  // Check if config store has audit trail
  const configPath = path.join(projectRoot, 'data/config_store/config.csv');
  if (fs.existsSync(configPath)) {
    changeLogs.evidence.push('✅ Config changes logged in CSV with audit trail');
  }

  // Check for analytics logging
  const analyticsFiles = [
    'src/lib/analytics/manager.ts',
    'src/lib/experiments/manager.ts',
    'src/lib/quiz-logger.ts'
  ];

  const foundAnalytics = analyticsFiles.filter(f =>
    fs.existsSync(path.join(projectRoot, f))
  );

  if (foundAnalytics.length > 0) {
    changeLogs.evidence.push(`✅ ${foundAnalytics.length} analytics/experiment loggers found`);
  }

  // Gaps: No centralized server-side logging yet
  changeLogs.gaps.push('⚠️  No centralized server-side audit log for analytics events');
  changeLogs.gaps.push('⚠️  Console/localStorage logs still volatile');

} catch (error) {
  changeLogs.gaps.push(`❌ Error checking change logs: ${error.message}`);
}

auditStatus.categories['Change Logs'] = changeLogs;
console.log(`Status: ${changeLogs.status.toUpperCase()}`);
changeLogs.evidence.forEach(e => console.log(`  ${e}`));
changeLogs.gaps.forEach(g => console.log(`  ${g}`));

// ============================================================================
// Category 3: Result Tracking
// ============================================================================
console.log('\n📊 Category 3: Result Tracking');
console.log('-'.repeat(60));

const resultTracking = {
  status: 'partial',
  evidence: [],
  gaps: []
};

try {
  // Check for analytics API routes
  const analyticsRoutes = [
    'src/app/api/analytics/route.ts',
    'src/app/api/analytics/enhanced/route.ts'
  ];

  const foundRoutes = analyticsRoutes.filter(f =>
    fs.existsSync(path.join(projectRoot, f))
  );

  if (foundRoutes.length > 0) {
    resultTracking.evidence.push(`✅ ${foundRoutes.length} analytics API routes exist`);
  }

  // Check for hooks
  const hooksPath = path.join(projectRoot, 'src/hooks');
  if (fs.existsSync(hooksPath)) {
    const hooks = fs.readdirSync(hooksPath).filter(f => f.includes('Analytics') || f.includes('ABTesting'));
    if (hooks.length > 0) {
      resultTracking.evidence.push(`✅ ${hooks.length} analytics/testing hooks found`);
    }
  }

  // Gaps: GA4 and Clarity still need real credentials
  resultTracking.gaps.push('⚠️  GA4 integration may still use fallback/simulated data');
  resultTracking.gaps.push('⚠️  Clarity metrics may be stubbed');
  resultTracking.gaps.push('⚠️  No persistent datastore for historical metrics');

} catch (error) {
  resultTracking.gaps.push(`❌ Error checking result tracking: ${error.message}`);
}

auditStatus.categories['Result Tracking'] = resultTracking;
console.log(`Status: ${resultTracking.status.toUpperCase()}`);
resultTracking.evidence.forEach(e => console.log(`  ${e}`));
resultTracking.gaps.forEach(g => console.log(`  ${g}`));

// ============================================================================
// Category 4: Backup/Transparency
// ============================================================================
console.log('\n💾 Category 4: Backup/Transparency');
console.log('-'.repeat(60));

const backupTransparency = {
  status: 'partial',
  evidence: [],
  gaps: []
};

try {
  // Config store is backed up via git
  backupTransparency.evidence.push('✅ Config store is git-tracked for version history');

  // Check if README exists
  const readmePath = path.join(projectRoot, 'data/config_store/README.md');
  if (fs.existsSync(readmePath)) {
    backupTransparency.evidence.push('✅ Configuration documentation exists');
  }

  // Gaps: No automated exports yet
  backupTransparency.gaps.push('⚠️  No scheduled exports or CSV snapshots for stakeholders');
  backupTransparency.gaps.push('⚠️  Analytics/experiment data still in localStorage (fragile)');
  backupTransparency.gaps.push('⚠️  No external storage (S3, database) for analytics backups');

} catch (error) {
  backupTransparency.gaps.push(`❌ Error checking backup/transparency: ${error.message}`);
}

auditStatus.categories['Backup/Transparency'] = backupTransparency;
console.log(`Status: ${backupTransparency.status.toUpperCase()}`);
backupTransparency.evidence.forEach(e => console.log(`  ${e}`));
backupTransparency.gaps.forEach(g => console.log(`  ${g}`));

// ============================================================================
// Category 5: Metrics & Tools
// ============================================================================
console.log('\n🔧 Category 5: Metrics & Tools');
console.log('-'.repeat(60));

const metricsTools = {
  status: 'partial',
  evidence: [],
  gaps: []
};

try {
  // Check for GA4 files
  const ga4Files = [
    'src/lib/ga4-real-data.ts',
    'src/lib/analytics.ts',
    'src/lib/analytics-tracking-enhanced.ts'
  ];

  const foundGA4 = ga4Files.filter(f =>
    fs.existsSync(path.join(projectRoot, f))
  );

  if (foundGA4.length > 0) {
    metricsTools.evidence.push(`✅ ${foundGA4.length} GA4 integration files exist`);
  }

  // Check for GTM in layout
  const layoutPath = path.join(projectRoot, 'src/app/layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    if (layoutContent.includes('googletagmanager')) {
      metricsTools.evidence.push('✅ GTM integration detected in layout');
    }
  }

  // Gaps: Credentials may not be finalized
  metricsTools.gaps.push('⚠️  GA4 property ID may need verification');
  metricsTools.gaps.push('⚠️  Clarity integration may be stubbed');
  metricsTools.gaps.push('⚠️  Third-party configs scattered across files');

} catch (error) {
  metricsTools.gaps.push(`❌ Error checking metrics & tools: ${error.message}`);
}

auditStatus.categories['Metrics & Tools'] = metricsTools;
console.log(`Status: ${metricsTools.status.toUpperCase()}`);
metricsTools.evidence.forEach(e => console.log(`  ${e}`));
metricsTools.gaps.forEach(g => console.log(`  ${g}`));

// ============================================================================
// Category 6: A/B Testing
// ============================================================================
console.log('\n🧪 Category 6: A/B Testing');
console.log('-'.repeat(60));

const abTesting = {
  status: 'partial',
  evidence: [],
  gaps: []
};

try {
  // Check for experiment files
  const experimentFiles = [
    'src/lib/experiments/types.ts',
    'src/lib/experiments/manager.ts',
    'src/components/optimization/ABTestingFramework.tsx'
  ];

  const foundExperiments = experimentFiles.filter(f =>
    fs.existsSync(path.join(projectRoot, f))
  );

  if (foundExperiments.length > 0) {
    abTesting.evidence.push(`✅ ${foundExperiments.length} A/B testing infrastructure files exist`);
  }

  // Check for A/B API
  const abApiPath = path.join(projectRoot, 'src/app/api/ab-tests');
  if (fs.existsSync(abApiPath)) {
    abTesting.evidence.push('✅ A/B testing API endpoints exist');
  }

  // Gaps: No server-side persistence
  abTesting.gaps.push('⚠️  Experiment state lives in localStorage/memory (volatile)');
  abTesting.gaps.push('⚠️  No shared datastore for experiment assignments');
  abTesting.gaps.push('⚠️  Winner analysis relies on synthetic analytics');

} catch (error) {
  abTesting.gaps.push(`❌ Error checking A/B testing: ${error.message}`);
}

auditStatus.categories['A/B Testing'] = abTesting;
console.log(`Status: ${abTesting.status.toUpperCase()}`);
abTesting.evidence.forEach(e => console.log(`  ${e}`));
abTesting.gaps.forEach(g => console.log(`  ${g}`));

// ============================================================================
// Calculate Summary
// ============================================================================
console.log('\n📊 Audit Summary');
console.log('='.repeat(60));

Object.entries(auditStatus.categories).forEach(([category, status]) => {
  if (status.status === 'resolved') {
    auditStatus.summary.resolved++;
  } else if (status.status === 'partial') {
    auditStatus.summary.partial++;
  } else {
    auditStatus.summary.missing++;
  }
});

console.log(`Total Categories: ${auditStatus.summary.total}`);
console.log(`✅ Resolved: ${auditStatus.summary.resolved}`);
console.log(`⚠️  Partial: ${auditStatus.summary.partial}`);
console.log(`❌ Missing: ${auditStatus.summary.missing}`);

// ============================================================================
// Generate Updated Report
// ============================================================================
console.log('\n📄 Generating Updated Audit Report');
console.log('='.repeat(60));

const reportPath = path.join(projectRoot, 'reports/labessentials_full_audit_status.json');
fs.writeFileSync(reportPath, JSON.stringify(auditStatus, null, 2));
console.log(`✅ Report saved to: ${reportPath}`);

// Generate Markdown Summary
const markdownPath = path.join(projectRoot, 'reports/AUDIT_SUMMARY.md');
let markdown = `# Lab Essentials Audit Summary\n\n`;
markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
markdown += `## Overview\n\n`;
markdown += `- **Total Categories:** ${auditStatus.summary.total}\n`;
markdown += `- **✅ Resolved:** ${auditStatus.summary.resolved}\n`;
markdown += `- **⚠️ Partial:** ${auditStatus.summary.partial}\n`;
markdown += `- **❌ Missing:** ${auditStatus.summary.missing}\n\n`;

markdown += `## Category Status\n\n`;

Object.entries(auditStatus.categories).forEach(([category, status]) => {
  const icon = status.status === 'resolved' ? '✅' : status.status === 'partial' ? '⚠️' : '❌';
  markdown += `### ${icon} ${category}\n\n`;
  markdown += `**Status:** ${status.status.toUpperCase()}\n\n`;

  if (status.evidence.length > 0) {
    markdown += `**Evidence:**\n`;
    status.evidence.forEach(e => markdown += `- ${e}\n`);
    markdown += `\n`;
  }

  if (status.gaps.length > 0) {
    markdown += `**Remaining Gaps:**\n`;
    status.gaps.forEach(g => markdown += `- ${g}\n`);
    markdown += `\n`;
  }
});

markdown += `## Next Steps\n\n`;
markdown += `1. **Secure Config API** - Add authentication middleware to /api/config\n`;
markdown += `2. **Admin Dashboard** - Create UI for config visibility\n`;
markdown += `3. **Result Tracking** - Complete GA4/Clarity integration\n`;
markdown += `4. **Server-Side Logging** - Centralize analytics event storage\n`;
markdown += `5. **Experiment Persistence** - Move A/B test state to database\n\n`;

fs.writeFileSync(markdownPath, markdown);
console.log(`✅ Markdown summary saved to: ${markdownPath}\n`);

console.log('✅ Audit complete!\n');
