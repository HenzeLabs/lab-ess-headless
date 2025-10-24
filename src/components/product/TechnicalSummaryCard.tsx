'use client';
import React from 'react';
import { FileText } from 'lucide-react';

type Metafield = {
  namespace: string;
  key: string;
  value: string;
  type: string;
};

type TechnicalSummaryCardProps = {
  productTitle: string;
  metafields?: Metafield[];
};

export default function TechnicalSummaryCard({
  productTitle: _productTitle,
  metafields = [],
}: TechnicalSummaryCardProps) {
  // Helper to get metafield value
  const getMetafield = (key: string): string | null => {
    if (!metafields || !Array.isArray(metafields)) return null;
    const field = metafields.find(
      (m) => m && m.key === key && m.namespace === 'custom',
    );
    return field?.value ?? null;
  };

  const manualUrl = getMetafield('manual_url');
  const quickStartUrl = getMetafield('quick_start_url');

  // Only render if we have at least one URL
  const hasAnyDownload = manualUrl || quickStartUrl;

  if (!hasAnyDownload) {
    // Don't render anything if no downloads are available
    return null;
  }

  return (
    <>
      {manualUrl && (
        <React.Fragment key="manual-wrapper">
          <a
            href={manualUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 min-w-[200px] items-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3 text-left text-sm font-semibold shadow-sm transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-md"
          >
            <FileText
              className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
              aria-hidden="true"
            />
            <span className="flex-1 text-[hsl(var(--ink))]">View Manual</span>
            <svg
              className="h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </React.Fragment>
      )}
      {quickStartUrl && (
        <React.Fragment key="quickstart-wrapper">
          <a
            href={quickStartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 min-w-[200px] items-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3 text-left text-sm font-semibold shadow-sm transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-md"
          >
            <FileText
              className="h-5 w-5 flex-shrink-0 text-[hsl(var(--brand))]"
              aria-hidden="true"
            />
            <span className="flex-1 text-[hsl(var(--ink))]">Quick Start Guide</span>
            <svg
              className="h-5 w-5 flex-shrink-0 text-[hsl(var(--muted-foreground))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </React.Fragment>
      )}
    </>
  );
}
