require('dotenv').config({ path: '.env.local' });

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-07';

console.log('🚀 Starting detailed Shopify API debug...\n');
console.log('📋 Configuration:');
console.log(`   Store: ${SHOPIFY_STORE_DOMAIN}`);
console.log(
  `   Token: ${SHOPIFY_STOREFRONT_ACCESS_TOKEN?.substring(
    0,
    8,
  )}...${SHOPIFY_STOREFRONT_ACCESS_TOKEN?.substring(-4)}`,
);
console.log(`   API Version: ${SHOPIFY_API_VERSION}\n`);

async function shopifyFetch(query) {
  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Fetch error:', error);
    return { errors: [{ message: error.message }] };
  }
}

async function testIntrospection() {
  console.log('🔍 Testing API introspection to see available fields...');

  const introspectionQuery = `
    query {
      __schema {
        mutationType {
          fields {
            name
            description
          }
        }
      }
    }
  `;

  const result = await shopifyFetch(introspectionQuery);

  if (result.errors) {
    console.log('❌ Introspection failed:', result.errors);
    return;
  }

  const mutationFields = result.data?.__schema?.mutationType?.fields || [];
  const customerFields = mutationFields.filter((field) =>
    field.name.toLowerCase().includes('customer'),
  );

  console.log('✅ Available customer-related mutations:');
  customerFields.forEach((field) => {
    console.log(`   - ${field.name}: ${field.description || 'No description'}`);
  });
  console.log('');
}

async function testBasicQueries() {
  console.log('🔍 Testing basic queries that should work...');

  // Test shop query (should always work)
  const shopQuery = `
    query {
      shop {
        name
        description
      }
    }
  `;

  const shopResult = await shopifyFetch(shopQuery);
  if (shopResult.errors) {
    console.log('❌ Basic shop query failed:', shopResult.errors);
  } else {
    console.log('✅ Shop query works:', shopResult.data.shop.name);
  }

  // Test product query (should work with basic access)
  const productQuery = `
    query {
      products(first: 1) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `;

  const productResult = await shopifyFetch(productQuery);
  if (productResult.errors) {
    console.log('❌ Product query failed:', productResult.errors);
  } else {
    const productCount = productResult.data?.products?.edges?.length || 0;
    console.log(`✅ Product query works: ${productCount} products found`);
  }
  console.log('');
}

async function testCustomerMutations() {
  console.log('🔍 Testing customer mutations with minimal data...');

  // Test customer access token creation with minimal data
  const loginQuery = `
    mutation {
      customerAccessTokenCreate(input: {
        email: "test@example.com"
        password: "testpassword123"
      }) {
        customerAccessToken {
          accessToken
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const loginResult = await shopifyFetch(loginQuery);
  if (loginResult.errors) {
    console.log(
      '❌ Customer login mutation errors:',
      JSON.stringify(loginResult.errors, null, 2),
    );
  } else if (
    loginResult.data?.customerAccessTokenCreate?.customerUserErrors?.length > 0
  ) {
    console.log(
      '❌ Customer login user errors:',
      loginResult.data.customerAccessTokenCreate.customerUserErrors,
    );
  } else {
    console.log('✅ Customer login mutation works!');
  }

  // Test customer creation with minimal data
  const registerQuery = `
    mutation {
      customerCreate(input: {
        email: "newtest@example.com"
        password: "testpassword123"
        firstName: "Test"
        lastName: "User"
      }) {
        customer {
          id
          email
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const registerResult = await shopifyFetch(registerQuery);
  if (registerResult.errors) {
    console.log(
      '❌ Customer registration mutation errors:',
      JSON.stringify(registerResult.errors, null, 2),
    );
  } else if (
    registerResult.data?.customerCreate?.customerUserErrors?.length > 0
  ) {
    console.log(
      '❌ Customer registration user errors:',
      registerResult.data.customerCreate.customerUserErrors,
    );
  } else {
    console.log('✅ Customer registration mutation works!');
  }
  console.log('');
}

async function main() {
  await testBasicQueries();
  await testIntrospection();
  await testCustomerMutations();
  console.log('🏁 Detailed debug complete!');
}

main().catch(console.error);
