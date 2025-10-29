#!/usr/bin/env node

/**
 * Pre-Deployment Checklist
 *
 * Master script that runs all deployment gates and provides a final
 * go/no-go decision for production deployment.
 *
 * Usage: node scripts/pre-deploy-checklist.mjs [options]
 *
 * Options:
 *   --quick          Run quick checks only (no Lighthouse/E2E tests)
 *   --staging-url    URL of staging environment to test
 *   --skip-build     Skip build step (assumes build is already done)
 */

import { execSync, spawn } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const CHECKLIST_ITEMS = [
  {
    id: 'env',
    name: 'Environment Variables',
    command: 'npm run verify:env',
    critical: true,
    quick: true,
  },
  {
    id: 'typecheck',
    name: 'TypeScript Type Check',
    command: 'npm run typecheck',
    critical: true,
    quick: true,
  },
  {
    id: 'lint',
    name: 'ESLint Check',
    command: 'npm run lint',
    critical: true,
    quick: true,
  },
  {
    id: 'security',
    name: 'Security Audit',
    command: 'node scripts/check-security.mjs',
    critical: true,
    quick: true,
  },
  {
    id: 'build',
    name: 'Production Build',
    command: 'npm run build',
    critical: true,
    quick: false,
  },
  {
    id: 'bundle',
    name: 'Bundle Size Check',
    command: 'node scripts/check-bundle-size.mjs',
    critical: true,
    quick: true,
  },
  {
    id: 'seo',
    name: 'SEO Validation',
    command: 'node scripts/validate-seo.mjs',
    critical: false,
    quick: true,
  },
  {
    id: 'tests-core',
    name: 'Core Functional Tests',
    command: 'npm run test:core',
    critical: true,
    quick: false,
  },
  {
    id: 'tests-a11y',
    name: 'Accessibility Tests',
    command: 'npm run test:a11y',
    critical: true,
    quick: false,
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse Performance Audit',
    command: 'npm run lh',
    critical: true,
    quick: false,
  },
  {
    id: 'links',
    name: 'Link Validation',
    command: 'node scripts/check-links.mjs --max-pages=25',
    critical: false,
    quick: false,
  },
];

class PreDeployChecklist {
  constructor(options = {}) {
    this.options = options;
    this.results = {
      timestamp: new Date().toISOString(),
      passed: false,
      checks: [],
      criticalFailures: [],
      warnings: [],
      duration: 0,
    };
    this.startTime = Date.now();
  }

