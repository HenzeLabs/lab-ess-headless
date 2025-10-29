'use client';

import StickyCollectionCTA from './StickyCollectionCTA';

interface StickyCollectionCTAWrapperProps {
  collectionTitle: string;
  productCount?: number;
}

export default function StickyCollectionCTAWrapper({
  collectionTitle,
  productCount,
}: StickyCollectionCTAWrapperProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StickyCollectionCTA
      collectionTitle={collectionTitle}
      productCount={productCount}
      onSortClick={scrollToTop}
      showAfterScroll={600}
    />
  );
}
