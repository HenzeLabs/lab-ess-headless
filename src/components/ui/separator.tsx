import * as React from 'react';
import * as RadixSeparator from '@radix-ui/react-separator';
import { cn } from '../../lib/cn';

/**
 * Separator component using Radix UI, styled with tokens.
 * @param orientation - horizontal or vertical
 */
export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof RadixSeparator.Root> {}

export const Separator = React.forwardRef<
  React.ElementRef<typeof RadixSeparator.Root>,
  SeparatorProps
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref,
  ) => (
    <RadixSeparator.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = 'Separator';
