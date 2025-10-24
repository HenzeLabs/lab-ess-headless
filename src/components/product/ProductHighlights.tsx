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
      title: 'Built for Real Labs',
      description:
        'Durable, precision-tested instruments designed for classrooms, clinics, and research environments.',
    },
    {
      icon: Shield,
      title: 'Reliable by Design',
      description:
        'Every product is backed by thorough quality checks, a solid warranty, and expert U.S. support.',
    },
    {
      icon: Award,
      title: 'Trusted Performance',
      description:
        'Meets essential lab standards for accuracy and consistency—without the premium price tag.',
    },
  ];

  return (
    <div className="border-y border-border bg-muted/20 py-12 md:py-16 px-6">
      <div className="grid gap-8 md:grid-cols-3 md:gap-10">
        {highlights.map((highlight, index) => {
          const Icon = highlight.icon;
          return (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--brand))]/10 ring-1 ring-[hsl(var(--brand))]/20">
                <Icon
                  className="h-6 w-6 text-[hsl(var(--brand))]"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mb-3 text-base font-semibold text-[hsl(var(--ink))]">
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
