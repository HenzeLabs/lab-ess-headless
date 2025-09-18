import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Card } from './ui/card';

type ProductWithExtras = Product & {
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  description?: string;
};

export default function ProductCard({
  product,
}: {
  product: ProductWithExtras;
}) {
  const imageSrc =
    product.featuredImage?.url ??
    product.images?.edges?.[0]?.node?.url;
  const imageAlt =
    product.featuredImage?.altText ??
    product.title;

  const price = product.priceRange?.minVariantPrice?.amount;
  const currencyCode = product.priceRange?.minVariantPrice?.currencyCode ?? 'USD';
  const formattedPrice = price
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).format(Number(price))
    : null;
  

  return (
    <Link
      href={`/products/${product.handle}`}
      tabIndex={0}
      aria-label={product.title}
      className="group h-full flex flex-col"
    >
      <Card className="flex flex-col p-0 overflow-hidden flex-1 transition-shadow duration-200 hover:shadow-lg focus-within:shadow-lg">
        <div className="relative aspect-square w-full bg-background rounded-t-lg transition-transform duration-500 motion-reduce:transition-none motion-reduce:transform-none motion-safe:group-hover:scale-105">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain w-full h-full"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
              No Image
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          {/* Product Title */}
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
            {product.title}
          </h3>
          {/* CTA Button */}
          <Button
            className="w-full mt-2"
            tabIndex={-1}
            aria-label={`Shop ${product.title}`}
          >
            Shop Now
          </Button>
          
          {/* Price */}
          <div className="mb-4 mt-auto">
            <p className="text-xl font-bold text-primary">
              {formattedPrice ?? 'Contact for price'}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}