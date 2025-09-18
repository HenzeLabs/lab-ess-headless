'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef } from 'react';

import { layout, textStyles } from '@/lib/ui';

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
  description =
    'Lab Essentials makes running a lab straightforward. We supply durable, accurate equipment that schools, clinical labs, and research facilities depend on. Trusted by more than 1,200 labs, our products are built for daily use and backed by U.S. support.',
  features = [
    {
      title: 'Precision in Every Detail',
      description: 'Accurate results with clear optics and exact measurements.',
    },
    {
      title: 'Built for Speed',
      description: 'Rapid sample handling and fast U.S. shipping.',
    },
    {
      title: 'Reliability You Can Trust',
      description: 'Durable equipment designed for long-term use.',
    },
    {
      title: 'U.S.-Based Support',
      description: 'Knowledgeable help from a responsive local team.',
    }
  ],
}) => {
  const featureIconSet = useMemo(
    () => [
      (
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
          <path strokeLinecap="round" d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" />
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </svg>
      ),
      (
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
        </svg>
      ),
      (
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
        </svg>
      ),
      (
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
        </svg>
      ),
    ],
    []
  );

  const sectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const featureItems = useMemo(
    () =>
      features.map((feature, index) => ({
        ...feature,
        icon: feature.icon ?? featureIconSet[index % featureIconSet.length],
      })),
    [featureIconSet, features]
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
    <section className={`${layout.section} relative isolate overflow-hidden bg-[hsl(var(--bg))]`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--brand)_/_0.08),transparent_55%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)_/_0.08),transparent_50%)]"
      />
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
        <div
          ref={sectionRef}
          className="mb-16 grid items-center gap-12 opacity-0 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 [&:not(.is-visible)]:translate-y-8 lg:grid-cols-2"
        >
          <div className="space-y-6 text-center lg:text-left">
            <h2 className={`${textStyles.heading} text-balance text-[hsl(var(--ink))] md:text-5xl`}>
              {title}
            </h2>
            <h3 className="text-balance text-xl font-semibold text-[hsl(var(--ink))]/80 sm:text-2xl">
              {subtitle}
            </h3>
            <p className="text-base leading-relaxed text-[hsl(var(--body))] sm:text-lg">
              {description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 lg:justify-start">
              <Link
                href="/pages/about-lab-essentials"
                className="inline-flex items-center justify-center rounded-full bg-[hsl(var(--brand))] px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                About Lab Essentials
              </Link>
              <Link
                href="/pages/contact-us"
                className="inline-flex items-center justify-center rounded-full border border-[hsl(var(--brand))]/30 bg-white px-8 py-3 text-base font-semibold text-[hsl(var(--brand))] shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Contact Support
              </Link>
            </div>
          </div>

          <div className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-3xl border border-white/25 shadow-[0_40px_85px_-38px_rgba(10,16,40,0.75)]">
            <Image
              src="https://cdn.shopify.com/s/files/1/0338/9141/8171/files/hero.svg?v=1756558974"
              alt="Lab Essentials team working in a modern laboratory"
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 500px, 100vw"
              priority={false}
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,36,0.78)_0%,rgba(8,16,48,0.68)_45%,rgba(8,12,36,0.88)_100%)]"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl bg-white/80 px-10 py-12 text-center shadow-[0_10px_40px_-25px_rgba(15,23,42,0.45)] backdrop-blur">
              <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand))] px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white">
                Trusted By 1,200+ Labs
              </span>
              <p className="max-w-xs text-balance text-base text-[hsl(var(--body))]">
                From K-12 classrooms to research hospitals, teams rely on Lab Essentials for day-to-day precision.
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" aria-hidden="true" />
          </div>
        </div>

        <div ref={featuresRef} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featureItems.map((feature, index) => (
            <div
              key={feature.title}
              data-feature-card
              style={{ transitionDelay: `${index * 80}ms` }}
              className="flex h-full flex-col items-center gap-4 rounded-2xl border border-white/40 bg-white/90 px-6 py-8 text-center shadow-[0_28px_60px_-36px_rgba(15,23,42,0.55)] backdrop-blur-sm opacity-0 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 [&:not(.is-visible)]:translate-y-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(76,102,255,0.18)] text-[hsl(var(--brand))] shadow-[0_15px_32px_-22px_rgba(15,23,42,0.55)] ring-1 ring-inset ring-white/60">
                {feature.icon}
              </div>
              <h4 className="text-lg font-semibold text-[hsl(var(--ink))]">
                {feature.title}
              </h4>
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
