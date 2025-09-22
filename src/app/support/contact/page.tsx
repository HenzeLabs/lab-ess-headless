export default function ContactPage() {
  return (
    <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-heading lg:text-4xl mb-8">
          Contact Us
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-body mb-6">
            Get in touch with our expert team for support, questions, or
            inquiries about our laboratory equipment and supplies.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div>
              <h2 className="text-2xl font-bold text-heading mb-4">
                Customer Support
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-heading">Email</h3>
                  <p className="text-body">support@labessentials.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-heading">Phone</h3>
                  <p className="text-body">1-800-LAB-HELP (1-800-522-4357)</p>
                </div>
                <div>
                  <h3 className="font-semibold text-heading">Hours</h3>
                  <p className="text-body">
                    Monday - Friday: 8:00 AM - 6:00 PM EST
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-heading mb-4">
                Sales Inquiries
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-heading">Email</h3>
                  <p className="text-body">sales@labessentials.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-heading">Phone</h3>
                  <p className="text-body">1-888-LAB-SALE (1-888-522-7253)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-heading mb-2">
              Quick Response Guarantee
            </h3>
            <p className="text-body mb-4">
              We respond to all inquiries within 24 hours during business days.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
