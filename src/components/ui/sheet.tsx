// Radix-based Sheet with portal + overlay and accessible content

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/cn';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[60] bg-black/30 backdrop-blur-[1px]',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: 'left' | 'right' | 'top' | 'bottom';
  }
>(({ className, side = 'right', children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-[70] bg-[hsl(var(--bg))] text-[hsl(var(--ink))] border border-border shadow-xl outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        side === 'right' && 'top-0 right-0 h-full w-80 rounded-l-lg',
        side === 'left' && 'top-0 left-0 h-full w-80 rounded-r-lg',
        side === 'top' && 'top-0 left-0 w-full rounded-b-xl',
        side === 'bottom' && 'bottom-0 left-0 w-full rounded-t-xl',
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';
