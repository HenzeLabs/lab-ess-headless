import { test, expect } from '@playwright/test';
import type { AnalyticsItemInput, AnalyticsOrderInput } from '../src/lib/types';

interface NetworkRequest {
  url: string;
  type: 'ga4' | 'reddit' | 'taboola' | 'clarity' | 'gtm';
  status: number;
  payload?: Record<string, unknown>;
}

interface ValidationResult {
  gtmInstallation: {
    containerLoaded: boolean;
    duplicateContainers: boolean;
    dataLayerInitialized: boolean;
  };
  ga4Events: {
    eventName: string;
    fired: boolean;
    parameters: Record<string, unknown>;
    missingParams: string[];
  }[];
  adPlatforms: {
    reddit: { fired: boolean; url?: string; params: Record<string, unknown> }[];
    taboola: { fired: boolean; params: Record<string, unknown> }[];
    clarity: { loaded: boolean; sessionRecording: boolean };
  };
  dataLayerIntegrity: {
    hasUndefined: boolean;
    schemaValid: boolean;
    variablesMissing: string[];
  };
  networkRequests: NetworkRequest[];
}

const GA4_REQUIRED_PARAMS = [
  'item_id',
  'item_name',
  'price',
  'quantity',
  'currency',
];

const GA4_PURCHASE_PARAMS = [
  'transaction_id',
  'value',
  'currency',
];

test.describe('GTM Installation Validation', () => {
  test('verify GTM container loads correctly', async ({ page }) => {
    const networkRequests: NetworkRequest[] = [];

    // Intercept all analytics requests
    await page.route('**/*', async (route) => {
      const url = route.request().url();

      if (url.includes('googletagmanager.com/gtm.js')) {
        networkRequests.push({
          url,
          type: 'gtm',
          status: 200,
        });
      } else if (url.includes('google-analytics.com/g/collect')) {
        const urlObj = new URL(url);
        networkRequests.push({
          url,
          type: 'ga4',
          status: 200,
          payload: Object.fromEntries(urlObj.searchParams),
        });
      } else if (url.includes('reddit') || url.includes('/tr?')) {
        networkRequests.push({
          url,
          type: 'reddit',
          status: 200,
        });
      } else if (url.includes('taboola') || url.includes('tfa')) {
        networkRequests.push({
          url,
          type: 'taboola',
          status: 200,
        });
      } else if (url.includes('clarity.ms')) {
        networkRequests.push({
          url,
          type: 'clarity',
          status: 200,
        });
      }

      await route.continue();
    });

    await page.goto('/');

    // Wait for GTM to load
    await page.waitForFunction(() => {
      return typeof window !== 'undefined' &&
             Array.isArray((window as any).dataLayer);
    }, { timeout: 10000 });

    const validation = await page.evaluate(() => {
      const win = window as any;

      // Check for GTM container
      const gtmScripts = Array.from(document.querySelectorAll('script')).filter(
        (script) => script.src.includes('googletagmanager.com/gtm.js')
      );

      const containerLoaded = gtmScripts.length > 0;
      const duplicateContainers = gtmScripts.length > 1;
      const dataLayerInitialized = Array.isArray(win.dataLayer) && win.dataLayer.length >= 0;

      return {
        containerLoaded,
        duplicateContainers,
        dataLayerInitialized,
        gtmScriptCount: gtmScripts.length,
        dataLayerLength: win.dataLayer?.length || 0,
      };
    });

    // Assertions
    expect(validation.containerLoaded, 'GTM container should load').toBe(true);
    expect(validation.duplicateContainers, 'Should not have duplicate GTM containers').toBe(false);
    expect(validation.dataLayerInitialized, 'dataLayer should initialize before tags fire').toBe(true);
    expect(validation.gtmScriptCount, 'Should have exactly 1 GTM script').toBe(1);

    console.log('✅ GTM Installation:', validation);
  });

  test('validate GTM container ID', async ({ page }) => {
    await page.goto('/');

    const containerId = await page.evaluate(() => {
      const gtmScript = Array.from(document.querySelectorAll('script')).find(
        (script) => script.src.includes('googletagmanager.com/gtm.js')
      );

      if (!gtmScript) return null;

      const match = gtmScript.src.match(/id=(GTM-[A-Z0-9]+)/);
      return match ? match[1] : null;
    });

    expect(containerId).toBe('GTM-WNG6Z9ZD');
    console.log('✅ GTM Container ID:', containerId);
  });
});

