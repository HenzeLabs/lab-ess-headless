#!/usr/bin/env node
/**
 * Export Shopify Products for Quiz Testing
 *
 * This script fetches all microscope products from Shopify
 * and exports them to a JSON file for quiz validation.
 */

const fs = require('fs');
const path = require('path');

// Try to load .env file
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

// Shopify configuration
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'labessentials.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!SHOPIFY_TOKEN) {
  console.error('❌ Error: SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable not set');
  console.error('   A .env file has been created in quiz-testing/');
  console.error('   The token should already be loaded from it.');
  process.exit(1);
}

const GRAPHQL_ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

// GraphQL query to fetch products
const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, query: "product_type:Microscopes OR title:microscope*") {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          productType
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          metafields(identifiers: [
            { namespace: "custom", key: "features" },
            { namespace: "custom", key: "applications" },
            { namespace: "custom", key: "specs" },
            { namespace: "custom", key: "equipment_category" }
          ]) {
            namespace
            key
            value
            type
          }
        }
      }
    }
  }
`;

async function fetchProducts() {
  const products = [];
  let hasNextPage = true;
  let cursor = null;
  let pageCount = 0;

  console.log('🔍 Fetching products from Shopify...\n');

  while (hasNextPage) {
    pageCount++;
    console.log(`   Fetching page ${pageCount}...`);

    const variables = {
      first: 50,
      after: cursor,
    };

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
        },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.error('❌ GraphQL errors:', data.errors);
        throw new Error('GraphQL query failed');
      }

      const { edges, pageInfo } = data.data.products;

      // Process products
      edges.forEach((edge) => {
        const node = edge.node;

        // Convert metafields array to object
        const metafieldsObj = {};
        (node.metafields || []).forEach((field) => {
          if (field) {
            metafieldsObj[field.key] = field.value;
          }
        });

        products.push({
          id: node.id,
          title: node.title,
          handle: node.handle,
          productType: node.productType,
          price: parseFloat(node.priceRange.minVariantPrice.amount),
          currencyCode: node.priceRange.minVariantPrice.currencyCode,
          metafields: metafieldsObj,
        });
      });

      hasNextPage = pageInfo.hasNextPage;
      cursor = pageInfo.endCursor;

      console.log(`   ✓ Page ${pageCount}: ${edges.length} products`);

    } catch (error) {
      console.error('❌ Error fetching products:', error.message);
      throw error;
    }
  }

  return products;
}

async function main() {
  console.log('🔬 Shopify Product Exporter for Quiz Testing\n');

  try {
    // Fetch products
    const products = await fetchProducts();

    console.log(`\n✓ Total products fetched: ${products.length}`);

    // Save to JSON file
    const outputPath = path.join(__dirname, 'products_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

    console.log(`✓ Products exported to: ${outputPath}`);

    // Print summary
    console.log('\n📊 Product Summary:');

    // Count by type
    const typeCounts = {};
    products.forEach((product) => {
      const title = product.title.toLowerCase();
      let type = 'other';

      if (title.includes('inverted')) type = 'inverted';
      else if (title.includes('stereo')) type = 'stereo';
      else if (title.includes('compound')) type = 'compound';
      else if (title.includes('digital')) type = 'digital';

      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Price range
    const prices = products.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    console.log('\n💰 Price Range:');
    console.log(`   Min: $${minPrice.toFixed(2)}`);
    console.log(`   Max: $${maxPrice.toFixed(2)}`);
    console.log(`   Avg: $${avgPrice.toFixed(2)}`);

    console.log('\n✅ Export complete!');
    console.log('\nNext steps:');
    console.log('1. Run: python3 quiz_validator.py');
    console.log('2. Review: initial_validation_report.txt');
    console.log('3. Check: optimized_weights.json');

  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fetchProducts };
