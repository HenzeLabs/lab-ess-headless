import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

const PLACEHOLDER_IMG = '/placeholder-product.jpg';

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

const badgeVariantMap: Record<
  string,
  'default' | 'secondary' | 'accent' | 'destructive'
> = {
  'best seller': 'accent',
  bestseller: 'accent',
  'most luxurious': 'secondary',
  new: 'destructive',
};

export default function ProductCard({
  product,
}: {
  product: ProductWithExtras;
}) {
  const price = product.priceRange?.minVariantPrice?.amount;
  const badgeVariant = product.badge
    ? badgeVariantMap[product.badge.toLowerCase()] || 'default'
    : undefined;

  return (
    <Link
      href={`/products/${product.handle}`}
      tabIndex={0}
      aria-label={product.title}
      className="group h-full flex flex-col"
    >
      <Card className="flex flex-col p-0 overflow-hidden transition-all duration-300 hover:shadow-elevated flex-1">
        <div className="relative aspect-square w-full bg-background rounded-t-lg">
          {product.badge && (
            <Badge
              variant={badgeVariant}
              className="absolute top-3 left-3 z-10"
            >
              {product.badge}
            </Badge>
          )}
          <Image
            src={product.featuredImage?.url ?? PLACEHOLDER_IMG}
            alt={
              product.featuredImage?.altText
                ? product.featuredImage.altText
                : product.title
            }
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ aspectRatio: '1/1' }}
            priority={false}
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          {/* Product Title */}
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
            {product.title}
          </h3>
          {/* Product Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          {/* Price */}
          <div className="mb-4 mt-auto">
            <p className="text-xl font-bold text-primary">
              {price
                ? `From ${parseFloat(price).toFixed(0)}`
                : 'Contact for price'}
            </p>
          </div>
          {/* CTA Button */}
          <Button
            className="w-full mt-2"
            tabIndex={-1}
            aria-label={`Shop ${product.title}`}
          >
            Shop Now
          </Button>
        </div>
      </Card>
    </Link>
  );
}