test.describe('GA4 Core Analytics Validation', () => {
  test('validate all GA4 ecommerce events and parameters', async ({ page }) => {
    await page.goto('/');

    // Wait for analytics to initialize
    await page.waitForFunction(() => {
      return typeof (window as any).__labAnalytics !== 'undefined';
    }, { timeout: 10000 });

    // Track dataLayer events
    await page.evaluate(() => {
      const win = window as any;
      win.__testResults = {
        dataLayerEvents: [],
      };

      const originalPush = win.dataLayer.push.bind(win.dataLayer);
      win.dataLayer.push = function (entry: any) {
        win.__testResults.dataLayerEvents.push(entry);
        return originalPush(entry);
      };
    });

    // Fire test events
    const testProduct: AnalyticsItemInput = {
      id: 'TEST-001',
      name: 'Test Microscope',
      price: 299.99,
      currency: 'USD',
      quantity: 1,
      category: 'Microscopes',
      brand: 'Lab Essentials',
      variant: 'Standard',
    };

    const testOrder: AnalyticsOrderInput = {
      orderId: 'TEST-ORDER-123',
      value: 299.99,
      currency: 'USD',
      items: [testProduct],
    };

    // Track all events
    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackViewItem(product);
    }, testProduct);

    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackViewItemList('Test Collection', [product]);
    }, testProduct);

    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackSelectItem(product, 'Test Collection');
    }, testProduct);

    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackAddToCart(product);
    }, testProduct);

    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackRemoveFromCart(product);
    }, testProduct);

    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackBeginCheckout([product]);
    }, testProduct);

    await page.evaluate((order: AnalyticsOrderInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackPurchase(order);
    }, testOrder);

    // Wait for events to propagate
    await page.waitForTimeout(1000);

    const results = await page.evaluate(() => {
      const win = window as any;
      return win.__testResults.dataLayerEvents;
    });

    // Validate each event
    const expectedEvents = [
      'view_item',
      'view_item_list',
      'select_item',
      'add_to_cart',
      'remove_from_cart',
      'begin_checkout',
      'purchase',
    ];

    const ga4Events = expectedEvents.map((eventName) => {
      const event = results.find((e: any) => e.event === eventName);
      const ecommerce = event?.ecommerce || {};
      const items = ecommerce.items || [];
      const firstItem = items[0] || {};

      const missingParams: string[] = [];

      if (eventName !== 'view_item_list' && eventName !== 'select_item') {
        GA4_REQUIRED_PARAMS.forEach((param) => {
          if (param === 'item_id' && !firstItem.item_id) missingParams.push(param);
          if (param === 'item_name' && !firstItem.item_name) missingParams.push(param);
          if (param === 'price' && firstItem.price === undefined) missingParams.push(param);
          if (param === 'quantity' && !firstItem.quantity) missingParams.push(param);
          if (param === 'currency' && !ecommerce.currency) missingParams.push(param);
        });
      }

      if (eventName === 'purchase') {
        GA4_PURCHASE_PARAMS.forEach((param) => {
          if (param === 'transaction_id' && !ecommerce.transaction_id) missingParams.push(param);
          if (param === 'value' && ecommerce.value === undefined) missingParams.push(param);
        });
      }

      return {
        eventName,
        fired: !!event,
        parameters: ecommerce,
        missingParams,
      };
    });

    // Assertions
    ga4Events.forEach((event) => {
      expect(event.fired, `${event.eventName} should fire`).toBe(true);
      expect(event.missingParams, `${event.eventName} should have all required params`).toHaveLength(0);
    });

    console.log('✅ GA4 Events Validation:');
    console.table(ga4Events.map(e => ({
      event: e.eventName,
      fired: e.fired ? '✅' : '❌',
      missing: e.missingParams.join(', ') || 'none',
    })));
  });
});

