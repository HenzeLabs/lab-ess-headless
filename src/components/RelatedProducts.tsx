import ProductRail from '@/components/ProductRail';
import { getCollectionByHandleQuery, getProductRecommendationsQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import type { Product } from '@/lib/types';
import { layout } from '@/lib/ui';

interface RelatedProductsProps {
  productId?: string;
  heading?: string;
  fallbackCollectionHandle?: string;
}

interface ProductRecommendationsResponse {
  productRecommendations: Product[];
}

interface CollectionResponse {
  collection: {
    handle: string;
    products: {
      edges: {
        node: Product;
      }[];
    };
  } | null;
}

const DEFAULT_FALLBACK_HANDLE = 'best-sellers';

export default async function RelatedProducts({
  productId,
  heading = 'Shop Related Products',
  fallbackCollectionHandle = DEFAULT_FALLBACK_HANDLE,
}: RelatedProductsProps) {
  try {
    let products: Product[] = [];
    let viewAllHref: string | undefined;

    if (productId) {
      const response = await shopifyFetch<ProductRecommendationsResponse>({
        query: getProductRecommendationsQuery,
        variables: { productId },
      });
      products = response.data.productRecommendations ?? [];
    }

    if (!products.length && fallbackCollectionHandle) {
      const fallbackResponse = await shopifyFetch<CollectionResponse>({
        query: getCollectionByHandleQuery,
        variables: { handle: fallbackCollectionHandle, first: 12 },
      });
      const fallbackCollection = fallbackResponse.data.collection;
      products = fallbackCollection?.products?.edges.map((edge) => edge.node) ?? [];
      if (fallbackCollection?.handle) {
        viewAllHref = `/collections/${fallbackCollection.handle}`;
      }
    }

    if (!products.length) {
      return null;
    }

    return (
      <section className="bg-[hsl(var(--bg))] py-16 sm:py-20">
        <div className={`${layout.container} space-y-6`}>
          <ProductRail heading={heading} products={products} viewAllHref={viewAllHref} />
        </div>
      </section>
    );
  } catch (error) {
    
    return null;
  }
}
