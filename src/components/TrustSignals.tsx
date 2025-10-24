import {
  ShieldCheckIcon,
  ClockIcon,
  TruckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';


const signals = [
  {
    icon: ShieldCheckIcon,
    title: 'Quality Guaranteed',
    description:
      '1-year warranty on all lab equipment for your peace of mind.',
  },
  {
    icon: ClockIcon,
    title: 'Expert Support',
    description: 'Our team is ready to help with your equipment needs.',
  },
  {
    icon: TruckIcon,
    title: 'Free Shipping',
    description: 'Free delivery on orders over $300 to keep costs down.',
  },
  {
    icon: SparklesIcon,
    title: 'Trusted by Professionals',
    description: 'Used by leading labs, clinics, and universities nationwide.',
  },
];

export default function TrustSignals() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))] via-white to-[hsl(var(--muted))] rounded-2xl border-2 border-border/50 shadow-lg p-8 md:p-10">
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)', backgroundSize: '30px 30px' }}
      />

      <div className="relative z-10">
        <div className="max-w-2xl space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))]/10 px-4 py-1.5 border border-[hsl(var(--brand))]/20">
            <svg className="w-4 h-4 text-[hsl(var(--brand))]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--brand))]">
              Why Choose Us
            </span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--ink))] mb-2">
              Quality you can trust
            </h2>
            <p className="text-base text-[hsl(var(--body))]">
              We're committed to providing the best lab equipment and service experience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div
                key={signal.title}
                className="group bg-white rounded-xl border-2 border-border/50 p-5 hover:border-[hsl(var(--brand))]/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[hsl(var(--ink))] mb-1">
                      {signal.title}
                    </h3>
                    <p className="text-sm text-[hsl(var(--body))] leading-relaxed">
                      {signal.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
