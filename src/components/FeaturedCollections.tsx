import ProductRail from '@/components/ProductRail';
import { getCollectionByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import type { Product } from '@/lib/types';
import { getFallbackCollection } from '@/lib/fallback/catalog';

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
  let collection: CollectionResponse['collection'] | null = null;

  try {
    const response = await shopifyFetch<CollectionResponse>({
      query: getCollectionByHandleQuery,
      variables: {
        handle: BEST_SELLERS_HANDLE,
        first: PRODUCT_LIMIT,
      },
    });
    collection = response.data.collection;
  } catch (error) {
    console.error('Failed to load best-sellers collection', error);
  }

  const fallbackCollection = getFallbackCollection(BEST_SELLERS_HANDLE);
  const resolvedCollection = collection ?? fallbackCollection;
  const products =
    resolvedCollection?.products?.edges.map((edge) => edge.node) ?? [];

  if (!products.length) {
    return null;
  }

  return (
    <section className="w-full py-12 lg:pb-16 bg-background">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <ProductRail
          heading={resolvedCollection?.title ?? 'Best Sellers'}
          products={products}
          viewAllHref={`/collections/${
            resolvedCollection?.handle ?? BEST_SELLERS_HANDLE
          }`}
        />
      </div>
    </section>
  );
}
