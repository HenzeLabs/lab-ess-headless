export default function FAQPage() {
  return (
    <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-heading lg:text-4xl mb-8">
          Frequently Asked Questions
        </h1>
        <div className="prose prose-lg max-w-none">
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-heading mb-3">
                How do I place an order?
              </h2>
              <p className="text-body">
                You can place an order by browsing our products, adding items to
                your cart, and proceeding to checkout. We accept all major
                credit cards and offer various payment options.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-heading mb-3">
                What are your shipping options?
              </h2>
              <p className="text-body">
                We offer standard shipping (5-7 business days), expedited
                shipping (2-3 business days), and overnight shipping for urgent
                orders. Shipping costs vary based on order size and destination.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-heading mb-3">
                Do you offer returns?
              </h2>
              <p className="text-body">
                Yes, we offer a 30-day return policy on most items. Items must
                be in original condition and packaging. Some laboratory
                equipment may have special return conditions.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-heading mb-3">
                How do I track my order?
              </h2>
              <p className="text-body">
                Once your order ships, you&apos;ll receive a tracking number via
                email. You can also track your order status by logging into your
                account on our website.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-heading mb-3">
                Do you provide technical support?
              </h2>
              <p className="text-body">
                Yes, our technical support team is available to help with
                product setup, troubleshooting, and usage questions. Contact us
                at support@labessentials.com or call 1-800-LAB-HELP.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-blue-800 mb-4">
              Can&apos;t find the answer you&apos;re looking for? Our support
              team is here to help.
            </p>
            <a
              href="/support/contact"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
