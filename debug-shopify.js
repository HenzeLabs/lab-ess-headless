// Debug script to test Shopify API connectivity and permissions
const SHOPIFY_STORE_DOMAIN = 'labessentials.myshopify.com';
const SHOPIFY_STOREFRONT_API_TOKEN = 'c22dcd89ca97d4e5cfcf37f389edf929';
const SHOPIFY_API_VERSION = '2024-10';

async function testBasicShopQuery() {
  console.log('🔍 Testing basic Shopify connection...');

  const query = `
    query {
      shop {
        name
        id
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_TOKEN,
        },
        body: JSON.stringify({ query }),
      },
    );

    const result = await response.json();

    if (result.errors) {
      console.error('❌ Basic shop query failed:', result.errors);
      return false;
    }

    console.log('✅ Basic connection works! Shop:', result.data.shop.name);
    return true;
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

async function testCustomerAccessTokenCreate() {
  console.log('🔍 Testing customer access token creation (login)...');

  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const variables = {
    input: {
      email: 'test@example.com',
      password: 'password123',
    },
  };

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      },
    );

    const result = await response.json();

    if (result.errors) {
      console.error('❌ GraphQL errors in login test:', result.errors);
      return false;
    }

    const { customerAccessToken, customerUserErrors } =
      result.data.customerAccessTokenCreate;

    if (customerUserErrors && customerUserErrors.length > 0) {
      console.log(
        '⚠️ Customer login errors (expected for non-existing user):',
        customerUserErrors,
      );
    }

    if (customerAccessToken) {
      console.log(
        '✅ Login functionality works! Got access token:',
        customerAccessToken.accessToken.substring(0, 20) + '...',
      );
    } else {
      console.log(
        "📝 Login mutation accepted but no token (user probably doesn't exist)",
      );
    }

    return true;
  } catch (error) {
    console.error('❌ Network error in login test:', error.message);
    return false;
  }
}

async function testCustomerCreate() {
  console.log('🔍 Testing customer creation (registration)...');

  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          field
          message
          code
        }
      }
    }
  `;

  const variables = {
    input: {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    },
  };

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      },
    );

    const result = await response.json();

    if (result.errors) {
      console.error('❌ GraphQL errors in registration test:', result.errors);
      return false;
    }

    const { customer, customerUserErrors } = result.data.customerCreate;

    if (customerUserErrors && customerUserErrors.length > 0) {
      console.log('❌ Customer registration errors:', customerUserErrors);
      return false;
    }

    if (customer) {
      console.log(
        '✅ Registration functionality works! Created customer:',
        customer.email,
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Network error in registration test:', error.message);
    return false;
  }
}

async function debugPermissions() {
  console.log('🚀 Starting Shopify API permissions debug...\n');

  const basicWorks = await testBasicShopQuery();
  if (!basicWorks) {
    console.log('\n❌ Basic connectivity failed. Check your domain and token.');
    return;
  }

  console.log('');
  await testCustomerAccessTokenCreate();

  console.log('');
  await testCustomerCreate();

  console.log('\n🏁 Debug complete!');
}

// Run the debug
debugPermissions().catch(console.error);
