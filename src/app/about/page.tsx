import type { Metadata } from 'next';
import Link from 'next/link';
import { textStyles } from '@/lib/ui';
import { absoluteUrl, jsonLd } from '@/lib/seo';
import { Building2, Users, Award, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Lab Essentials',
  description:
    'Learn about Lab Essentials - your trusted partner for quality laboratory equipment, microscopes, and scientific products. Reliable products backed by expert U.S. support.',
  alternates: {
    canonical: absoluteUrl('/about'),
  },
  openGraph: {
    title: 'About Us | Lab Essentials',
    description:
      'Learn about Lab Essentials - your trusted partner for quality laboratory equipment, microscopes, and scientific products.',
    url: absoluteUrl('/about'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About Us | Lab Essentials',
    description:
      'Learn about Lab Essentials - your trusted partner for quality laboratory equipment, microscopes, and scientific products.',
  },
};

export default function AboutPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: absoluteUrl('/about'),
      },
    ],
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lab Essentials',
    url: absoluteUrl('/'),
    description:
      'Quality laboratory equipment and scientific products for research, education, and clinical applications.',
  };

  const values = [
    {
      icon: Award,
      title: 'Quality You Can Trust',
      description:
        'Every product we offer is tested and reviewed to meet the standards labs rely on every day.',
    },
    {
      icon: Users,
      title: 'Expert Support',
      description:
        'Our U.S.-based team provides practical, knowledgeable help—from choosing the right equipment to keeping it running smoothly.',
    },
    {
      icon: Globe,
      title: 'Accessible Performance',
      description:
        'Reliable lab equipment shouldn\'t be out of reach. We focus on dependable products at fair, transparent prices.',
    },
    {
      icon: Building2,
      title: 'Trusted Nationwide',
      description:
        'From classrooms to research facilities, labs across the country count on Lab Essentials for consistent, accurate results.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(organizationJsonLd)}
      />

      <main
        id="main-content"
        className="bg-background"
        role="main"
      >
        {/* Hero Section with Brand Background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))]/10 via-background to-[hsl(var(--accent))]/5 border-b border-border/50 py-12 md:py-16">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

          <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <p className="text-sm md:text-base font-semibold text-[hsl(var(--brand))] uppercase tracking-wider mb-3">
                Modern Lab Equipment. Made Simple.
              </p>
              <h1 className={`${textStyles.h1} mb-5 text-[hsl(var(--ink))]`}>About Lab Essentials</h1>
              <p className="text-lg md:text-xl text-[hsl(var(--ink))] leading-relaxed mb-6">
                Quality lab equipment made simple. Trusted by 1,200+ labs nationwide.
              </p>

              {/* Trust bar under hero */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base font-semibold text-[hsl(var(--ink))] pt-5 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>1-Year Warranty</span>
                </div>
                <span className="text-border text-xl">•</span>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Free Shipping over $300</span>
                </div>
                <span className="text-border text-xl">•</span>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>U.S. Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10">
          {/* Combined Mission & Story Section - Two Column Layout */}
          <div className="py-12 md:py-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
              {/* Mission */}
              <div className="relative bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white rounded-2xl p-8 md:p-10 shadow-xl border-t-4 border-[hsl(var(--accent))] flex flex-col">
                <h2 className={`${textStyles.h3} mb-4 text-white`}>Our Mission</h2>
                <p className="text-base md:text-lg leading-relaxed text-white/95">
                  We make lab operations simpler by providing reliable, affordable equipment that&apos;s easy to use. Whether you&apos;re teaching future scientists or managing a clinical lab, you deserve quality products without high prices or complicated service.
                </p>
              </div>

              {/* Story */}
              <div className="relative bg-white border-2 border-border/50 rounded-2xl p-8 md:p-10 shadow-xl flex flex-col">
                <h2 className={`${textStyles.h3} mb-4`}>Our Story</h2>
                <div className="space-y-4 text-[hsl(var(--ink))] leading-relaxed">
                  <p className="text-base md:text-lg leading-relaxed">
                    Lab Essentials started with a straightforward idea: modern lab equipment should be accessible and dependable. Too often, labs have to choose between expensive name brands and products that don&apos;t hold up. We set out to change that—partnering with trusted manufacturers to deliver well-built products without the markups or hassle.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="py-12 md:py-16 bg-muted/30 -mx-6 px-6 md:-mx-10 md:px-10">
            <div className="max-w-7xl mx-auto">
              <h2 className={`${textStyles.h2} mb-8 text-center`}>What We Stand For</h2>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-card border-2 border-border/50 rounded-xl p-6 hover:border-[hsl(var(--brand))] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="text-center">
                        <div className="flex h-14 w-14 mx-auto mb-4 items-center justify-center rounded-xl bg-[hsl(var(--brand))] shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <Icon
                            className="h-7 w-7 text-white"
                            aria-hidden="true"
                          />
                        </div>
                        <h3 className={`${textStyles.h5} mb-2 text-[hsl(var(--ink))]`}>{value.title}</h3>
                        <p className="text-[hsl(var(--muted-foreground))] leading-relaxed text-sm">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-[hsl(var(--brand))] via-[hsl(var(--brand-dark))] to-[hsl(var(--brand))] rounded-2xl p-8 md:p-12 text-center max-w-7xl mx-auto shadow-2xl mb-12 mt-12 relative overflow-hidden border border-[hsl(var(--accent))]/20">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--accent))]/20 via-transparent to-[hsl(var(--accent))]/10 opacity-50"></div>

            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[hsl(var(--accent))]/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

            <h2 className={`${textStyles.h3} mb-6 text-white relative z-10`}>Ready to Upgrade Your Lab?</h2>
            <p className="text-white/95 mb-8 text-base md:text-lg mx-auto relative z-10">Browse our product catalog or connect with our team for personalized recommendations.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3 text-sm md:text-base font-bold text-[hsl(var(--brand))] shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:gap-4 hover:scale-105 group"
              >
                Browse Products
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href="/pages/contact-us"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/5 backdrop-blur-sm px-6 py-3 text-sm md:text-base font-bold text-white transition-all hover:-translate-y-1 hover:bg-white/15 hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
