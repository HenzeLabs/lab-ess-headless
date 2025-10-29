import type { Metadata } from 'next';
import Link from 'next/link';
import { textStyles, buttonStyles } from '@/lib/ui';
import { absoluteUrl, jsonLd } from '@/lib/seo';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageCircle,
  Truck,
  Phone,
  Download,
  Shield,
  Microscope,
  DollarSign,
  Wrench,
  Eye,
  HelpCircle,
} from 'lucide-react';
import StickyCTABar from '@/components/StickyCTABar';

export const metadata: Metadata = {
  title:
    'Lab Essentials vs AmScope | The Clear Choice for Professional Lab Equipment',
  description:
    'Stop settling for hidden costs and operational headaches. Lab Essentials offers reliable, U.S.-supported microscopes and centrifuges with infinity plan optics and brushless motors. No AmScope Tax.',
  alternates: {
    canonical: absoluteUrl('/pages/amscope-or-lab-essentials'),
  },
  openGraph: {
    title: 'Lab Essentials vs AmScope | Professional Lab Equipment',
    description:
      'Reliable U.S.-supported equipment vs quality control failures. See why 1,200+ labs choose Lab Essentials.',
    url: absoluteUrl('/pages/amscope-or-lab-essentials'),
    type: 'website',
  },
};

