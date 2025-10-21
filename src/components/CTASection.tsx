'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { buttonStyles, layout } from '@/lib/ui';

export default function CTASection() {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.2 },
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`relative isolate overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))] via-[hsl(var(--brand))] to-[hsl(var(--accent))] ${layout.section} text-white`}
    >
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        ref={ctaRef}
        className={`${layout.container} flex flex-col items-center gap-10 rounded-3xl border border-white/20 bg-white/10 p-10 text-center shadow-[0_24px_60px_-30px_rgba(8,9,57,0.65)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:text-left opacity-0 translate-y-8 transition-all duration-700 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0`}
      >
        <div className="max-w-2xl">
          <h2 className="text-balance text-white">
            Start Your Lab, Simplified
          </h2>
          <p className="mt-3 text-white/80">
            From classrooms to clinical work, find the right equipment to power
            your next discovery—all in one place.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <Link
            href="/collections"
            className={`${buttonStyles.primary} text-white shadow-[0_15px_35px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_45px_-10px_rgba(255,255,255,0.6)] hover:scale-105 transition-all duration-300`}
          >
            Explore Lab Equipment →
          </Link>
        </div>
      </div>
    </section>
  );
}
