'use client';
import { FileText, Star, Gauge, Beaker } from 'lucide-react';

type Metafield = {
  namespace: string;
  key: string;
  value: string;
  type: string;
};

type ProductAccordionsProps = {
  productTitle: string;
  descriptionHtml?: string;
  metafields?: Metafield[];
};

export default function ProductAccordions({
  productTitle,
  descriptionHtml,
  metafields = [],
}: ProductAccordionsProps) {
  // Helper to get metafield value
  const getMetafield = (key: string): string | null => {
    if (!metafields || !Array.isArray(metafields)) return null;
    const field = metafields.find(
      (m) => m && m.key === key && m.namespace === 'custom',
    );
    return field?.value ?? null;
  };

  // Helper to parse list metafields (JSON array of strings)
  const getListMetafield = (key: string): string[] => {
    const value = getMetafield(key);
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const features = getListMetafield('features');
  const applications = getListMetafield('applications');
  const specs = getListMetafield('specs');
  const faq = getMetafield('faq');

  // Default fallback data
  const defaultFeatures = [
    'High-precision performance for accurate, reproducible results',
    'Compact, space-saving design perfect for any laboratory environment',
    'Intuitive controls for easy operation and minimal training time',
    'Durable construction with premium materials for long-term reliability',
    'Energy-efficient operation to reduce operating costs',
    'Safety features including automatic shut-off and error detection',
  ];

  const defaultApplications = [
    'DNA/RNA extraction and purification',
    'Cell culture and sample preparation',
    'Blood sample processing and serum separation',
    'Microbiological testing and culture work',
    'Clinical diagnostics and medical research',
    'Quality control and analytical testing',
    'Pharmaceutical research and development',
    'Educational and training laboratories',
  ];

  const defaultSpecs = [
    'Voltage: 110-240V AC, 50/60Hz',
    'Speed Range: 100-6,000 RPM',
    'Capacity: 6 x 1.5/2.0 mL tubes',
    'Dimensions (L×W×H): 18 × 15 × 12 cm',
    'Weight: 2.5 kg',
    'Timer Range: 0-99 minutes',
    'Noise Level: <55 dB',
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;
  const displayApplications =
    applications.length > 0 ? applications : defaultApplications;
  const displaySpecs = specs.length > 0 ? specs : defaultSpecs;

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
            {displayFeatures.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
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
          <ul className="list-inside list-disc space-y-3 text-[hsl(var(--muted-foreground))]">
            {displaySpecs.map((spec, index) => (
              <li key={index}>{spec}</li>
            ))}
          </ul>
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
            {displayApplications.map((application, index) => (
              <li key={index}>{application}</li>
            ))}
          </ul>
        </div>
      </details>

      {/* FAQ - Only show if metafield exists */}
      {faq && (
        <details className="group overflow-hidden rounded-xl border-2 border-border bg-background shadow-sm transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-md">
          <summary className="flex cursor-pointer items-center gap-3 px-6 py-5 text-lg font-semibold text-[hsl(var(--ink))] transition-colors hover:bg-muted/30 list-none">
            <FileText
              className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
              aria-hidden="true"
            />
            <span className="flex-1">FAQ</span>
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
            <div style={{ whiteSpace: 'pre-wrap' }}>{faq}</div>
          </div>
        </details>
      )}
    </div>
  );
}
