#!/usr/bin/env node

/**
 * Security Audit Script
 *
 * Comprehensive security checks including:
 * - Secret detection in repository
 * - npm vulnerability scan
 * - Security header validation
 * - Environment variable checks
 * - Dependency license compliance
 *
 * Usage: node scripts/check-security.mjs
 */

import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const REQUIRED_HEADERS = [
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
];

const SECRET_PATTERNS = [
  { pattern: 'SHOPIFY.*SECRET|SHOPIFY.*ACCESS_TOKEN', name: 'Shopify Secrets' },
  { pattern: 'API_KEY|APIKEY', name: 'API Keys' },
  { pattern: 'PASSWORD|passwd', name: 'Passwords' },
  { pattern: 'private.*key|PRIVATE.*KEY', name: 'Private Keys' },
  { pattern: 'JWT.*SECRET|JWT.*KEY', name: 'JWT Secrets' },
  { pattern: 'aws.*secret|AWS.*SECRET', name: 'AWS Secrets' },
];

class SecurityAuditor {
  constructor() {
    this.results = {
      passed: true,
      checks: [],
      failures: [],
      warnings: [],
    };
  }

  log(level, message, details = null) {
    const colorMap = {
      error: colors.red,
      warn: colors.yellow,
      success: colors.green,
      info: colors.cyan,
    };

    const color = colorMap[level] || colors.reset;
    console.log(`${color}[${level.toUpperCase()}] ${message}${colors.reset}`);
    if (details) {
      console.log(`  ${details}`);
    }
  }

  section(title) {
    console.log('\n' + colors.bright + colors.cyan + '━'.repeat(80) + colors.reset);
    console.log(colors.bright + `  ${title}` + colors.reset);
    console.log(colors.bright + colors.cyan + '━'.repeat(80) + colors.reset + '\n');
  }

  async checkSecretsInRepo() {
    this.section('1. Secret Detection in Repository');

    const foundSecrets = [];

    for (const { pattern, name } of SECRET_PATTERNS) {
      try {
        // Use git grep to search for patterns, excluding safe files and patterns
        const result = execSync(
          `git grep -i -E "${pattern}" -- ":(exclude)*.md" ":(exclude)*.example" ":(exclude).env.example" ":(exclude)scripts/check-security.mjs" ":(exclude)scripts/verify-env.js" ":(exclude)scripts/archive/*" ":(exclude)node_modules" ":(exclude).github/workflows/*" || true`,
          { encoding: 'utf-8' }
        );

        if (result.trim()) {
          // Filter out safe patterns (environment variable references)
          const lines = result.trim().split('\n');
          const unsafeLines = lines.filter(line => {
            // Safe patterns:
            // - process.env.VARIABLE_NAME
            // - const VARIABLE = process.env.VARIABLE
            // - ${{ secrets.VARIABLE_NAME }}
            // - Environment variable names in comments or checks
            // - HTTP headers using env variables
            // - HMAC functions using env variables
            const safePatterns = [
              'process.env',
              'secrets.',
              'env vars',
              'environment variable',
              'export ',
              'Missing ',
              'not set',
              'not configured',
              'const ',
              'createHmac',
              'X-Shopify-Storefront-Access-Token',
              'if (!',
              'private getKey',  // TypeScript private methods
              'private key',     // Cryptographic references (not actual keys)
              'grep -',          // Grep commands in scripts
              'rg -',            // Ripgrep commands
            ];

            return !safePatterns.some(pattern => line.includes(pattern));
          });

          if (unsafeLines.length > 0) {
            foundSecrets.push({ name, matches: unsafeLines.length });
          }
        }
      } catch (error) {
        // git grep returns non-zero if no matches found (which is good)
      }
    }

    if (foundSecrets.length > 0) {
      this.results.passed = false;
      foundSecrets.forEach(secret => {
        this.results.failures.push({
          check: 'Secret Detection',
          message: `Potential ${secret.name} found in repository (${secret.matches} matches)`,
        });
        this.log('error', `Found ${secret.matches} potential ${secret.name} in repository`);
      });
    } else {
      this.log('success', 'No secrets detected in repository');
      this.results.checks.push({ name: 'Secret Detection', status: 'pass' });
    }
  }

