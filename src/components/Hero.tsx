import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
  const hasMedia = Boolean(videoUrl || imageUrl);

  const headingClass = hasMedia ? 'text-white' : 'text-[hsl(var(--ink))]';

  const ctaPrimaryClass = hasMedia
    ? 'bg-white text-[hsl(var(--ink))] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(30,8,64,0.6)] transform'
    : 'bg-[linear-gradient(135deg,hsl(var(--brand))_0%,hsl(var(--accent))_100%)] text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]/40 transform';

  const ctaSecondaryClass = hasMedia
    ? 'border border-white/70 bg-white/10 text-white shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(30,8,64,0.5)] transform'
    : 'border border-[hsl(var(--brand))]/35 bg-transparent text-[hsl(var(--brand))] shadow-sm transition hover:-translate-y-0.5 hover:bg-[rgba(255,126,71,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]/40 transform';

  return (
    <section className="relative isolate flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(88,45,159,0.14),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(255,148,74,0.16),transparent_60%)] min-h-[70vh] text-center">
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
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 md:gap-10">
        <h1
          className={`text-balance max-w-3xl text-5xl font-black tracking-tight drop-shadow-2xl md:text-7xl ${headingClass}`}
        >
          {title}
        </h1>
        {(ctaText && ctaHref) || (ctaSecondaryText && ctaSecondaryHref) ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            {ctaText && ctaHref && (
              <Link
                href={ctaHref}
                className={`inline-block rounded-full px-10 py-4 text-lg font-semibold ${ctaPrimaryClass}`}
              >
                {ctaText}
              </Link>
            )}
            {ctaSecondaryText && ctaSecondaryHref && (
              <Link
                href={ctaSecondaryHref}
                className={`inline-block rounded-full px-10 py-4 text-lg font-semibold ${ctaSecondaryClass}`}
              >
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
