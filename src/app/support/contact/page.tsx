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
    <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-heading lg:text-4xl mb-8">
          Contact Us
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))] mb-12 max-w-3xl">
          Get in touch with our expert team for support, questions, or inquiries
          about our laboratory equipment and supplies.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[hsl(var(--border))] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[hsl(var(--ink))] mb-4">
                Customer Support
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    Email
                  </p>
                  <a
                    href="mailto:support@labessentials.com"
                    className="text-[hsl(var(--brand))] hover:underline"
                  >
                    support@labessentials.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    Phone
                  </p>
                  <a
                    href="tel:1-800-522-4357"
                    className="text-[hsl(var(--brand))] hover:underline"
                  >
                    1-800-LAB-HELP (1-800-522-4357)
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    Hours
                  </p>
                  <p className="text-[hsl(var(--ink))]">
                    Monday - Friday: 8:00 AM - 6:00 PM EST
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[hsl(var(--border))] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[hsl(var(--ink))] mb-4">
                Sales Inquiries
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    Email
                  </p>
                  <a
                    href="mailto:sales@labessentials.com"
                    className="text-[hsl(var(--brand))] hover:underline"
                  >
                    sales@labessentials.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                    Phone
                  </p>
                  <a
                    href="tel:1-888-522-7253"
                    className="text-[hsl(var(--brand))] hover:underline"
                  >
                    1-888-LAB-SALE (1-888-522-7253)
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(var(--brand))]/5 border border-[hsl(var(--brand))]/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[hsl(var(--ink))] mb-2">
                Quick Response Guarantee
              </h3>
              <p className="text-[hsl(var(--muted-foreground))]">
                We respond to all inquiries within 24 hours during business
                days.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