  async checkNpmVulnerabilities() {
    this.section('2. NPM Vulnerability Scan');

    try {
      const auditOutput = execSync('npm audit --json', { encoding: 'utf-8' });
      const audit = JSON.parse(auditOutput);

      const critical = audit.metadata?.vulnerabilities?.critical || 0;
      const high = audit.metadata?.vulnerabilities?.high || 0;
      const moderate = audit.metadata?.vulnerabilities?.moderate || 0;
      const low = audit.metadata?.vulnerabilities?.low || 0;

      this.log('info', `Vulnerabilities found: ${critical} critical, ${high} high, ${moderate} moderate, ${low} low`);

      if (critical > 0) {
        this.results.passed = false;
        this.results.failures.push({
          check: 'NPM Audit',
          message: `${critical} critical vulnerabilities found`,
        });
        this.log('error', `${critical} CRITICAL vulnerabilities must be fixed`);
      }

      if (high > 0) {
        this.results.passed = false;
        this.results.failures.push({
          check: 'NPM Audit',
          message: `${high} high-severity vulnerabilities found`,
        });
        this.log('error', `${high} HIGH vulnerabilities must be fixed`);
      }

      if (moderate > 0) {
        this.results.warnings.push(`${moderate} moderate-severity vulnerabilities found`);
        this.log('warn', `${moderate} moderate vulnerabilities should be reviewed`);
      }

      if (critical === 0 && high === 0) {
        this.log('success', 'No critical or high-severity vulnerabilities');
        this.results.checks.push({ name: 'NPM Audit', status: 'pass' });
      }
    } catch (error) {
      // npm audit returns non-zero if vulnerabilities found
      try {
        const audit = JSON.parse(error.stdout || '{}');
        const critical = audit.metadata?.vulnerabilities?.critical || 0;
        const high = audit.metadata?.vulnerabilities?.high || 0;

        if (critical > 0 || high > 0) {
          this.results.passed = false;
          this.results.failures.push({
            check: 'NPM Audit',
            message: `${critical} critical and ${high} high-severity vulnerabilities found`,
          });
          this.log('error', `Found ${critical} critical and ${high} high-severity vulnerabilities`);
          this.log('info', 'Run "npm audit fix" to resolve automatically fixable issues');
        }
      } catch (parseError) {
        this.log('warn', 'Could not parse npm audit output');
      }
    }
  }

  async checkSecurityHeaders() {
    this.section('3. Security Headers Validation');

    try {
      const nextConfig = await readFile('./next.config.mjs', 'utf-8');

      const missingHeaders = [];

      for (const header of REQUIRED_HEADERS) {
        if (!nextConfig.includes(header)) {
          missingHeaders.push(header);
        }
      }

      if (missingHeaders.length > 0) {
        this.results.passed = false;
        this.results.failures.push({
          check: 'Security Headers',
          message: `Missing security headers: ${missingHeaders.join(', ')}`,
        });
        missingHeaders.forEach(header => {
          this.log('error', `Missing header: ${header}`);
        });
      } else {
        this.log('success', 'All required security headers configured');
        this.results.checks.push({ name: 'Security Headers', status: 'pass' });
      }

      // Check CSP quality
      if (nextConfig.includes("'unsafe-eval'")) {
        this.results.warnings.push("CSP contains 'unsafe-eval' - consider removing for production");
        this.log('warn', "CSP contains 'unsafe-eval' directive");
      }

      if (nextConfig.includes("'unsafe-inline'")) {
        this.results.warnings.push("CSP contains 'unsafe-inline' - consider using nonces or hashes");
        this.log('warn', "CSP contains 'unsafe-inline' directive");
      }
    } catch (error) {
      this.log('error', 'Could not read next.config.mjs', error.message);
    }
  }

