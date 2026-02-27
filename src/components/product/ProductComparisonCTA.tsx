import { ArrowRight, Scale } from 'lucide-react';
import { buttonStyles } from '@/lib/ui';

export default function ProductComparisonCTA() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--brand))]/30 bg-gradient-to-br from-[hsl(var(--brand))]/5 to-[hsl(var(--brand))]/10 p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--brand))]/20 ring-2 ring-[hsl(var(--brand))]/30">
          <Scale
            className="h-7 w-7 text-[hsl(var(--brand))]"
            aria-hidden="true"
          />
        </div>
        <h3 className="mb-3 text-xl font-bold text-[hsl(var(--ink))]">
          Compare Products
        </h3>
        <p className="mb-6 max-w-md text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          Not sure if this is the right fit? Review key specifications, standout
          features, and ideal workflows for our highlighted microscopes and
          centrifuges before you decide.
        </p>
        <a
          href="/compare"
          className={`${buttonStyles.primary} group`}
          aria-label="Compare featured lab equipment"
        >
          Compare Featured Equipment
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  );
}
