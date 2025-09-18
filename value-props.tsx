import Image from 'next/image';

import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Fast & Free Delivery',
    description:
      'Get your equipment delivered to your lab, fast. Free delivery on all orders over $50.',
    icon: TruckIcon,
  },
  {
    name: '120-Night Trial',
    description:
      "We are confident in our quality. Try any product for 120 nights, and if you're not satisfied, we'll take it back for free.",
    icon: ArrowPathIcon,
  },
  {
    name: 'Secure Payments',
    description:
      'Your data and payment information are safe with us. We use industry-standard encryption.',
    icon: LockClosedIcon,
  },
  {
    name: 'Cloud Data Backup',
    description:
      'For our smart devices, enjoy seamless and secure data backup to the cloud, accessible anytime.',
    icon: CloudArrowUpIcon,
  },
];

export function ValueProps() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-primary">
                Our Commitment
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                A better experience
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                We design our products and services to provide a seamless,
                reliable, and supportive experience from purchase to discovery.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-muted-foreground lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-foreground">
                      <feature.icon
                        className="absolute left-1 top-1 h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop"
            alt="Product screenshot"
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-border sm:w-[57rem] md:-ml-4 lg:-ml-0"
            width={2432}
            height={1442}
            priority
          />
        </div>
      </div>
    </div>
  );
}