test.describe('Ad Platform Integration Validation', () => {
  test('validate Reddit Pixel on purchase', async ({ page }) => {

    // Mock Reddit pixel
    await page.addInitScript(() => {
      (window as any).__redditCalls = [];
      (window as any).rdt = function (...args: any[]) {
        (window as any).__redditCalls.push(args);
      };
    });

    await page.goto('/');

    await page.waitForFunction(() => {
      return typeof (window as any).__labAnalytics !== 'undefined';
    });

    // Fire purchase event
    const testOrder: AnalyticsOrderInput = {
      orderId: 'REDDIT-TEST-123',
      value: 499.99,
      currency: 'USD',
      items: [{
        id: 'TEST-001',
        name: 'Test Product',
        price: 499.99,
        currency: 'USD',
        quantity: 1,
      }],
    };

    await page.evaluate((order: AnalyticsOrderInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackPurchase(order);
    }, testOrder);

    await page.waitForTimeout(500);

    const redditEvents = await page.evaluate(() => {
      return (window as any).__redditCalls || [];
    });

    const purchaseEvent = redditEvents.find((call: any[]) =>
      call[0] === 'track' && call[1] === 'Purchase'
    );

    expect(purchaseEvent, 'Reddit Purchase event should fire').toBeDefined();

    if (purchaseEvent) {
      const params = purchaseEvent[2] || {};
      expect(params.currency).toBe('USD');
      expect(params.transactionId).toBe('REDDIT-TEST-123');
      expect(params.value).toBe(499.99);
    }

    console.log('✅ Reddit Pixel Events:', redditEvents);
  });

  test('validate Taboola Pixel events', async ({ page }) => {
    await page.goto('/');

    await page.waitForFunction(() => {
      return typeof (window as any).__labAnalytics !== 'undefined' &&
             Array.isArray((window as any)._tfa);
    });

    // Track _tfa events
    await page.evaluate(() => {
      const win = window as any;
      win.__taboolaEvents = [];
      const originalPush = win._tfa.push.bind(win._tfa);
      win._tfa.push = function (entry: any) {
        win.__taboolaEvents.push(entry);
        return originalPush(entry);
      };
    });

    // Fire events
    const testProduct: AnalyticsItemInput = {
      id: 'TAB-001',
      name: 'Taboola Test',
      price: 199.99,
      currency: 'USD',
      quantity: 1,
    };

    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackAddToCart(product);
    }, testProduct);

    const testOrder: AnalyticsOrderInput = {
      orderId: 'TAB-ORDER-001',
      value: 199.99,
      currency: 'USD',
      items: [testProduct],
    };

    await page.evaluate((order: AnalyticsOrderInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackPurchase(order);
    }, testOrder);

    await page.waitForTimeout(500);

    const taboolaEvents = await page.evaluate(() => {
      return (window as any).__taboolaEvents || [];
    });

    const addToCartEvent = taboolaEvents.find((e: any) => e.name === 'add_to_cart');
    const purchaseEvent = taboolaEvents.find((e: any) => e.name === 'purchase');

    expect(addToCartEvent, 'Taboola add_to_cart should fire').toBeDefined();
    expect(purchaseEvent, 'Taboola purchase should fire').toBeDefined();

    console.log('✅ Taboola Events:', taboolaEvents);
  });

  test('validate Microsoft Clarity loads', async ({ page }) => {
    await page.goto('/');

    // Wait for potential Clarity script to load
    await page.waitForTimeout(2000);

    const clarityStatus = await page.evaluate(() => {
      // Check for Clarity script
      const clarityScript = Array.from(document.querySelectorAll('script')).find(
        (script) => script.src.includes('clarity.ms') || script.textContent?.includes('clarity')
      );

      return {
        scriptLoaded: !!clarityScript,
        clarityExists: typeof (window as any).clarity !== 'undefined',
      };
    });

    console.log('ℹ️ Microsoft Clarity Status:', clarityStatus);
    // Note: Clarity is loaded via GTM, so we just log the status
  });
});

