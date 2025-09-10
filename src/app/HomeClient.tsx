'use client';

import dynamic from 'next/dynamic';
import Hero from '../components/Hero';
import BrandValues from '../components/BrandValues';
import type { MenuItem } from '@/lib/types';

const Collections = dynamic(() => import('../components/Bestsellers'), {
  ssr: false,
});
const CustomerReviews = dynamic(() => import('../components/CustomerReviews'), {
  ssr: false,
});

interface HomeClientProps {
  collections: MenuItem[];
}

export default function HomeClient({ collections }: HomeClientProps) {
  return (
    <>
      <Hero />
      <section>
        <Collections productsByCollection={{}} />
      </section>
      <section>
        <CustomerReviews />
      </section>
      <section>
        <BrandValues />
      </section>
    </>
  );
}
