import { shopifyFetch } from '../src/lib/shopify';
import { promises as fs } from 'fs';

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

interface ProductEdge {
  node: ShopifyProduct;
}

interface ProductsResponse {
  products?: {
    edges: ProductEdge[];
  };
}

const GET_PRODUCTS = `
  query GetProducts {
    products(first: 10, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          variants(first: 1) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchRealProducts() {
  try {
    console.log('🔍 Fetching real products from Shopify...\n');

    const response = await shopifyFetch<ProductsResponse>({
      query: GET_PRODUCTS,
    });

    const products = response.data?.products?.edges || [];

    if (products.length === 0) {
      console.log('❌ No products found in Shopify!');
      console.log('Please add products to your Shopify store first.');
      return;
    }

    console.log(`✅ Found ${products.length} products:\n`);

    products.forEach((edge: ProductEdge, index: number) => {
      const product = edge.node;
      const variant = product.variants.edges[0]?.node;

      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Handle: ${product.handle}`);
      console.log(`   Available: ${product.availableForSale ? 'Yes' : 'No'}`);
      if (variant) {
        console.log(
          `   Price: ${variant.price.currencyCode} ${variant.price.amount}`,
        );
        console.log(`   Variant ID: ${variant.id}`);
      }
      console.log('');
    });

    // Save the first available product handle for tests
    const firstAvailable = products.find(
      (p: ProductEdge) => p.node.availableForSale,
    );
    if (firstAvailable) {
      console.log('📝 First available product for testing:');
      console.log(`   Handle: "${firstAvailable.node.handle}"`);
      console.log(`   Use this in your tests!\n`);

      // Write to a test config file
      const testConfig = {
        testProductHandle: firstAvailable.node.handle,
        testVariantId: firstAvailable.node.variants.edges[0]?.node.id,
        products: products.map((p: ProductEdge) => ({
          handle: p.node.handle,
          title: p.node.title,
          available: p.node.availableForSale,
        })),
      };

      await fs.writeFile(
        'tests/fixtures/test-products.json',
        JSON.stringify(testConfig, null, 2),
      );
      console.log(
        '✅ Saved test product configuration to tests/fixtures/test-products.json',
      );
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error);
  }
}

fetchRealProducts();
