'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonStyles, textStyles, layout } from '@/lib/ui';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  title: string;
  ctaText?: string;
  ctaHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  ctaTertiaryText?: string;
  ctaTertiaryHref?: string;
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;
  poster?: string;
}

const HeroOptimized: React.FC<HeroProps> = ({
  title = '',
  ctaText = '',
  ctaHref = '',
  ctaSecondaryText = '',
  ctaSecondaryHref = '',
  ctaTertiaryText = '',
  ctaTertiaryHref = '',
  imageUrl = '',
  imageAlt = '',
  videoUrl = '/hero.mp4',
  poster = '/hero.avif',
}) => {
  const hasMedia = Boolean(videoUrl || imageUrl);

  // Scroll to next section smoothly
  const scrollToContent = () => {
    const aboutSection = document.querySelector('#about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ctaPrimaryClass = hasMedia
    ? `${buttonStyles.primary} text-white text-base px-8 py-4 shadow-[0_15px_35px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_45px_-10px_rgba(255,255,255,0.6)] hover:scale-105 transition-all duration-300`
    : `${buttonStyles.primary} text-base px-8 py-4 hover:scale-105 transition-all duration-300`;

  const ctaSecondaryClass = hasMedia
    ? `${buttonStyles.outline} border-2 border-white text-white bg-white/10 backdrop-blur-sm text-base px-8 py-4 hover:bg-white hover:text-[hsl(var(--brand))] hover:scale-105 transition-all duration-300`
    : `${buttonStyles.ghost} text-base px-8 py-4 hover:scale-105 transition-all duration-300`;

  return (
    <section
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden ${layout.section} text-center min-h-[60vh] md:min-h-[70vh]`}
      data-test-id="hero-section"
    >
      {videoUrl ? (
        <video
          className="absolute inset-0 -z-20 h-full w-full min-h-full object-cover"
          poster={poster}
          preload="none"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        imageUrl && (
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            priority
            fetchPriority="high"
            sizes="100vw"
          />
        )
      )}

      <div
        className={`relative z-10 ${layout.container} flex flex-col items-center justify-center gap-6 md:gap-10`}
      >
        {/* Make the title container clickable on mobile to prevent dead clicks */}
        <Link
          href="/collections/microscopes"
          className={`block cursor-pointer transition-transform hover:scale-105 ${
            hasMedia
              ? 'bg-[hsl(var(--brand))]/75 backdrop-blur-sm rounded-3xl px-8 md:px-12 py-6 md:py-8 border-2 border-white/20'
              : ''
          }`}
        >
          <h1
            className={`text-balance max-w-3xl ${textStyles.h1} drop-shadow-2xl ${
              hasMedia ? 'text-white' : ''
            }`}
          >
            {title}
          </h1>
          {/* Add subtle tagline that's clickable */}
          <p className={`mt-2 text-sm md:text-base ${hasMedia ? 'text-white/90' : 'text-gray-600'}`}>
            Proven clarity. Trusted precision.
          </p>
        </Link>

        {/* Mobile-First CTA Layout */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 w-full max-w-xl">
          {/* Primary CTA - "Shop Reliable Microscopes" prominent on mobile */}
          {ctaText && ctaHref && (
            <Link
              href={ctaHref}
              className={`${ctaPrimaryClass} w-full sm:w-auto text-lg sm:text-base py-5 sm:py-4 font-bold`}
              data-test-id="hero-cta"
            >
              Shop Reliable Microscopes
            </Link>
          )}

          {/* Mobile Quick Actions - Visible only on mobile */}
          <div className="flex gap-3 w-full sm:hidden">
            <Link
              href="/contact"
              className="flex-1 bg-white/90 text-[hsl(var(--brand))] px-4 py-3 rounded-lg font-semibold hover:bg-white transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/collections/centrifuges"
              className="flex-1 bg-white/20 backdrop-blur-sm text-white border border-white/40 px-4 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
            >
              Centrifuges
            </Link>
          </div>

          {/* Secondary CTA - Quiz for tablet/desktop */}
          {ctaSecondaryText && ctaSecondaryHref && (
            <Link
              href={ctaSecondaryHref}
              className={`${ctaSecondaryClass} hidden sm:inline-flex md:text-lg md:px-10 md:py-5`}
              data-test-id="hero-cta-secondary"
            >
              {ctaSecondaryText}
            </Link>
          )}

          {/* Tertiary CTA - Desktop only */}
          {ctaTertiaryText && ctaTertiaryHref && (
            <Link
              href={ctaTertiaryHref}
              className={`${ctaSecondaryClass} hidden lg:inline-flex`}
              data-test-id="hero-cta-tertiary"
            >
              {ctaTertiaryText}
            </Link>
          )}
        </div>

        {/* Interactive scroll indicator - encourages scrolling on all devices */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 animate-bounce cursor-pointer p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          aria-label="Scroll to content"
        >
          <ChevronDown className={`w-6 h-6 ${hasMedia ? 'text-white' : 'text-gray-700'}`} />
        </button>
      </div>
    </section>
  );
};

export default HeroOptimized;