'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { RoyalButton, RoyalCard } from './royal-components';
import { cn } from '@/lib/cn';

interface RoyalProductCardProps {
  product: {
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      url: string;
      altText?: string;
    };
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    description?: string;
    tags?: string[];
    availableForSale?: boolean;
  };
  priority?: boolean;
  className?: string;
}

export function RoyalProductCard({
  product,
  priority = false,
  className,
}: RoyalProductCardProps) {
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const isOutOfStock = !product.availableForSale;

  return (
    <RoyalCard
      className={cn(
        'group overflow-hidden transition-all duration-300',
        'hover:shadow-2xl hover:shadow-purple-500/10',
        isOutOfStock && 'opacity-75',
        className,
      )}
      glow={!isOutOfStock}
    >
      <div className="relative aspect-square overflow-hidden">
        {/* Image */}
        {product.featuredImage ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              className="object-cover transition-transform duration-300"
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
            <svg
              className="w-20 h-20 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock && (
            <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
              Out of Stock
            </span>
          )}
          {product.tags?.includes('featured') && (
            <span className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded">
              Featured
            </span>
          )}
          {price > 1000 && (
            <span className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded">
              Premium
            </span>
          )}
        </div>

        {/* Quick action overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"
        >
          <RoyalButton
            variant="royal"
            size="md"
            className="opacity-90 hover:opacity-100"
          >
            Quick View
          </RoyalButton>
        </motion.div>
      </div>

      {/* Product details */}
      <div className="p-6">
        <div className="mb-3">
          <Link
            href={`/products/${product.handle}`}
            className="group-hover:text-purple-600 transition-colors duration-200"
          >
            <h3 className="text-lg font-semibold line-clamp-2 mb-2">
              {product.title}
            </h3>
          </Link>

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Price and actions */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            $
            {price.toLocaleString('en-US', {
              minimumFractionDigits: price % 1 === 0 ? 0 : 2,
              maximumFractionDigits: 2,
            })}
            <span className="text-sm font-normal text-gray-500 ml-1">
              {product.priceRange.minVariantPrice.currencyCode}
            </span>
          </div>

          <Link href={`/products/${product.handle}`}>
            <RoyalButton
              variant={isOutOfStock ? 'secondary' : 'primary'}
              size="sm"
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Notify Me' : 'View Details'}
            </RoyalButton>
          </Link>
        </div>

        {/* Product tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </RoyalCard>
  );
}

// Royal Product Grid Component
interface RoyalProductGridProps {
  products: RoyalProductCardProps['product'][];
  className?: string;
}

export function RoyalProductGrid({
  products,
  className,
}: RoyalProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className,
      )}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <RoyalProductCard product={product} priority={index < 4} />
        </motion.div>
      ))}
    </div>
  );
}
