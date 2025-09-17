'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { shopifyFetch } from '@/lib/shopify';
import { getCollectionProductsByHandleQuery } from '@/lib/queries';
import type { CollectionData, Product } from '@/lib/types';

interface CollectionSwitcherProps {
  initialCollections: CollectionData[];
}

const CollectionSwitcher: React.FC<CollectionSwitcherProps> = ({
  initialCollections,
}) => {
  const [activeCollectionHandle, setActiveCollectionHandle] = useState(
    initialCollections[0]?.handle || '',
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!activeCollectionHandle) return;

      setLoading(true);
      try {
        const { data } = await shopifyFetch<{
          collection: {
            products: { edges: { node: Product }[] };
          };
        }>({
          query: getCollectionProductsByHandleQuery,
          variables: { handle: activeCollectionHandle, first: 4 },
        });
        setProducts(data.collection.products.edges.map((edge) => edge.node));
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCollectionHandle]);

  const activeCollection = initialCollections.find(
    (collection) => collection.handle === activeCollectionHandle,
  );

  return (
    <section className="w-full py-12 lg:py-24 bg-background">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Shop by Collection
          </h2>
          {activeCollection && (
            <Link
              href={`/collections/${activeCollection.handle}`}
              className="text-primary hover:underline font-medium"
            >
              See All
            </Link>
          )}
        </div>

        <div className="flex space-x-4 overflow-x-auto mb-8 pb-2">
          {initialCollections.map((collection) => (
            <button
              key={collection.handle}
              onClick={() => setActiveCollectionHandle(collection.handle)}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-colors duration-200 ease-in-out
                ${
                  activeCollectionHandle === collection.handle
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {collection.title}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-card rounded-lg shadow-lg overflow-hidden flex flex-col"
              >
                <Link href={`/products/${product.handle}`} className="block relative h-60 w-full">
                  {product.featuredImage?.url ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </Link>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {product.title}
                  </h3>
                  <p className="text-primary font-bold mb-4">
                    {product.priceRange.minVariantPrice.amount}{' '}
                    {product.priceRange.minVariantPrice.currencyCode}
                  </p>
                  <Link
                    href={`/products/${product.handle}`}
                    className="inline-block w-full text-center bg-primary text-primary-foreground py-3 rounded-full font-semibold transition-colors hover:bg-primary/90"
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionSwitcher;
