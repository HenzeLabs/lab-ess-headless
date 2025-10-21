#!/usr/bin/env node

/**
 * Brand Token Validation Script
 *
 * Scans source files for brand compliance violations:
 * - Hardcoded colors instead of CSS variables
 * - Hardcoded fonts instead of CSS variables
 * - Large pixel values that should use rem
 *
 * Usage:
 *   node scripts/validate-brand-tokens.js
 *   npm run validate:brand
 */

const fs = require('fs');
const path = require('path');
const { validateBrandCompliance, BRAND_TOKENS } = require('../lib/tailwind-brand-validator');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const SRC_DIR = path.join(__dirname, '..', 'src');
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css'];
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'build',
  'dist',
  '__tests__',
  '*.test.ts',
  '*.spec.ts',
];

/**
 * Recursively find all source files
 */
function findSourceFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(SRC_DIR, fullPath);

    // Skip excluded patterns
    if (EXCLUDE_PATTERNS.some(pattern => relativePath.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      findSourceFiles(fullPath, files);
    } else if (EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Format violation message
 */
function formatViolation(violation) {
  const severityColor = violation.severity === 'error' ? colors.red : colors.yellow;
  const icon = violation.severity === 'error' ? '✗' : '⚠';

  return [
    `${severityColor}${icon} ${violation.type.toUpperCase()}${colors.reset}`,
    `  ${colors.cyan}${violation.file}${colors.reset}`,
    `  ${violation.issue}`,
  ].join('\n');
}

/**
 * Main validation function
 */
function main() {
  console.log(`${colors.bold}${colors.cyan}Lab Essentials Brand Token Validator${colors.reset}\n`);

  console.log('Scanning source files for brand compliance violations...\n');

  const files = findSourceFiles(SRC_DIR);
  console.log(`Found ${files.length} source files to scan\n`);

  let allViolations = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    const violations = validateBrandCompliance(relativePath, content);

    if (violations.length > 0) {
      allViolations.push(...violations);
      violations.forEach(v => {
        if (v.severity === 'error') errorCount++;
        else warningCount++;
      });
    }
  }

  // Print violations grouped by type
  if (allViolations.length > 0) {
    console.log(`${colors.bold}Violations Found:${colors.reset}\n`);

    const violationsByType = {
      color: [],
      font: [],
      spacing: [],
    };

    allViolations.forEach(v => {
      violationsByType[v.type].push(v);
    });

    // Print color violations
    if (violationsByType.color.length > 0) {
      console.log(`${colors.bold}Color Violations (${violationsByType.color.length}):${colors.reset}`);
      violationsByType.color.forEach(v => console.log(formatViolation(v) + '\n'));
    }

    // Print font violations
    if (violationsByType.font.length > 0) {
      console.log(`${colors.bold}Font Violations (${violationsByType.font.length}):${colors.reset}`);
      violationsByType.font.forEach(v => console.log(formatViolation(v) + '\n'));
    }

    // Print spacing violations
    if (violationsByType.spacing.length > 0) {
      console.log(`${colors.bold}Spacing Violations (${violationsByType.spacing.length}):${colors.reset}`);
      violationsByType.spacing.forEach(v => console.log(formatViolation(v) + '\n'));
    }

    // Summary
    console.log(`${colors.bold}Summary:${colors.reset}`);
    console.log(`  ${colors.red}${errorCount} errors${colors.reset}`);
    console.log(`  ${colors.yellow}${warningCount} warnings${colors.reset}`);
    console.log(`  ${files.length} files scanned\n`);

    // Print brand guidelines
    console.log(`${colors.bold}${colors.cyan}Brand Guidelines:${colors.reset}`);
    console.log('\nAllowed Colors (use CSS variables):');
    BRAND_TOKENS.colors.allowed.forEach(color => {
      console.log(`  ${colors.green}✓${colors.reset} --${color}`);
    });

    console.log('\nAllowed Fonts (use CSS variables):');
    BRAND_TOKENS.fonts.allowed.forEach(font => {
      console.log(`  ${colors.green}✓${colors.reset} ${font}`);
    });

    console.log('\nForbidden Patterns:');
    BRAND_TOKENS.colors.forbidden.forEach(color => {
      console.log(`  ${colors.red}✗${colors.reset} ${color}`);
    });

    // Exit with error if violations found
    if (errorCount > 0) {
      console.log(`\n${colors.red}${colors.bold}Brand validation failed!${colors.reset}`);
      console.log('Fix errors before committing.\n');
      process.exit(1);
    } else {
      console.log(`\n${colors.yellow}${colors.bold}Warnings found, but build can continue.${colors.reset}\n`);
      process.exit(0);
    }
  } else {
    console.log(`${colors.green}${colors.bold}✓ No brand violations found!${colors.reset}`);
    console.log(`All ${files.length} source files comply with Lab Essentials brand guidelines.\n`);
    process.exit(0);
  }
}

// Run validation
main();
