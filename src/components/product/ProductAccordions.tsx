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
    <div className="space-y-3">
      {/* Overview */}
      <details className="group overflow-hidden rounded-xl border-2 border-border bg-background shadow-sm transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-md">
        <summary className="flex cursor-pointer items-center gap-3 px-6 py-5 text-lg font-semibold text-[hsl(var(--ink))] transition-colors hover:bg-muted/30 list-none">
          <FileText
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span className="flex-1">Overview</span>
          <svg
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180"
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
        <div className="prose prose-sm max-w-none border-t border-border/50 bg-muted/10 px-6 py-5 text-[hsl(var(--muted-foreground))]">
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
      <details className="group overflow-hidden rounded-xl border-2 border-border bg-background shadow-sm transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-md">
        <summary className="flex cursor-pointer items-center gap-3 px-6 py-5 text-lg font-semibold text-[hsl(var(--ink))] transition-colors hover:bg-muted/30 list-none">
          <Star
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span className="flex-1">Key Features</span>
          <svg
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180"
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
        <div className="border-t border-border/50 bg-muted/10 px-6 py-5">
          <ul className="list-inside list-disc space-y-3 text-[hsl(var(--muted-foreground))]">
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
      <details className="group overflow-hidden rounded-xl border-2 border-border bg-background shadow-sm transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-md">
        <summary className="flex cursor-pointer items-center gap-3 px-6 py-5 text-lg font-semibold text-[hsl(var(--ink))] transition-colors hover:bg-muted/30 list-none">
          <Gauge
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span className="flex-1">Technical Specifications</span>
          <svg
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180"
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
        <div className="border-t border-border/50 bg-muted/10 px-6 py-5">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/50">
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
      <details className="group overflow-hidden rounded-xl border-2 border-border bg-background shadow-sm transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-md">
        <summary className="flex cursor-pointer items-center gap-3 px-6 py-5 text-lg font-semibold text-[hsl(var(--ink))] transition-colors hover:bg-muted/30 list-none">
          <Beaker
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span className="flex-1">Applications</span>
          <svg
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180"
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
        <div className="border-t border-border/50 bg-muted/10 px-6 py-5">
          <ul className="list-inside list-disc space-y-3 text-[hsl(var(--muted-foreground))]">
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
      <details className="group overflow-hidden rounded-xl border-2 border-border bg-background shadow-sm transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-md">
        <summary className="flex cursor-pointer items-center gap-3 px-6 py-5 text-lg font-semibold text-[hsl(var(--ink))] transition-colors hover:bg-muted/30 list-none">
          <Download
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span className="flex-1">Manuals &amp; Resources</span>
          <svg
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180"
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
        <div className="border-t border-border/50 bg-muted/10 px-6 py-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-background px-4 py-3 text-sm font-medium text-[hsl(var(--ink))] transition-all hover:border-[hsl(var(--brand))]/50 hover:bg-muted/30"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Replace with actual PDF download link
                console.log('Download user manual');
              }}
            >
              <Download
                className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">User Manual</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  PDF, 2.3 MB
                </span>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-background px-4 py-3 text-sm font-medium text-[hsl(var(--ink))] transition-all hover:border-[hsl(var(--brand))]/50 hover:bg-muted/30"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Replace with actual PDF download link
                console.log('Download technical specifications');
              }}
            >
              <Download
                className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Tech Specs</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  PDF, 850 KB
                </span>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-background px-4 py-3 text-sm font-medium text-[hsl(var(--ink))] transition-all hover:border-[hsl(var(--brand))]/50 hover:bg-muted/30"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Replace with actual PDF download link
                console.log('Download quick start guide');
              }}
            >
              <Download
                className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Quick Start</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  PDF, 450 KB
                </span>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-background px-4 py-3 text-sm font-medium text-[hsl(var(--ink))] transition-all hover:border-[hsl(var(--brand))]/50 hover:bg-muted/30"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Replace with actual PDF download link
                console.log('Download warranty information');
              }}
            >
              <Download
                className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Warranty Info</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  PDF, 320 KB
                </span>
              </div>
            </a>
          </div>
          <p className="rounded-lg border border-border/50 bg-background/50 px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
            Need additional support? Contact our{' '}
            <a
              href="/support/contact"
              className="font-semibold text-[hsl(var(--brand))] hover:underline"
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
