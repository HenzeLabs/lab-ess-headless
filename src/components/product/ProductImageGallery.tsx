'use client';
import { useState } from 'react';
import Image from 'next/image';

type ProductImage = {
  url: string;
  altText: string | null;
};

type ProductImageGalleryProps = {
  images: ProductImage[];
  productTitle: string;
};

export default function ProductImageGallery({
  images,
  productTitle,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const currentImage = images[selectedIndex] || images[0];

  // Handle mouse move for zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  // Handle touch swipe for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left - next image
      setSelectedIndex((prev) => (prev + 1 < images.length ? prev + 1 : prev));
    }

    if (touchStart - touchEnd < -75) {
      // Swipe right - previous image
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-muted/20 border border-border/50">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">No image available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-border/50 bg-background shadow-sm transition-all hover:border-[hsl(var(--brand))]/30 hover:shadow-md"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative h-full w-full">
          <Image
            src={currentImage.url}
            alt={currentImage.altText || productTitle}
            fill
            className={`object-contain p-8 transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            style={
              isZoomed
                ? {
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  }
                : {}
            }
            priority={selectedIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={90}
          />
        </div>

        {/* Zoom indicator (desktop only) */}
        <div className="absolute right-4 top-4 hidden rounded-lg border border-border bg-background/90 px-3 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))] opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 md:block">
          <span className="flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            Hover to zoom
          </span>
        </div>

        {/* Mobile swipe indicators */}
        {images.length > 1 && (
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'w-6 bg-[hsl(var(--brand))]'
                    : 'w-1.5 bg-background/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="w-full">
          {/* Desktop: Grid */}
          <div className="hidden gap-4 md:grid md:grid-cols-4">
            {images.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`group aspect-square overflow-hidden rounded-xl border-2 bg-background shadow-sm transition-all hover:scale-105 hover:shadow-md ${
                  index === selectedIndex
                    ? 'border-[hsl(var(--brand))] ring-4 ring-[hsl(var(--brand))]/20'
                    : 'border-border/40 hover:border-[hsl(var(--brand))]/50'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={image.url}
                    alt={
                      image.altText || `${productTitle} - Image ${index + 1}`
                    }
                    fill
                    className="object-contain p-3"
                    sizes="120px"
                    loading="lazy"
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className="overflow-x-auto scrollbar-hide md:hidden">
            <div className="flex gap-3 pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-background shadow-sm transition-all ${
                    index === selectedIndex
                      ? 'border-[hsl(var(--brand))] ring-4 ring-[hsl(var(--brand))]/20 scale-105'
                      : 'border-border/40'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={image.url}
                      alt={
                        image.altText || `${productTitle} - Image ${index + 1}`
                      }
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                      loading="lazy"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
