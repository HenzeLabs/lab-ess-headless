#!/usr/bin/env node

/**
 * Link Checker & 404 Validator
 *
 * Crawls the site and validates:
 * - Internal links are not broken
 * - No 404 errors (except intentional)
 * - External links are accessible
 * - Redirects are working correctly
 *
 * Usage: node scripts/check-links.mjs [--url=http://localhost:3000] [--max-pages=50]
 */

import { execSync } from 'child_process';
import { readFile } from 'fs/promises';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const DEFAULT_MAX_PAGES = 50;
const TIMEOUT = 10000; // 10 seconds per request

class LinkChecker {
  constructor(baseUrl = 'http://localhost:3000', maxPages = DEFAULT_MAX_PAGES) {
    this.baseUrl = baseUrl;
    this.maxPages = maxPages;
    this.visited = new Set();
    this.brokenLinks = [];
    this.redirects = [];
    this.slowLinks = [];
    this.results = {
      passed: true,
      totalLinks: 0,
      brokenLinks: 0,
      redirects: 0,
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

  async checkLink(url, source = null) {
    if (this.visited.has(url)) {
      return true;
    }

    this.visited.add(url);
    this.results.totalLinks++;

    try {
      const startTime = Date.now();

      // Use curl for link checking
      const curlCmd = `curl -s -o /dev/null -w "%{http_code}|%{redirect_url}|%{time_total}" -L --max-time ${TIMEOUT / 1000} "${url}"`;

      const output = execSync(curlCmd, {
        encoding: 'utf-8',
        timeout: TIMEOUT,
      }).trim();

      const [statusCode, redirectUrl, timeTotal] = output.split('|');
      const responseTime = Math.round(parseFloat(timeTotal) * 1000);

      // Check status
      if (statusCode === '404') {
        this.brokenLinks.push({ url, source, status: 404 });
        this.log('error', `404 Not Found: ${url}`);
        return false;
      }

      if (statusCode.startsWith('5')) {
        this.brokenLinks.push({ url, source, status: parseInt(statusCode) });
        this.log('error', `Server Error ${statusCode}: ${url}`);
        return false;
      }

      if (statusCode.startsWith('4') && statusCode !== '404') {
        this.brokenLinks.push({ url, source, status: parseInt(statusCode) });
        this.log('error', `Client Error ${statusCode}: ${url}`);
        return false;
      }

      // Check for redirects
      if (redirectUrl && redirectUrl !== url) {
        this.redirects.push({ from: url, to: redirectUrl });
        this.log('info', `Redirect: ${url} → ${redirectUrl}`);
      }

      // Check for slow links
      if (responseTime > 3000) {
        this.slowLinks.push({ url, time: responseTime });
        this.log('warn', `Slow response (${responseTime}ms): ${url}`);
      }

      return true;
    } catch (error) {
      this.brokenLinks.push({ url, source, error: error.message });
      this.log('error', `Failed to check: ${url}`, error.message);
      return false;
    }
  }

  async crawlPage(url) {
    if (this.visited.size >= this.maxPages) {
      this.log('info', `Reached maximum page limit (${this.maxPages})`);
      return;
    }

    this.log('info', `Crawling: ${url}`);

    try {
      const html = execSync(`curl -s -L "${url}"`, { encoding: 'utf-8' });

      // Extract links using regex (simple approach)
      const linkRegex = /href=["']([^"']+)["']/g;
      let match;

      while ((match = linkRegex.exec(html)) !== null) {
        const link = match[1];

        // Skip non-HTTP links
        if (
          link.startsWith('#') ||
          link.startsWith('mailto:') ||
          link.startsWith('tel:') ||
          link.startsWith('javascript:')
        ) {
          continue;
        }

        // Resolve relative URLs
        let fullUrl;
        if (link.startsWith('http')) {
          fullUrl = link;
        } else if (link.startsWith('//')) {
          fullUrl = 'https:' + link;
        } else if (link.startsWith('/')) {
          fullUrl = this.baseUrl + link;
        } else {
          fullUrl = this.baseUrl + '/' + link;
        }

        // Check internal links
        if (fullUrl.startsWith(this.baseUrl)) {
          await this.checkLink(fullUrl, url);

          // Recursively crawl internal pages
          if (this.visited.size < this.maxPages && !this.visited.has(fullUrl)) {
            await this.crawlPage(fullUrl);
          }
        }
      }
    } catch (error) {
      this.log('warn', `Could not crawl page: ${url}`, error.message);
    }
  }

  async checkExternalLinks() {
    this.section('Checking External Links');

    const externalLinks = [
      'https://cdn.shopify.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ];

    for (const link of externalLinks) {
      this.log('info', `Checking external: ${link}`);
      await this.checkLink(link);
    }
  }

  async run() {
    console.log(colors.bright + colors.cyan);
    console.log('═'.repeat(80));
    console.log('  LINK CHECKER & 404 VALIDATOR');
    console.log('═'.repeat(80));
    console.log(colors.reset);

    this.log('info', `Starting crawl from ${this.baseUrl}`);
    this.log('info', `Maximum pages to crawl: ${this.maxPages}`);

    // Check if server is running
    try {
      execSync(`curl -s -o /dev/null -w "%{http_code}" "${this.baseUrl}"`, {
        encoding: 'utf-8',
        timeout: 5000,
      });
    } catch (error) {
      this.log('error', `Server not reachable at ${this.baseUrl}`);
      this.log('info', 'Start the development server with: npm run dev');
      process.exit(1);
    }

    // Crawl starting from home page
    await this.crawlPage(this.baseUrl);

    // Check important pages
    const criticalPages = [
      '/',
      '/products',
      '/collections',
      '/cart',
      '/search',
    ];

    this.section('Checking Critical Pages');

    for (const page of criticalPages) {
      const url = this.baseUrl + page;
      if (!this.visited.has(url)) {
        await this.checkLink(url);
      }
    }

    // Check external links
    await this.checkExternalLinks();

    // Load exclusions from config
    let exclusions = { intentional404s: [] };
    try {
      const config = JSON.parse(
        await readFile('./deployment-gates.config.json', 'utf-8')
      );
      exclusions = config.exclusions || exclusions;
    } catch (error) {
      // Config not found, use defaults
    }

    // Filter out intentional 404s
    this.brokenLinks = this.brokenLinks.filter(
      link => !exclusions.intentional404s.some(pattern => link.url.includes(pattern))
    );

    // Calculate results
    this.results.brokenLinks = this.brokenLinks.length;
    this.results.redirects = this.redirects.length;
    this.results.passed = this.brokenLinks.length === 0;

    // Summary
    this.section('LINK CHECK SUMMARY');

    console.log(`${colors.bright}Results:${colors.reset}`);
    console.log(`  Total Links Checked: ${colors.cyan}${this.results.totalLinks}${colors.reset}`);
    console.log(`  Broken Links:        ${colors.red}${this.results.brokenLinks}${colors.reset}`);
    console.log(`  Redirects:           ${colors.yellow}${this.results.redirects}${colors.reset}`);
    console.log(`  Slow Links:          ${colors.yellow}${this.slowLinks.length}${colors.reset}\n`);

    if (this.brokenLinks.length > 0) {
      console.log(`${colors.red}${colors.bright}BROKEN LINKS FOUND${colors.reset}\n`);
      this.brokenLinks.forEach((link, idx) => {
        console.log(`${colors.red}${idx + 1}. ${link.url}${colors.reset}`);
        if (link.source) {
          console.log(`   Found on: ${link.source}`);
        }
        if (link.status) {
          console.log(`   Status: ${link.status}`);
        }
        console.log();
      });
      process.exit(1);
    } else if (this.redirects.length > 0) {
      console.log(`${colors.yellow}${colors.bright}LINK CHECK PASSED WITH REDIRECTS${colors.reset}\n`);
      this.redirects.forEach((redirect, idx) => {
        console.log(`${colors.yellow}${idx + 1}. ${redirect.from} → ${redirect.to}${colors.reset}`);
      });
      console.log();
      process.exit(0);
    } else {
      console.log(`${colors.green}${colors.bright}ALL LINKS VALID${colors.reset}\n`);
      process.exit(0);
    }
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const baseUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';
const maxPages = parseInt(
  args.find(arg => arg.startsWith('--max-pages='))?.split('=')[1] || DEFAULT_MAX_PAGES
);

const checker = new LinkChecker(baseUrl, maxPages);
checker.run().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
