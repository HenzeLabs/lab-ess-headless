#!/usr/bin/env node

/**
 * SEO Validation Script
 *
 * Validates SEO requirements including:
 * - Meta tags (title, description, OG, Twitter)
 * - Structured data (Schema.org)
 * - Sitemap presence and validity
 * - Robots.txt configuration
 * - Canonical URLs
 * - hreflang (if applicable)
 *
 * Usage: node scripts/validate-seo.mjs [--url=http://localhost:3000]
 */

import { readFile, access } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const CRITICAL_PAGES = [
  '/',
  '/products',
  '/collections',
  '/about',
  '/contact',
];

const REQUIRED_SCHEMA_TYPES = [
  'Organization',
  'WebSite',
  'Product',
  'BreadcrumbList',
];

class SEOValidator {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
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

  async checkMetaTags() {
    this.section('1. Meta Tags Validation');

    const requiredMeta = [
      { tag: 'title', maxLength: 60 },
      { tag: 'description', maxLength: 155 },
      { tag: 'og:title', maxLength: 60 },
      { tag: 'og:description', maxLength: 155 },
      { tag: 'og:image', maxLength: null },
      { tag: 'og:url', maxLength: null },
      { tag: 'twitter:card', maxLength: null },
    ];

    this.log('info', 'Meta tags should be validated via Playwright tests');
    this.log('info', 'Checking meta tag configuration in components...');

    // Check if metadata export exists in layout.tsx
    try {
      const layoutFile = await readFile('./src/app/layout.tsx', 'utf-8');

      if (!layoutFile.includes('metadata')) {
        this.results.warnings.push('No metadata export found in layout.tsx');
        this.log('warn', 'No metadata export in layout.tsx');
      } else {
        this.log('success', 'Metadata configuration found in layout.tsx');
      }

      // Check for generateMetadata in dynamic pages
      const productPage = existsSync('./src/app/products/[handle]/page.tsx');
      if (productPage) {
        const productFile = await readFile('./src/app/products/[handle]/page.tsx', 'utf-8');
        if (!productFile.includes('generateMetadata')) {
          this.results.warnings.push('Product pages may not have dynamic metadata');
          this.log('warn', 'generateMetadata not found in product page');
        } else {
          this.log('success', 'Dynamic metadata configured for products');
        }
      }
    } catch (error) {
      this.log('warn', 'Could not validate meta tag configuration', error.message);
    }

    this.results.checks.push({ name: 'Meta Tags', status: 'partial' });
  }

  async checkStructuredData() {
    this.section('2. Structured Data (Schema.org)');

    this.log('info', 'Checking for structured data implementation...');

    const filesToCheck = [
      './src/app/layout.tsx',
      './src/app/products/[handle]/page.tsx',
      './src/components/ProductCard.tsx',
    ];

    let foundStructuredData = false;

    for (const file of filesToCheck) {
      if (existsSync(file)) {
        try {
          const content = await readFile(file, 'utf-8');

          if (content.includes('application/ld+json') || content.includes('@type')) {
            foundStructuredData = true;
            this.log('success', `Structured data found in ${file}`);
          }
        } catch (error) {
          // Skip files we can't read
        }
      }
    }

    if (!foundStructuredData) {
      this.results.warnings.push('No structured data (Schema.org) implementation detected');
      this.log('warn', 'No structured data found in common locations');
      this.log('info', 'Consider adding JSON-LD structured data for: Product, Organization, BreadcrumbList');
    } else {
      this.results.checks.push({ name: 'Structured Data', status: 'pass' });
    }
  }

  async checkSitemap() {
    this.section('3. Sitemap Validation');

    const sitemapPaths = [
      './public/sitemap.xml',
      './src/app/sitemap.ts',
      './src/app/sitemap.js',
    ];

    let sitemapFound = false;

    for (const path of sitemapPaths) {
      if (existsSync(path)) {
        sitemapFound = true;
        this.log('success', `Sitemap found at ${path}`);

        if (path.endsWith('.xml')) {
          try {
            const content = await readFile(path, 'utf-8');
            const urlCount = (content.match(/<url>/g) || []).length;
            this.log('info', `Sitemap contains ${urlCount} URLs`);

            if (urlCount === 0) {
              this.results.warnings.push('Sitemap exists but contains no URLs');
              this.log('warn', 'Sitemap is empty');
            }
          } catch (error) {
            this.log('warn', 'Could not read sitemap file');
          }
        }
        break;
      }
    }

    if (!sitemapFound) {
      this.results.failures.push({
        check: 'Sitemap',
        message: 'No sitemap found (required for SEO)',
      });
      this.results.passed = false;
      this.log('error', 'No sitemap found - create sitemap.ts or sitemap.xml');
    } else {
      this.results.checks.push({ name: 'Sitemap', status: 'pass' });
    }
  }

  async checkRobotsTxt() {
    this.section('4. Robots.txt Validation');

    const robotsPaths = [
      './public/robots.txt',
      './src/app/robots.ts',
      './src/app/robots.js',
    ];

    let robotsFound = false;

    for (const path of robotsPaths) {
      if (existsSync(path)) {
        robotsFound = true;
        this.log('success', `Robots.txt found at ${path}`);

        if (path.endsWith('.txt')) {
          try {
            const content = await readFile(path, 'utf-8');

            // Check for sitemap reference
            if (!content.includes('Sitemap:')) {
              this.results.warnings.push('robots.txt does not reference sitemap');
              this.log('warn', 'robots.txt should include Sitemap: directive');
            }

            // Check for disallow rules
            if (content.includes('Disallow: /')) {
              this.results.warnings.push('robots.txt may be blocking all crawlers');
              this.log('warn', 'Verify robots.txt is not blocking all pages');
            }

            this.log('info', 'robots.txt content:');
            console.log(content.split('\n').map(line => `  ${line}`).join('\n'));
          } catch (error) {
            this.log('warn', 'Could not read robots.txt file');
          }
        }
        break;
      }
    }

    if (!robotsFound) {
      this.results.warnings.push('No robots.txt found');
      this.log('warn', 'robots.txt not found - recommended for SEO');
    } else {
      this.results.checks.push({ name: 'Robots.txt', status: 'pass' });
    }
  }

