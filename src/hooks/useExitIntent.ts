'use client';

import { useEffect, useState } from 'react';

interface UseExitIntentOptions {
  enabled?: boolean;
  sensitivity?: number;
  delay?: number;
}

export function useExitIntent({
  enabled = true,
  sensitivity = 20,
  delay = 1000,
}: UseExitIntentOptions = {}) {
  const [isExiting, setIsExiting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!enabled || hasTriggered) return;

    let delayTimeoutId: NodeJS.Timeout;

    const handleMouseLeave = (event: MouseEvent) => {
      // Only trigger if mouse leaves from the top of the page
      if (event.clientY <= sensitivity) {
        clearTimeout(delayTimeoutId);
        delayTimeoutId = setTimeout(() => {
          setIsExiting(true);
          setHasTriggered(true);
        }, delay);
      }
    };

    const handleMouseEnter = () => {
      clearTimeout(delayTimeoutId);
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      clearTimeout(delayTimeoutId);
    };
  }, [enabled, sensitivity, delay, hasTriggered]);

  return {
    isExiting,
    resetExitIntent: () => {
      setIsExiting(false);
      setHasTriggered(false);
    },
  };
}