  log(level, message, details = null) {
    const colorMap = {
      error: colors.red,
      warn: colors.yellow,
      success: colors.green,
      info: colors.cyan,
    };

    const color = colorMap[level] || colors.reset;
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${colors.dim}${timestamp}${colors.reset} ${color}${message}${colors.reset}`);
    if (details) {
      console.log(`  ${details}`);
    }
  }

  banner(text) {
    console.log('\n' + colors.bright + colors.blue);
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + text.padStart(39 + text.length / 2).padEnd(78) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');
    console.log(colors.reset);
  }

  section(title) {
    console.log('\n' + colors.bright + colors.cyan + '─'.repeat(80) + colors.reset);
    console.log(colors.bright + colors.cyan + `  ${title}` + colors.reset);
    console.log(colors.bright + colors.cyan + '─'.repeat(80) + colors.reset + '\n');
  }

  async runCheck(check) {
    const { id, name, command, critical, quick } = check;

    // Skip non-quick checks in quick mode
    if (this.options.quick && !quick) {
      this.log('info', `⊘ Skipping ${name} (quick mode)`);
      this.results.checks.push({
        id,
        name,
        status: 'skipped',
        critical,
      });
      return true;
    }

    // Skip build if requested
    if (id === 'build' && this.options.skipBuild) {
      this.log('info', `⊘ Skipping ${name} (--skip-build)`);
      this.results.checks.push({
        id,
        name,
        status: 'skipped',
        critical,
      });
      return true;
    }

    this.log('info', `▶ Running: ${name}...`);
    const checkStart = Date.now();

    try {
      // Add staging URL if provided
      const cmd = this.options.stagingUrl && command.includes('scripts/')
        ? `${command} --url=${this.options.stagingUrl}`
        : command;

      const output = execSync(cmd, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, CI: '1' },
      });

      const duration = Date.now() - checkStart;

      this.log('success', `✓ ${name} passed (${Math.round(duration / 1000)}s)`);

      this.results.checks.push({
        id,
        name,
        status: 'pass',
        critical,
        duration,
      });

      return true;
    } catch (error) {
      const duration = Date.now() - checkStart;

      if (critical) {
        this.log('error', `✗ ${name} FAILED (${Math.round(duration / 1000)}s)`);
        this.results.criticalFailures.push({
          check: name,
          command,
          error: error.message,
        });
      } else {
        this.log('warn', `⚠ ${name} failed (non-critical)`);
        this.results.warnings.push({
          check: name,
          command,
          error: error.message,
        });
      }

      this.results.checks.push({
        id,
        name,
        status: 'fail',
        critical,
        duration,
        error: error.message,
      });

      return false;
    }
  }

  async generateReport() {
    const reportPath = './deployment-checklist-report.json';
    const htmlReportPath = './deployment-checklist-report.html';

    // JSON report
    await writeFile(reportPath, JSON.stringify(this.results, null, 2));

    // HTML report
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deployment Readiness Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #1a1a1a; margin-bottom: 0.5rem; }
    .timestamp { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
    .status { padding: 1rem; border-radius: 4px; margin-bottom: 2rem; font-weight: 600; }
    .status.passed { background: #d4edda; color: #155724; }
    .status.failed { background: #f8d7da; color: #721c24; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat { padding: 1rem; border-radius: 4px; background: #f8f9fa; }
    .stat-label { font-size: 0.85rem; color: #666; margin-bottom: 0.25rem; }
    .stat-value { font-size: 1.5rem; font-weight: 600; }
    .checks { margin-top: 2rem; }
    .check { padding: 1rem; border-left: 4px solid #ddd; margin-bottom: 0.5rem; background: #fafafa; }
    .check.pass { border-color: #28a745; }
    .check.fail { border-color: #dc3545; }
    .check.skipped { border-color: #6c757d; }
    .check-name { font-weight: 600; margin-bottom: 0.25rem; }
    .check-meta { font-size: 0.85rem; color: #666; }
    .failures { margin-top: 2rem; }
    .failure { padding: 1rem; background: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Deployment Readiness Report</h1>
    <div class="timestamp">${this.results.timestamp}</div>

    <div class="status ${this.results.passed ? 'passed' : 'failed'}">
      ${this.results.passed ? '✓ READY FOR DEPLOYMENT' : '✗ DEPLOYMENT BLOCKED'}
    </div>

    <div class="summary">
      <div class="stat">
        <div class="stat-label">Total Checks</div>
        <div class="stat-value">${this.results.checks.length}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Passed</div>
        <div class="stat-value">${this.results.checks.filter(c => c.status === 'pass').length}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Failed</div>
        <div class="stat-value">${this.results.checks.filter(c => c.status === 'fail').length}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Duration</div>
        <div class="stat-value">${Math.round(this.results.duration / 1000)}s</div>
      </div>
    </div>

    <div class="checks">
      <h2>Check Results</h2>
      ${this.results.checks.map(check => `
        <div class="check ${check.status}">
          <div class="check-name">${check.name} ${check.critical ? '(CRITICAL)' : ''}</div>
          <div class="check-meta">
            Status: ${check.status.toUpperCase()}
            ${check.duration ? `| Duration: ${Math.round(check.duration / 1000)}s` : ''}
          </div>
          ${check.error ? `<div style="margin-top: 0.5rem; color: #721c24;">${check.error}</div>` : ''}
        </div>
      `).join('')}
    </div>

    ${this.results.criticalFailures.length > 0 ? `
      <div class="failures">
        <h2>Critical Failures</h2>
        ${this.results.criticalFailures.map(failure => `
          <div class="failure">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">${failure.check}</div>
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">${failure.command}</div>
            <div style="font-size: 0.9rem;">${failure.error}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  </div>
</body>
</html>
    `;

    await writeFile(htmlReportPath, html.trim());

    this.log('info', `Reports generated:`);
    this.log('info', `  - ${reportPath}`);
    this.log('info', `  - ${htmlReportPath}`);
  }

  async run() {
    this.banner('PRE-DEPLOYMENT CHECKLIST');

    this.log('info', 'Starting deployment readiness checks...');
    if (this.options.quick) {
      this.log('info', 'Running in QUICK mode (skipping slow checks)');
    }
    if (this.options.stagingUrl) {
      this.log('info', `Testing staging: ${this.options.stagingUrl}`);
    }

    // Run all checks
    for (const check of CHECKLIST_ITEMS) {
      await this.runCheck(check);
    }

    // Calculate results
    this.results.duration = Date.now() - this.startTime;
    this.results.passed =
      this.results.criticalFailures.length === 0 &&
      this.results.checks.filter(c => c.critical && c.status === 'fail').length === 0;

    // Generate reports
    await this.generateReport();

    // Final summary
    this.section('FINAL SUMMARY');

    const totalChecks = this.results.checks.length;
    const passedChecks = this.results.checks.filter(c => c.status === 'pass').length;
    const failedChecks = this.results.checks.filter(c => c.status === 'fail').length;
    const skippedChecks = this.results.checks.filter(c => c.status === 'skipped').length;

    console.log(`${colors.bright}Results:${colors.reset}`);
    console.log(`  Total Checks:       ${totalChecks}`);
    console.log(`  ${colors.green}Passed:${colors.reset}             ${passedChecks}`);
    console.log(`  ${colors.red}Failed:${colors.reset}             ${failedChecks}`);
    console.log(`  ${colors.dim}Skipped:${colors.reset}            ${skippedChecks}`);
    console.log(`  ${colors.yellow}Warnings:${colors.reset}           ${this.results.warnings.length}`);
    console.log(`  Duration:           ${Math.round(this.results.duration / 1000)}s\n`);

    if (this.results.passed) {
      this.banner('✓ DEPLOYMENT APPROVED');
      this.log('success', 'All critical checks passed. Ready for deployment!');
      console.log();
      process.exit(0);
    } else {
      this.banner('✗ DEPLOYMENT BLOCKED');
      this.log('error', `${this.results.criticalFailures.length} critical failure(s) detected.`);
      console.log();

      this.results.criticalFailures.forEach((failure, idx) => {
        console.log(`${colors.red}${idx + 1}. ${failure.check}${colors.reset}`);
        console.log(`   Command: ${colors.dim}${failure.command}${colors.reset}`);
        console.log(`   ${failure.error}\n`);
      });

      process.exit(1);
    }
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  quick: args.includes('--quick'),
  skipBuild: args.includes('--skip-build'),
  stagingUrl: args.find(arg => arg.startsWith('--staging-url='))?.split('=')[1],
};

// Run checklist
const checklist = new PreDeployChecklist(options);
checklist.run().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
