import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';

// Lazy load components below the fold for better performance
const CollectionSwitcherWrapper = dynamic(
  () => import('@/app/components/CollectionSwitcherWrapper'),
  {
    loading: () => (
      <div className="animate-pulse bg-gradient-to-r from-purple-100 via-white to-purple-100 h-64 rounded-2xl shadow-lg" />
    ),
  },
);

const CTASection = dynamic(() => import('@/components/CTASection'), {
  loading: () => (
    <div className="animate-pulse bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 h-48 rounded-2xl shadow-lg animate-glow" />
  ),
});

const FeaturedHeroProduct = dynamic(
  () => import('@/components/FeaturedHeroProduct'),
  {
    loading: () => (
      <div className="animate-pulse bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 h-96 rounded-2xl shadow-lg" />
    ),
  },
);

const FeaturedCollections = dynamic(
  () => import('@/components/FeaturedCollections'),
  {
    loading: () => (
      <div className="animate-pulse bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 h-80 rounded-2xl shadow-lg" />
    ),
  },
);

const RelatedProducts = dynamic(() => import('@/components/RelatedProducts'), {
  loading: () => (
    <div className="animate-pulse bg-gradient-to-l from-emerald-50 via-teal-50 to-cyan-50 h-64 rounded-2xl shadow-lg" />
  ),
});

const EmailSignup = dynamic(() => import('@/components/EmailSignup'), {
  loading: () => (
    <div className="animate-pulse bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 h-32 rounded-2xl shadow-lg" />
  ),
});

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
        className="bg-gradient-to-br from-gray-50 via-white to-purple-50/30 text-[hsl(var(--ink))] overflow-hidden"
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
        <div className="animate-fade-in-up animation-delay-500">
          <AboutSection
            title="Why Labs Choose Lab Essentials"
            subtitle="Trusted performance, expert support, built for daily use"
          />
        </div>
        <div className="animate-fade-in-up animation-delay-700">
          <CollectionSwitcherWrapper />
        </div>
        <div className="animate-fade-in-up animation-delay-1000">
          <CTASection />
        </div>
        <div className="animate-fade-in-up animation-delay-1300">
          <FeaturedHeroProduct />
        </div>
        <div className="animate-fade-in-up animation-delay-1600">
          <FeaturedCollections />
        </div>
        <div className="animate-fade-in-up animation-delay-1900">
          <RelatedProducts />
        </div>
        <div className="animate-fade-in-up animation-delay-2200">
          <EmailSignup />
        </div>
      </main>
    </>
  );
}
