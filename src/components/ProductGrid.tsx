import ProductCard from '@/components/ProductCard';
import { shopifyFetch } from '@/lib/shopify';
import { getHomepageProductsQuery } from '@/lib/queries';
import type { Product } from '@/lib/types';
import { layout, textStyles } from '@/lib/ui';

interface ProductEdge {
  node: Product;
}

export default async function ProductGrid() {
  let products: Product[] = [];

  try {
    const response = await shopifyFetch<{
      products: {
        edges: ProductEdge[];
      };
    }>({
      query: getHomepageProductsQuery,
      variables: { first: 8 },
    });

    products = response.data.products?.edges.map((edge) => edge.node) ?? [];
  } catch (error) {
    console.error('Failed to load homepage products', error);
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-[hsl(var(--bg))]">
      <div className={`${layout.container} ${layout.section}`}>
        <div className="mb-10 max-w-3xl">
          <h2 className={textStyles.heading}>Featured Products</h2>
          <p className={`mt-4 ${textStyles.subheading}`}>
            Lab-approved gear and consumables ready for immediate deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
