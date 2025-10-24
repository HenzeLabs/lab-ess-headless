'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef } from 'react';

import { layout, textStyles, buttonStyles } from '@/lib/ui';

interface Feature {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: Feature[];
}

const AboutSection: React.FC<AboutSectionProps> = ({
  title = 'Modern Lab Equipment, Made Simple.',
  subtitle = 'High-performance, affordable, and reliable tools for every lab.',
  description = 'Lab Essentials makes running a lab straightforward. We supply durable, accurate equipment that schools, clinical labs, and research facilities depend on. Trusted by more than 1,200 labs, our products are built for daily use and backed by U.S. support.',
  features = [
    {
      title: 'Precision in Every Detail',
      description:
        "Clear optics and accurate results—because precision isn't optional in the lab.",
    },
    {
      title: 'Ready When You Are',
      description:
        'Fast order processing and quick U.S. shipping to keep your work moving.',
    },
    {
      title: 'Built to Last',
      description:
        'Reliable, high-performance equipment engineered for consistent results and long-term value.',
    },
    {
      title: 'Support That Knows Labs',
      description:
        'Responsive, U.S.-based product specialists ready to help you choose, use, and troubleshoot with confidence.',
    },
  ],
}) => {
  const featureIconSet = useMemo(
    () => [
      <svg
        key="precision"
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <circle cx="12" cy="12" r="6" />
        <path
          strokeLinecap="round"
          d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>,
      <svg
        key="speed"
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12h9" />
        <path d="M4 12l4-4" />
        <path d="M4 12l4 4" />
        <path d="M15 7l5 5-5 5" />
      </svg>,
      <svg
        key="reliability"
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3l7 4v5a9 9 0 01-7 8 9 9 0 01-7-8V7l7-4z" />
        <path d="M9 12l2.25 2.25L15 10.5" />
      </svg>,
      <svg
        key="support"
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 8a3 3 0 013-3h10a3 3 0 013 3v6a3 3 0 01-3 3h-5l-3.5 3v-3H7a3 3 0 01-3-3V8z" />
        <path d="M8.5 11h7" />
        <path d="M8.5 14h3" />
      </svg>,
    ],
    [],
  );

  const sectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const featureItems = useMemo(
    () =>
      features.map((feature, index) => ({
        ...feature,
        icon: feature.icon ?? featureIconSet[index % featureIconSet.length],
      })),
    [featureIconSet, features],
  );

  useEffect(() => {
    const reveal: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    };

    const sectionObserver = new IntersectionObserver(reveal, {
      threshold: 0.2,
    });

    const featureObserver = new IntersectionObserver(reveal, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    });

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    const cards = featuresRef.current?.querySelectorAll('[data-feature-card]');
    cards?.forEach((card) => {
      card.classList.remove('is-visible');
      featureObserver.observe(card);
    });

    return () => {
      sectionObserver.disconnect();
      featureObserver.disconnect();
    };
  }, [featureItems]);

  return (
    <section
      className={`${layout.section} relative isolate overflow-hidden bg-[hsl(var(--muted))]`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--brand)_/_0.05),transparent_55%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)_/_0.05),transparent_50%)]"
      />
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
        <div
          ref={sectionRef}
          className="mb-16 opacity-0 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 [&:not(.is-visible)]:translate-y-8"
        >
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className={`${textStyles.h2} text-balance`}>{title}</h2>
            <h3 className={`${textStyles.h3} text-balance text-[hsl(var(--brand))]`}>{subtitle}</h3>
            <p className="text-base leading-relaxed text-[hsl(var(--body))] sm:text-lg">
              {description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/pages/about-lab-essentials"
                className={`${buttonStyles.primary} px-8 py-3 text-base`}
              >
                About Lab Essentials
              </Link>
              <Link
                href="/pages/contact-us"
                className={`${buttonStyles.outline} px-8 py-3 text-base`}
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        <div
          ref={featuresRef}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featureItems.map((feature, index) => (
            <div
              key={feature.title}
              data-feature-card
              style={{ transitionDelay: `${index * 80}ms` }}
              className="flex h-full flex-col items-center gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] px-6 py-8 text-center shadow-[0_28px_60px_-36px_rgba(15,23,42,0.15)] opacity-0 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 [&:not(.is-visible)]:translate-y-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--brand)_/_0.1)] text-[hsl(var(--brand))] shadow-[0_8px_16px_-8px_rgba(15,23,42,0.2)] ring-1 ring-inset ring-[hsl(var(--border))]">
                {feature.icon}
              </div>
              <h4 className={`${textStyles.h4}`}>{feature.title}</h4>
              <p className="text-sm text-[hsl(var(--body))]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
