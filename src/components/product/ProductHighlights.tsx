import { Zap, Shield, Award } from 'lucide-react';

type Highlight = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

export default function ProductHighlights() {
  const highlights: Highlight[] = [
    {
      icon: Zap,
      title: 'Professional Grade',
      description:
        'Precision-engineered equipment designed for demanding laboratory environments',
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description:
        'Premium construction backed by comprehensive warranty and expert support',
    },
    {
      icon: Award,
      title: 'Lab Certified',
      description:
        'Meets rigorous industry standards for accuracy and reliability',
    },
  ];

  return (
    <div className="border-y border-border bg-muted/20 py-8 md:py-12">
      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {highlights.map((highlight, index) => {
          const Icon = highlight.icon;
          return (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--brand))]/10 ring-1 ring-[hsl(var(--brand))]/20">
                <Icon
                  className="h-6 w-6 text-[hsl(var(--brand))]"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[hsl(var(--ink))]">
                {highlight.title}
              </h3>
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {highlight.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
