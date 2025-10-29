#!/usr/bin/env node
/**
 * Analyze Quiz Test Coverage
 *
 * Shows what types/categories are in test cases vs what products we actually have
 */

const fs = require('fs');

// Parse CSV test cases
function parseTestCases(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const testCases = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let currentValue = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    if (values.length >= 10) {
      testCases.push({
        id: values[0],
        expectedType: values[8],
        expectedCategory: values[9],
      });
    }
  }

  return testCases;
}

// Parse product CSV
function parseProducts(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let currentValue = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    if (values.length >= 7) {
      products.push({
        title: values[1].replace(/^"|"$/g, ''),
        type: values[2],
        category: values[6],
      });
    }
  }

  return products;
}

function main() {
  console.log('📊 Quiz Coverage Analysis\n');

  // Load test cases
  const testCsv = fs.readFileSync('quiz_test_cases.csv', 'utf-8');
  const testCases = parseTestCases(testCsv);

  // Load products
  const prodCsv = fs.readFileSync('metafields_template.csv', 'utf-8');
  const products = parseProducts(prodCsv);

  // Count test case expectations
  const typeNeeds = {};
  const categoryNeeds = {};

  testCases.forEach(tc => {
    typeNeeds[tc.expectedType] = (typeNeeds[tc.expectedType] || 0) + 1;
    categoryNeeds[tc.expectedCategory] = (categoryNeeds[tc.expectedCategory] || 0) + 1;
  });

  // Count available products
  const typeAvailable = {};
  const categoryAvailable = {};

  products.forEach(p => {
    typeAvailable[p.type] = (typeAvailable[p.type] || 0) + 1;
    categoryAvailable[p.category] = (categoryAvailable[p.category] || 0) + 1;
  });

  console.log('════════════════════════════════════════');
  console.log('📦 PRODUCT INVENTORY');
  console.log('════════════════════════════════════════');
  console.log(`Total Products: ${products.length}\n`);

  console.log('By Type:');
  Object.entries(typeAvailable).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  console.log('\nBy Category:');
  Object.entries(categoryAvailable).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });

  console.log('\n════════════════════════════════════════');
  console.log('🧪 TEST CASE REQUIREMENTS');
  console.log('════════════════════════════════════════');
  console.log(`Total Test Cases: ${testCases.length}\n`);

  console.log('Expected Types:');
  Object.entries(typeNeeds).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    const available = typeAvailable[type] || 0;
    const coverage = available > 0 ? '✓' : '✗';
    console.log(`  ${coverage} ${type}: ${count} test cases (${available} products available)`);
  });

  console.log('\nExpected Categories:');
  Object.entries(categoryNeeds).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    const available = categoryAvailable[cat] || 0;
    const coverage = available > 0 ? '✓' : '✗';
    console.log(`  ${coverage} ${cat}: ${count} test cases (${available} products available)`);
  });

  console.log('\n════════════════════════════════════════');
  console.log('⚠️  COVERAGE GAPS');
  console.log('════════════════════════════════════════\n');

  const missingTypes = Object.keys(typeNeeds).filter(type => !typeAvailable[type]);
  const missingCategories = Object.keys(categoryNeeds).filter(cat => !categoryAvailable[cat]);

  if (missingTypes.length > 0) {
    console.log('Missing Product Types:');
    missingTypes.forEach(type => {
      console.log(`  ❌ ${type} - ${typeNeeds[type]} test cases need this`);
    });
  } else {
    console.log('✅ All required types are available');
  }

  if (missingCategories.length > 0) {
    console.log('\nMissing Categories:');
    missingCategories.forEach(cat => {
      console.log(`  ❌ ${cat} - ${categoryNeeds[cat]} test cases need this`);
    });
  } else {
    console.log('✅ All required categories are available');
  }

  // Calculate theoretical maximum accuracy
  let canMatch = 0;
  testCases.forEach(tc => {
    if (typeAvailable[tc.expectedType]) {
      canMatch++;
    }
  });

  const maxPossibleAccuracy = (canMatch / testCases.length) * 100;

  console.log('\n════════════════════════════════════════');
  console.log('📈 THEORETICAL LIMITS');
  console.log('════════════════════════════════════════');
  console.log(`Max Possible Type Accuracy: ${maxPossibleAccuracy.toFixed(1)}%`);
  console.log(`(${canMatch}/${testCases.length} tests have matching product types)\n`);

  if (maxPossibleAccuracy < 90) {
    console.log('⚠️  To achieve 90%+ accuracy, you need to:');
    missingTypes.forEach(type => {
      console.log(`   • Add at least 1 "${type}" microscope product`);
    });
  }

  console.log('');
}

main();
