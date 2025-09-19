import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * Input component with token-driven styles and sizes.
 * @param size - Input size (sm|md|lg)
 */
// Removed unused InputProps

const sizeClasses = {
  sm: 'h-8 px-2 text-sm',
  md: 'h-10 px-3 text-base',
  lg: 'h-12 px-4 text-lg',
};

type InputSize = 'sm' | 'md' | 'lg';

interface InputComponentProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  inputSize?: InputSize;
}

export const Input = React.forwardRef<HTMLInputElement, InputComponentProps>(
  ({ className, type, inputSize = 'md', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:opacity-50 disabled:pointer-events-none transition-colors',
          sizeClasses[inputSize as InputSize],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