  async checkEnvironmentVariables() {
    this.section('4. Environment Variable Security');

    // Check if .env file exists (shouldn't in repo)
    if (existsSync('.env')) {
      this.results.warnings.push('.env file exists in repository - ensure it is gitignored');
      this.log('warn', '.env file found in repository (should be in .gitignore)');
    }

    // Check .env.example exists
    if (!existsSync('.env.example')) {
      this.results.warnings.push('.env.example file missing - developers may not know required variables');
      this.log('warn', '.env.example file not found');
    } else {
      this.log('success', '.env.example file present');
    }

    // Validate required environment variables
    const requiredVars = [
      'SHOPIFY_STORE_DOMAIN',
      'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
      'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN',
    ];

    const envExample = existsSync('.env.example')
      ? await readFile('.env.example', 'utf-8')
      : '';

    const missingVars = requiredVars.filter(v => !envExample.includes(v));

    if (missingVars.length > 0) {
      this.results.warnings.push(`Missing variables in .env.example: ${missingVars.join(', ')}`);
      this.log('warn', `Missing variables in .env.example: ${missingVars.join(', ')}`);
    }
  }

  async checkHTTPS() {
    this.section('5. HTTPS & Transport Security');

    try {
      const nextConfig = await readFile('./next.config.mjs', 'utf-8');

      // Check if HSTS is configured
      if (!nextConfig.includes('Strict-Transport-Security')) {
        this.results.warnings.push('HSTS (Strict-Transport-Security) header not configured');
        this.log('warn', 'Consider adding HSTS header for production');
      } else {
        this.log('success', 'HSTS header configured');
      }

      // Check for http:// in config
      if (nextConfig.includes('http://') && !nextConfig.includes('localhost')) {
        this.results.warnings.push('HTTP URLs found in configuration (should use HTTPS)');
        this.log('warn', 'HTTP URLs detected in configuration');
      }
    } catch (error) {
      this.log('warn', 'Could not check HTTPS configuration');
    }
  }

  async checkDependencies() {
    this.section('6. Dependency Security Review');

    try {
      const packageJson = JSON.parse(await readFile('./package.json', 'utf-8'));

      // Check for deprecated or risky packages
      const riskyPackages = [
        'request', // deprecated
        'node-uuid', // deprecated
        'colors', // supply chain attack history
      ];

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const foundRisky = riskyPackages.filter(pkg => allDeps[pkg]);

      if (foundRisky.length > 0) {
        this.results.warnings.push(`Potentially risky packages found: ${foundRisky.join(', ')}`);
        foundRisky.forEach(pkg => {
          this.log('warn', `Consider replacing risky/deprecated package: ${pkg}`);
        });
      } else {
        this.log('success', 'No known risky packages detected');
      }
    } catch (error) {
      this.log('warn', 'Could not check dependencies');
    }
  }

  async run() {
    console.log(colors.bright + colors.cyan);
    console.log('═'.repeat(80));
    console.log('  SECURITY AUDIT');
    console.log('═'.repeat(80));
    console.log(colors.reset);

    await this.checkSecretsInRepo();
    await this.checkNpmVulnerabilities();
    await this.checkSecurityHeaders();
    await this.checkEnvironmentVariables();
    await this.checkHTTPS();
    await this.checkDependencies();

    // Summary
    this.section('SECURITY AUDIT SUMMARY');

    console.log(`${colors.bright}Results:${colors.reset}`);
    console.log(`  Checks Passed: ${colors.green}${this.results.checks.length}${colors.reset}`);
    console.log(`  Failures:      ${colors.red}${this.results.failures.length}${colors.reset}`);
    console.log(`  Warnings:      ${colors.yellow}${this.results.warnings.length}${colors.reset}\n`);

    if (this.results.failures.length > 0) {
      console.log(`${colors.red}${colors.bright}SECURITY AUDIT FAILED${colors.reset}\n`);
      this.results.failures.forEach((failure, idx) => {
        console.log(`${colors.red}${idx + 1}. ${failure.check}: ${failure.message}${colors.reset}`);
      });
      console.log();
      process.exit(1);
    } else if (this.results.warnings.length > 0) {
      console.log(`${colors.yellow}${colors.bright}SECURITY AUDIT PASSED WITH WARNINGS${colors.reset}\n`);
      this.results.warnings.forEach((warning, idx) => {
        console.log(`${colors.yellow}${idx + 1}. ${warning}${colors.reset}`);
      });
      console.log();
      process.exit(0);
    } else {
      console.log(`${colors.green}${colors.bright}SECURITY AUDIT PASSED${colors.reset}\n`);
      process.exit(0);
    }
  }
}

const auditor = new SecurityAuditor();
auditor.run().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
