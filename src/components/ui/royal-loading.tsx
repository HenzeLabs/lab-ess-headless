'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface RoyalLoadingProps {
  variant?: 'spinner' | 'pulse' | 'bars' | 'royal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function RoyalLoading({
  variant = 'royal',
  size = 'md',
  className,
  text,
}: RoyalLoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (variant === 'royal') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4',
          className,
        )}
      >
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            className={cn(
              'rounded-full border-4 border-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600',
              sizeClasses[size],
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              background:
                'conic-gradient(from 0deg, #9333ea, #3b82f6, #0d9488, #9333ea)',
            }}
          />

          {/* Inner circle */}
          <motion.div
            className={cn(
              'absolute inset-2 rounded-full bg-white border-2 border-purple-200',
              'flex items-center justify-center',
            )}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <motion.div
              className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {text && (
          <motion.p
            className={cn('text-gray-600 font-medium', textSizes[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex items-center justify-center gap-1', className)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-t from-purple-600 to-blue-600 rounded-full"
            style={{
              width: size === 'sm' ? '3px' : size === 'md' ? '4px' : '6px',
              height: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px',
            }}
            animate={{
              scaleY: [1, 2, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <motion.div
          className={cn(
            'rounded-full bg-gradient-to-r from-purple-600 to-blue-600',
            sizeClasses[size],
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        className={cn(
          'rounded-full border-4 border-gray-200 border-t-purple-600',
          sizeClasses[size],
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Royal Skeleton Components
export function RoyalCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden',
        className,
      )}
    >
      <div className="aspect-square bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 animate-pulse" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20 animate-pulse" />
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function RoyalPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32 animate-pulse" />
            <div className="flex space-x-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 animate-pulse" />
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20 animate-pulse" />
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-64 mb-8 animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <RoyalCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Royal Error Component
interface RoyalErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function RoyalError({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content.',
  onRetry,
  className,
}: RoyalErrorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        'bg-red-50 border border-red-200 rounded-xl',
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
      >
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </motion.div>

      <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-red-700 mb-4 max-w-md">{message}</p>

      {onRetry && (
        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </motion.button>
      )}
    </div>
  );
}
