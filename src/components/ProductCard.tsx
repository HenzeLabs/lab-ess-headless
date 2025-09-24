import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';
import type { Product } from '@/lib/types';
import { textStyles, buttonStyles } from '@/lib/ui';

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

const ProductCard = React.memo<{ product: ProductWithExtras }>(
  ({ product }) => {
    const imageSrc =
      product.featuredImage?.url ?? product.images?.edges?.[0]?.node?.url;
    const imageAlt = product.featuredImage?.altText ?? product.title;

    // Memoize price calculations
    const priceData = useMemo(() => {
      const price = product.priceRange?.minVariantPrice?.amount;
      const currencyCode =
        product.priceRange?.minVariantPrice?.currencyCode ?? 'USD';

      const formattedPrice = price
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
          }).format(Number(price))
        : null;

      return { price, currencyCode, formattedPrice };
    }, [
      product.priceRange?.minVariantPrice?.amount,
      product.priceRange?.minVariantPrice?.currencyCode,
    ]);

    // Memoize metafield processing
    const metafields = useMemo(() => {
      if (!product.metafields || !Array.isArray(product.metafields)) {
        return {
          brand: null,
          modelNumber: null,
          features: null,
          availabilityStatus: null,
        };
      }

      const validMetafields = product.metafields.filter(Boolean);
      const getMetafield = (key: string) =>
        validMetafields.find((field) => field.key === key)?.value || null;

      return {
        brand: getMetafield('brand'),
        modelNumber: getMetafield('model_number'),
        features: getMetafield('features'),
        availabilityStatus: getMetafield('availability_status'),
      };
    }, [product.metafields]);

    return (
      <div
        className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 card-hover bg-gradient-to-br from-white via-white to-purple-50/30"
        data-test-id="product-card"
      >
        {/* Image and Product Info - clickable area */}
        <Link href={`/products/${product.handle}`} className="block flex-grow">
          <div className="relative flex h-60 w-full items-center justify-center rounded-t-2xl bg-gradient-to-br from-gray-50 to-purple-50/20 p-6 overflow-hidden">
            {/* Subtle background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-transparent to-blue-100/20 animate-pulse"></div>
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={220}
                height={220}
                className="relative z-10 h-full w-auto object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={false}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyxx7ZTapIlG4ASZnOsZqGlQ7EzFw/nMDNNrSTcMpC1K1kUZxBH2mUUNUKjTCGI="
                data-test-id="product-image"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">No image available</span>
              </div>
            )}
          </div>
          <div className="p-5 pt-3">
            <div>
              <h3 className={`${textStyles.h4} text-foreground`}>
                {product.title}
              </h3>
              {/* Brand and Model Number */}
              {(metafields.brand || metafields.modelNumber) && (
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {metafields.brand && (
                    <span className="px-2 py-1 bg-[#4e2cfb]/10 text-[#4e2cfb] rounded-md font-medium">
                      {metafields.brand}
                    </span>
                  )}
                  {metafields.modelNumber && (
                    <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-md">
                      Model: {metafields.modelNumber}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Key Features */}
            {metafields.features && (
              <div className="text-xs text-muted-foreground mt-3">
                <p className="line-clamp-2">{metafields.features}</p>
              </div>
            )}

            {/* Availability Status */}
            {metafields.availabilityStatus && (
              <div className="text-xs mt-3">
                <span
                  className={`px-2 py-1 rounded-md ${
                    metafields.availabilityStatus.toLowerCase() === 'in stock'
                      ? 'bg-green-100 text-green-700'
                      : metafields.availabilityStatus.toLowerCase() ===
                        'limited stock'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {metafields.availabilityStatus}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Price section - OUTSIDE the Link, positioned consistently */}
        <div className="px-5 pb-3">
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {priceData.formattedPrice ?? 'Contact for price'}
          </p>
        </div>

        {/* Buy Now Button - separate clickable area at bottom */}
        <div className="px-5 pb-5">
          <Link
            href={`/products/${product.handle}`}
            className={`${buttonStyles.primary} w-full`}
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
  },
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;
