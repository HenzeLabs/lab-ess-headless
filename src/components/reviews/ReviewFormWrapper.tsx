'use client';

import dynamic from 'next/dynamic';

const ReviewForm = dynamic(() => import('./ReviewForm'), { ssr: false });

export default function ReviewFormWrapper({ productHandle }: { productHandle: string }) {
  return <ReviewForm productHandle={productHandle} />;
}
