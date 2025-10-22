import { FileText, Star, Gauge, Beaker, Download } from 'lucide-react';

type ProductAccordionsProps = {
  productTitle: string;
  descriptionHtml?: string;
};

export default function ProductAccordions({
  productTitle,
  descriptionHtml,
}: ProductAccordionsProps) {
  return (
    <div className="space-y-4">
      {/* Overview */}
      <details className="group border-b border-border pb-4">
        <summary className="flex cursor-pointer items-center gap-3 text-lg font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--brand))] transition-colors list-none">
          <FileText
            className="h-5 w-5 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span>Overview</span>
          <svg
            className="ml-auto h-5 w-5 transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div className="mt-4 prose prose-sm max-w-none text-[hsl(var(--muted-foreground))]">
          {descriptionHtml ? (
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          ) : (
            <p>
              The {productTitle} is designed for laboratory professionals who
              demand precision, reliability, and performance. Engineered with
              cutting-edge technology, this product delivers consistent results
              for critical research and diagnostic applications.
            </p>
          )}
        </div>
      </details>

      {/* Key Features */}
      <details className="group border-b border-border pb-4">
        <summary className="flex cursor-pointer items-center gap-3 text-lg font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--brand))] transition-colors list-none">
          <Star
            className="h-5 w-5 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span>Key Features</span>
          <svg
            className="ml-auto h-5 w-5 transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div className="mt-4 space-y-3">
          <ul className="list-disc list-inside space-y-2 text-[hsl(var(--muted-foreground))]">
            <li>
              High-precision performance for accurate, reproducible results
            </li>
            <li>
              Compact, space-saving design perfect for any laboratory
              environment
            </li>
            <li>
              Intuitive controls for easy operation and minimal training time
            </li>
            <li>
              Durable construction with premium materials for long-term
              reliability
            </li>
            <li>Energy-efficient operation to reduce operating costs</li>
            <li>
              Safety features including automatic shut-off and error detection
            </li>
          </ul>
        </div>
      </details>

      {/* Technical Specifications */}
      <details className="group border-b border-border pb-4">
        <summary className="flex cursor-pointer items-center gap-3 text-lg font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--brand))] transition-colors list-none">
          <Gauge
            className="h-5 w-5 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span>Technical Specifications</span>
          <svg
            className="ml-auto h-5 w-5 transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div className="mt-4">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 text-[hsl(var(--muted-foreground))]">
                  Voltage
                </td>
                <td className="py-2 text-right text-[hsl(var(--ink))] font-medium">
                  110-240V AC, 50/60Hz
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[hsl(var(--muted-foreground))]">
                  Speed Range
                </td>
                <td className="py-2 text-right text-[hsl(var(--ink))] font-medium">
                  100-6,000 RPM
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[hsl(var(--muted-foreground))]">
                  Capacity
                </td>
                <td className="py-2 text-right text-[hsl(var(--ink))] font-medium">
                  6 x 1.5/2.0 mL tubes
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[hsl(var(--muted-foreground))]">
                  Dimensions (L×W×H)
                </td>
                <td className="py-2 text-right text-[hsl(var(--ink))] font-medium">
                  18 × 15 × 12 cm
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[hsl(var(--muted-foreground))]">
                  Weight
                </td>
                <td className="py-2 text-right text-[hsl(var(--ink))] font-medium">
                  2.5 kg
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[hsl(var(--muted-foreground))]">
                  Timer Range
                </td>
                <td className="py-2 text-right text-[hsl(var(--ink))] font-medium">
                  0-99 minutes
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[hsl(var(--muted-foreground))]">
                  Noise Level
                </td>
                <td className="py-2 text-right text-[hsl(var(--ink))] font-medium">
                  &lt;55 dB
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>

      {/* Applications */}
      <details className="group border-b border-border pb-4">
        <summary className="flex cursor-pointer items-center gap-3 text-lg font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--brand))] transition-colors list-none">
          <Beaker
            className="h-5 w-5 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span>Applications</span>
          <svg
            className="ml-auto h-5 w-5 transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div className="mt-4 space-y-3">
          <ul className="list-disc list-inside space-y-2 text-[hsl(var(--muted-foreground))]">
            <li>DNA/RNA extraction and purification</li>
            <li>Cell culture and sample preparation</li>
            <li>Blood sample processing and serum separation</li>
            <li>Microbiological testing and culture work</li>
            <li>Clinical diagnostics and medical research</li>
            <li>Quality control and analytical testing</li>
            <li>Pharmaceutical research and development</li>
            <li>Educational and training laboratories</li>
          </ul>
        </div>
      </details>

      {/* Manuals & Resources */}
      <details className="group border-b border-border pb-4">
        <summary className="flex cursor-pointer items-center gap-3 text-lg font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--brand))] transition-colors list-none">
          <Download
            className="h-5 w-5 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span>Manuals &amp; Resources</span>
          <svg
            className="ml-auto h-5 w-5 transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            <a
              href="#"
              className="flex items-center gap-2 text-[hsl(var(--brand))] hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Replace with actual PDF download link
                console.log('Download user manual');
              }}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>User Manual (PDF, 2.3 MB)</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-[hsl(var(--brand))] hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Replace with actual PDF download link
                console.log('Download technical specifications');
              }}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Technical Specifications (PDF, 850 KB)</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-[hsl(var(--brand))] hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Replace with actual PDF download link
                console.log('Download quick start guide');
              }}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Quick Start Guide (PDF, 450 KB)</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-[hsl(var(--brand))] hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Replace with actual PDF download link
                console.log('Download warranty information');
              }}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Warranty Information (PDF, 320 KB)</span>
            </a>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] pt-2">
            Need additional support? Contact our{' '}
            <a
              href="/support/contact"
              className="text-[hsl(var(--brand))] hover:underline"
            >
              technical support team
            </a>{' '}
            for assistance.
          </p>
        </div>
      </details>
    </div>
  );
}
