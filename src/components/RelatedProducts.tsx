import React from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

// Accept products as a prop, fallback to empty array
interface RelatedProductsProps {
  products?: Product[];
}

export default function RelatedProducts({
  products = [],
}: RelatedProductsProps) {
  if (!products.length) return null;
  return (
    <section className="py-16 bg-muted border-t">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-primary mb-8 text-center">
          You might also like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
