'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { ReactNode } from 'react';

interface RoyalButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'royal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants = {
  primary: 'bg-black text-white hover:bg-gray-800 shadow-lg',
  secondary:
    'border-2 border-black bg-white text-black hover:bg-black hover:text-white',
  tertiary: 'bg-transparent text-black hover:bg-gray-100',
  royal:
    'bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transform-gpu',
};

const sizeVariants = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function RoyalButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}: RoyalButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: variant === 'royal' ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'relative inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant],
        sizeVariants[size],
        className,
      )}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </motion.div>
        ) : (
          <motion.span
            key="children"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>

      {variant === 'royal' && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400"
          whileHover={{ opacity: 0.2 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}

// Royal Loading Spinner Component
export function RoyalSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={cn('relative inline-block', sizeMap[size])}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute inset-0 border-4 border-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-full opacity-25" />
      <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full" />
    </motion.div>
  );
}

// Royal Card Component
interface RoyalCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function RoyalCard({
  children,
  className,
  hover = true,
  glow = false,
}: RoyalCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative bg-white rounded-xl shadow-lg border border-gray-100',
        'transition-all duration-300 ease-out',
        hover && 'hover:shadow-xl hover:border-gray-200',
        glow && 'shadow-purple-500/10 hover:shadow-purple-500/20',
        className,
      )}
    >
      {glow && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-teal-600/5" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
