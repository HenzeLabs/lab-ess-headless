import { layout, textStyles } from '@/lib/ui';

const TESTIMONIALS = [
  {
    name: 'Dr. Priya Anand',
    title: 'Director of Biomedical Research, Nova Labs',
    quote:
      'The equipment calibration kits arrived ahead of schedule and performed flawlessly. Your team has become our trusted procurement partner.',
  },
  {
    name: 'Elliot Ramirez',
    title: 'Operations Manager, Helios Diagnostics',
    quote:
      'Switching our consumables to Lab Essentials cut prep time by 30%. The support team anticipates our needs before we even reach out.',
  },
  {
    name: 'Dr. Mariko Chen',
    title: 'Principal Investigator, Horizon University',
    quote:
      'Robust instrumentation, transparent pricing, and impeccable documentation. Everything our research program needs in one place.',
  },
];

export default function TestimonialBlock() {
  return (
    <section className="bg-[hsl(var(--bg))]">
      <div className={`${layout.container} ${layout.section}`}>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[hsl(var(--muted))]">
            Trusted by scientists worldwide
          </p>
          <h2 className={`mt-3 ${textStyles.heading} text-center`}>
            Proven Reliability for High-Stakes Work
          </h2>
          <p className={`mt-4 ${textStyles.subheading}`}>
            Research directors, lab managers, and diagnostics teams partner with us to
            keep critical programs running on schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.name}
              className="flex h-full flex-col rounded-2xl border border-[hsl(var(--muted))]/20 bg-[hsl(var(--bg))]/90 p-6 shadow-sm backdrop-blur lg:p-8"
            >
              <p className="text-base text-[hsl(var(--ink))] leading-relaxed">
                “{testimonial.quote}”
              </p>
              <div className="mt-6">
                <p className="text-sm font-semibold text-[hsl(var(--ink))]">
                  {testimonial.name}
                </p>
                <p className="text-sm text-[hsl(var(--muted))]">
                  {testimonial.title}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
