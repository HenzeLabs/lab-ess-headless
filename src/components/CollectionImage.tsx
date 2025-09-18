import Image, { ImageProps } from 'next/image';

import { cn } from '@/lib/cn';

type CollectionImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt: string;
  fallbackKey?: string | null; // This prop will no longer be used but kept for type compatibility if needed elsewhere
};

export function CollectionImage({
  src,
  alt,
  width = 500,
  height = 500,
  className,
  ...rest
}: CollectionImageProps) {
  if (!src) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-200 text-gray-500 rounded-md', className)} style={{ width, height }}>
        No Image
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-cover rounded-md', className)}
      {...rest}
    />
  );
}
