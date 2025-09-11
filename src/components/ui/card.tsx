import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * Card component with token-driven styles.
 * Includes CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
 */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

// Removed unused Card* exports and types
