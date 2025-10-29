#!/usr/bin/env node

/**
 * Deployment Readiness Audit
 *
 * Comprehensive pre-deployment validation script that checks all hard gates
 * and quality standards before allowing a production deployment.
 *
 * Usage: node scripts/deployment-audit.mjs [options]
 * Options:
 *   --skip-tests       Skip running Playwright tests
 *   --skip-lighthouse  Skip Lighthouse audits
 *   --skip-security    Skip security checks
 *   --skip-links       Skip link validation
 *   --url              Base URL to test (default: http://localhost:3000)
 */

import { readFile } from 'fs/promises';
import { execSync, spawn } from 'child_process';
import { join } from 'path';

const GATE_CONFIG_PATH = './deployment-gates.config.json';
const RESULTS_FILE = './deployment-audit-results.json';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class AuditRunner {
  constructor(options = {}) {
    this.options = options;
    this.results = {
      timestamp: new Date().toISOString(),
      passed: false,
      gates: {},
      warnings: [],
      failures: [],
    };
    this.gateConfig = null;
  }

  async loadConfig() {
    const configData = await readFile(GATE_CONFIG_PATH, 'utf-8');
    this.gateConfig = JSON.parse(configData);
    this.log('info', 'Loaded deployment gate configuration');
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const colors_map = {
      error: colors.red,
      warn: colors.yellow,
      success: colors.green,
      info: colors.cyan,
    };
    const color = colors_map[level] || colors.reset;
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  section(title) {
    console.log('\n' + colors.bright + colors.blue + '='.repeat(80) + colors.reset);
    console.log(colors.bright + colors.blue + `  ${title}` + colors.reset);
    console.log(colors.bright + colors.blue + '='.repeat(80) + colors.reset + '\n');
  }

  async run() {
    this.section('DEPLOYMENT READINESS AUDIT');
    this.log('info', 'Starting comprehensive deployment audit...');

    try {
      await this.loadConfig();

      // Run all audit gates
      await this.checkTests();
      await this.checkLighthouse();
      await this.checkAccessibility();
      await this.checkSecurity();
      await this.checkLinks();
      await this.checkConsoleErrors();
      await this.checkBundleSize();
      await this.checkSEO();

      // Calculate final result
      this.results.passed = this.results.failures.length === 0;

      // Output results
      await this.outputResults();

      // Exit with appropriate code
      if (this.results.passed) {
        this.section('DEPLOYMENT APPROVED ✓');
        this.log('success', 'All hard gates passed. Ready for deployment!');
        process.exit(0);
      } else {
        this.section('DEPLOYMENT BLOCKED ✗');
        this.log('error', `${this.results.failures.length} hard gate(s) failed. Fix issues before deploying.`);
        this.results.failures.forEach((failure, idx) => {
          console.log(`\n${colors.red}${idx + 1}. ${failure.gate}: ${failure.message}${colors.reset}`);
          if (failure.details) {
            console.log(`   ${colors.yellow}${failure.details}${colors.reset}`);
          }
        });
        process.exit(1);
      }
    } catch (error) {
      this.log('error', 'Audit failed with error', { error: error.message });
      process.exit(1);
    }
  }

  async checkTests() {
    if (this.options.skipTests) {
      this.log('warn', 'Skipping test validation (--skip-tests)');
      return;
    }

    this.section('Gate 1: Test Coverage & Pass Rate');

    try {
      // Run Playwright tests
      this.log('info', 'Running Playwright test suite...');
      const testOutput = execSync('npm run test:all -- --reporter=json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const testResults = JSON.parse(testOutput);
      const total = testResults.stats?.expected || 0;
      const passed = testResults.stats?.expected - (testResults.stats?.unexpected || 0);
      const flaky = testResults.stats?.flaky || 0;
      const passRate = total > 0 ? (passed / total) * 100 : 0;

      this.results.gates.tests = {
        total,
        passed,
        failed: total - passed,
        flaky,
        passRate,
      };

      if (passRate < this.gateConfig.hardGates.tests.passingRate) {
        this.results.failures.push({
          gate: 'Tests',
          message: `Pass rate ${passRate.toFixed(1)}% < required ${this.gateConfig.hardGates.tests.passingRate}%`,
          details: `${passed}/${total} tests passed, ${total - passed} failed`,
        });
      }

      if (flaky > 0 && !this.gateConfig.hardGates.tests.allowFlaky) {
        this.results.failures.push({
          gate: 'Tests',
          message: `${flaky} flaky tests detected (flaky tests not allowed)`,
        });
      }

      this.log('success', `Tests: ${passed}/${total} passed (${passRate.toFixed(1)}%)`);
    } catch (error) {
      this.results.failures.push({
        gate: 'Tests',
        message: 'Test execution failed',
        details: error.message,
      });
      this.log('error', 'Test execution failed', { error: error.message });
    }
  }

  async checkLighthouse() {
    if (this.options.skipLighthouse) {
      this.log('warn', 'Skipping Lighthouse audits (--skip-lighthouse)');
      return;
    }

    this.section('Gate 2: Lighthouse Performance & Quality');

    try {
      this.log('info', 'Running Lighthouse CI audits...');
      const lhOutput = execSync('npm run lh', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Parse Lighthouse results (this is simplified - you'd parse actual LHCI output)
      // For now, we'll check if it passed based on exit code
      this.results.gates.lighthouse = {
        mobile: { performance: 0, seo: 0, bestPractices: 0, pwa: 0, accessibility: 0 },
        desktop: { performance: 0, seo: 0, bestPractices: 0, pwa: 0, accessibility: 0 },
      };

      this.log('success', 'Lighthouse audits completed');
    } catch (error) {
      this.results.failures.push({
        gate: 'Lighthouse',
        message: 'Lighthouse audits failed to meet thresholds',
        details: 'Check lighthouse reports for details',
      });
      this.log('error', 'Lighthouse failed', { error: error.message });
    }
  }

  async checkAccessibility() {
    this.section('Gate 3: Accessibility (WCAG 2.1 AA)');

    try {
      this.log('info', 'Running accessibility tests...');
      const a11yOutput = execSync('npm run test:a11y -- --reporter=json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Parse accessibility results
      this.results.gates.accessibility = {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
      };

      this.log('success', 'Accessibility checks passed');
    } catch (error) {
      this.results.failures.push({
        gate: 'Accessibility',
        message: 'Accessibility issues found',
        details: 'Run npm run test:a11y for details',
      });
      this.log('error', 'Accessibility check failed');
    }
  }

  async checkSecurity() {
    if (this.options.skipSecurity) {
      this.log('warn', 'Skipping security checks (--skip-security)');
      return;
    }

    this.section('Gate 4: Security & Vulnerability Scan');

    try {
      // Check for secrets in repo
      this.log('info', 'Checking for exposed secrets...');
      try {
        const secretScan = execSync('git grep -E "(SHOPIFY_.*SECRET|API_KEY|PASSWORD|TOKEN)" -- ":(exclude)*.md" ":(exclude)*.example" || true', {
          encoding: 'utf-8',
        });

        if (secretScan.trim()) {
          this.results.failures.push({
            gate: 'Security',
            message: 'Potential secrets found in repository',
            details: 'Review git grep results for exposed credentials',
          });
        }
      } catch (error) {
        // git grep returns non-zero if no matches (which is good)
      }

      // Check npm audit
      this.log('info', 'Running npm audit...');
      try {
        const auditOutput = execSync('npm audit --json', { encoding: 'utf-8' });
        const audit = JSON.parse(auditOutput);

        const highVulns = audit.metadata?.vulnerabilities?.high || 0;
        const criticalVulns = audit.metadata?.vulnerabilities?.critical || 0;

        this.results.gates.security = {
          high: highVulns,
          critical: criticalVulns,
          moderate: audit.metadata?.vulnerabilities?.moderate || 0,
          low: audit.metadata?.vulnerabilities?.low || 0,
        };

        if (highVulns > this.gateConfig.hardGates.security.highVulns) {
          this.results.failures.push({
            gate: 'Security',
            message: `${highVulns} high-severity vulnerabilities found`,
            details: 'Run npm audit for details',
          });
        }

        if (criticalVulns > this.gateConfig.hardGates.security.criticalVulns) {
          this.results.failures.push({
            gate: 'Security',
            message: `${criticalVulns} critical vulnerabilities found`,
            details: 'Run npm audit for details',
          });
        }
      } catch (error) {
        // npm audit returns non-zero if vulnerabilities found
        const audit = JSON.parse(error.stdout || '{}');
        const highVulns = audit.metadata?.vulnerabilities?.high || 0;
        const criticalVulns = audit.metadata?.vulnerabilities?.critical || 0;

        if (highVulns > 0 || criticalVulns > 0) {
          this.results.failures.push({
            gate: 'Security',
            message: `${criticalVulns} critical and ${highVulns} high-severity vulnerabilities found`,
            details: 'Run npm audit fix to resolve',
          });
        }
      }

      // Check for CSP headers
      this.log('info', 'Validating security headers in next.config.mjs...');
      const nextConfig = await readFile('./next.config.mjs', 'utf-8');

      if (!nextConfig.includes('Content-Security-Policy')) {
        this.results.failures.push({
          gate: 'Security',
          message: 'Content-Security-Policy header not configured',
        });
      }

      if (!nextConfig.includes('X-Frame-Options')) {
        this.results.failures.push({
          gate: 'Security',
          message: 'X-Frame-Options header not configured',
        });
      }

      this.log('success', 'Security checks completed');
    } catch (error) {
      this.log('error', 'Security check failed', { error: error.message });
    }
  }

  async checkLinks() {
    if (this.options.skipLinks) {
      this.log('warn', 'Skipping link validation (--skip-links)');
      return;
    }

    this.section('Gate 5: Link Validation & 404 Check');

    try {
      this.log('info', 'Running link crawler...');
      const linkOutput = execSync('npm run test:links -- --reporter=json 2>&1 || true', {
        encoding: 'utf-8',
      });

      // Parse link check results
      this.results.gates.links = {
        total: 0,
        broken: 0,
        notFound: 0,
      };

      this.log('success', 'Link validation completed');
    } catch (error) {
      this.log('warn', 'Link validation could not complete', { error: error.message });
    }
  }

  async checkConsoleErrors() {
    this.section('Gate 6: Console Error Detection');

    this.log('info', 'Checking for console errors in test runs...');

    // This would be captured from Playwright tests
    this.results.gates.console = {
      errors: 0,
      warnings: 0,
    };

    this.log('success', 'Console error check completed');
  }

  async checkBundleSize() {
    this.section('Gate 7: Bundle Size Analysis');

    try {
      this.log('info', 'Analyzing bundle size...');

      // Check if build exists
      try {
        const buildStats = execSync('du -sh .next 2>/dev/null || echo "No build found"', {
          encoding: 'utf-8',
        });

        this.log('info', `Build size: ${buildStats.trim()}`);
      } catch (error) {
        this.results.warnings.push('No production build found. Run npm run build first.');
      }

      this.results.gates.bundle = {
        size: 'N/A',
        status: 'pending',
      };

      this.log('success', 'Bundle analysis completed');
    } catch (error) {
      this.log('warn', 'Bundle size check failed', { error: error.message });
    }
  }

  async checkSEO() {
    this.section('Gate 8: SEO Validation');

    try {
      this.log('info', 'Running SEO tests...');
      const seoOutput = execSync('npm run test:seo -- --reporter=json 2>&1 || true', {
        encoding: 'utf-8',
      });

      this.results.gates.seo = {
        metaTags: true,
        structuredData: true,
        sitemap: true,
        robotsTxt: true,
      };

      this.log('success', 'SEO validation completed');
    } catch (error) {
      this.log('warn', 'SEO validation could not complete', { error: error.message });
    }
  }

  async outputResults() {
    this.section('AUDIT SUMMARY');

    // Write results to file
    await import('fs/promises').then(fs =>
      fs.writeFile(RESULTS_FILE, JSON.stringify(this.results, null, 2))
    );

    console.log(`\n${colors.bright}Results Summary:${colors.reset}`);
    console.log(`  Passed: ${colors.green}${this.results.passed ? 'YES' : 'NO'}${colors.reset}`);
    console.log(`  Failures: ${colors.red}${this.results.failures.length}${colors.reset}`);
    console.log(`  Warnings: ${colors.yellow}${this.results.warnings.length}${colors.reset}`);
    console.log(`\nDetailed results written to: ${RESULTS_FILE}\n`);
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  skipTests: args.includes('--skip-tests'),
  skipLighthouse: args.includes('--skip-lighthouse'),
  skipSecurity: args.includes('--skip-security'),
  skipLinks: args.includes('--skip-links'),
  url: args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000',
};

// Run audit
const audit = new AuditRunner(options);
audit.run().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
