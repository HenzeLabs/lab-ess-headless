'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { layout } from '@/lib/ui';

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
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${layout.section} text-center`}
      style={{ minHeight: '100vh' }}
      data-test-id="hero-section"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-4 w-72 h-72 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
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
        className={`relative z-10 ${layout.container} flex flex-col items-center justify-center gap-8 md:gap-12 opacity-0 translate-y-8 transition-all duration-1000 ease-out [&.animate-in]:opacity-100 [&.animate-in]:translate-y-0`}
      >
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white/90 text-sm font-medium animate-fade-in-up animation-delay-500">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Premium Lab Equipment
          </div>
        </div>
        <h1
          className={`text-balance max-w-4xl text-6xl md:text-7xl lg:text-8xl font-bold leading-tight bg-gradient-to-r from-white via-purple-200 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl animate-fade-in-up animation-delay-700`}
        >
          {title}
        </h1>
        <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-1000">
          Precision instruments and cutting-edge technology for research
          excellence
        </p>
        {(ctaText && ctaHref) || (ctaSecondaryText && ctaSecondaryHref) ? (
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8 animate-fade-in-up animation-delay-1300">
            {ctaText && ctaHref && (
              <Link
                href={ctaHref}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white font-semibold rounded-full overflow-hidden shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                data-test-id="hero-cta"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center gap-2">
                  {ctaText}
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>
            )}
            {ctaSecondaryText && ctaSecondaryHref && (
              <Link
                href={ctaSecondaryHref}
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  {ctaSecondaryText}
                  <svg
                    className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </span>
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Hero;
