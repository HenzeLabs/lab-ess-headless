import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

const PLACEHOLDER_IMG = "/placeholder-product.jpg";

const ProductBadge = ({ type }: { type: string }) => {
  const getBadgeStyles = () => {
    switch (type.toLowerCase()) {
      case "best seller":
      case "bestseller":
        return "bg-koala-badge-bestseller text-white";
      case "most luxurious":
        return "bg-koala-badge-luxury text-white";
      case "new":
        return "bg-koala-badge-new text-white";
      default:
        return "bg-koala-green text-white";
    }
  };

  return (
    <span
      className={`product-badge absolute top-3 left-3 z-10 ${getBadgeStyles()}`}
    >
      {type}
    </span>
  );
};

type ProductWithExtras = Product & {
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  badge?: string;
  description?: string;
};

export default function ProductCard({
  product,
}: {
  product: ProductWithExtras;
}) {
  const price = product.priceRange?.minVariantPrice?.amount;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group bg-white rounded-card overflow-hidden transition-all duration-300 hover:shadow-elevated h-full flex flex-col"
    >
      <div className="relative aspect-square w-full bg-white rounded-card">
        {product.badge && <ProductBadge type={product.badge} />}

        <Image
          src={product.featuredImage?.url ?? PLACEHOLDER_IMG}
          alt={product.featuredImage?.altText ?? product.title}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Product Title */}
        <h3 className="text-card-title text-koala-gray-dark mb-1">
          {product.title}
        </h3>

        {/* Product Description */}
        {product.description && (
          <p className="text-sm text-koala-gray mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mb-4 mt-auto">
          <p className="text-xl font-bold text-koala-green">
            {price
              ? `From ${parseFloat(price).toFixed(0)}`
              : "Contact for price"}
          </p>
        </div>

        {/* CTA Button */}
        <button className="w-full btn-primary text-center mt-2">
          Shop Now
        </button>
      </div>
    </Link>
  );
}
