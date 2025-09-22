// Heavy test - run manually or in separate CI job
import { test, expect } from '@playwright/test';

test.describe.skip('Dead Link Crawler', () => {
  test('should not have any broken internal links from the homepage', async ({
    page,
  }) => {
    const baseUrl = page.baseURL || 'http://localhost:3000'; // Fallback if baseURL is not set
    const visitedUrls = new Set<string>();
    const internalLinksToVisit: string[] = [];

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Collect all internal links from the homepage
    const links = await page.locator('a').all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (
        href &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:')
      ) {
        const url = new URL(href, baseUrl);
        if (url.origin === new URL(baseUrl).origin) {
          // Only add if it's an internal link and not already visited/queued
          if (
            !visitedUrls.has(url.href) &&
            !internalLinksToVisit.includes(url.href)
          ) {
            internalLinksToVisit.push(url.href);
          }
        }
      }
    }

    // Visit each internal link and assert status
    for (const linkUrl of internalLinksToVisit) {
      test.step(`Checking link: ${linkUrl}`, async () => {
        if (visitedUrls.has(linkUrl)) {
          return; // Skip if already visited
        }
        visitedUrls.add(linkUrl);

        const response = await page.goto(linkUrl, {
          waitUntil: 'domcontentloaded',
        });

        // Assert status code
        expect(response?.status()).toBeLessThan(400); // Expect 2xx or 3xx status codes

        // Optionally, check for specific 404 content if your site has a custom 404 page
        const pageContent = await page.textContent('body');
        expect(pageContent).not.toContain('404 Not Found'); // Adjust based on your 404 page content
      });
    }
  });
});
