export default function ReturnsPage() {
  return (
    <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-heading lg:text-4xl mb-8">
          Return Policy
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-body mb-6">
            We want you to be completely satisfied with your Lab Essentials
            purchase. Our return policy is designed to make returns as simple as
            possible.
          </p>

          <h2 className="text-2xl font-bold text-heading mt-8 mb-4">
            30-Day Return Window
          </h2>
          <p className="text-body mb-4">
            You have 30 days from the date of delivery to return most items for
            a full refund. Items must be in their original condition and
            packaging.
          </p>

          <h2 className="text-2xl font-bold text-heading mt-8 mb-4">
            What Can Be Returned
          </h2>
          <ul className="list-disc list-inside text-body space-y-2 mb-6">
            <li>Consumable supplies (unopened and in original packaging)</li>
            <li>Small laboratory equipment and instruments</li>
            <li>Accessories and replacement parts</li>
            <li>Most glassware and plasticware</li>
          </ul>

          <h2 className="text-2xl font-bold text-heading mt-8 mb-4">
            Return Process
          </h2>
          <ol className="list-decimal list-inside text-body space-y-2 mb-6">
            <li>Contact our returns team at returns@labessentials.com</li>
            <li>Receive a return authorization number</li>
            <li>Package the item securely in its original packaging</li>
            <li>Ship the item to the address provided</li>
            <li>Receive refund once item is inspected</li>
          </ol>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Special Considerations
            </h3>
            <p className="text-yellow-800 mb-4">
              Large laboratory equipment and custom orders may have different
              return policies. Please contact us before attempting to return
              these items.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
