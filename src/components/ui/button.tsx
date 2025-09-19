import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Button component with token-driven variants and sizes.
 * @param asChild - Render as child (for Slot support)
 * @param variant - Visual style
 * @param size - Button size
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-out-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))] disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]',
  {
    variants: {
      variant: {
        primary:
          'bg-[hsl(var(--brand))] text-white shadow-subtle hover:bg-[hsl(var(--brand-dark))] hover:text-white hover:shadow-card',
        accent:
          'bg-[hsl(var(--accent))] text-white shadow-lift hover:bg-[hsl(var(--accent-dark))] hover:text-white',
        ghost:
          'border border-transparent bg-transparent text-heading hover:bg-[hsl(var(--muted))]',
        outline:
          'border border-[hsl(var(--border))] bg-surface text-heading hover:border-[hsl(var(--brand))] hover:bg-[hsl(var(--muted))]',
        subtle:
          'bg-[hsl(var(--muted))] text-heading hover:bg-[hsl(var(--muted))]/80',
        destructive:
          'bg-[hsl(var(--destructive))] text-white shadow-subtle hover:bg-[hsl(var(--destructive))]/90 hover:text-white',
        link:
          'text-[hsl(var(--brand))] underline underline-offset-4 hover:text-[hsl(var(--brand-dark))] px-0 py-0 h-auto',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonComponentProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonComponentProps>(
  function Button(
    { className, variant, size, asChild = false, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
