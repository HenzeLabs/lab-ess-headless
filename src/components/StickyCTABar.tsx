'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface StickyCTABarProps {
  ctaText?: string;
  ctaHref?: string;
  showAfterScroll?: number;
}

export default function StickyCTABar({
  ctaText = 'Shop Reliable Microscopes',
  ctaHref = '/collections/microscopes',
  showAfterScroll = 400,
}: StickyCTABarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > showAfterScroll);
    };

    // Check scroll position on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="complementary"
      aria-label="Sticky call to action"
    >
      <div className="bg-[hsl(var(--brand))] shadow-2xl border-t-2 border-[hsl(var(--brand-dark))]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-white font-semibold text-sm md:text-base">
                Ready to upgrade your lab equipment?
              </p>
              <p className="text-white/90 text-xs md:text-sm hidden sm:block">
                Trusted by 1,200+ labs. Free shipping on orders over $300.
              </p>
            </div>
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm md:text-base font-bold text-[hsl(var(--brand))] shadow-lg transition-all hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--brand))]"
              aria-label={ctaText}
            >
              {ctaText}
              <ArrowRight
                className="h-4 w-4 md:h-5 md:w-5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
