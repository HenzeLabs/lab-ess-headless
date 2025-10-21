import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import Hero from '@/components/Hero';
import CollectionSwitcherWrapper from '@/app/components/CollectionSwitcherWrapper';
import AboutSection from '@/components/AboutSection';
import FeaturedHeroProduct from '@/components/FeaturedHeroProduct';

import { absoluteUrl, jsonLd } from '@/lib/seo';

// Lazy load below-the-fold components to reduce initial JS bundle
const CTASection = dynamic(() => import('@/components/CTASection'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100" />,
});
const EmailSignup = dynamic(() => import('@/components/EmailSignup'), {
  loading: () => <div className="h-48 animate-pulse bg-gray-50" />,
});
const FeaturedCollections = dynamic(
  () => import('@/components/FeaturedCollections'),
  {
    loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
  },
);

export const revalidate = 300; // 5 minutes for homepage (longer cache for better TTFB)

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
  sameAs: ['https://www.facebook.com/labessentials'],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(organizationJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(websiteJsonLd)}
      />
      <main
        id="main-content"
        className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))]"
        role="main"
        data-test-id="homepage-main-content"
      >
        <Hero
          title="Precision Lab Equipment That Just Works"
          ctaText="Shop Microscopes"
          ctaHref="/collections/microscopes"
          ctaSecondaryText="Find Your Microscope"
          ctaSecondaryHref="/pages/microscope-selector-quiz"
          imageUrl="/hero.webp"
          imageAlt="Precision lab equipment and microscopes"
        />
        <AboutSection
          title="Why Labs Choose Lab Essentials"
          subtitle="Trusted performance, expert support, built for daily use"
        />
        <CollectionSwitcherWrapper />
        <CTASection />
        <FeaturedHeroProduct />
        <FeaturedCollections />
        <EmailSignup />
      </main>
    </>
  );
}
