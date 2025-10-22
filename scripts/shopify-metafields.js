#!/usr/bin/env node

/**
 * Shopify Metafield Management Script
 *
 * Prerequisites:
 * 1. Create a Custom App in Shopify Admin:
 *    - Settings → Apps and sales channels → Develop apps → Create an app
 *    - Configure Admin API scopes: read_products, write_products, read_metaobjects, write_metaobjects
 *    - Install the app and get your Admin API access token
 *
 * 2. Set environment variables:
 *    SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *    SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxx
 *
 * Usage:
 *   node scripts/shopify-metafields.js list           # List all product metafield definitions
 *   node scripts/shopify-metafields.js create         # Create new metafield definitions
 *   node scripts/shopify-metafields.js delete [key]   # Delete specific metafield definition
 */

const https = require('https');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN || 'labessentials.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-01';

if (!SHOPIFY_TOKEN) {
  console.error('❌ Error: SHOPIFY_ADMIN_API_TOKEN or SHOPIFY_ADMIN_ACCESS_TOKEN environment variable not set');
  console.log('\nHow to get your token:');
  console.log('1. Go to Shopify Admin → Settings → Apps and sales channels');
  console.log('2. Click "Develop apps" → Create an app');
  console.log('3. Configure Admin API scopes: read_products, write_products, read_metaobjects, write_metaobjects');
  console.log('4. Install app and reveal Admin API access token');
  console.log('5. Set environment variable: export SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx');
  process.exit(1);
}

// GraphQL request helper
async function shopifyGraphQL(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });

    const options = {
      hostname: SHOPIFY_STORE,
      path: `/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.errors) {
            reject(new Error(JSON.stringify(json.errors, null, 2)));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// List all product metafield definitions
async function listMetafieldDefinitions() {
  console.log('📋 Fetching product metafield definitions...\n');

  const query = `
    query {
      metafieldDefinitions(first: 50, ownerType: PRODUCT) {
        edges {
          node {
            id
            name
            namespace
            key
            type {
              name
            }
            description
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyGraphQL(query);
    const definitions = data.metafieldDefinitions.edges;

    if (definitions.length === 0) {
      console.log('No metafield definitions found.');
      return;
    }

    console.log(`Found ${definitions.length} metafield definition(s):\n`);

    definitions.forEach(({ node }) => {
      console.log(`📌 ${node.name}`);
      console.log(`   Namespace: ${node.namespace}`);
      console.log(`   Key: ${node.key}`);
      console.log(`   Type: ${node.type.name}`);
      if (node.description) console.log(`   Description: ${node.description}`);
      console.log(`   ID: ${node.id}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Create new metafield definitions
async function createMetafieldDefinitions() {
  console.log('🔧 Creating new metafield definitions...\n');

  const definitions = [
    {
      name: 'Key Features',
      namespace: 'custom',
      key: 'features',
      type: 'list.single_line_text_field',
      description: 'List of product features (bullet points)',
    },
    {
      name: 'Applications',
      namespace: 'custom',
      key: 'applications',
      type: 'list.single_line_text_field',
      description: 'List of product use cases',
    },
    {
      name: 'User Manual',
      namespace: 'custom',
      key: 'manual_url',
      type: 'url',
      description: 'URL to product manual',
    },
    {
      name: 'Quick Start Guide',
      namespace: 'custom',
      key: 'quick_start_url',
      type: 'url',
      description: 'URL to quick start guide',
    },
    {
      name: 'Technical Specs',
      namespace: 'custom',
      key: 'specs_url',
      type: 'url',
      description: 'URL to technical specifications sheet',
    },
    {
      name: 'Equipment Category',
      namespace: 'custom',
      key: 'equipment_category',
      type: 'single_line_text_field',
      description: 'Type of lab equipment (microscope, centrifuge, incubator, etc.)',
    },
    {
      name: 'FAQ',
      namespace: 'custom',
      key: 'faq',
      type: 'multi_line_text_field',
      description: 'Frequently asked questions for this product',
    },
  ];

  for (const def of definitions) {
    try {
      const mutation = `
        mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
          metafieldDefinitionCreate(definition: $definition) {
            createdDefinition {
              id
              name
              namespace
              key
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        definition: {
          name: def.name,
          namespace: def.namespace,
          key: def.key,
          type: def.type,
          description: def.description,
          ownerType: 'PRODUCT',
        },
      };

      const data = await shopifyGraphQL(mutation, variables);

      if (data.metafieldDefinitionCreate.userErrors.length > 0) {
        console.log(`⚠️  ${def.name}:`);
        data.metafieldDefinitionCreate.userErrors.forEach(err => {
          console.log(`   ${err.message}`);
        });
      } else {
        console.log(`✅ Created: ${def.name} (${def.namespace}.${def.key})`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${def.name}:`, error.message);
    }
  }

  console.log('\n✨ Metafield creation complete!');
}

// Delete metafield definition
async function deleteMetafieldDefinition(key, namespace = 'custom') {
  if (!key) {
    console.error('❌ Error: Please provide a metafield key to delete');
    console.log('Usage: node scripts/shopify-metafields.js delete <key> [namespace]');
    console.log('Example: node scripts/shopify-metafields.js delete features custom');
    console.log('         node scripts/shopify-metafields.js delete primary_keyword lab');
    return;
  }

  console.log(`🗑️  Deleting metafield definition: ${namespace}.${key}...\n`);

  // First, find the metafield definition ID
  const listQuery = `
    query {
      metafieldDefinitions(first: 50, ownerType: PRODUCT, namespace: "${namespace}", key: "${key}") {
        edges {
          node {
            id
            name
            key
            namespace
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyGraphQL(listQuery);
    const definitions = data.metafieldDefinitions.edges;

    if (definitions.length === 0) {
      console.log(`No metafield definition found with key: ${key}`);
      return;
    }

    const metafieldId = definitions[0].node.id;
    const metafieldName = definitions[0].node.name;
    const metafieldNamespace = definitions[0].node.namespace;

    // Delete the metafield definition
    const deleteMutation = `
      mutation DeleteMetafieldDefinition($id: ID!) {
        metafieldDefinitionDelete(id: $id) {
          deletedDefinitionId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const deleteData = await shopifyGraphQL(deleteMutation, { id: metafieldId });

    if (deleteData.metafieldDefinitionDelete.userErrors.length > 0) {
      console.log('⚠️  Errors:');
      deleteData.metafieldDefinitionDelete.userErrors.forEach(err => {
        console.log(`   ${err.message}`);
      });
    } else {
      console.log(`✅ Deleted: ${metafieldName} (${metafieldNamespace}.${key})`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main CLI
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

(async () => {
  switch (command) {
    case 'list':
      await listMetafieldDefinitions();
      break;
    case 'create':
      await createMetafieldDefinitions();
      break;
    case 'delete':
      await deleteMetafieldDefinition(arg1, arg2);
      break;
    default:
      console.log('Shopify Metafield Management Tool\n');
      console.log('Usage:');
      console.log('  node scripts/shopify-metafields.js list                    # List all metafield definitions');
      console.log('  node scripts/shopify-metafields.js create                  # Create new metafield definitions');
      console.log('  node scripts/shopify-metafields.js delete [key] [namespace] # Delete specific metafield');
      console.log('\nExamples:');
      console.log('  node scripts/shopify-metafields.js delete features          # Delete custom.features');
      console.log('  node scripts/shopify-metafields.js delete primary_keyword lab  # Delete lab.primary_keyword');
      break;
  }
})();
