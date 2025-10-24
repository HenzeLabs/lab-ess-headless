import type { Metadata } from 'next';
import Link from 'next/link';
import { textStyles, buttonStyles } from '@/lib/ui';
import { absoluteUrl, jsonLd } from '@/lib/seo';
import { CheckCircle2, XCircle, AlertTriangle, MessageCircle, Truck, Phone, Download, Shield, Microscope, DollarSign, Wrench, Eye, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lab Essentials vs AmScope | The Clear Choice for Professional Lab Equipment',
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
      labEssentials: 'Reliable, U.S.-Based Support',
      amscope: 'Systematically non-functional; All BBB complaints unanswered',
    },
    {
      icon: Microscope,
      feature: 'Product Origin',
      labEssentials: 'U.S. Designed/Assembled equipment available (e.g., Incubators, MXU Centrifuge)',
      amscope: 'Lack of transparency; generally re-labeled Chinese generics',
    },
    {
      icon: Eye,
      feature: 'Optical Clarity',
      labEssentials: 'Infinity Plan Optics deliver sharp, distortion-free images',
      amscope: 'Pervasive quality failures, narrow field of view causing eye strain',
    },
    {
      icon: Wrench,
      feature: 'Mechanical Quality',
      labEssentials: 'Durable, maintenance-free brushless motors and ergonomic designs',
      amscope: 'Substandard materials (soft steel, cheap plastic) leading to premature wear and breakage',
    },
    {
      icon: DollarSign,
      feature: 'Hidden Costs',
      labEssentials: 'Transparent pricing; bundled accessories are high-quality (e.g., BioVID 4K Camera)',
      amscope: 'High likelihood of needing immediate, unplanned replacement costs (the "AmScope Tax") due to poor-quality accessories',
    },
    {
      icon: Shield,
      feature: 'Professional Workflow',
      labEssentials: 'Features optimized for workflow (e.g., parfocality assured C-mounts)',
      amscope: 'Frequent lack of parfocality, requiring constant refocusing when changing zoom levels',
    },
  ];

  const trustSignals = [
    {
      icon: Phone,
      title: 'U.S.-Based Support',
      description: 'Backed by helpful, knowledgeable staff',
    },
    {
      icon: Truck,
      title: 'Fast Shipping',
      description: 'Orders ship quickly from our U.S. Warehouse',
    },
    {
      icon: CheckCircle2,
      title: 'Warranty & Quality',
      description: 'Lab-grade build for continuous use',
    },
    {
      icon: Download,
      title: 'Free Shipping',
      description: 'Available on all orders over $300+',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)}
      />

      <main id="main-content" className="bg-background" role="main">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))]/10 via-background to-[hsl(var(--accent))]/5 border-b border-border/50 py-16 md:py-20">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

          <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className={`${textStyles.h1} mb-4 text-[hsl(var(--ink))]`}>
                Lab Essentials vs. AmScope:
              </h1>
              <p className="text-xl md:text-2xl text-[hsl(var(--muted-foreground))] mt-4 mb-6">
                The Clear Choice for Professional Lab Equipment
              </p>

              <div className="max-w-5xl mx-auto mt-8 mb-10">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/50 backdrop-blur-sm border-2 border-border rounded-xl p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--brand))]/10 flex items-center justify-center mx-auto mb-3">
                      <Eye className="h-6 w-6 text-[hsl(var(--brand))]" />
                    </div>
                    <p className="text-base font-semibold text-[hsl(var(--ink))] mb-2">Unclear Images</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Quality varies between batches</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm border-2 border-border rounded-xl p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--brand))]/10 flex items-center justify-center mx-auto mb-3">
                      <Wrench className="h-6 w-6 text-[hsl(var(--brand))]" />
                    </div>
                    <p className="text-base font-semibold text-[hsl(var(--ink))] mb-2">Missing Parts</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Hours spent troubleshooting</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm border-2 border-border rounded-xl p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--brand))]/10 flex items-center justify-center mx-auto mb-3">
                      <HelpCircle className="h-6 w-6 text-[hsl(var(--brand))]" />
                    </div>
                    <p className="text-base font-semibold text-[hsl(var(--ink))] mb-2">Hard-to-Reach Support</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Limited technical assistance</p>
                  </div>
                </div>
                <p className="text-lg text-center text-[hsl(var(--ink))] mt-8 leading-relaxed">
                  While AmScope&apos;s prices might look appealing, the &ldquo;savings&rdquo; often come with <span className="font-semibold text-[hsl(var(--brand))]">hidden costs and inconsistent quality</span>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/collections/microscopes" className={`${buttonStyles.primary} px-8 py-4 text-base`}>
                  Shop Reliable Microscopes
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/quiz" className={`${buttonStyles.outline} px-8 py-4 text-base`}>
                  Find Your Perfect Microscope
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10">
          {/* Solution Section */}
          <div className="py-12 md:py-16">
            <div className="max-w-5xl mx-auto text-center mb-10">
              <h2 className={`${textStyles.h2} mb-6`}>
                Modern Lab Equipment, Made Simple
              </h2>
              <p className="text-lg md:text-xl text-[hsl(var(--ink))] leading-relaxed mb-6">
                Lab Essentials makes it easier for labs to get dependable, high-quality equipment without unnecessary complexity or cost. Our products are built for reliability and ease of use—trusted by clinical labs, research facilities, and schools nationwide.
              </p>
              <p className="text-lg md:text-xl text-[hsl(var(--ink))] leading-relaxed">
                By choosing Lab Essentials (featuring trusted brands like <span className="font-semibold">LW Scientific</span>), you're choosing consistent performance and responsive U.S. support that keeps your lab running smoothly.
              </p>
            </div>

            {/* Trust Signals */}
            <div className="max-w-5xl mx-auto">
              <h3 className={`${textStyles.h3} mb-8 text-center`}>Confidence You Can Count On</h3>
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
                          <Icon className="h-7 w-7 text-white" aria-hidden="true" />
                        </div>
                      </div>
                      <h4 className={`${textStyles.h5} mb-2 text-[hsl(var(--ink))]`}>{signal.title}</h4>
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
                Quality You Can Trust vs. Quality You Have to Fix
              </h2>
              <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] mb-4 text-center max-w-4xl mx-auto leading-relaxed">
                Don&apos;t let misleading product terminology like &ldquo;simul-focal&rdquo; confuse your workflow. Lab Essentials offers equipment with professionally specified features like <span className="font-bold text-[hsl(var(--ink))]">Infinity Plan Optics</span> and <span className="font-bold text-[hsl(var(--ink))]">Quiet, Brushless Motors</span> built for efficiency and long-term use.
              </p>
              <p className="text-base text-[hsl(var(--muted-foreground))] mb-12 text-center max-w-3xl mx-auto">
                Below is an easy-to-scan comparison of key differentiating factors:
              </p>

              {/* Comparison Table - Desktop */}
              <div className="hidden lg:block overflow-hidden rounded-2xl border-2 border-border bg-white shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-[hsl(var(--brand))]/10 to-[hsl(var(--accent))]/5 border-b-2 border-border">
                        <th className="py-4 px-6 text-left w-1/4">
                          <span className={`${textStyles.h5} text-[hsl(var(--ink))]`}>Feature Category</span>
                        </th>
                        <th className="py-4 px-6 text-left w-5/12">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className={`${textStyles.h5} text-[hsl(var(--brand))]`}>Lab Essentials / LW Scientific</span>
                          </div>
                        </th>
                        <th className="py-4 px-6 text-left w-5/12">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <span className={`${textStyles.h5} text-[hsl(var(--muted-foreground))]`}>AmScope (Reported User Experience)</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <tr key={index} className="border-t border-border hover:bg-muted/20 transition-colors">
                            <td className="py-5 px-6 align-top">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand))]/10 flex items-center justify-center flex-shrink-0">
                                  <Icon className="h-5 w-5 text-[hsl(var(--brand))]" />
                                </div>
                                <span className="font-bold text-[hsl(var(--ink))]">{item.feature}</span>
                              </div>
                            </td>
                            <td className="py-5 px-6 align-top bg-green-50/50">
                              <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-[hsl(var(--ink))] font-medium">{item.labEssentials}</span>
                              </div>
                            </td>
                            <td className="py-5 px-6 align-top">
                              <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span className="text-[hsl(var(--muted-foreground))]">{item.amscope}</span>
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
                    <div key={index} className="border-2 border-border rounded-xl overflow-hidden bg-white shadow-card">
                      {/* Feature Header */}
                      <div className="bg-gradient-to-r from-[hsl(var(--brand))]/10 to-[hsl(var(--accent))]/5 p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--brand))]/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-[hsl(var(--brand))]" />
                          </div>
                          <h3 className="font-bold text-[hsl(var(--ink))]">{item.feature}</h3>
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

                      {/* AmScope */}
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1.5">
                              AmScope (Reported User Experience)
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
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              <h2 className={`${textStyles.h2} mb-4 text-center`}>
                Trusted by Clinical Professionals
              </h2>
              <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] mb-10 text-center leading-relaxed">
                We provide laboratory tools that deliver reliable performance for lab workflows requiring precision and durability. Our equipment is trusted by <span className="font-bold text-[hsl(var(--brand))]">over 1,200 labs worldwide</span>.
              </p>

              {/* Testimonial */}
              <div className="relative bg-gradient-to-r from-[hsl(var(--brand))]/10 to-[hsl(var(--accent))]/5 border-l-4 border-[hsl(var(--brand))] p-8 md:p-10 rounded-r-2xl shadow-card mb-10">
                <svg className="absolute top-4 left-4 h-10 w-10 text-[hsl(var(--brand))]/20" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <div className="relative z-10">
                  <p className="text-lg md:text-xl text-[hsl(var(--ink))] italic mb-6 leading-relaxed">
                    &ldquo;We started with a cheaper brand, but the focus drift and constant need to clean new optics destroyed our workflow efficiency. Upgrading to Lab Essentials equipment fixed that instantly. The Revelation III microscopes deliver the clarity we need for pathology, and knowing the U.S.-based support team is available if anything goes wrong makes all the difference. It&apos;s a genuine long-term investment.&rdquo;
                  </p>
                  <footer className="text-[hsl(var(--ink))] font-bold">
                    — Irma A., Clinical Lab Director, El Paso, TX
                  </footer>
                </div>
              </div>

              <div className="text-center">
                <Link href="/collections" className={`${buttonStyles.primary} px-8 py-4 text-base`}>
                  Stop Sacrificing Time: Shop Our Best-Selling Lab Tools
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
                    <h3 className={`${textStyles.h4} text-[hsl(var(--brand))]`}>Lab Essentials</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--ink))]"><span className="font-semibold">Quiet, brushless motors</span> for low maintenance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--ink))]"><span className="font-semibold">Digital controls</span> for precise adjustments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--ink))]"><span className="font-semibold">30-Year Anti-Fungal Lens Coating</span> for long-term clarity</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--ink))]"><span className="font-semibold">Infinity Plan Optics</span> with true magnification specs</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white border-2 border-border rounded-2xl p-8 shadow-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className={`${textStyles.h4} text-[hsl(var(--muted-foreground))]`}>AmScope</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--muted-foreground))]">Inconsistent motor quality across batches</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--muted-foreground))]">Basic controls with limited precision</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--muted-foreground))]">Optics may require frequent cleaning</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-base text-[hsl(var(--muted-foreground))]">&ldquo;Empty magnification&rdquo; marketing claims</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link href="/collections/centrifuges" className={`${buttonStyles.primary} px-8 py-4 text-base`}>
                  Explore Our High-Performance, USA-Engineered Centrifuges
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] rounded-2xl p-10 md:p-16 text-center max-w-5xl mx-auto shadow-2xl mb-16 mt-12 relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute top-4 right-4 opacity-10">
              <svg className="h-24 w-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>

            <h2 className={`${textStyles.h2} mb-5 text-white relative z-10`}>
              Secure Your Upgrade Today
            </h2>
            <p className="text-white/95 mb-8 text-lg md:text-xl max-w-3xl mx-auto relative z-10 leading-relaxed">
              Don&apos;t risk purchasing a product that functions as a &ldquo;crap shoot from batch to batch&rdquo;. Our commitment is to offer modern, reliable equipment backed by accessible U.S. support.
            </p>

            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 mb-10 max-w-2xl mx-auto relative z-10">
              <h3 className="text-xl font-bold text-white mb-4">We Guarantee Your Satisfaction:</h3>
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
    </>
  );
}