export default function AmScopeVsLabEssentialsPage() {
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
        name: 'Lab Essentials vs AmScope',
        item: absoluteUrl('/pages/amscope-or-lab-essentials'),
      },
    ],
  };

  const comparisonFeatures = [
    {
      icon: HelpCircle,
      feature: 'Customer Support',
      labEssentials: 'U.S.-based team available by phone or email',
      amscope: 'Online-only or limited response options',
    },
    {
      icon: Microscope,
      feature: 'Product Origin',
      labEssentials: 'Designed and assembled in the U.S. on select models',
      amscope: 'Commonly sourced from global suppliers',
    },
    {
      icon: Eye,
      feature: 'Optical Clarity',
      labEssentials:
        'Infinity Plan Optics available on select models for sharp, distortion-free images',
      amscope: 'May use standard Achromat optics',
    },
    {
      icon: Wrench,
      feature: 'Mechanical Design',
      labEssentials: 'Durable, easy-to-maintain components built for daily use',
      amscope:
        'May include lightweight materials more suited for occasional use',
    },
    {
      icon: DollarSign,
      feature: 'Pricing Transparency',
      labEssentials:
        'Clear pricing and accessory options with full warranty coverage',
      amscope: 'Varies by reseller; may require separate accessory purchases',
    },
    {
      icon: Shield,
      feature: 'Intended Use',
      labEssentials:
        'Built for classrooms, clinics, and professional workflows',
      amscope: 'Often marketed for hobbyist or entry-level applications',
    },
  ];

  const trustSignals = [
    {
      icon: Phone,
      title: 'U.S.-Based Support',
      description: 'Helpful, responsive team available by phone or email',
    },
    {
      icon: Truck,
      title: 'Fast Shipping',
      description: 'Orders ship quickly from our U.S. warehouse',
    },
    {
      icon: CheckCircle2,
      title: 'Warranty & Quality',
      description: 'Backed by full manufacturer warranty and product testing',
    },
    {
      icon: Download,
      title: 'Free Shipping',
      description: 'On all orders over $300',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)}
      />

      {/* Prefetch key pages for faster navigation */}
      <link rel="prefetch" href="/collections/microscopes" />
      <link rel="prefetch" href="/collections/incubators-slide-preparation" />
      <link rel="prefetch" href="/pages/contact-us" />

      <main id="main-content" className="bg-background" role="main">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))]/10 via-background to-[hsl(var(--accent))]/5 border-b border-border/50 py-8 md:py-20">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          ></div>

          <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              {/* Trust Badge */}
              <div className="mb-4 inline-flex items-center gap-2 bg-[hsl(var(--brand))]/10 border border-[hsl(var(--brand))]/20 rounded-full px-4 py-2 text-sm font-semibold text-[hsl(var(--brand))]">
                <CheckCircle2 className="h-4 w-4" />
                Trusted by 1,200+ Labs Worldwide
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[hsl(var(--ink))] mb-4 md:mb-6 leading-tight">
                See Why Labs Choose{' '}
                <span className="text-[hsl(var(--brand))]">Lab Essentials</span>{' '}
                Over AmScope
              </h1>

              <p className="text-xl md:text-2xl text-[hsl(var(--ink))] font-semibold mt-3 md:mt-4 mb-2 md:mb-3">
                Proven clarity. Faster service. Real U.S. support.
              </p>

              <p className="text-base md:text-lg text-[hsl(var(--muted-foreground))] mb-6 md:mb-8 max-w-3xl mx-auto">
                Stop settling for inconsistent quality and unresponsive support.
                Lab Essentials delivers tested microscopes, fast shipping, and
                expert help you can actually reach.
              </p>

              {/* Trust Badges Row */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-6 text-sm md:text-base">
                <div className="inline-flex items-center gap-2 text-[hsl(var(--ink))]">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Pre-Tested Quality</span>
                </div>
                <div className="inline-flex items-center gap-2 text-[hsl(var(--ink))]">
                  <Truck className="h-5 w-5 text-[hsl(var(--brand))]" />
                  <span className="font-medium">Free Shipping $300+</span>
                </div>
                <div className="inline-flex items-center gap-2 text-[hsl(var(--ink))]">
                  <Phone className="h-5 w-5 text-[hsl(var(--brand))]" />
                  <span className="font-medium">U.S.-Based Support</span>
                </div>
              </div>

              {/* Primary CTA - Prominent on Mobile */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
                <Link
                  href="/collections/microscopes"
                  className={`${buttonStyles.primary} px-8 py-4 text-lg md:text-base w-full sm:w-auto inline-flex items-center justify-center gap-3`}
                  aria-label="Browse our collection of reliable microscopes with U.S. support"
                >
                  Shop Reliable Microscopes
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  className={`${buttonStyles.outline} px-6 py-3 md:px-8 md:py-4 text-base w-full sm:w-auto inline-flex items-center justify-center gap-2`}
                  aria-label="Contact our U.S.-based support team"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Contact Us
                </Link>
              </div>

              <div className="max-w-5xl mx-auto mt-6 md:mt-8 mb-6 md:mb-10">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                  <div className="bg-white/50 backdrop-blur-sm border-2 border-border rounded-xl p-4 md:p-6 text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[hsl(var(--brand))]/10 flex items-center justify-center mx-auto mb-2 md:mb-3">
                      <Eye className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--brand))]" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-[hsl(var(--ink))] mb-1 md:mb-2">
                      Consistent Optical Clarity
                    </p>
                    <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] hidden md:block">
                      Every microscope is tested for precision before shipment
                    </p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm border-2 border-border rounded-xl p-4 md:p-6 text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[hsl(var(--brand))]/10 flex items-center justify-center mx-auto mb-2 md:mb-3">
                      <Truck className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--brand))]" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-[hsl(var(--ink))] mb-1 md:mb-2">
                      Fast U.S. Shipping
                    </p>
                    <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] hidden md:block">
                      Most orders ship within 1–3 business days
                    </p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm border-2 border-border rounded-xl p-4 md:p-6 text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[hsl(var(--brand))]/10 flex items-center justify-center mx-auto mb-2 md:mb-3">
                      <Phone className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--brand))]" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-[hsl(var(--ink))] mb-1 md:mb-2">
                      Responsive Support
                    </p>
                    <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] hidden md:block">
                      Reach a knowledgeable team that actually responds
                    </p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm border-2 border-border rounded-xl p-4 md:p-6 text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[hsl(var(--brand))]/10 flex items-center justify-center mx-auto mb-2 md:mb-3">
                      <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--brand))]" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-[hsl(var(--ink))] mb-1 md:mb-2">
                      Free Shipping $300+
                    </p>
                    <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] hidden md:block">
                      Simple, transparent pricing—no surprises
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial - Above the Fold */}
        <div className="bg-white border-y border-border/50 py-8 md:py-12">
          <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-r from-[hsl(var(--brand))]/10 to-[hsl(var(--accent))]/5 border-l-4 border-[hsl(var(--brand))] p-6 md:p-8 rounded-r-2xl shadow-card">
                <svg
                  className="absolute top-4 left-4 h-8 w-8 text-[hsl(var(--brand))]/20"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <div className="relative z-10">
                  <p className="text-base md:text-lg text-[hsl(var(--ink))] italic mb-4 leading-relaxed">
                    &ldquo;We started with a cheaper brand, but the focus drift
                    and constant need to clean new optics destroyed our workflow
                    efficiency. Upgrading to Lab Essentials equipment fixed that
                    instantly. The Revelation III microscopes deliver the
                    clarity we need for pathology, and knowing the U.S.-based
                    support team is available if anything goes wrong makes all
                    the difference.&rdquo;
                  </p>
                  <footer className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[hsl(var(--brand))]/10 flex items-center justify-center">
                      <span className="text-[hsl(var(--brand))] font-bold text-lg">
                        IA
                      </span>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--ink))] font-bold">
                        Irma A.
                      </p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Clinical Lab Director, El Paso, TX
                      </p>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10">
          {/* Solution Section */}
          <div className="py-12 md:py-16">
            <div className="max-w-5xl mx-auto text-center mb-10">
              <h2 className={`${textStyles.h2} mb-6`}>
                Dependable Equipment, Simplified
              </h2>
              <p className="text-lg md:text-xl text-[hsl(var(--ink))] leading-relaxed mb-6">
                Lab Essentials makes it easy to get reliable, high-quality
                equipment without unnecessary complexity or inflated costs. Our
                products are designed for everyday use and trusted by schools,
                clinics, and research facilities across the U.S.
              </p>
              <p className="text-lg md:text-xl text-[hsl(var(--ink))] leading-relaxed">
                When you choose Lab Essentials (featuring brands like{' '}
                <span className="font-semibold">LW Scientific</span>),
                you&apos;re choosing consistent performance, clear
                specifications, and responsive U.S.-based support that keeps
                your workflow running smoothly.
              </p>
            </div>

            {/* Trust Signals */}
            <div className="max-w-5xl mx-auto">
              <h3 className={`${textStyles.h3} mb-8 text-center`}>
                Confidence You Can Count On
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {trustSignals.map((signal, index) => {
                  const Icon = signal.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white border-2 border-border/50 rounded-2xl p-6 hover:border-[hsl(var(--brand))] hover:shadow-card hover:-translate-y-1 transition-all duration-300 group text-center"
                    >
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--brand))] shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <Icon
                            className="h-7 w-7 text-white"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <h4
                        className={`${textStyles.h5} mb-2 text-[hsl(var(--ink))]`}
                      >
                        {signal.title}
                      </h4>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                        {signal.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comparison Table Section */}
          <div className="py-12 md:py-16 bg-muted/30 -mx-6 px-6 md:-mx-10 md:px-10">
            <div className="max-w-7xl mx-auto">
              <h2 className={`${textStyles.h2} mb-4 text-center`}>
                Quality and Clarity You Can Rely On
              </h2>
              <p className="text-xl md:text-2xl font-semibold text-[hsl(var(--ink))] mb-4 text-center max-w-4xl mx-auto leading-relaxed">
                Built for Everyday Reliability
              </p>
              <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] mb-12 text-center max-w-4xl mx-auto leading-relaxed">
                Choosing lab equipment shouldn&apos;t involve guesswork. Lab
                Essentials focuses on dependable products, transparent
                specifications, and responsive support—so you can stay focused
                on your work, not troubleshooting your tools.
              </p>

              {/* Comparison Table - Desktop */}
              <div className="hidden lg:block overflow-hidden rounded-2xl border-2 border-border bg-white shadow-card">
                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    aria-label="Comparison of Lab Essentials vs entry-level microscopes"
                  >
                    <caption className="sr-only">
                      Feature-by-feature comparison showing Lab Essentials
                      advantages over typical entry-level microscopes
                    </caption>
                    <thead>
                      <tr className="bg-gradient-to-r from-[hsl(var(--brand))]/10 to-[hsl(var(--accent))]/5 border-b-2 border-border">
                        <th className="py-4 px-6 text-left w-1/4">
                          <span
                            className={`${textStyles.h5} text-[hsl(var(--ink))]`}
                          >
                            Feature Category
                          </span>
                        </th>
                        <th className="py-4 px-6 text-left w-5/12 bg-[hsl(var(--brand))]/5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand))] flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                            </div>
                            <span
                              className={`${textStyles.h5} text-[hsl(var(--brand))] font-bold`}
                            >
                              Lab Essentials
                            </span>
                          </div>
                        </th>
                        <th className="py-4 px-6 text-left w-5/12 bg-gray-50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-400 flex items-center justify-center">
                              <XCircle className="h-5 w-5 text-white flex-shrink-0" />
                            </div>
                            <span className={`${textStyles.h5} text-gray-600`}>
                              AmScope / Entry-Level
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <tr
                            key={index}
                            className="border-t border-border hover:bg-muted/20 transition-colors"
                          >
                            <td className="py-5 px-6 align-top">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand))]/10 flex items-center justify-center flex-shrink-0">
                                  <Icon className="h-5 w-5 text-[hsl(var(--brand))]" />
                                </div>
                                <span className="font-bold text-[hsl(var(--ink))]">
                                  {item.feature}
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-6 align-top bg-[hsl(var(--brand))]/5 border-l-2 border-[hsl(var(--brand))]/20">
                              <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--brand))] flex-shrink-0 mt-0.5" />
                                <span className="text-[hsl(var(--ink))] font-semibold">
                                  {item.labEssentials}
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-6 align-top bg-gray-50/50">
                              <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-600">
                                  {item.amscope}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comparison Cards - Mobile */}
              <div className="lg:hidden space-y-4">
                {comparisonFeatures.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="border-2 border-border rounded-xl overflow-hidden bg-white shadow-card"
                    >
                      {/* Feature Header */}
                      <div className="bg-gradient-to-r from-[hsl(var(--brand))]/10 to-[hsl(var(--accent))]/5 p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand))]/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-[hsl(var(--brand))]" />
                          </div>
                          <h3 className="font-bold text-[hsl(var(--ink))]">
                            {item.feature}
                          </h3>
                        </div>
                      </div>

                      {/* Lab Essentials */}
                      <div className="p-4 bg-green-50/50 border-b border-border">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-xs text-[hsl(var(--brand))] uppercase tracking-wider mb-1.5">
                              Lab Essentials / LW Scientific
                            </p>
                            <p className="text-sm text-[hsl(var(--ink))] font-medium leading-relaxed">
                              {item.labEssentials}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Typical Entry-Level */}
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5">
                              Typical Entry-Level Microscopes
                            </p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                              {item.amscope}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary after comparison */}
              <div className="mt-12 max-w-4xl mx-auto text-center">
                <p className="text-lg md:text-xl text-[hsl(var(--ink))] leading-relaxed mb-8">
                  You don&apos;t need to spend more time adjusting, cleaning, or
                  replacing your equipment. Lab Essentials delivers consistent
                  quality, clear specifications, and dependable support you can
                  actually reach when you need it.
                </p>
                <Link
                  href="/collections/microscopes"
                  className={`${buttonStyles.primary} px-8 py-4 text-base`}
                >
                  Shop Reliable Microscopes
                  <svg
                    className="h-5 w-5"
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
              </div>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              <h2 className={`${textStyles.h2} mb-4 text-center`}>
                Trusted by Clinical Professionals
              </h2>
              <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] mb-10 text-center leading-relaxed">
                We provide laboratory tools that deliver reliable performance
                for lab workflows requiring precision and durability. Our
                equipment is trusted by{' '}
                <span className="font-bold text-[hsl(var(--brand))]">
                  over 1,200 labs worldwide
                </span>
                .
              </p>

              {/* Testimonial */}
              <div className="relative bg-gradient-to-r from-[hsl(var(--brand))]/10 to-[hsl(var(--accent))]/5 border-l-4 border-[hsl(var(--brand))] p-8 md:p-10 rounded-r-2xl shadow-card mb-10">
                <svg
                  className="absolute top-4 left-4 h-10 w-10 text-[hsl(var(--brand))]/20"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <div className="relative z-10">
                  <p className="text-lg md:text-xl text-[hsl(var(--ink))] italic mb-6 leading-relaxed">
                    &ldquo;We started with a cheaper brand, but the focus drift
                    and constant need to clean new optics destroyed our workflow
                    efficiency. Upgrading to Lab Essentials equipment fixed that
                    instantly. The Revelation III microscopes deliver the
                    clarity we need for pathology, and knowing the U.S.-based
                    support team is available if anything goes wrong makes all
                    the difference. It&apos;s a genuine long-term
                    investment.&rdquo;
                  </p>
                  <footer className="text-[hsl(var(--ink))] font-bold">
                    — Irma A., Clinical Lab Director, El Paso, TX
                  </footer>
                </div>
              </div>

              {/* Popular Collections Navigation */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <Link
                  href="/collections/microscopes"
                  className="group bg-gradient-to-br from-[hsl(var(--brand))]/5 to-[hsl(var(--accent))]/5 border-2 border-[hsl(var(--brand))]/20 rounded-2xl p-8 hover:border-[hsl(var(--brand))] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand))] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Microscope className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`${textStyles.h4} text-[hsl(var(--brand))] mb-2 group-hover:underline`}
                      >
                        Shop Microscopes
                      </h3>
                      <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed mb-3">
                        Browse our complete line of professional microscopes
                        with infinity plan optics and U.S. support.
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--brand))]">
                        View Collection
                        <svg
                          className="h-4 w-4 group-hover:translate-x-1 transition-transform"
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
                      </span>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/collections/incubators-slide-preparation"
                  className="group bg-gradient-to-br from-[hsl(var(--brand))]/5 to-[hsl(var(--accent))]/5 border-2 border-[hsl(var(--brand))]/20 rounded-2xl p-8 hover:border-[hsl(var(--brand))] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand))] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`${textStyles.h4} text-[hsl(var(--brand))] mb-2 group-hover:underline`}
                      >
                        Incubators & Slide Preparation
                      </h3>
                      <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed mb-3">
                        Precision equipment for sample preparation and
                        incubation with reliable temperature control.
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--brand))]">
                        View Collection
                        <svg
                          className="h-4 w-4 group-hover:translate-x-1 transition-transform"
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
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="text-center">
                <Link
                  href="/collections"
                  className={`${buttonStyles.outline} px-8 py-4 text-base`}
                >
                  Browse All Lab Equipment
                  <svg
                    className="h-5 w-5"
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
              </div>
            </div>
          </div>

          {/* Precision Equipment Section */}
          <div className="py-12 md:py-16 bg-muted/30 -mx-6 px-6 md:-mx-10 md:px-10">
            <div className="max-w-5xl mx-auto">
              <h2 className={`${textStyles.h2} mb-6 text-center`}>
                Precision Equipment Built for Your Workflow
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="bg-gradient-to-br from-[hsl(var(--brand))]/5 to-[hsl(var(--accent))]/5 border-2 border-[hsl(var(--brand))]/20 rounded-2xl p-8 shadow-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand))] flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`${textStyles.h4} text-[hsl(var(--brand))]`}>
                      Lab Essentials
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--ink))]">
                        <span className="font-semibold">
                          Quiet, brushless motors
                        </span>{' '}
                        for low maintenance
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--ink))]">
                        <span className="font-semibold">Digital controls</span>{' '}
                        for precise adjustments
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--ink))]">
                        <span className="font-semibold">
                          30-Year Anti-Fungal Lens Coating
                        </span>{' '}
                        for long-term clarity
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--ink))]">
                        <span className="font-semibold">
                          Infinity Plan Optics
                        </span>{' '}
                        with true magnification specs
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white border-2 border-border rounded-2xl p-8 shadow-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3
                      className={`${textStyles.h4} text-[hsl(var(--muted-foreground))]`}
                    >
                      AmScope
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--muted-foreground))]">
                        Inconsistent motor quality across batches
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--muted-foreground))]">
                        Basic controls with limited precision
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--muted-foreground))]">
                        Optics may require frequent cleaning
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--muted-foreground))]">
                        &ldquo;Empty magnification&rdquo; marketing claims
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/collections/centrifuges"
                  className={`${buttonStyles.primary} px-8 py-4 text-base`}
                >
                  Explore Our High-Performance, USA-Engineered Centrifuges
                  <svg
                    className="h-5 w-5"
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
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] rounded-2xl p-10 md:p-16 text-center max-w-5xl mx-auto shadow-2xl mb-16 mt-12 relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute top-4 right-4 opacity-10">
              <svg
                className="h-24 w-24 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>

            <h2 className={`${textStyles.h2} mb-5 text-white relative z-10`}>
              Secure Your Upgrade Today
            </h2>
            <p className="text-white/95 mb-8 text-lg md:text-xl max-w-3xl mx-auto relative z-10 leading-relaxed">
              Don&apos;t risk purchasing a product that functions as a
              &ldquo;crap shoot from batch to batch&rdquo;. Our commitment is to
              offer modern, reliable equipment backed by accessible U.S.
              support.
            </p>

            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 mb-10 max-w-2xl mx-auto relative z-10">
              <h3 className="text-xl font-bold text-white mb-4">
                We Guarantee Your Satisfaction:
              </h3>
              <ul className="text-left text-white/95 space-y-2 max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                  <span>Fast Shipping from U.S. Warehouse</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                  <span>U.S.-Based Technical Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                  <span>Secure Checkout</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/collections/microscopes"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-base font-bold text-[hsl(var(--brand))] shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:gap-4 group"
              >
                See the Clarity: Shop Precision Microscopes
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border-3 border-white bg-transparent px-8 py-4 text-base font-bold text-white transition-all hover:-translate-y-1 hover:bg-white/10"
              >
                <MessageCircle className="h-5 w-5" />
                Stop Waiting: Chat with U.S. Support Now
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA Bar - Shows after scroll */}
      <StickyCTABar
        ctaText="Shop Reliable Microscopes"
        ctaHref="/collections/microscopes"
        showAfterScroll={600}
      />
    </>
  );
}
