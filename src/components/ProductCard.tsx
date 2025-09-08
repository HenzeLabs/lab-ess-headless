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
    role="group"
    className="border rounded-xl p-4 transition transform bg-white group hover:shadow-lg hover:-translate-y-0.5 focus-within:shadow-lg flex flex-col overflow-hidden"
    tabIndex={0}
  >
    {featuredImage?.url && (
      <div className="aspect-square bg-gray-100 relative rounded-md overflow-hidden">
        <Image
          src={featuredImage.url}
          alt={featuredImage.altText || title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          priority={true}
        />
      </div>
    )}
    <div className="flex-1 flex flex-col">
      <div className="mt-3 font-medium line-clamp-2">{title}</div>
      <div className="text-sm text-gray-600 mb-2">
        {price.amount} {price.currencyCode}
      </div>
      <span className="text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline mt-auto">
        View product
      </span>
    </div>
  </Link>
);

export default ProductCard;
