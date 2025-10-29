#!/usr/bin/env node
/**
 * Generate Metafield Template CSV
 *
 * Creates a CSV file with suggested metafields for each product.
 * You can edit the CSV, then run apply_metafields.js to upload to Shopify.
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

const TEMPLATES = {
  compound: {
    features: 'LED illumination|Mechanical stage|Multiple objective lenses|Coaxial focus controls',
    applications: 'Bacteria and microorganisms|Blood samples|Tissue slides|Transparent specimens',
    category: 'Education',
  },
  stereo: {
    features: 'Dual LED illumination|Wide field view|3D viewing|Incident and transmitted light',
    applications: 'Insects and specimens|Rocks and minerals|Circuit boards|Opaque specimens',
    category: 'Education',
  },
  inverted: {
    features: 'Inverted design|Phase contrast|Large stage|Trinocular head for camera',
    applications: 'Cell cultures|Tissue culture|Live cell imaging|Embryology',
    category: 'Clinical',
  },
  digital: {
    features: 'Built-in camera|USB connectivity|Image capture|LED illumination',
    applications: 'Digital imaging|Educational presentations|Documentation|Video microscopy',
    category: 'Education',
  },
};

async function fetchProducts() {
  const query = `
    query {
      products(first: 50, query: "product_type:Microscope OR title:microscope*") {
        edges {
          node {
            id
            title
            handle
            productType
            priceRange {
              minVariantPrice {
                amount
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  if (data.errors) throw new Error(JSON.stringify(data.errors));

  return data.data.products.edges.map(edge => edge.node);
}

function guessTypeFromProduct(product) {
  const title = product.title.toLowerCase();

  if (title.includes('stereo')) return 'stereo';
  if (title.includes('inverted')) return 'inverted';
  if (title.includes('digital')) return 'digital';
  return 'compound';
}

function guessCategoryFromPrice(price) {
  if (price < 600) return 'Education';
  if (price < 1400) return 'Clinical';
  return 'Research';
}

function extractMagnification(title) {
  const match = title.match(/(\d+)[-x]/i);
  return match ? `${match[1]}x` : '';
}

async function main() {
  console.log('🔬 Metafield Template Generator\n');

  try {
    console.log('📦 Fetching products from Shopify...');
    const products = await fetchProducts();

    // Filter actual microscopes
    const microscopes = products.filter(p => {
      const title = p.title.toLowerCase();
      return !title.includes('kit') &&
             !title.includes('case') &&
             !title.includes('adapter') &&
             !title.includes('camera') &&
             !title.includes('cleaning');
    });

    console.log(`✓ Found ${microscopes.length} microscopes\n`);

    // Generate CSV
    const csvLines = [];
    csvLines.push('product_id,product_title,type,features,applications,specs,equipment_category');

    microscopes.forEach(product => {
      const type = guessTypeFromProduct(product);
      const price = parseFloat(product.priceRange.minVariantPrice.amount);
      const category = guessCategoryFromPrice(price);
      const template = TEMPLATES[type];
      const mag = extractMagnification(product.title);
      const specs = mag ? `Magnification: ${mag}|Type: ${type}` : `Type: ${type}`;

      csvLines.push([
        product.id,
        `"${product.title}"`,
        type,
        `"${template.features}"`,
        `"${template.applications}"`,
        `"${specs}"`,
        category,
      ].join(','));
    });

    const csvContent = csvLines.join('\n');
    fs.writeFileSync('metafields_template.csv', csvContent);

    console.log('✅ Template created: metafields_template.csv\n');
    console.log('📝 Next steps:');
    console.log('   1. Open metafields_template.csv in Excel/Numbers');
    console.log('   2. Edit the values for each product');
    console.log('   3. Save the file');
    console.log('   4. Run: node apply_metafields.js\n');

    // Also create a readable version
    console.log('────────────────────────────────────────');
    console.log('PREVIEW (first 3 products):');
    console.log('────────────────────────────────────────\n');

    microscopes.slice(0, 3).forEach((product, i) => {
      const type = guessTypeFromProduct(product);
      const template = TEMPLATES[type];
      const price = parseFloat(product.priceRange.minVariantPrice.amount);
      const category = guessCategoryFromPrice(price);

      console.log(`${i + 1}. ${product.title}`);
      console.log(`   Type: ${type}`);
      console.log(`   Category: ${category} ($${price})`);
      console.log(`   Features: ${template.features.split('|').slice(0, 2).join(', ')}...`);
      console.log(`   Applications: ${template.applications.split('|').slice(0, 2).join(', ')}...\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
