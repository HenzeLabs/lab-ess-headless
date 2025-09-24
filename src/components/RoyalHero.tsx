'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RoyalButton } from './ui/royal-components';
import { layout } from '@/lib/ui';
import { cn } from '@/lib/cn';

interface RoyalHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;
  poster?: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

const RoyalHero: React.FC<RoyalHeroProps> = ({
  title = 'Premium Laboratory Equipment',
  subtitle = 'Precision instruments for world-class research',
  description = 'Discover cutting-edge laboratory equipment trusted by leading research institutions worldwide. Experience the perfect blend of innovation, reliability, and performance.',
  ctaText = 'Explore Products',
  ctaHref = '/collections',
  ctaSecondaryText = 'Learn More',
  ctaSecondaryHref = '/about',
  imageUrl = '',
  imageAlt = '',
  videoUrl = '/hero.mp4',
  poster = '',
  stats = [
    { value: '1,200+', label: 'Labs Worldwide' },
    { value: '15+', label: 'Years Experience' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Expert Support' },
  ],
}) => {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_rgba(120,219,255,0.3),_transparent_50%)]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Video/Image Background */}
      {hasMedia && (
        <motion.div className="absolute inset-0 z-10" style={{ y, opacity }}>
          {videoUrl ? (
            <video
              className="w-full h-full object-cover opacity-30"
              autoPlay
              muted
              loop
              playsInline
              poster={poster}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt || 'Hero background'}
              fill
              className="object-cover opacity-30"
              priority
              quality={85}
            />
          ) : null}
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-20 w-full">
        <div className={cn(layout.container, 'text-center text-white')}>
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-5xl mx-auto"
          >
            {/* Subtitle */}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-purple-300 text-lg font-medium mb-4 tracking-wide"
              >
                {subtitle}
              </motion.p>
            )}

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight"
            >
              {title}
            </motion.h1>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                {description}
              </motion.p>
            )}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              {ctaText && ctaHref && (
                <Link href={ctaHref}>
                  <RoyalButton
                    variant="royal"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {ctaText}
                  </RoyalButton>
                </Link>
              )}
              {ctaSecondaryText && ctaSecondaryHref && (
                <Link href={ctaSecondaryHref}>
                  <RoyalButton
                    variant="secondary"
                    size="lg"
                    className="min-w-[200px] bg-white/10 border-white/30 text-white hover:bg-white hover:text-gray-900"
                  >
                    {ctaSecondaryText}
                  </RoyalButton>
                </Link>
              )}
            </motion.div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-purple-300 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-15" />
    </section>
  );
};

export default RoyalHero;
