'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface MockProductPageProps {
  product: {
    handle: string;
    name: string;
    price: number;
    description: string;
    image: string;
  };
}

export default function MockProductPage({ product }: MockProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update cart count in header (mock implementation)
    const cartCountElement = document.querySelector(
      '[data-test-id="cart-count"]',
    );
    if (cartCountElement) {
      const currentCount = parseInt(cartCountElement.textContent || '0');
      cartCountElement.textContent = (currentCount + quantity).toString();
    }

    setIsAdding(false);

    // Show success message
    console.log(`Added ${quantity}x ${product.name} to cart`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-semibold text-gray-700 mt-2">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <p className="text-gray-600">{product.description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <label htmlFor="quantity" className="text-sm font-medium">
              Quantity:
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full md:w-auto"
            data-test-id="add-to-cart-button"
          >
            {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
          </Button>

          <div className="text-sm text-gray-500">
            <p>✓ Free shipping on orders over $300</p>
            <p>✓ 30-day return policy</p>
            <p>✓ Expert technical support</p>
          </div>
        </div>
      </div>
    </div>
  );
}
