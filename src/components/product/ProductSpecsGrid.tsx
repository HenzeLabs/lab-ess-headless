type Spec = {
  label: string;
  value: string;
};

type ProductSpecsGridProps = {
  specs?: Spec[];
};

export default function ProductSpecsGrid({ specs }: ProductSpecsGridProps) {
  // Default specs if none provided
  const defaultSpecs: Spec[] = [
    { label: 'Voltage', value: '110-240V AC, 50/60Hz' },
    { label: 'Speed Range', value: '100-6,000 RPM' },
    { label: 'Capacity', value: '6 × 1.5/2.0 mL tubes' },
    { label: 'Dimensions', value: '18 × 15 × 12 cm' },
    { label: 'Weight', value: '2.5 kg' },
    { label: 'Timer Range', value: '0-99 minutes' },
    { label: 'Noise Level', value: '<55 dB' },
    { label: 'Certifications', value: 'CE, RoHS, ISO 9001' },
  ];

  const displaySpecs = specs ?? defaultSpecs;

  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold text-[hsl(var(--ink))]">
        Quick Specifications
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {displaySpecs.map((spec, index) => (
          <div
            key={index}
            className="flex flex-col gap-1 rounded-lg border border-border/50 bg-muted/20 p-4"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              {spec.label}
            </dt>
            <dd className="text-sm font-semibold text-[hsl(var(--ink))]">
              {spec.value}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}
