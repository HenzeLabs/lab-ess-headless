#!/usr/bin/env node
/**
 * Populate Shopify Product Metafields
 *
 * This script helps you add metafields to your microscope products
 * so the quiz can accurately recommend them.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
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

// Also try to load from parent .env.local
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
  console.error('   Set it in quiz-testing/.env or ../.env.local');
  process.exit(1);
}

const API_VERSION = '2024-01';
const GRAPHQL_ENDPOINT = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

// Product metafield templates based on microscope type
const METAFIELD_TEMPLATES = {
  'compound': {
    features: [
      'LED illumination',
      'Mechanical stage',
      'Multiple objective lenses',
      'Coaxial coarse and fine focus',
    ],
    applications: [
      'Bacteria and microorganisms',
      'Blood samples',
      'Tissue slides',
      'Pond water analysis',
      'Transparent specimens',
    ],
    equipment_category: 'Education', // or Clinical or Research
  },
  'stereo': {
    features: [
      'Dual LED illumination',
      'Wide field of view',
      '3D viewing capability',
      'Incident and transmitted light',
    ],
    applications: [
      'Insects and specimens',
      'Rocks and minerals',
      'Circuit board inspection',
      'Dissection',
      'Opaque specimens',
    ],
    equipment_category: 'Education',
  },
  'inverted': {
    features: [
      'Inverted optical design',
      'Phase contrast capability',
      'Large stage for culture vessels',
      'Trinocular head for camera',
    ],
    applications: [
      'Cell cultures',
      'Tissue culture observation',
      'Live cell imaging',
      'Embryology',
      'Cell biology research',
    ],
    equipment_category: 'Clinical',
  },
  'digital': {
    features: [
      'Built-in digital camera',
      'USB connectivity',
      'Image capture software',
      'LED illumination',
    ],
    applications: [
      'Digital imaging',
      'Educational presentations',
      'Documentation',
      'Video microscopy',
    ],
    equipment_category: 'Education',
  },
};

// Interactive prompt helper
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

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

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data.products.edges.map(edge => edge.node);
}

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
    metafields: metafields.map(mf => ({
      namespace: 'custom',
      key: mf.key,
      value: mf.value,
      type: mf.type || 'multi_line_text_field',
    })),
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

async function guessMetafieldsFromProduct(product) {
  const title = product.title.toLowerCase();

  // Determine type
  let type = 'compound';
  if (title.includes('stereo')) type = 'stereo';
  else if (title.includes('inverted')) type = 'inverted';
  else if (title.includes('digital')) type = 'digital';

  // Determine category based on title and price would be ideal
  let category = 'Education';
  if (title.includes('research') || title.includes('professional')) category = 'Research';
  else if (title.includes('clinical') || title.includes('lab')) category = 'Clinical';

  const template = METAFIELD_TEMPLATES[type];

  // Extract magnification if present
  const magMatch = title.match(/(\d+)[-x]/i);
  const specs = magMatch
    ? `Magnification: ${magMatch[1]}x, Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`
    : `Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  return {
    type,
    category,
    features: template.features,
    applications: template.applications,
    specs,
  };
}

async function main() {
  console.log('🔬 Shopify Metafield Populator\n');

  try {
    // Fetch products
    console.log('📦 Fetching microscope products...');
    const products = await fetchProducts();

    if (products.length === 0) {
      console.log('❌ No microscope products found');
      return;
    }

    console.log(`✓ Found ${products.length} products\n`);

    // Filter out accessories
    const actualMicroscopes = products.filter(p => {
      const title = p.title.toLowerCase();
      return !title.includes('kit') &&
             !title.includes('case') &&
             !title.includes('adapter') &&
             !title.includes('camera') &&
             !title.includes('cleaning');
    });

    console.log(`📊 ${actualMicroscopes.length} actual microscopes (excluding accessories)\n`);

    console.log('────────────────────────────────────────');
    console.log('Choose an option:');
    console.log('────────────────────────────────────────');
    console.log('1. Auto-populate ALL microscopes (quick)');
    console.log('2. Review and customize each product (recommended)');
    console.log('3. List products only (no changes)');
    console.log('────────────────────────────────────────\n');

    const choice = await question('Enter choice (1-3): ');

    if (choice === '3') {
      console.log('\n📋 Products:\n');
      actualMicroscopes.forEach((p, i) => {
        console.log(`${i + 1}. ${p.title}`);
        console.log(`   Handle: ${p.handle}`);
        console.log(`   Type: ${p.productType || '(not set)'}\n`);
      });
      rl.close();
      return;
    }

    if (choice === '1') {
      console.log('\n🚀 Auto-populating metafields...\n');

      for (const product of actualMicroscopes) {
        const guessed = await guessMetafieldsFromProduct(product);

        console.log(`📝 ${product.title}`);
        console.log(`   Type: ${guessed.type}`);
        console.log(`   Category: ${guessed.category}`);

        const metafields = [
          {
            key: 'features',
            value: guessed.features.join('\n'),
          },
          {
            key: 'applications',
            value: guessed.applications.join('\n'),
          },
          {
            key: 'specs',
            value: guessed.specs,
          },
          {
            key: 'equipment_category',
            value: guessed.category,
          },
        ];

        try {
          await setProductMetafields(product.id, metafields);
          console.log(`   ✓ Updated\n`);
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}\n`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('✅ Auto-population complete!\n');
    }
    else if (choice === '2') {
      console.log('\n📝 Interactive mode (customize each product)...\n');

      for (let i = 0; i < actualMicroscopes.length; i++) {
        const product = actualMicroscopes[i];
        const guessed = await guessMetafieldsFromProduct(product);

        console.log(`\n─── Product ${i + 1}/${actualMicroscopes.length} ───`);
        console.log(`📦 ${product.title}\n`);

        console.log('Suggested values:');
        console.log(`  Type: ${guessed.type}`);
        console.log(`  Category: ${guessed.category}`);
        console.log(`  Features: ${guessed.features.slice(0, 2).join(', ')}...`);
        console.log(`  Applications: ${guessed.applications.slice(0, 2).join(', ')}...`);

        const proceed = await question('\nUse these values? (y/n/skip): ');

        if (proceed.toLowerCase() === 'skip' || proceed.toLowerCase() === 's') {
          console.log('⏭️  Skipped');
          continue;
        }

        if (proceed.toLowerCase() === 'n') {
          // Custom input
          const type = await question('  Type (compound/stereo/inverted/digital): ');
          const category = await question('  Category (Education/Clinical/Research): ');

          const template = METAFIELD_TEMPLATES[type] || METAFIELD_TEMPLATES['compound'];

          guessed.type = type;
          guessed.category = category;
          guessed.features = template.features;
          guessed.applications = template.applications;
        }

        const metafields = [
          { key: 'features', value: guessed.features.join('\n') },
          { key: 'applications', value: guessed.applications.join('\n') },
          { key: 'specs', value: guessed.specs },
          { key: 'equipment_category', value: guessed.category },
        ];

        try {
          await setProductMetafields(product.id, metafields);
          console.log('✓ Updated successfully\n');
        } catch (error) {
          console.log(`❌ Error: ${error.message}\n`);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('✅ Interactive update complete!\n');
    }

    console.log('─────────────────────────────');
    console.log('Next steps:');
    console.log('1. Run: ./run_validation.sh');
    console.log('2. Check new accuracy results');
    console.log('3. Refine metafields as needed');
    console.log('─────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { setProductMetafields };
