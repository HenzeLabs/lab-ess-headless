'use client';
import { FileText } from 'lucide-react';

type TechnicalSummaryCardProps = {
  productTitle: string;
};

export default function TechnicalSummaryCard({
  productTitle: _productTitle,
}: TechnicalSummaryCardProps) {
  return (
    <div className="sticky top-24 hidden lg:block">
      <div className="space-y-6 rounded-2xl border-2 border-border bg-background p-6 shadow-md">
        <div className="border-b border-border/50 pb-4">
          <h3 className="text-lg font-bold text-[hsl(var(--ink))]">
            Technical Summary
          </h3>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Quick reference specifications
          </p>
        </div>

        {/* Key Specifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Voltage
            </span>
            <span className="text-sm font-bold text-[hsl(var(--ink))]">
              110-240V AC
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Speed Range
            </span>
            <span className="text-sm font-bold text-[hsl(var(--ink))]">
              100-6,000 RPM
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Capacity
            </span>
            <span className="text-sm font-bold text-[hsl(var(--ink))]">
              6 × 1.5/2.0 mL
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Dimensions
            </span>
            <span className="text-sm font-bold text-[hsl(var(--ink))]">
              18 × 15 × 12 cm
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Weight
            </span>
            <span className="text-sm font-bold text-[hsl(var(--ink))]">
              2.5 kg
            </span>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="space-y-3 border-t border-border/50 pt-6">
          <a
            href="#"
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-border bg-background px-4 py-3 text-sm font-semibold text-[hsl(var(--ink))] shadow-sm transition-all hover:border-[hsl(var(--brand))]/50 hover:bg-muted/30"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Replace with actual PDF download link
              console.log('View manual');
            }}
          >
            <FileText
              className="h-5 w-5 text-[hsl(var(--brand))]"
              aria-hidden="true"
            />
            <span>View Manual</span>
          </a>
        </div>

        {/* Warranty Badge */}
        <div className="rounded-xl border-2 border-[hsl(var(--brand))]/20 bg-gradient-to-br from-[hsl(var(--brand))]/5 to-[hsl(var(--brand))]/10 p-5 text-center">
          <div className="mb-2 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--brand))]/20">
              <svg
                className="h-5 w-5 text-[hsl(var(--brand))]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm font-bold text-[hsl(var(--ink))]">
            1-Year Warranty
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            With free technical support
          </p>
        </div>
      </div>
    </div>
  );
}
