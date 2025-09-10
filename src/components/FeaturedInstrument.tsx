import React from "react";
import Image from "next/image";
import Link from "next/link";

type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: { url: string; altText: string };
  priceRange: { minVariantPrice: { amount: string } };
  tags: string[];
};

export default function FeaturedInstrument({
  product,
}: {
  product: ShopifyProduct;
}) {
  const specifications = [
    { label: "Dimension", value: "200cm x 100cm" },
    { label: "Material", value: "Solid Oak Frame" },
    { label: "Upholstery", value: "Linen Blend Fabric" },
    { label: "Warranty", value: "5-Year Warranty" },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4 sm:px-6 lg:px-8">
        {/* Left Column: Image */}
        <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="relative w-full h-full">
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col">
          <p className="text-sm tracking-widest uppercase text-blue-600 font-bold">
            Featured Product
          </p>
          <h1 className="font-extrabold text-4xl mt-2 text-gray-800">
            {product.title}
          </h1>
          <p className="text-lg mt-4 max-w-prose text-gray-600">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-6 text-sm mt-8">
            {specifications.map((spec) => (
              <div key={spec.label}>
                <p className="font-bold text-gray-800">{spec.label}</p>
                <p className="text-gray-600 mt-1">{spec.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href={`/products/${product.handle}`}
              className="inline-block bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg"
            >
              View Product Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
