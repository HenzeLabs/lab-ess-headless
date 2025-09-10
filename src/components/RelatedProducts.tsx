import React from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

// Placeholder related products
const related: Product[] = [
  {
    id: "1",
    title: "Cushy Sofa Bed",
    handle: "cushy-sofa-bed",
    featuredImage: {
      url: "/placeholders/product1.jpg",
      altText: "Cushy Sofa Bed",
    },
    description: "",
    priceRange: {
      minVariantPrice: {
        amount: "999.00",
        currencyCode: "USD",
      },
    },
  },
  {
    id: "2",
    title: "Kirra Sofa Bed",
    handle: "kirra-sofa-bed",
    featuredImage: {
      url: "/placeholders/product2.jpg",
      altText: "Kirra Sofa Bed",
    },
    description: "",
    priceRange: {
      minVariantPrice: {
        amount: "1199.00",
        currencyCode: "USD",
      },
    },
  },
];

export default function RelatedProducts() {
  return (
    <section className="py-16 bg-blue-50 border-t">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-koala-green mb-8 text-center">
          You might also like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {related.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
