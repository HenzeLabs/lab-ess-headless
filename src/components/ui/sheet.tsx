// Minimal SheetContent export for Header.tsx usage

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/cn';
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: 'left' | 'right' | 'top' | 'bottom';
  }
>(({ className, side = 'right', children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'fixed z-50 bg-background border border-border shadow-xl transition-transform duration-300',
      side === 'right' && 'top-0 right-0 h-full w-80 translate-x-0',
      side === 'left' && 'top-0 left-0 h-full w-80',
      side === 'top' && 'top-0 left-0 w-full h-1/3',
      side === 'bottom' && 'bottom-0 left-0 w-full h-1/3',
      'rounded-lg',
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
SheetContent.displayName = 'SheetContent';
