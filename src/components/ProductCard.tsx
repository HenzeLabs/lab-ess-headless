'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { textStyles, buttonStyles } from '@/lib/ui';
import { trackSelectItem } from '@/lib/analytics';

type ProductWithExtras = Product & {
  description?: string;
  variants?: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        availableForSale?: boolean;
        price?: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
};

export default function ProductCard({
  product,
  listName,
}: {
  product: ProductWithExtras;
  listName?: string;
}) {
  const imageSrc =
    product.featuredImage?.url ?? product.images?.edges?.[0]?.node?.url;
  const imageAlt = product.featuredImage?.altText ?? product.title;

  // Get price from priceRange (already in Product type)
  const price = product.priceRange?.minVariantPrice?.amount;
  const currencyCode =
    product.priceRange?.minVariantPrice?.currencyCode ?? 'USD';

  const formattedPrice = price
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).format(Number(price))
    : null;

  // Helper function to get metafield value by key
  const getMetafield = (key: string) => {
    if (!product.metafields || !Array.isArray(product.metafields)) {
      return null;
    }
    // Filter out null/undefined entries before processing
    const validMetafields = product.metafields.filter(Boolean);
    return validMetafields.find((field) => field.key === key)?.value;
  };

  // Get key metafields for display
  const brand = getMetafield('brand');
  const modelNumber = getMetafield('model_number');
  const features = getMetafield('features');
  const availabilityStatus = getMetafield('availability_status');

  const handleProductClick = () => {
    trackSelectItem(
      {
        id: product.id,
        name: product.title,
        price,
        currency: currencyCode,
        category: product.tags?.[0] ?? null,
        brand,
        variant: null,
      },
      listName,
    );
  };

  return (
    <div className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Image and Product Info - clickable area */}
      <Link
        href={`/products/${product.handle}`}
        className="block flex-grow"
        onClick={handleProductClick}
      >
        <div className="flex h-60 w-full items-center justify-center rounded-t-2xl bg-background p-6">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={220}
              height={220}
              className="h-full w-auto object-contain drop-shadow-sm"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
              data-test-id="product-image"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        <div className="p-5 pt-3">
          <div>
            <h3 className={`${textStyles.h4} text-foreground`}>
              {product.title}
            </h3>
            {/* Brand and Model Number */}
            {(brand || modelNumber) && (
              <div className="mt-1 flex flex-wrap gap-2 text-xs">
                {brand && (
                  <span className="px-2 py-1 bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))] rounded-md font-medium">
                    {brand}
                  </span>
                )}
                {modelNumber && (
                  <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-md">
                    Model: {modelNumber}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Key Features */}
          {features && (
            <div className="text-xs text-muted-foreground mt-3">
              <p className="line-clamp-2">{features}</p>
            </div>
          )}

          {/* Availability Status */}
          {availabilityStatus && (
            <div className="text-xs mt-3">
              <span
                className={`px-2 py-1 rounded-md ${
                  availabilityStatus.toLowerCase() === 'in stock'
                    ? 'bg-green-100 text-green-700'
                    : availabilityStatus.toLowerCase() === 'limited stock'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {availabilityStatus}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Price section - OUTSIDE the Link, positioned consistently */}
      <div className="px-5 pb-3">
        <p className="text-base font-bold text-gray-900 dark:text-white">
          {formattedPrice ?? 'Contact for price'}
        </p>
      </div>

      {/* Buy Now Button - separate clickable area at bottom */}
      <div className="px-5 pb-5">
        <Link
          href={`/products/${product.handle}`}
          className={`${buttonStyles.primary} w-full`}
          onClick={handleProductClick}
        >
          Buy Now
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
