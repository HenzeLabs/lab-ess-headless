'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonStyles, textStyles, layout } from '@/lib/ui';

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

const Hero: React.FC<HeroProps> = ({
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
  poster = '/hero.avif', // AVIF poster for instant display (36KB vs 2.5MB video)
}) => {
  const hasMedia = Boolean(videoUrl || imageUrl);

  const ctaPrimaryClass = hasMedia
    ? `${buttonStyles.primary} text-white text-base px-8 py-4 shadow-[0_15px_35px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_45px_-10px_rgba(255,255,255,0.6)] hover:scale-105 transition-all duration-300`
    : `${buttonStyles.primary} text-base px-8 py-4 hover:scale-105 transition-all duration-300`;

  const ctaSecondaryClass = hasMedia
    ? `${buttonStyles.outline} border-2 border-white text-white bg-white/10 backdrop-blur-sm text-base px-8 py-4 hover:bg-white hover:text-[hsl(var(--brand))] hover:scale-105 transition-all duration-300`
    : `${buttonStyles.ghost} text-base px-8 py-4 hover:scale-105 transition-all duration-300`;

  return (
    <section
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden ${layout.section} text-center`}
      style={{ minHeight: '60vh' }}
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
        className={`relative z-10 ${layout.container} flex flex-col items-center justify-center gap-8 md:gap-10`}
      >
        {/* Make title clickable to prevent dead clicks */}
        <Link
          href="/products"
          className={`group cursor-pointer transition-transform hover:scale-105 ${
            hasMedia
              ? 'bg-[hsl(var(--brand))]/75 backdrop-blur-sm rounded-3xl px-12 py-8 border-2 border-white/20 hover:bg-[hsl(var(--brand))]/85'
              : 'hover:bg-gray-50 rounded-3xl px-12 py-8'
          }`}
        >
          <h1
            className={`text-balance max-w-3xl ${textStyles.h1} drop-shadow-2xl ${
              hasMedia ? 'text-white' : ''
            } group-hover:drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]`}
          >
            {title}
          </h1>
          <p className={`mt-2 text-sm ${hasMedia ? 'text-white/90' : 'text-gray-600'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            Click to explore our full catalog →
          </p>
        </Link>
        {(ctaText && ctaHref) ||
        (ctaSecondaryText && ctaSecondaryHref) ||
        (ctaTertiaryText && ctaTertiaryHref) ? (
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            {/* Primary CTA - Extra prominent on mobile (larger text, full-width), visible on all devices */}
            {ctaText && ctaHref && (
              <Link
                href={ctaHref}
                className={`${ctaPrimaryClass} w-full sm:w-auto text-lg sm:text-base py-5 sm:py-4 font-bold`}
                data-test-id="hero-cta"
              >
                {ctaText}
              </Link>
            )}

            {/* Secondary CTA - More prominent on tablet (md), visible on all devices */}
            {ctaSecondaryText && ctaSecondaryHref && (
              <Link
                href={ctaSecondaryHref}
                className={`${ctaSecondaryClass} w-full sm:w-auto md:text-lg md:px-10 md:py-5`}
                data-test-id="hero-cta-secondary"
              >
                {ctaSecondaryText}
              </Link>
            )}

            {/* Tertiary CTA - Desktop only for Centrifuges/Contact */}
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
        ) : null}

        {/* Scroll indicator to encourage exploration */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className={`w-6 h-6 ${hasMedia ? 'text-white/70' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          <span className={`sr-only`}>Scroll down for more</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
