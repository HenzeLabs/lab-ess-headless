import {
  ShieldCheckIcon,
  ClockIcon,
  TruckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import { buttonStyles, textStyles } from '@/lib/ui';

const signals = [
  {
    icon: ShieldCheckIcon,
    title: 'Certified & Calibrated',
    description:
      'ISO 9001 processes with calibration certificates available on request.',
  },
  {
    icon: ClockIcon,
    title: '48-Hour Support SLA',
    description: 'Lab onboarding specialists respond within two business days.',
  },
  {
    icon: TruckIcon,
    title: 'Fast, Insured Shipping',
    description: 'Cold-chain packaging and proactive tracking on every order.',
  },
  {
    icon: SparklesIcon,
    title: '2-Year Equipment Warranty',
    description: 'Coverage extends across parts, labor, and onsite servicing.',
  },
];

export default function TrustSignals() {
  return (
    <section className="bg-[hsl(var(--bg))]">
      <div className="rounded-lg border border-[hsl(var(--border))]/60 bg-[hsl(var(--surface))]">
        <div className="flex flex-col gap-8 p-8 md:p-10">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-heading/80">
              Trusted Lab Partner
            </span>
            <div>
              <h2 className={`${textStyles.heading} text-heading`}>
                Rock-solid guarantees on every order.
              </h2>
              <p className="mt-3 text-base text-body/80">
                From compliance paperwork to white-glove installs, our team
                keeps your workflow running without surprises.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/support/warranty"
                className={`${buttonStyles.primary} px-5 py-2`}
              >
                Explore warranty
              </a>
              <a
                href="/support/shipping"
                className={`${buttonStyles.outline} px-5 py-2`}
              >
                Shipping details
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {signals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div
                  key={signal.title}
                  className="rounded-lg border border-[hsl(var(--border))]/60 bg-[hsl(var(--surface))] p-6"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--brand))]/12 text-[hsl(var(--brand))]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-heading">
                    {signal.title}
                  </h3>
                  <p className="mt-2 text-sm text-body/75">
                    {signal.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
