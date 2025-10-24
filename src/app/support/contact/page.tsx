import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Lab Essentials',
  description:
    'Get in touch with Lab Essentials for support, sales inquiries, and technical assistance. Call 1-800-LAB-HELP or email support@labessentials.com. 24-hour response guarantee.',
  alternates: {
    canonical: 'https://labessentials.com/support/contact',
  },
  openGraph: {
    title: 'Contact Us | Lab Essentials',
    description:
      'Get in touch with Lab Essentials for support, sales inquiries, and technical assistance. 24-hour response guarantee.',
    url: 'https://labessentials.com/support/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <main className="bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))]/10 via-background to-[hsl(var(--accent))]/5 border-b border-border/50 py-16 md:py-20">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm md:text-base font-semibold text-[hsl(var(--brand))] uppercase tracking-wider mb-4">
              We&apos;re Here to Help
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[hsl(var(--ink))] mb-6">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-[hsl(var(--ink))] leading-relaxed">
              Get in touch with our expert team for support, questions, or inquiries about our laboratory equipment and supplies.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 py-16 md:py-20">

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-card rounded-2xl border-2 border-border/50 p-8 shadow-md hover:shadow-xl hover:border-[hsl(var(--brand))]/30 transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--brand))]/10">
                  <svg className="h-6 w-6 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[hsl(var(--ink))] pt-2">
                  Get in Touch
                </h2>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">
                    Email
                  </p>
                  <a
                    href="mailto:info@labessentials.com"
                    className="text-lg font-semibold text-[hsl(var(--brand))] hover:underline flex items-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@labessentials.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">
                    Hours
                  </p>
                  <p className="text-base text-[hsl(var(--ink))] flex items-center gap-2">
                    <svg className="h-5 w-5 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Monday - Friday: 9:00 AM - 5:00 PM EST
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-r from-[hsl(var(--brand))]/10 to-[hsl(var(--accent))]/10 border-2 border-[hsl(var(--brand))]/30 rounded-2xl p-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--brand))]">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[hsl(var(--ink))] mb-2">
                    Quick Response Guarantee
                  </h3>
                  <p className="text-base text-[hsl(var(--ink))]">
                    We respond to all inquiries within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
