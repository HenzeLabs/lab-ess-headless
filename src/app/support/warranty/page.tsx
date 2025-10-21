import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warranty Information | Lab Essentials',
  description:
    'Comprehensive warranty coverage for laboratory equipment. Standard 1-year warranty with extended options up to 5 years. Learn about our warranty policies and how to file claims.',
  alternates: {
    canonical: 'https://labessentials.com/support/warranty',
  },
  openGraph: {
    title: 'Warranty Information | Lab Essentials',
    description:
      'Comprehensive warranty coverage for laboratory equipment. Standard 1-year warranty with extended options up to 5 years.',
    url: 'https://labessentials.com/support/warranty',
    type: 'website',
  },
};

export default function WarrantyPage() {
  return (
    <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-heading lg:text-4xl mb-8">
          Warranty Information
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-body mb-6">
            Lab Essentials provides comprehensive warranty coverage for all our
            laboratory equipment and supplies.
          </p>

          <h2 className="text-2xl font-bold text-heading mt-8 mb-4">
            Standard Warranty Coverage
          </h2>
          <p className="text-body mb-4">
            All Lab Essentials products come with a standard 1-year warranty
            covering manufacturing defects and workmanship issues.
          </p>

          <h2 className="text-2xl font-bold text-heading mt-8 mb-4">
            Extended Warranty Options
          </h2>
          <p className="text-body mb-4">
            Extend your protection with our extended warranty plans, available
            for up to 5 years on select equipment.
          </p>

          <h2 className="text-2xl font-bold text-heading mt-8 mb-4">
            How to File a Warranty Claim
          </h2>
          <ol className="list-decimal list-inside text-body space-y-2 mb-6">
            <li>Contact our support team at support@labessentials.com</li>
            <li>Provide your order number and product details</li>
            <li>Include photos of the issue when possible</li>
            <li>Our team will guide you through the resolution process</li>
          </ol>

          <div className="bg-[hsl(var(--brand))]/5 border border-[hsl(var(--brand))]/20 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-[hsl(var(--ink))] mb-2">
              Need Help?
            </h3>
            <p className="text-[hsl(var(--foreground))] mb-4">
              Our customer support team is here to help with any warranty
              questions or claims.
            </p>
            <a
              href="/support/contact"
              className="inline-flex items-center px-4 py-2 bg-[hsl(var(--brand-dark))] text-white rounded-md hover:bg-[hsl(var(--brand-dark))] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