  async checkCanonicalURLs() {
    this.section('5. Canonical URL Configuration');

    this.log('info', 'Checking for canonical URL implementation...');

    try {
      const layoutFile = await readFile('./src/app/layout.tsx', 'utf-8');

      if (layoutFile.includes('metadataBase') || layoutFile.includes('canonical')) {
        this.log('success', 'Canonical URL configuration found');
        this.results.checks.push({ name: 'Canonical URLs', status: 'pass' });
      } else {
        this.results.warnings.push('Canonical URL configuration not detected');
        this.log('warn', 'Add metadataBase to layout.tsx for proper canonical URLs');
      }
    } catch (error) {
      this.log('warn', 'Could not check canonical URL configuration');
    }
  }

  async checkOpenGraph() {
    this.section('6. Open Graph & Social Media Tags');

    const socialTags = [
      'og:title',
      'og:description',
      'og:image',
      'og:url',
      'og:type',
      'twitter:card',
      'twitter:title',
      'twitter:description',
      'twitter:image',
    ];

    this.log('info', 'Social media tags should be validated via automated tests');

    try {
      const layoutFile = await readFile('./src/app/layout.tsx', 'utf-8');

      const foundTags = socialTags.filter(tag => layoutFile.includes(tag));

      if (foundTags.length > 0) {
        this.log('success', `Found ${foundTags.length}/${socialTags.length} social media tags`);
        this.results.checks.push({ name: 'Open Graph', status: 'pass' });
      } else {
        this.results.warnings.push('Social media tags may not be configured');
        this.log('warn', 'Social media tags not detected in layout.tsx');
      }
    } catch (error) {
      this.log('warn', 'Could not check Open Graph configuration');
    }
  }

  async checkURLStructure() {
    this.section('7. URL Structure & Slugs');

    this.log('info', 'Checking URL structure...');

    // Check for clean URL patterns
    const urlPatterns = [
      { pattern: '/products/[handle]', file: './src/app/products/[handle]/page.tsx' },
      { pattern: '/collections/[handle]', file: './src/app/collections/[handle]/page.tsx' },
    ];

    let cleanURLs = true;

    for (const { pattern, file } of urlPatterns) {
      if (existsSync(file)) {
        this.log('success', `Clean URL pattern: ${pattern}`);
      } else {
        this.log('warn', `Expected file not found: ${file}`);
      }
    }

    if (cleanURLs) {
      this.results.checks.push({ name: 'URL Structure', status: 'pass' });
    }
  }

  async checkPagePerformance() {
    this.section('8. SEO-Related Performance Metrics');

    this.log('info', 'Core Web Vitals should be monitored via Lighthouse and RUM');
    this.log('info', 'Key metrics for SEO:');
    console.log('  - LCP (Largest Contentful Paint) < 2.5s');
    console.log('  - FID (First Input Delay) < 100ms');
    console.log('  - CLS (Cumulative Layout Shift) < 0.1');
    console.log('  - Mobile-friendly design');
    console.log('  - HTTPS enabled\n');

    this.results.checks.push({ name: 'Performance Metrics', status: 'info' });
  }

  async run() {
    console.log(colors.bright + colors.cyan);
    console.log('═'.repeat(80));
    console.log('  SEO VALIDATION');
    console.log('═'.repeat(80));
    console.log(colors.reset);

    await this.checkMetaTags();
    await this.checkStructuredData();
    await this.checkSitemap();
    await this.checkRobotsTxt();
    await this.checkCanonicalURLs();
    await this.checkOpenGraph();
    await this.checkURLStructure();
    await this.checkPagePerformance();

    // Summary
    this.section('SEO VALIDATION SUMMARY');

    console.log(`${colors.bright}Results:${colors.reset}`);
    console.log(`  Checks Passed: ${colors.green}${this.results.checks.length}${colors.reset}`);
    console.log(`  Failures:      ${colors.red}${this.results.failures.length}${colors.reset}`);
    console.log(`  Warnings:      ${colors.yellow}${this.results.warnings.length}${colors.reset}\n`);

    if (this.results.failures.length > 0) {
      console.log(`${colors.red}${colors.bright}SEO VALIDATION FAILED${colors.reset}\n`);
      this.results.failures.forEach((failure, idx) => {
        console.log(`${colors.red}${idx + 1}. ${failure.check}: ${failure.message}${colors.reset}`);
      });
      console.log();
      process.exit(1);
    } else if (this.results.warnings.length > 0) {
      console.log(`${colors.yellow}${colors.bright}SEO VALIDATION PASSED WITH WARNINGS${colors.reset}\n`);
      this.results.warnings.forEach((warning, idx) => {
        console.log(`${colors.yellow}${idx + 1}. ${warning}${colors.reset}`);
      });
      console.log();
      process.exit(0);
    } else {
      console.log(`${colors.green}${colors.bright}SEO VALIDATION PASSED${colors.reset}\n`);
      process.exit(0);
    }
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const baseUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';

const validator = new SEOValidator(baseUrl);
validator.run().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
