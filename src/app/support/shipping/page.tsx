import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Information | Lab Essentials',
  description:
    'Fast, reliable shipping for laboratory equipment and supplies. Free shipping on orders over $300 and same-day shipping available on qualifying orders.',
  alternates: {
    canonical: 'https://labessentials.com/support/shipping',
  },
  openGraph: {
    title: 'Shipping Information | Lab Essentials',
    description:
      'Fast, reliable shipping for laboratory equipment and supplies. Free shipping on orders over $300.',
    url: 'https://labessentials.com/support/shipping',
    type: 'website',
  },
};

export default function ShippingPage() {
  return (
    <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-heading lg:text-4xl mb-8">
          Shipping Information
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-body mb-6">
            We offer fast, reliable shipping options to ensure your laboratory
            supplies arrive when you need them. All orders are processed within
            1-2 business days.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div>
              <h2 className="text-2xl font-bold text-heading mb-4">
                Shipping Options
              </h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-heading">
                    Standard Shipping
                  </h3>
                  <p className="text-body text-sm">
                    1-3 business days • Free on orders over $300
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-heading">
                    Same-Day Shipping
                  </h3>
                  <p className="text-body text-sm">
                    Available on eligible orders placed before 2 PM EST • Rates calculated at checkout
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-heading mb-4">
                Shipping Policies
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-heading">
                    Order Processing
                  </h3>
                  <p className="text-body text-sm">
                    Orders ship within 1-2 business days. Same-day shipping is available for qualifying orders placed before 2 PM EST.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-heading">
                    International Shipping
                  </h3>
                  <p className="text-body text-sm">
                    Available to most countries • Rates calculated at checkout
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-heading">Tracking</h3>
                  <p className="text-body text-sm">
                    Tracking information provided via email
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--brand))]/5 border border-[hsl(var(--brand))]/20 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-[hsl(var(--ink))] mb-2">
              Need Rush Delivery?
            </h3>
            <p className="text-[hsl(var(--foreground))] mb-4">
              For urgent orders, contact our sales team for expedited processing
              options.
            </p>
            <a
              href="/support/contact"
              className="inline-flex items-center px-4 py-2 bg-[hsl(var(--brand-dark))] text-white rounded-md hover:bg-[hsl(var(--brand-dark))] transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
