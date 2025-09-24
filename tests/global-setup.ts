import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch();

  // Store auth state if needed for tests that require authentication
  // const page = await browser.newPage();
  // await page.goto('/login');
  // ... perform login steps
  // await page.context().storageState({ path: 'auth.json' });

  await browser.close();
}

export default globalSetup;
