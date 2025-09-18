import Image, { ImageProps } from 'next/image';

import { cn } from '@/lib/cn';

type CollectionImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt: string;
  fallbackKey?: string | null;
};

export function CollectionImage({
  src,
  alt,
  fallbackKey,
  width = 500,
  height = 500,
  className,
  ...rest
}: CollectionImageProps) {
  const fallbackSrc = getFallbackImage(alt, fallbackKey);
  const imageSrc = src || fallbackSrc;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-cover rounded-md', className)}
      {...rest}
    />
  );
}

function getFallbackImage(alt: string, fallbackKey?: string | null) {
  const keywords = [fallbackKey, alt].filter(Boolean) as string[];

  for (const candidate of keywords) {
    const key = candidate.toLowerCase();
    if (key.includes('microscope')) return '/images/default-microscope.jpg';
    if (key.includes('centrifuge')) return '/images/default-centrifuge.jpg';
    if (key.includes('camera')) return '/images/default-camera.jpg';
  }

  return '/images/default-collection.jpg';
}
