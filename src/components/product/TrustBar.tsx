import { Shield, Truck, MapPin } from 'lucide-react';

export default function TrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-[hsl(var(--muted-foreground))] border-t border-border/50 pt-4 mt-4">
      <div className="flex items-center gap-2">
        <Shield
          className="h-4 w-4 text-[hsl(var(--brand))]"
          aria-hidden="true"
        />
        <span>1-Year Warranty</span>
      </div>
      <span className="text-border" aria-hidden="true">
        ·
      </span>
      <div className="flex items-center gap-2">
        <Truck
          className="h-4 w-4 text-[hsl(var(--brand))]"
          aria-hidden="true"
        />
        <span>Free Shipping over $300</span>
      </div>
      <span className="text-border" aria-hidden="true">
        ·
      </span>
      <div className="flex items-center gap-2">
        <MapPin
          className="h-4 w-4 text-[hsl(var(--brand))]"
          aria-hidden="true"
        />
        <span>U.S. Support</span>
      </div>
    </div>
  );
}
