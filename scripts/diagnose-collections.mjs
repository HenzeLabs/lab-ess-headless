import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_API_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';

const getAllCollectionsQuery = `
  query getAllCollections($first: Int = 20) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
          products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
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

async function diagnoseCollections() {
  try {
    console.log('Fetching collections from Shopify...');
    const response = await shopifyFetch({
      query: getAllCollectionsQuery,
      variables: { first: 250 }
    });
    const collections = response.data?.collections?.edges;
    if (collections && collections.length > 0) {
      console.log(`Found ${collections.length} collections:`);
      collections.forEach(edge => {
        console.log(`- ${edge.node.title} (handle: ${edge.node.handle})`);
      });
    } else {
      console.log('No collections found in store.');
    }
  } catch (error) {
    console.error('Error fetching collections:', error.message);
  }
}

diagnoseCollections();