'use client';

import { AnimationWrapper, PulseAnimation } from '@/components/ui/animations';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true,
}) => {
  const baseClasses = 'bg-gray-200';

  const variantClasses = {
    text: 'rounded-sm h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && {
      height: typeof height === 'number' ? `${height}px` : height,
    }),
  };

  const skeletonElement = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );

  if (animate) {
    return <PulseAnimation>{skeletonElement}</PulseAnimation>;
  }

  return skeletonElement;
};

// Specialized skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '75%' : '100%'}
        className={i === lines - 1 ? 'opacity-60' : ''}
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export const SkeletonCard: React.FC<{
  className?: string;
  showAvatar?: boolean;
}> = ({ className = '', showAvatar = false }) => (
  <AnimationWrapper
    className={`border border-gray-200 rounded-lg p-6 ${className}`}
  >
    <div className="animate-pulse">
      {showAvatar && (
        <div className="flex items-center mb-4">
          <SkeletonAvatar className="mr-3" />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" className="mb-2" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      )}

      <Skeleton className="w-full h-48 mb-4" />

      <div className="space-y-3">
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </div>

      <div className="flex justify-between items-center mt-6">
        <Skeleton variant="rounded" width="80px" height="32px" />
        <Skeleton variant="rounded" width="100px" height="40px" />
      </div>
    </div>
  </AnimationWrapper>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div
    className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}
  >
    {/* Header */}
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} variant="text" width="80%" />
        ))}
      </div>
    </div>

    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={colIndex === 0 ? '90%' : '70%'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{
  items?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}> = ({ items = 8, columns = 3, className = '' }) => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-6 ${gridClasses[columns]} ${className}`}>
      {Array.from({ length: items }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

// Product-specific skeletons
export const SkeletonProductCard: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <AnimationWrapper
    className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}
  >
    <div className="animate-pulse">
      {/* Product Image */}
      <Skeleton className="w-full h-64" />

      <div className="p-4">
        {/* Product Title */}
        <Skeleton variant="text" width="85%" className="mb-2" />

        {/* Product Description */}
        <SkeletonText lines={2} className="mb-4" />

        {/* Price and Button */}
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="60px" />
          <Skeleton variant="rounded" width="80px" height="36px" />
        </div>
      </div>
    </div>
  </AnimationWrapper>
);

export const SkeletonProductGrid: React.FC<{
  products?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}> = ({ products = 12, columns = 3, className = '' }) => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-6 ${gridClasses[columns]} ${className}`}>
      {Array.from({ length: products }, (_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
};

export const SkeletonProductDetail: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`max-w-6xl mx-auto ${className}`}>
    <AnimationWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <Skeleton className="w-full h-96 rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Skeleton variant="text" width="70%" className="mb-2" />
            <Skeleton
              variant="text"
              width="40%"
              className="text-2xl font-bold mb-4"
            />
            <SkeletonText lines={3} className="mb-6" />
          </div>

          <div className="space-y-4">
            <Skeleton variant="rounded" width="100%" height="48px" />
            <Skeleton variant="rounded" width="100%" height="48px" />
          </div>

          <div className="border-t pt-6">
            <SkeletonText lines={4} />
          </div>
        </div>
      </div>
    </AnimationWrapper>
  </div>
);
