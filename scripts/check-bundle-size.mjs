#!/usr/bin/env node

/**
 * Bundle Size Checker
 *
 * Validates that the production bundle meets size budgets defined in
 * deployment-gates.config.json
 *
 * Usage: node scripts/check-bundle-size.mjs
 */

import { readFile } from 'fs/promises';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const GATE_CONFIG_PATH = './deployment-gates.config.json';
const BUILD_DIR = './.next';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function getDirectorySize(dirPath) {
  let totalSize = 0;

  async function traverse(currentPath) {
    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await traverse(fullPath);
        } else if (entry.isFile()) {
          const stats = await stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  await traverse(dirPath);
  return totalSize;
}

async function analyzeBundle() {
  console.log(`${colors.cyan}Bundle Size Analysis${colors.reset}\n`);

  try {
    // Load gate configuration
    const configData = await readFile(GATE_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(configData);
    const budgets = config.performanceBudgets.bundle;

    // Check if build exists
    try {
      await stat(BUILD_DIR);
    } catch (error) {
      console.error(`${colors.red}Error: No production build found at ${BUILD_DIR}${colors.reset}`);
      console.log('Run "npm run build" first.');
      process.exit(1);
    }

    // Analyze JavaScript bundles
    const jsDir = join(BUILD_DIR, 'static/chunks');
    const jsSize = await getDirectorySize(jsDir);
    const jsKb = Math.round(jsSize / 1024);

    // Analyze CSS
    const cssDir = join(BUILD_DIR, 'static/css');
    const cssSize = await getDirectorySize(cssDir);
    const cssKb = Math.round(cssSize / 1024);

    // Check for fonts
    let fontKb = 0;
    try {
      const fontDir = join(BUILD_DIR, 'static/fonts');
      const fontSize = await getDirectorySize(fontDir);
      fontKb = Math.round(fontSize / 1024);
    } catch (error) {
      // No fonts directory
    }

    // Results
    const results = {
      js: { actual: jsKb, budget: budgets.maxJsKb, pass: jsKb <= budgets.maxJsKb },
      css: { actual: cssKb, budget: budgets.maxCssKb, pass: cssKb <= budgets.maxCssKb },
      fonts: { actual: fontKb, budget: budgets.maxFontsKb, pass: fontKb <= budgets.maxFontsKb },
    };

    // Output results
    console.log('Bundle Size Report:\n');

    Object.entries(results).forEach(([type, data]) => {
      const status = data.pass ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
      const percentage = Math.round((data.actual / data.budget) * 100);

      console.log(`${type.toUpperCase().padEnd(8)} ${status}`);
      console.log(`  Actual:  ${data.actual} KB`);
      console.log(`  Budget:  ${data.budget} KB`);
      console.log(`  Usage:   ${percentage}%`);
      console.log();
    });

    // Check overall pass/fail
    const allPassed = Object.values(results).every(r => r.pass);

    if (allPassed) {
      console.log(`${colors.green}All bundle size checks passed!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.red}Bundle size check failed. Optimize bundles to meet budgets.${colors.reset}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}Error analyzing bundle:${colors.reset}`, error.message);
    process.exit(1);
  }
}

analyzeBundle();
