'use client';
import dynamic from 'next/dynamic';

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
};

export default function ProductInfoPanelClient({
  product,
}: ProductInfoPanelProps) {
  return <ProductInfoPanel product={product} />;
}
