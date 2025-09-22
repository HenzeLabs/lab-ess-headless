import type { Metadata } from 'next';

import Hero from '@/components/Hero';
import CollectionSwitcherWrapper from '@/app/components/CollectionSwitcherWrapper';
import CTASection from '@/components/CTASection';
import AboutSection from '@/components/AboutSection';
import EmailSignup from '@/components/EmailSignup';
import FeaturedCollections from '@/components/FeaturedCollections';
import FeaturedHeroProduct from '@/components/FeaturedHeroProduct';
import RelatedProducts from '@/components/RelatedProducts';

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
        />
        <AboutSection
          title="Why Labs Choose Lab Essentials"
          subtitle="Trusted performance, expert support, built for daily use"
        />
        <CollectionSwitcherWrapper />
        <CTASection />
        <FeaturedHeroProduct />
        <FeaturedCollections />
        <RelatedProducts />
        <EmailSignup />
      </main>
    </>
  );
}
