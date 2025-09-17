import React from 'react';
import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle?: string;
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
  subtitle = '',
  ctaText = '',
  ctaHref = '',
  ctaSecondaryText = '',
  ctaSecondaryHref = '',
  imageUrl = '',
  imageAlt = '',
  videoUrl = '/hero.mp4',
  poster = '',
}) => {
  const hasMedia = Boolean(videoUrl || imageUrl);

  const headingClass = hasMedia
    ? 'text-white'
    : 'text-[hsl(var(--ink))]';

  const copyClass = hasMedia
    ? 'text-white/85'
    : 'text-[hsl(var(--muted))]';

  const ctaPrimaryClass = hasMedia
    ? 'bg-[hsl(var(--brand))] text-white shadow-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
    : 'bg-[hsl(var(--brand))] text-white shadow-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]/60';

  const ctaSecondaryClass = hasMedia
    ? 'border border-white/70 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
    : 'border border-[hsl(var(--brand))]/30 bg-[hsl(var(--bg))] text-[hsl(var(--brand))] shadow-sm transition hover:bg-[hsl(var(--brand))]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]/40';

  return (
    <section
      className="relative isolate flex flex-col items-center justify-center overflow-hidden bg-[hsl(var(--bg))] py-16 text-center sm:py-20 lg:py-28"
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
        <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden="true" />
      )}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-6 px-6">
        <h1
          className={`text-balance text-4xl font-extrabold tracking-tight drop-shadow-lg md:text-6xl ${headingClass}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`text-balance mx-auto max-w-3xl text-lg drop-shadow md:text-2xl ${copyClass}`}
          >
            {subtitle}
          </p>
        )}
        {(ctaText && ctaHref) || (ctaSecondaryText && ctaSecondaryHref) ? (
          <div className="mt-2 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {ctaText && ctaHref && (
              <a
                href={ctaHref}
                className={`inline-block rounded-full px-10 py-4 text-lg font-semibold ${ctaPrimaryClass} hover:text-white`}
              >
                {ctaText}
              </a>
            )}
            {ctaSecondaryText && ctaSecondaryHref && (
              <a
                href={ctaSecondaryHref}
                className={`inline-block rounded-full px-10 py-4 text-lg font-semibold ${ctaSecondaryClass}`}
              >
                {ctaSecondaryText}
              </a>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Hero;
