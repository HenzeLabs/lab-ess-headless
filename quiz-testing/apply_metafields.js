#!/usr/bin/env node
/**
 * Apply Metafields from CSV to Shopify
 *
 * Reads metafields_template.csv and uploads to Shopify
 */

const fs = require('fs');
const path = require('path');

// Load environment
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const parentEnvPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(parentEnvPath)) {
  const envContent = fs.readFileSync(parentEnvPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'labessentials.myshopify.com';
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ Error: SHOPIFY_ADMIN_ACCESS_TOKEN not found');
  process.exit(1);
}

const GRAPHQL_ENDPOINT = `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/graphql.json`;

async function setProductMetafields(productId, metafields) {
  const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = {
    id: productId,
    metafields: metafields.map(mf => {
      // Determine the correct type based on the key
      let type, value;

      if (mf.key === 'features' || mf.key === 'applications' || mf.key === 'specs') {
        // These are list fields - convert pipe-separated strings to JSON array
        type = 'list.single_line_text_field';
        const items = mf.value.split('|').map(item => item.trim()).filter(item => item);
        value = JSON.stringify(items);
      } else if (mf.key === 'equipment_category' || mf.key === 'type') {
        // Simple string fields
        type = 'single_line_text_field';
        value = mf.value;
      } else {
        // Default
        type = 'multi_line_text_field';
        value = mf.value;
      }

      return {
        namespace: 'custom',
        key: mf.key,
        value: value,
        type: type,
      };
    }),
  };

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  if (data.data.productUpdate.userErrors.length > 0) {
    throw new Error(`User errors: ${JSON.stringify(data.data.productUpdate.userErrors)}`);
  }

  return data.data.productUpdate.product;
}

function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Simple CSV parser (handles quoted fields)
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
        id: values[0],
        title: values[1].replace(/^"|"$/g, ''),
        type: values[2],
        features: values[3].replace(/^"|"$/g, ''),
        applications: values[4].replace(/^"|"$/g, ''),
        specs: values[5].replace(/^"|"$/g, ''),
        category: values[6],
      });
    }
  }

  return products;
}

async function main() {
  console.log('🔬 Metafield Uploader\n');

  try {
    // Read CSV
    if (!fs.existsSync('metafields_template.csv')) {
      console.error('❌ metafields_template.csv not found');
      console.error('   Run: node generate_metafield_template.js');
      process.exit(1);
    }

    const csvContent = fs.readFileSync('metafields_template.csv', 'utf-8');
    const products = parseCSV(csvContent);

    console.log(`📦 Found ${products.length} products in CSV\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      console.log(`[${i + 1}/${products.length}] ${product.title}`);

      const metafields = [
        { key: 'type', value: product.type },
        { key: 'features', value: product.features },
        { key: 'applications', value: product.applications },
        { key: 'specs', value: product.specs },
        { key: 'equipment_category', value: product.category },
      ];

      try {
        await setProductMetafields(product.id, metafields);
        console.log('   ✓ Updated\n');
        successCount++;
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        errorCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('════════════════════════════════════════');
    console.log(`✅ Complete: ${successCount} updated, ${errorCount} errors`);
    console.log('════════════════════════════════════════\n');

    if (successCount > 0) {
      console.log('📊 Next step: Run validation again');
      console.log('   ./run_validation.sh\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
