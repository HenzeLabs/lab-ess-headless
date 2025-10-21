'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonStyles, textStyles, layout } from '@/lib/ui';

interface HeroProps {
  title: string;
  ctaText?: string;
  ctaHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
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
  imageUrl = '',
  imageAlt = '',
  videoUrl = '/hero.mp4',
  poster = '',
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const hasMedia = Boolean(videoUrl || imageUrl);

  const ctaPrimaryClass = hasMedia
    ? `${buttonStyles.primary} text-white text-base px-8 py-4 shadow-[0_15px_35px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_45px_-10px_rgba(255,255,255,0.6)] hover:scale-105 transition-all duration-300`
    : `${buttonStyles.primary} text-base px-8 py-4 hover:scale-105 transition-all duration-300`;

  const ctaSecondaryClass = hasMedia
    ? `${buttonStyles.outline} border-2 border-white text-white bg-white/10 backdrop-blur-sm text-base px-8 py-4 hover:bg-white hover:text-[hsl(var(--brand))] hover:scale-105 transition-all duration-300`
    : `${buttonStyles.ghost} text-base px-8 py-4 hover:scale-105 transition-all duration-300`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 },
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(88,45,159,0.14),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(255,148,74,0.16),transparent_60%)] ${layout.section} text-center`}
      style={{ minHeight: '70vh' }}
      data-test-id="hero-section"
    >
      {videoUrl ? (
        <video
          className="absolute inset-0 -z-20 h-full w-full min-h-full object-cover"
          poster={poster}
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
          />
        )
      )}
      {hasMedia && (
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(68,24,123,0.82),transparent_65%),radial-gradient(circle_at_bottom_right,rgba(255,119,44,0.75),transparent_60%)]"
          aria-hidden="true"
        />
      )}
      <div
        ref={heroRef}
        className={`relative z-10 ${layout.container} flex flex-col items-center justify-center gap-8 md:gap-10 opacity-0 translate-y-8 transition-all duration-1000 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0`}
      >
        <h1
          className={`text-balance max-w-3xl ${textStyles.h1} drop-shadow-2xl ${
            hasMedia ? 'text-white' : ''
          }`}
        >
          {title}
        </h1>
        {(ctaText && ctaHref) || (ctaSecondaryText && ctaSecondaryHref) ? (
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            {ctaText && ctaHref && (
              <Link
                href={ctaHref}
                className={`${ctaPrimaryClass}`}
                data-test-id="hero-cta"
              >
                {ctaText}
              </Link>
            )}
            {ctaSecondaryText && ctaSecondaryHref && (
              <Link href={ctaSecondaryHref} className={`${ctaSecondaryClass}`}>
                {ctaSecondaryText}
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Hero;
