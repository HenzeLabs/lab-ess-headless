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
    className="group border rounded-xl p-4 bg-white transition hover:shadow-lg hover:-translate-y-0.5 flex flex-col overflow-hidden"
    tabIndex={0}
  >
    {featuredImage?.url && (
      <div className="aspect-square bg-gray-100 relative rounded-md overflow-hidden">
        <Image
          src={featuredImage.url}
          alt={featuredImage.altText || title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain group-hover:scale-105 transition-transform"
          priority={true}
        />
      </div>
    )}
    <div className="flex-1 flex flex-col">
      <div className="mt-3 font-medium tracking-tight line-clamp-2">
        {title}
      </div>
      <div className="text-sm text-gray-600 mb-2">
        {price.amount} {price.currencyCode}
      </div>
      <span className="text-gray-700 hover:text-black underline-offset-4 hover:underline mt-auto transition">
        View product
      </span>
    </div>
  </Link>
);

export default ProductCard;
