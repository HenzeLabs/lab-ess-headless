import type { Metadata } from 'next';

import Hero from '@/components/Hero';
import FeaturedCollections from '@/components/FeaturedCollections';
import CTASection from '@/components/CTASection';
import ProductGrid from '@/components/ProductGrid';
import TestimonialBlock from '@/components/TestimonialBlock';
import { absoluteUrl, jsonLd } from '@/lib/seo';

export const revalidate = 60;

const homeTitle = 'Lab Essentials | Precision Lab Equipment & Supplies';
const homeDescription =
  'Lab Essentials delivers calibrated instruments, consumables, and support services that keep research teams compliant and efficient.';

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: absoluteUrl('/'),
    siteName: 'Lab Essentials',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: homeDescription,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lab Essentials',
  url: absoluteUrl('/'),
  logo: absoluteUrl('/logo.svg'),
  sameAs: [
    'https://www.linkedin.com/company/labessentials',
    'https://www.facebook.com/labessentials',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Lab Essentials',
  url: absoluteUrl('/'),
  potentialAction: {
    '@type': 'SearchAction',
    target: `${absoluteUrl('/search')}?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default async function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(websiteJsonLd)} />
      <main
        id="main-content"
        className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))]"
        role="main"
      >
      <Hero
        title="Modern Lab Equipment. Simplified. Delivered."
        subtitle="Equip your schools, clinical labs, and research teams with high-performance tools, from essential consumables to precision instruments. We provide reliable solutions, backed by U.S.-based support and fast shipping, to help you maintain compliance and accelerate discovery."
        ctaText="Shop Microscopes"
        ctaHref="/collections/microscopes"
        ctaSecondaryText="Find Your Microscope"
        ctaSecondaryHref="/pages/microscope-selector-quiz"
      />
        <FeaturedCollections />
        <CTASection />
        <ProductGrid />
        <TestimonialBlock />
      </main>
    </>
  );
}
