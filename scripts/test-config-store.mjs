#!/usr/bin/env node

/**
 * Test script for the configuration store
 * This validates that the CSV-based config store works correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const configPath = path.join(projectRoot, 'data/config_store/config.csv');

console.log('🔍 Testing Configuration Store\n');

// Test 1: Check if config file exists
console.log('Test 1: Config file exists');
if (!fs.existsSync(configPath)) {
  console.error('❌ FAIL: Config file not found at', configPath);
  process.exit(1);
}
console.log('✅ PASS: Config file exists\n');

// Test 2: Verify CSV structure
console.log('Test 2: CSV structure validation');
try {
  const csv = fs.readFileSync(configPath, 'utf8');
  const records = parse(csv, { columns: true });

  if (!Array.isArray(records) || records.length === 0) {
    console.error('❌ FAIL: Config file is empty or malformed');
    process.exit(1);
  }

  const requiredColumns = ['key', 'value', 'updated_by', 'updated_at', 'version'];
  const firstRecord = records[0];
  const missingColumns = requiredColumns.filter(col => !(col in firstRecord));

  if (missingColumns.length > 0) {
    console.error('❌ FAIL: Missing required columns:', missingColumns);
    process.exit(1);
  }

  console.log('✅ PASS: CSV structure is valid');
  console.log(`   Found ${records.length} configuration records\n`);
} catch (error) {
  console.error('❌ FAIL: Error parsing CSV:', error.message);
  process.exit(1);
}

// Test 3: Verify SEO config keys
console.log('Test 3: SEO configuration keys');
try {
  const csv = fs.readFileSync(configPath, 'utf8');
  const records = parse(csv, { columns: true });

  const seoKeys = [
    'seo.siteName',
    'seo.siteUrl',
    'seo.defaultTitle',
    'seo.defaultDescription',
  ];

  const foundSeoKeys = records
    .filter(r => seoKeys.includes(r.key))
    .map(r => r.key);

  const missingSeoKeys = seoKeys.filter(k => !foundSeoKeys.includes(k));

  if (missingSeoKeys.length > 0) {
    console.error('❌ FAIL: Missing SEO keys:', missingSeoKeys);
    process.exit(1);
  }

  console.log('✅ PASS: All required SEO keys present');
  console.log(`   Found keys: ${foundSeoKeys.join(', ')}\n`);
} catch (error) {
  console.error('❌ FAIL: Error checking SEO keys:', error.message);
  process.exit(1);
}

// Test 4: Verify security config keys
console.log('Test 4: Security configuration keys');
try {
  const csv = fs.readFileSync(configPath, 'utf8');
  const records = parse(csv, { columns: true });

  const securityKeys = [
    'security.rateLimit.default.windowMs',
    'security.rateLimit.default.maxRequests',
    'security.rateLimit.api.maxRequests',
  ];

  const foundSecurityKeys = records
    .filter(r => securityKeys.includes(r.key))
    .map(r => r.key);

  const missingSecurityKeys = securityKeys.filter(k => !foundSecurityKeys.includes(k));

  if (missingSecurityKeys.length > 0) {
    console.error('❌ FAIL: Missing security keys:', missingSecurityKeys);
    process.exit(1);
  }

  console.log('✅ PASS: All required security keys present');
  console.log(`   Found keys: ${foundSecurityKeys.join(', ')}\n`);
} catch (error) {
  console.error('❌ FAIL: Error checking security keys:', error.message);
  process.exit(1);
}

// Test 5: Verify data types for numeric values
console.log('Test 5: Numeric value validation');
try {
  const csv = fs.readFileSync(configPath, 'utf8');
  const records = parse(csv, { columns: true });

  const numericKeys = records.filter(r =>
    r.key.includes('windowMs') ||
    r.key.includes('maxRequests')
  );

  const invalidNumeric = numericKeys.filter(r => {
    const parsed = parseInt(r.value, 10);
    return isNaN(parsed);
  });

  if (invalidNumeric.length > 0) {
    console.error('❌ FAIL: Invalid numeric values found:');
    invalidNumeric.forEach(r => {
      console.error(`   ${r.key}: "${r.value}"`);
    });
    process.exit(1);
  }

  console.log('✅ PASS: All numeric values are valid');
  console.log(`   Checked ${numericKeys.length} numeric keys\n`);
} catch (error) {
  console.error('❌ FAIL: Error validating numeric values:', error.message);
  process.exit(1);
}

// Test 6: Display sample configuration
console.log('Test 6: Sample configuration values');
try {
  const csv = fs.readFileSync(configPath, 'utf8');
  const records = parse(csv, { columns: true });

  console.log('Sample SEO Configuration:');
  records
    .filter(r => r.key.startsWith('seo.'))
    .slice(0, 3)
    .forEach(r => {
      console.log(`   ${r.key}: ${r.value}`);
    });

  console.log('\nSample Security Configuration:');
  records
    .filter(r => r.key.startsWith('security.'))
    .slice(0, 3)
    .forEach(r => {
      console.log(`   ${r.key}: ${r.value}`);
    });

  console.log('\n✅ PASS: Configuration data displayed successfully\n');
} catch (error) {
  console.error('❌ FAIL: Error reading sample config:', error.message);
  process.exit(1);
}

console.log('✅ All tests passed! Configuration store is working correctly.\n');
console.log('📚 API Endpoints:');
console.log('   GET  /api/config?key=seo.siteName');
console.log('   GET  /api/config?prefix=seo.');
console.log('   GET  /api/config?all=true');
console.log('   PUT  /api/config (body: { key, value, updated_by })');
console.log('   POST /api/config (body: { updates: [{key, value}], updated_by })');
console.log('   DELETE /api/config?key=some.key\n');
