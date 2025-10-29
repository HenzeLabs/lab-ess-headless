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
      style={{ minHeight: '70vh' }}
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
        <div
          className={
            hasMedia
              ? 'bg-[hsl(var(--brand))]/75 backdrop-blur-sm rounded-3xl px-12 py-8 border-2 border-white/20'
              : ''
          }
        >
          <h1
            className={`text-balance max-w-3xl ${textStyles.h1} drop-shadow-2xl ${
              hasMedia ? 'text-white' : ''
            }`}
          >
            {title}
          </h1>
        </div>
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
      </div>
    </section>
  );
};

export default Hero;