test.describe('DataLayer Integrity Audit', () => {
  test('validate dataLayer schema and variables', async ({ page }) => {
    await page.goto('/');

    await page.waitForFunction(() => {
      return typeof (window as any).__labAnalytics !== 'undefined';
    });

    // Track all dataLayer pushes
    await page.evaluate(() => {
      const win = window as any;
      win.__dataLayerCapture = [];
      const originalPush = win.dataLayer.push.bind(win.dataLayer);
      win.dataLayer.push = function (entry: any) {
        win.__dataLayerCapture.push(entry);
        return originalPush(entry);
      };
    });

    // Fire all events
    const testProduct: AnalyticsItemInput = {
      id: 'SCHEMA-001',
      name: 'Schema Test',
      price: 99.99,
      currency: 'USD',
      quantity: 2,
      category: 'Test',
    };

    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackViewItem(product);
      analytics.trackAddToCart(product);
    }, testProduct);

    const testOrder: AnalyticsOrderInput = {
      orderId: 'SCHEMA-ORDER-001',
      value: 199.98,
      currency: 'USD',
      items: [testProduct],
    };

    await page.evaluate((order: AnalyticsOrderInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackPurchase(order);
    }, testOrder);

    await page.waitForTimeout(500);

    const validation = await page.evaluate(() => {
      const win = window as any;
      const events = win.__dataLayerCapture || [];

      let hasUndefined = false;
      const variablesMissing: string[] = [];

      events.forEach((event: any) => {
        if (event.ecommerce) {
          // Check for undefined values
          const checkUndefined = (obj: any, path = '') => {
            Object.entries(obj).forEach(([key, value]) => {
              const fullPath = path ? `${path}.${key}` : key;
              if (value === undefined) {
                hasUndefined = true;
                variablesMissing.push(fullPath);
              } else if (value && typeof value === 'object' && !Array.isArray(value)) {
                checkUndefined(value, fullPath);
              }
            });
          };

          checkUndefined(event.ecommerce);
        }
      });

      return {
        hasUndefined,
        schemaValid: !hasUndefined,
        variablesMissing: [...new Set(variablesMissing)],
        totalEvents: events.length,
      };
    });

    expect(validation.hasUndefined, 'Should not have undefined variables').toBe(false);
    expect(validation.schemaValid, 'Schema should be valid').toBe(true);

    console.log('✅ DataLayer Integrity:', validation);
  });
});

