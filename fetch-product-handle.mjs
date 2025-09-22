import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define boolean flag for verbose logging
const VERBOSE = process.env.VERBOSE === 'true' || false;

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_API_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';

const getAllProductsQuery = `
  query getAllProducts {
    products(first: 250) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

async function shopifyFetch({ query, variables, timeout = 15000 }) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_API_TOKEN) {
    throw new Error(
      'Missing Shopify env vars. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN (or SHOPIFY_STOREFRONT_API_TOKEN).',
    );
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(timeout),
  };

  const res = await fetch(endpoint, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  const { data, errors } = json;

  if (errors && errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join('\n'));
  }
  if (!data) {
    throw new Error('No data returned from Shopify.');
  }

  return { success: true, data };
}

async function getRealProductHandle() {
  try {
    const response = await shopifyFetch({
      query: getAllProductsQuery,
    });
    const products = response.data?.products?.edges;
    if (products && products.length > 0) {
      const handle = products[0].node.handle;
      if (VERBOSE) {
        console.log('Real product handle:', handle);
      }
      return handle;
    } else {
      if (VERBOSE) {
        console.log('No products found in store');
      }
      return null;
    }
  } catch (error) {
    if (VERBOSE) {
      console.error('Error fetching products:', error.message);
    }
    return null;
  }
}

getRealProductHandle().then((handle) => {
  if (handle) {
    console.log('Fetched product handle:', handle);
  } else {
    console.log('Failed to fetch product handle');
  }
});
