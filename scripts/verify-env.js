#!/usr/bin/env node
/**
 * Environment Variables Verification Script
 * Checks that all required environment variables are set and valid
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Environment variable configuration
const envConfig = {
  // CRITICAL - App won't function without these
  critical: [
    {
      name: 'SHOPIFY_STORE_DOMAIN',
      description: 'Your Shopify store domain (e.g., your-store.myshopify.com)',
      example: 'labessentials.myshopify.com',
      validate: (value) => value && value.includes('.myshopify.com'),
    },
    {
      name: 'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
      description: 'Shopify Storefront API access token',
      example: 'abc123...',
      validate: (value) => value && value.length > 20,
    },
    {
      name: 'NEXT_PUBLIC_SITE_URL',
      description: 'Your public site URL (no trailing slash)',
      example: 'https://labessentials.com',
      validate: (value) => value && value.startsWith('http'),
    },
  ],

  // HIGH PRIORITY - Analytics won't work without these
  analyticsRequired: [
    {
      name: 'GA4_MEASUREMENT_PROTOCOL_SECRET',
      description: 'GA4 Measurement Protocol API secret for server-side purchase tracking',
      example: 'abc123xyz',
      validate: (value) => value && value.length > 10,
      docs: 'https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events',
    },
    {
      name: 'SHOPIFY_WEBHOOK_SECRET',
      description: 'Shopify webhook HMAC secret for verifying order webhooks',
      example: 'your_webhook_secret',
      validate: (value) => value && value.length > 10,
      docs: 'https://shopify.dev/docs/apps/webhooks/configuration/https',
    },
    {
      name: 'TABOOLA_ADVERTISER_ID',
      description: 'Taboola Advertiser ID for server-side conversion tracking',
      example: 'your-advertiser-id',
      validate: (value) => value && value.length > 5,
      docs: 'https://help.taboola.com/hc/en-us/articles/360004563154',
    },
  ],

  // RECOMMENDED - Enhanced features
  recommended: [
    {
      name: 'SHOPIFY_ADMIN_ACCESS_TOKEN',
      description: 'Shopify Admin API token for advanced features',
      example: 'shpat_...',
    },
    {
      name: 'JWT_ACCESS_SECRET',
      description: 'Secret for JWT access token signing (user authentication)',
      example: 'random_secret_key_min_32_chars',
      validate: (value) => !value || value.length >= 32,
    },
    {
      name: 'JWT_REFRESH_SECRET',
      description: 'Secret for JWT refresh token signing',
      example: 'different_random_secret_key_min_32_chars',
      validate: (value) => !value || value.length >= 32,
    },
    {
      name: 'ADMIN_EMAILS',
      description: 'Comma-separated list of admin email addresses',
      example: 'admin@labessentials.com,support@labessentials.com',
    },
  ],

  // OPTIONAL - Performance & caching
  optional: [
    {
      name: 'UPSTASH_REDIS_REST_URL',
      description: 'Upstash Redis REST URL for caching',
      example: 'https://your-redis.upstash.io',
    },
    {
      name: 'UPSTASH_REDIS_REST_TOKEN',
      description: 'Upstash Redis REST token',
      example: 'your_redis_token',
    },
    {
      name: 'REDIS_URL',
      description: 'Alternative Redis URL for self-hosted Redis',
      example: 'redis://localhost:6379',
    },
    {
      name: 'REVALIDATE_SECRET',
      description: 'Secret for triggering ISR revalidation',
      example: 'random_revalidate_secret',
    },
    {
      name: 'ADMIN_TOKEN',
      description: 'Admin API authentication token',
      example: 'secure_admin_token',
    },
  ],
};

// Validation results
const results = {
  critical: [],
  analyticsRequired: [],
  recommended: [],
  optional: [],
  warnings: [],
  errors: [],
};

// Check environment variable
function checkEnvVar(config) {
  const value = process.env[config.name];
  const result = {
    name: config.name,
    description: config.description,
    set: !!value,
    valid: false,
    message: '',
    docs: config.docs || null,
  };

  if (!value) {
    result.message = 'Not set';
    return result;
  }

  // Validate if validation function exists
  if (config.validate) {
    result.valid = config.validate(value);
    result.message = result.valid ? 'Valid' : 'Invalid format';
  } else {
    result.valid = true;
    result.message = 'Set';
  }

  return result;
}

// Run validation
console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}   Lab Essentials - Environment Variables Verification${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

// Check critical variables
console.log(`${colors.bold}${colors.red}🔴 CRITICAL - Required for Core Functionality${colors.reset}\n`);
envConfig.critical.forEach((config) => {
  const result = checkEnvVar(config);
  results.critical.push(result);

  const icon = result.valid ? '✅' : '❌';
  const color = result.valid ? colors.green : colors.red;
  console.log(`${icon} ${colors.bold}${result.name}${colors.reset}`);
  console.log(`   ${config.description}`);
  console.log(`   Status: ${color}${result.message}${colors.reset}`);
  if (!result.valid && config.example) {
    console.log(`   ${colors.yellow}Example: ${config.example}${colors.reset}`);
  }
  console.log('');

  if (!result.valid) {
    results.errors.push(`${result.name} is ${result.message.toLowerCase()}`);
  }
});

// Check analytics variables
console.log(`${colors.bold}${colors.yellow}🟡 ANALYTICS - Required for Server-Side Tracking${colors.reset}\n`);
envConfig.analyticsRequired.forEach((config) => {
  const result = checkEnvVar(config);
  results.analyticsRequired.push(result);

  const icon = result.valid ? '✅' : '⚠️';
  const color = result.valid ? colors.green : colors.yellow;
  console.log(`${icon} ${colors.bold}${result.name}${colors.reset}`);
  console.log(`   ${config.description}`);
  console.log(`   Status: ${color}${result.message}${colors.reset}`);
  if (!result.valid && config.example) {
    console.log(`   ${colors.yellow}Example: ${config.example}${colors.reset}`);
  }
  if (!result.valid && config.docs) {
    console.log(`   ${colors.blue}Docs: ${config.docs}${colors.reset}`);
  }
  console.log('');

  if (!result.valid) {
    results.warnings.push(`${result.name} is ${result.message.toLowerCase()} - Server-side analytics will not work`);
  }
});

// Check recommended variables
console.log(`${colors.bold}${colors.blue}🔵 RECOMMENDED - Enhanced Features${colors.reset}\n`);
envConfig.recommended.forEach((config) => {
  const result = checkEnvVar(config);
  results.recommended.push(result);

  const icon = result.set ? (result.valid ? '✅' : '⚠️') : 'ℹ️';
  const color = result.valid ? colors.green : colors.yellow;
  console.log(`${icon} ${colors.bold}${result.name}${colors.reset}`);
  console.log(`   ${config.description}`);
  if (result.set) {
    console.log(`   Status: ${color}${result.message}${colors.reset}`);
  } else {
    console.log(`   Status: ${colors.cyan}Optional - Not set${colors.reset}`);
  }
  if (!result.valid && result.set && config.example) {
    console.log(`   ${colors.yellow}Example: ${config.example}${colors.reset}`);
  }
  console.log('');
});

// Check optional variables
console.log(`${colors.bold}${colors.cyan}⚪ OPTIONAL - Performance & Caching${colors.reset}\n`);
envConfig.optional.forEach((config) => {
  const result = checkEnvVar(config);
  results.optional.push(result);

  const icon = result.set ? '✅' : 'ℹ️';
  console.log(`${icon} ${colors.bold}${result.name}${colors.reset}`);
  console.log(`   ${config.description}`);
  console.log(`   Status: ${result.set ? colors.green + 'Set' : colors.cyan + 'Not set'}${colors.reset}`);
  console.log('');
});

// Summary
console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}   Summary${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

const criticalValid = results.critical.filter((r) => r.valid).length;
const analyticsValid = results.analyticsRequired.filter((r) => r.valid).length;
const recommendedSet = results.recommended.filter((r) => r.set && r.valid).length;
const optionalSet = results.optional.filter((r) => r.set).length;

console.log(`${colors.bold}Critical Variables:${colors.reset}     ${criticalValid}/${envConfig.critical.length} valid ${criticalValid === envConfig.critical.length ? '✅' : '❌'}`);
console.log(`${colors.bold}Analytics Variables:${colors.reset}    ${analyticsValid}/${envConfig.analyticsRequired.length} valid ${analyticsValid === envConfig.analyticsRequired.length ? '✅' : '⚠️'}`);
console.log(`${colors.bold}Recommended Variables:${colors.reset}  ${recommendedSet}/${envConfig.recommended.length} set`);
console.log(`${colors.bold}Optional Variables:${colors.reset}     ${optionalSet}/${envConfig.optional.length} set`);

// Errors and warnings
if (results.errors.length > 0) {
  console.log(`\n${colors.bold}${colors.red}❌ ERRORS (${results.errors.length}):${colors.reset}`);
  results.errors.forEach((error) => {
    console.log(`   ${colors.red}• ${error}${colors.reset}`);
  });
}

if (results.warnings.length > 0) {
  console.log(`\n${colors.bold}${colors.yellow}⚠️  WARNINGS (${results.warnings.length}):${colors.reset}`);
  results.warnings.forEach((warning) => {
    console.log(`   ${colors.yellow}• ${warning}${colors.reset}`);
  });
}

// Next steps
console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}   Next Steps${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

if (results.errors.length > 0) {
  console.log(`${colors.red}1. Fix critical errors above - your app will not function${colors.reset}`);
  console.log(`${colors.red}2. Update .env.local with missing required variables${colors.reset}`);
  console.log(`${colors.red}3. Restart your development server${colors.reset}\n`);
}

if (results.warnings.length > 0) {
  console.log(`${colors.yellow}1. Set analytics variables for server-side tracking:${colors.reset}`);
  console.log(`${colors.yellow}   - GA4_MEASUREMENT_PROTOCOL_SECRET${colors.reset}`);
  console.log(`${colors.yellow}   - SHOPIFY_WEBHOOK_SECRET${colors.reset}`);
  console.log(`${colors.yellow}   - TABOOLA_ADVERTISER_ID${colors.reset}`);
  console.log(`${colors.yellow}2. Configure Shopify webhooks to point to:${colors.reset}`);
  console.log(`${colors.yellow}   ${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.com'}/api/webhooks/shopify/orders${colors.reset}\n`);
}

if (results.errors.length === 0 && results.warnings.length === 0) {
  console.log(`${colors.green}✅ All required variables are configured!${colors.reset}`);
  console.log(`${colors.green}✅ Your app is ready for production${colors.reset}\n`);
}

console.log(`${colors.cyan}For more information, see: ENVIRONMENT_SETUP.md${colors.reset}\n`);

// Exit with error code if critical errors
process.exit(results.errors.length > 0 ? 1 : 0);
