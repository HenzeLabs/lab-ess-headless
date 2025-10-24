'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { layout } from "@/lib/ui";

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
      className={`relative isolate overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))] via-[hsl(var(--brand-dark))] to-[hsl(var(--accent))] ${layout.section} text-white`}
    >
      {/* Animated background elements */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '50px 50px' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-96 h-96 bg-[hsl(var(--accent))]/20 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div
        ref={ctaRef}
        className={`${layout.container} opacity-0 translate-y-8 transition-all duration-700 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0`}
      >
        <div className="relative rounded-3xl border-2 border-white/30 bg-white/10 p-12 md:p-16 text-center shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-white/20 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-white/20 rounded-br-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 mb-2">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Heading */}
            <div>
              <p className="text-sm md:text-base font-semibold text-white/90 uppercase tracking-wider mb-3">
                Ready to Get Started?
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Start Your Lab, Simplified
              </h2>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                From classrooms to clinical labs, find dependable products that help you do your best work—all in one place.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[hsl(var(--brand))] shadow-2xl transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(255,255,255,0.3)] hover:scale-105 group"
              >
                Shop by Category
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/pages/contact-us"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-all hover:bg-white hover:text-[hsl(var(--brand))] hover:-translate-y-1 hover:shadow-xl"
              >
                Talk to an Expert
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-2 text-white/90">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">Free Shipping $300+</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">1-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">U.S. Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
