'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedDiv = motion.div;
export const AnimatedSection = motion.section;
export const AnimatedButton = motion.button;

// Alias for backward compatibility
export const AnimationWrapper = AnimatedDiv;
export const PulseAnimation = AnimatedDiv;

interface AnimatedProductCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedProductCard: React.FC<AnimatedProductCardProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className = '',
}) => {
  return (
    <motion.svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </motion.svg>
  );
};
