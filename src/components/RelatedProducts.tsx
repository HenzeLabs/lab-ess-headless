import ProductRail from '@/components/ProductRail';
import {
  getCollectionByHandleQuery,
  getProductRecommendationsQuery,
} from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import type { Product } from '@/lib/types';

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

const DEFAULT_FALLBACK_HANDLE = 'featured-products';

export default async function RelatedProducts({
  productId,
  heading = 'Featured Lab Equipment',
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
        variables: { handle: fallbackCollectionHandle, first: 50 },
      });
      const fallbackCollection = fallbackResponse.data.collection;
      products =
        fallbackCollection?.products?.edges.map((edge) => edge.node) ?? [];
      console.log(
        `RelatedProducts: Fetched ${products.length} products from ${fallbackCollectionHandle} collection`,
      );
      if (fallbackCollection?.handle) {
        viewAllHref = `/collections/${fallbackCollection.handle}`;
      }
    }

    if (!products.length) {
      console.log('RelatedProducts: No products found');
      return (
        <section className="w-full py-12 lg:py-24 bg-background">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl font-bold">{heading}</h2>
            <p>No products found in the featured-products collection.</p>
          </div>
        </section>
      );
    }

    return (
      <section className="w-full pb-12 lg:pb-24 bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <ProductRail
            heading={heading}
            products={products}
            viewAllHref={viewAllHref}
          />
        </div>
      </section>
    );
  } catch (error) {
    return null;
  }
}
