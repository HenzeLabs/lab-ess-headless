import ProductRail from '@/components/ProductRail';
import { getCollectionByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import type { Product } from '@/lib/types';
import { layout } from '@/lib/ui';

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
    const products = bestSellers?.products?.edges.map((edge) => edge.node) ?? [];

    if (!products.length) {
      return null;
    }

    return (
      <section className="bg-[hsl(var(--bg))] py-16 sm:py-20">
        <div className={`${layout.container} space-y-6`}> 
          <ProductRail
            heading="Best Sellers"
            products={products}
            viewAllHref={`/collections/${bestSellers?.handle ?? BEST_SELLERS_HANDLE}`}
          />
        </div>
      </section>
    );
  } catch (error) {
    
    return null;
  }
}
