import { Download, FileText } from 'lucide-react';

type TechnicalSummaryCardProps = {
  productTitle: string;
};

export default function TechnicalSummaryCard({
  productTitle: _productTitle,
}: TechnicalSummaryCardProps) {
  return (
    <div className="hidden lg:block sticky top-24">
      <div className="rounded-2xl border border-border bg-background p-6 space-y-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[hsl(var(--ink))]">
          Technical Summary
        </h3>

        {/* Key Specifications */}
        <div className="space-y-3">
          <div className="flex justify-between items-start text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">Voltage</span>
            <span className="text-[hsl(var(--ink))] font-medium text-right">
              110-240V AC
            </span>
          </div>
          <div className="flex justify-between items-start text-sm border-t border-border/50 pt-3">
            <span className="text-[hsl(var(--muted-foreground))]">
              Speed Range
            </span>
            <span className="text-[hsl(var(--ink))] font-medium text-right">
              100-6,000 RPM
            </span>
          </div>
          <div className="flex justify-between items-start text-sm border-t border-border/50 pt-3">
            <span className="text-[hsl(var(--muted-foreground))]">
              Capacity
            </span>
            <span className="text-[hsl(var(--ink))] font-medium text-right">
              6 × 1.5/2.0 mL
            </span>
          </div>
          <div className="flex justify-between items-start text-sm border-t border-border/50 pt-3">
            <span className="text-[hsl(var(--muted-foreground))]">
              Dimensions
            </span>
            <span className="text-[hsl(var(--ink))] font-medium text-right">
              18 × 15 × 12 cm
            </span>
          </div>
          <div className="flex justify-between items-start text-sm border-t border-border/50 pt-3">
            <span className="text-[hsl(var(--muted-foreground))]">Weight</span>
            <span className="text-[hsl(var(--ink))] font-medium text-right">
              2.5 kg
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Download Buttons */}
        <div className="space-y-3">
          <a
            href="#"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-[hsl(var(--muted))]/20 transition-colors text-sm font-medium text-[hsl(var(--ink))]"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Replace with actual PDF download link
              console.log('Download specs PDF');
            }}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Download Specs PDF</span>
          </a>
          <a
            href="#"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-[hsl(var(--muted))]/20 transition-colors text-sm font-medium text-[hsl(var(--ink))]"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Replace with actual PDF download link
              console.log('View manual');
            }}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>View Manual</span>
          </a>
        </div>

        {/* Warranty Badge */}
        <div className="bg-[hsl(var(--muted))]/30 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-[hsl(var(--ink))]">
            1-Year Warranty Included
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Free technical support
          </p>
        </div>
      </div>
    </div>
  );
}