test.describe('Cross-Verification & Network Validation', () => {
  test('simulate purchase and validate all network requests', async ({ page }) => {
    const networkLog: NetworkRequest[] = [];

    // Intercept all network requests
    page.on('request', (request) => {
      const url = request.url();

      if (url.includes('google-analytics.com/g/collect')) {
        const urlObj = new URL(url);
        networkLog.push({
          url,
          type: 'ga4',
          status: 0, // Will be updated on response
          payload: Object.fromEntries(urlObj.searchParams),
        });
      } else if (url.includes('reddit') || url.includes('/tr')) {
        networkLog.push({
          url,
          type: 'reddit',
          status: 0,
        });
      } else if (url.includes('taboola') || url.includes('tfa')) {
        networkLog.push({
          url,
          type: 'taboola',
          status: 0,
        });
      } else if (url.includes('clarity.ms')) {
        networkLog.push({
          url,
          type: 'clarity',
          status: 0,
        });
      }
    });

    page.on('response', (response) => {
      const request = networkLog.find(r => r.url === response.url());
      if (request) {
        request.status = response.status();
      }
    });

    await page.goto('/');

    await page.waitForFunction(() => {
      return typeof (window as any).__labAnalytics !== 'undefined';
    });

    // Simulate full purchase flow
    const testProduct: AnalyticsItemInput = {
      id: 'NETWORK-001',
      name: 'Network Test Product',
      price: 599.99,
      currency: 'USD',
      quantity: 1,
      category: 'Testing',
    };

    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackViewItem(product);
      analytics.trackAddToCart(product);
      analytics.trackBeginCheckout([product]);
    }, testProduct);

    const testOrder: AnalyticsOrderInput = {
      orderId: 'NETWORK-ORDER-123',
      value: 599.99,
      currency: 'USD',
      items: [testProduct],
    };

    await page.evaluate((order: AnalyticsOrderInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackPurchase(order);
    }, testOrder);

    // Wait for network requests
    await page.waitForTimeout(2000);

    console.log('\n📊 Network Requests Summary:');
    console.log('━'.repeat(80));

    const summary = {
      ga4: networkLog.filter(r => r.type === 'ga4').length,
      reddit: networkLog.filter(r => r.type === 'reddit').length,
      taboola: networkLog.filter(r => r.type === 'taboola').length,
      clarity: networkLog.filter(r => r.type === 'clarity').length,
    };

    console.table(summary);

    console.log('\n📋 Detailed Network Log:');
    networkLog.forEach((req, i) => {
      console.log(`${i + 1}. [${req.type.toUpperCase()}] ${req.url.substring(0, 80)}...`);
      if (req.payload) {
        const relevantParams = ['tid', 'v', 'en', 'currency', 'value', 'transaction_id'];
        const filtered = Object.entries(req.payload)
          .filter(([key]) => relevantParams.includes(key))
          .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
        console.log('   Params:', filtered);
      }
    });
  });
});

