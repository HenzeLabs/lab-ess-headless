import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * Skeleton loading block with animated pulse.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  ),
);
Skeleton.displayName = 'Skeleton';
