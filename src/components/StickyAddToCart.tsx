'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { buttonStyles } from '@/lib/ui';

interface StickyAddToCartProps {
  productTitle: string;
  price: string;
  currencyCode?: string;
  onAddToCart: () => void;
  showAfterScroll?: number;
  isAdding?: boolean;
}

export default function StickyAddToCart({
  productTitle,
  price,
  currencyCode = 'USD',
  onAddToCart,
  showAfterScroll = 500,
  isAdding = false,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > showAfterScroll);
    };

    // Check scroll position on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  const formatPrice = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="complementary"
      aria-label="Quick add to cart"
    >
      <div className="bg-white shadow-2xl border-t-2 border-[hsl(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[hsl(var(--ink))] font-semibold text-sm md:text-base truncate">
                {productTitle}
              </p>
              <p className="text-[hsl(var(--brand))] font-bold text-lg md:text-xl">
                {formatPrice(price)}
              </p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={onAddToCart}
              disabled={isAdding}
              className={`${buttonStyles.primary} px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold shadow-lg hover:shadow-xl flex-shrink-0`}
              aria-label={`Add ${productTitle} to cart`}
            >
              <ShoppingCart
                className="h-4 w-4 md:h-5 md:w-5 mr-2"
                aria-hidden="true"
              />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
