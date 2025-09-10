import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * Input component with token-driven styles and sizes.
 * @param size - Input size (sm|md|lg)
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Custom input size (sm|md|lg). Not the native size attribute.
   */
  inputSize?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 px-2 text-sm',
  md: 'h-10 px-3 text-base',
  lg: 'h-12 px-4 text-lg',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = 'md', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:opacity-50 disabled:pointer-events-none transition-colors',
          sizeClasses[inputSize],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
