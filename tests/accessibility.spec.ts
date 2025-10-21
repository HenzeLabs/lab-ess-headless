import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// Pages to test for accessibility
const pagesToTest = [
  { name: 'Homepage', url: '/' },
  { name: 'Contact Page', url: '/support/contact' },
  { name: 'Shipping Info', url: '/support/shipping' },
  { name: 'Returns Policy', url: '/support/returns' },
  { name: 'FAQ Page', url: '/support/faq' },
  { name: 'Privacy Policy', url: '/privacy' },
  { name: 'Terms of Service', url: '/terms' },
];

test.describe('Accessibility & Contrast Verification', () => {
  // Test each page for accessibility violations
  for (const pageInfo of pagesToTest) {
    test(`${pageInfo.name} should not have accessibility violations`, async ({
      page,
    }) => {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n=== Accessibility Violations on ${pageInfo.name} ===`);
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(
            `\n${violation.impact?.toUpperCase()}: ${violation.help}`,
          );
          console.log(`  Description: ${violation.description}`);
          console.log(`  Affected elements: ${violation.nodes.length}`);
          violation.nodes.slice(0, 3).forEach((node) => {
            console.log(`    - ${node.html}`);
          });
        });
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  // Specific contrast ratio test
  test('should meet WCAG AA contrast ratios (≥4.5:1)', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for multiple page scans
    const contrastResults: Array<{
      page: string;
      passed: boolean;
      violations: number;
    }> = [];

    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.url, { timeout: 15000 });
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast',
      );

      const passed = contrastViolations.length === 0;

      contrastResults.push({
        page: pageInfo.name,
        passed,
        violations: contrastViolations.length,
      });

      if (!passed) {
        console.log(`\n=== Contrast Violations on ${pageInfo.name} ===`);
        contrastViolations.forEach((violation) => {
          console.log(`${violation.help}`);
          violation.nodes.forEach((node) => {
            console.log(`  Element: ${node.html}`);
            console.log(`  ${node.failureSummary}`);
          });
        });
      }
    }

    // Print summary
    console.log('\n=== CONTRAST RATIO SUMMARY ===');
    console.log('Page                    | Status | Violations');
    console.log('------------------------|--------|------------');
    contrastResults.forEach((result) => {
      const pageName = result.page.padEnd(23);
      const status = result.passed ? '  ✓   ' : '  ✗   ';
      const violations = result.violations.toString().padStart(5);
      console.log(`${pageName} | ${status} | ${violations}`);
    });
    console.log('');

    // Assert all pages pass
    const allPassed = contrastResults.every((r) => r.passed);
    expect(allPassed).toBe(true);
  });

  // ARIA attributes test
  test('should have proper ARIA support', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for multiple page scans
    const ariaResults: Array<{
      page: string;
      passed: boolean;
      issues: number;
    }> = [];

    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.url, { timeout: 15000 });
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const ariaViolations = accessibilityScanResults.violations.filter((v) =>
        v.id.startsWith('aria-'),
      );

      const passed = ariaViolations.length === 0;

      ariaResults.push({
        page: pageInfo.name,
        passed,
        issues: ariaViolations.length,
      });

      if (!passed) {
        console.log(`\n=== ARIA Issues on ${pageInfo.name} ===`);
        ariaViolations.forEach((violation) => {
          console.log(`${violation.id}: ${violation.help}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Affected elements: ${violation.nodes.length}`);
        });
      }
    }

    // Print summary
    console.log('\n=== ARIA VALIDATION SUMMARY ===');
    console.log('Page                    | Status | Issues');
    console.log('------------------------|--------|--------');
    ariaResults.forEach((result) => {
      const pageName = result.page.padEnd(23);
      const status = result.passed ? '  ✓   ' : '  ✗   ';
      const issues = result.issues.toString().padStart(3);
      console.log(`${pageName} | ${status} | ${issues}`);
    });
    console.log('');

    // Assert all pages pass
    const allPassed = ariaResults.every((r) => r.passed);
    expect(allPassed).toBe(true);
  });

  // Form labels and inputs test
  test('should have proper form labels', async ({ page }) => {
    await page.goto('/support/contact');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'label' || v.id === 'form-field-multiple-labels',
    );

    if (labelViolations.length > 0) {
      console.log('\n=== Form Label Issues ===');
      labelViolations.forEach((violation) => {
        console.log(`${violation.id}: ${violation.help}`);
        violation.nodes.forEach((node) => {
          console.log(`  ${node.html}`);
        });
      });
    }

    expect(labelViolations).toEqual([]);
  });

  // Image alt text test
  test('should have alt text on all images', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for multiple page scans
    const imageResults: Array<{
      page: string;
      passed: boolean;
      missingAlt: number;
    }> = [];

    for (const pageInfo of pagesToTest.slice(0, 5)) {
      // Test first 5 pages
      await page.goto(pageInfo.url, { timeout: 15000 });
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      const imageAltViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'image-alt',
      );

      const passed = imageAltViolations.length === 0;

      imageResults.push({
        page: pageInfo.name,
        passed,
        missingAlt: imageAltViolations.length,
      });
    }

    console.log('\n=== IMAGE ALT TEXT SUMMARY ===');
    console.log('Page                    | Status | Missing');
    console.log('------------------------|--------|--------');
    imageResults.forEach((result) => {
      const pageName = result.page.padEnd(23);
      const status = result.passed ? '  ✓   ' : '  ✗   ';
      const missing = result.missingAlt.toString().padStart(3);
      console.log(`${pageName} | ${status} | ${missing}`);
    });
    console.log('');

    const allPassed = imageResults.every((r) => r.passed);
    expect(allPassed).toBe(true);
  });

  // Heading hierarchy test
  test('should have proper heading hierarchy', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for multiple page scans
    const headingResults: Array<{ page: string; passed: boolean }> = [];

    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.url, { timeout: 15000 });
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      const headingViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'heading-order',
      );

      const passed = headingViolations.length === 0;
      headingResults.push({ page: pageInfo.name, passed });

      if (!passed) {
        console.log(`\n=== Heading Order Issues on ${pageInfo.name} ===`);
        headingViolations.forEach((violation) => {
          console.log(violation.help);
          violation.nodes.forEach((node) => {
            console.log(`  ${node.html}`);
          });
        });
      }
    }

    console.log('\n=== HEADING HIERARCHY SUMMARY ===');
    headingResults.forEach((result) => {
      const status = result.passed ? '✓' : '✗';
      console.log(`${status} ${result.page}`);
    });
    console.log('');

    const allPassed = headingResults.every((r) => r.passed);
    expect(allPassed).toBe(true);
  });
});
