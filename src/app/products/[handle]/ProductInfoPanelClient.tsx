'use client';
import dynamic from 'next/dynamic';
import StarRating from '@/components/StarRating';

const ProductInfoPanel = dynamic(
  () => import('@/components/ProductInfoPanel'),
  { ssr: false },
);

// Define Variant type to match ProductInfoPanel
type Variant = {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale?: boolean;
};

type ProductInfoPanelProps = {
  product: {
    id: string;
    title: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    tags?: string[];
    variants: { edges: { node: Variant }[] };
    descriptionHtml?: string;
  };
  reviewCount?: number;
  averageRating?: number;
};

export default function ProductInfoPanelClient({
  product,
  reviewCount = 0,
  averageRating = 0,
}: ProductInfoPanelProps) {
  return (
    <div>
      {reviewCount > 0 && (
        <a
          href="#reviews"
          className="inline-block mb-4 hover:opacity-80 transition-opacity"
        >
          <StarRating rating={averageRating} count={reviewCount} size="sm" />
        </a>
      )}
      <ProductInfoPanel product={product} />
    </div>
  );
}
