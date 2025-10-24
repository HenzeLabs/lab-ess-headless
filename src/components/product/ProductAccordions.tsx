'use client';
import { useState } from 'react';
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
  manualButtons?: React.ReactNode;
};

type TabId = 'overview' | 'features' | 'specs' | 'applications' | null;

export default function ProductAccordions({
  productTitle,
  descriptionHtml,
  metafields = [],
  manualButtons,
}: ProductAccordionsProps) {
  const [activeTab, setActiveTab] = useState<TabId>(null);
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

  const toggleTab = (tabId: TabId) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  return (
    <div className="space-y-4">
      {/* Tabs Row - stays at top, includes manual buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Overview Tab */}
        <button
          key="overview-tab"
          type="button"
          onClick={() => toggleTab('overview')}
          className={`flex flex-1 min-w-[200px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${
            activeTab === 'overview'
              ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]/5 shadow-md'
              : 'border-border bg-background shadow-sm hover:border-[hsl(var(--brand))]/30 hover:shadow-md'
          }`}
        >
          <FileText
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span className="flex-1 text-[hsl(var(--ink))]">Overview</span>
          <svg
            className={`h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${
              activeTab === 'overview' ? 'rotate-180' : ''
            }`}
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
        </button>

        {/* Features Tab */}
        <button
          key="features-tab"
          type="button"
          onClick={() => toggleTab('features')}
          className={`flex flex-1 min-w-[200px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${
            activeTab === 'features'
              ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]/5 shadow-md'
              : 'border-border bg-background shadow-sm hover:border-[hsl(var(--brand))]/30 hover:shadow-md'
          }`}
        >
          <Star
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span className="flex-1 text-[hsl(var(--ink))]">Features</span>
          <svg
            className={`h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${
              activeTab === 'features' ? 'rotate-180' : ''
            }`}
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
        </button>

        {/* Specifications Tab */}
        <button
          key="specs-tab"
          type="button"
          onClick={() => toggleTab('specs')}
          className={`flex flex-1 min-w-[200px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${
            activeTab === 'specs'
              ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]/5 shadow-md'
              : 'border-border bg-background shadow-sm hover:border-[hsl(var(--brand))]/30 hover:shadow-md'
          }`}
        >
          <Gauge
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span className="flex-1 text-[hsl(var(--ink))]">Specifications</span>
          <svg
            className={`h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${
              activeTab === 'specs' ? 'rotate-180' : ''
            }`}
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
        </button>

        {/* Applications Tab */}
        <button
          key="applications-tab"
          type="button"
          onClick={() => toggleTab('applications')}
          className={`flex flex-1 min-w-[200px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${
            activeTab === 'applications'
              ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]/5 shadow-md'
              : 'border-border bg-background shadow-sm hover:border-[hsl(var(--brand))]/30 hover:shadow-md'
          }`}
        >
          <Beaker
            className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
          <span className="flex-1 text-[hsl(var(--ink))]">Applications</span>
          <svg
            className={`h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${
              activeTab === 'applications' ? 'rotate-180' : ''
            }`}
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
        </button>

        {/* Manual Buttons - rendered inline with tabs */}
        {manualButtons && <div key="manual-buttons">{manualButtons}</div>}
      </div>

      {/* Content Area - appears below tabs */}
      {activeTab && (
        <div className="overflow-hidden rounded-xl border-2 border-[hsl(var(--brand))]/50 bg-background shadow-lg">
          {activeTab === 'overview' && (
            <div className="prose prose-sm max-w-none bg-muted/10 px-6 py-5 text-[hsl(var(--muted-foreground))]">
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
          )}

          {activeTab === 'features' && (
            <div className="prose prose-sm max-w-none bg-muted/10 px-6 py-5 text-[hsl(var(--muted-foreground))]">
              <ul className="space-y-2">
                {displayFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="prose prose-sm max-w-none bg-muted/10 px-6 py-5 text-[hsl(var(--muted-foreground))]">
              <ul className="space-y-2">
                {displaySpecs.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="prose prose-sm max-w-none bg-muted/10 px-6 py-5 text-[hsl(var(--muted-foreground))]">
              <ul className="space-y-2">
                {displayApplications.map((application, index) => (
                  <li key={index}>{application}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
