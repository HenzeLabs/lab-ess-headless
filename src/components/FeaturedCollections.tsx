import ProductRail from '@/components/ProductRail';
import { getCollectionByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import type { Product } from '@/lib/types';

const BEST_SELLERS_HANDLE = 'best-sellers';
const PRODUCT_LIMIT = 12;

interface CollectionResponse {
  collection: {
    id: string;
    handle: string;
    title: string;
    products: {
      edges: {
        node: Product;
      }[];
    };
  } | null;
}

export default async function FeaturedCollections() {
  try {
    const response = await shopifyFetch<CollectionResponse>({
      query: getCollectionByHandleQuery,
      variables: {
        handle: BEST_SELLERS_HANDLE,
        first: PRODUCT_LIMIT,
      },
    });

    const bestSellers = response.data.collection;
    const products =
      bestSellers?.products?.edges.map((edge) => edge.node) ?? [];

    if (!products.length) {
      console.log(
        'FeaturedCollections: No products found for best-sellers collection',
      );
      return (
        <section className="w-full py-12 lg:py-24 bg-background">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl font-bold">Best Sellers</h2>
            <p>No products found in the best-sellers collection.</p>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full py-12 lg:pb-16 bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <ProductRail
            heading="Best Sellers"
            products={products}
            viewAllHref={`/collections/${
              bestSellers?.handle ?? BEST_SELLERS_HANDLE
            }`}
          />
        </div>
      </section>
    );
  } catch (error) {
    return null;
  }
}