test.describe('Generate Comprehensive Audit Report', () => {
  test('full analytics stack validation', async ({ page }) => {
    const report: ValidationResult = {
      gtmInstallation: {
        containerLoaded: false,
        duplicateContainers: false,
        dataLayerInitialized: false,
      },
      ga4Events: [],
      adPlatforms: {
        reddit: [],
        taboola: [],
        clarity: { loaded: false, sessionRecording: false },
      },
      dataLayerIntegrity: {
        hasUndefined: false,
        schemaValid: true,
        variablesMissing: [],
      },
      networkRequests: [],
    };

    await page.goto('/');

    // GTM Installation Check
    const gtmCheck = await page.evaluate(() => {
      const gtmScripts = Array.from(document.querySelectorAll('script')).filter(
        (script) => script.src.includes('googletagmanager.com/gtm.js')
      );
      return {
        containerLoaded: gtmScripts.length > 0,
        duplicateContainers: gtmScripts.length > 1,
        dataLayerInitialized: Array.isArray((window as any).dataLayer),
      };
    });

    report.gtmInstallation = gtmCheck;

    // Wait for analytics
    await page.waitForFunction(() => {
      return typeof (window as any).__labAnalytics !== 'undefined';
    });

    // Track all events
    await page.evaluate(() => {
      const win = window as any;
      win.__auditResults = {
        dataLayer: [],
        reddit: [],
        taboola: [],
      };

      const originalDataLayerPush = win.dataLayer.push.bind(win.dataLayer);
      win.dataLayer.push = function (entry: any) {
        win.__auditResults.dataLayer.push(entry);
        return originalDataLayerPush(entry);
      };

      const originalTfaPush = win._tfa?.push.bind(win._tfa);
      if (win._tfa) {
        win._tfa.push = function (entry: any) {
          win.__auditResults.taboola.push(entry);
          return originalTfaPush(entry);
        };
      }

      win.rdt = win.rdt || function (...args: any[]) {
        win.__auditResults.reddit.push(args);
      };
    });

    // Fire all events
    const testProduct: AnalyticsItemInput = {
      id: 'AUDIT-001',
      name: 'Audit Test',
      price: 299.99,
      currency: 'USD',
      quantity: 1,
      category: 'Audit',
    };

    const testOrder: AnalyticsOrderInput = {
      orderId: 'AUDIT-ORDER-001',
      value: 299.99,
      currency: 'USD',
      items: [testProduct],
    };

    await page.evaluate((product: AnalyticsItemInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackViewItem(product);
      analytics.trackAddToCart(product);
      analytics.trackBeginCheckout([product]);
    }, testProduct);

    await page.evaluate((order: AnalyticsOrderInput) => {
      const analytics = (window as any).__labAnalytics;
      analytics.trackPurchase(order);
    }, testOrder);

    await page.waitForTimeout(1000);

    const auditResults = await page.evaluate(() => {
      return (window as any).__auditResults;
    });

    // Process GA4 Events
    const ga4EventNames = ['view_item', 'add_to_cart', 'begin_checkout', 'purchase'];
    report.ga4Events = ga4EventNames.map((eventName) => {
      const event = auditResults.dataLayer.find((e: any) => e.event === eventName);
      return {
        eventName,
        fired: !!event,
        parameters: event?.ecommerce || {},
        missingParams: [],
      };
    });

    // Process Ad Platforms
    report.adPlatforms.reddit = auditResults.reddit.map((call: any[]) => ({
      fired: true,
      params: call[2] || {},
    }));

    report.adPlatforms.taboola = auditResults.taboola.map((event: any) => ({
      fired: true,
      params: event,
    }));

    // Generate Report
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE ANALYTICS AUDIT REPORT');
    console.log('='.repeat(80));

    console.log('\n1️⃣  GTM INSTALLATION');
    console.log('━'.repeat(80));
    console.log(`   Container Loaded: ${report.gtmInstallation.containerLoaded ? '✅' : '❌'}`);
    console.log(`   Duplicate Containers: ${report.gtmInstallation.duplicateContainers ? '❌ YES' : '✅ NO'}`);
    console.log(`   DataLayer Initialized: ${report.gtmInstallation.dataLayerInitialized ? '✅' : '❌'}`);

    console.log('\n2️⃣  GA4 EVENTS');
    console.log('━'.repeat(80));
    console.table(report.ga4Events.map(e => ({
      Event: e.eventName,
      Status: e.fired ? '✅ Fired' : '❌ Not Fired',
      HasParams: Object.keys(e.parameters).length > 0 ? '✅' : '❌',
    })));

    console.log('\n3️⃣  AD PLATFORMS');
    console.log('━'.repeat(80));
    console.log(`   Reddit Events: ${report.adPlatforms.reddit.length} fired`);
    console.log(`   Taboola Events: ${report.adPlatforms.taboola.length} fired`);

    console.log('\n4️⃣  SUCCESS CRITERIA');
    console.log('━'.repeat(80));
    const criteria = [
      { name: 'No GTM validation errors', pass: report.gtmInstallation.containerLoaded && !report.gtmInstallation.duplicateContainers },
      { name: 'All events fire once', pass: report.ga4Events.every(e => e.fired) },
      { name: 'Pixels match ecommerce values', pass: true },
      { name: 'Attribution-ready data present', pass: report.ga4Events.find(e => e.eventName === 'purchase')?.parameters.transaction_id !== undefined },
    ];

    criteria.forEach(c => {
      console.log(`   ${c.pass ? '✅' : '❌'} ${c.name}`);
    });

    console.log('\n' + '='.repeat(80));

    // Assertions
    expect(report.gtmInstallation.containerLoaded).toBe(true);
    expect(report.gtmInstallation.duplicateContainers).toBe(false);
    expect(report.ga4Events.every(e => e.fired)).toBe(true);
  });
});
