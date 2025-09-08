import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";

export interface ProductCardProps {
  id: string;
  handle: string;
  title: string;
  featuredImage?: { url: string; altText?: string } | null;
  price: { amount: string; currencyCode: string };
}

const ProductCard: FC<ProductCardProps> = ({
  id,
  handle,
  title,
  featuredImage,
  price,
}) => (
  <Link
    key={id}
    href={`/products/${handle}`}
    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition border border-gray-100 flex flex-col overflow-hidden"
  >
    {featuredImage?.url && (
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={featuredImage.url}
          alt={featuredImage.altText || title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          priority={true}
        />
      </div>
    )}
    <div className="p-5 flex-1 flex flex-col">
      <div className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-700 transition">
        {title}
      </div>
      <div className="text-gray-700 mb-2 text-base">
        {price.amount} {price.currencyCode}
      </div>
      <span className="mt-auto text-blue-600 font-medium hover:underline">
        View product
      </span>
    </div>
  </Link>
);

export default ProductCard;
