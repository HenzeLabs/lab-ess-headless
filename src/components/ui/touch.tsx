'use client';

import { useEffect, useState, ReactNode, useCallback } from 'react';
import { motion } from 'framer-motion';

// Touch gesture types
interface TouchGestureProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  className?: string;
}

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
  refreshingElement?: ReactNode;
}

interface CarouselProps {
  children: ReactNode[];
  className?: string;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onSlideChange?: (index: number) => void;
}

// Touch Gestures Component (simplified)
export const TouchGestures: React.FC<TouchGestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  threshold = 50,
  className = '',
}) => {
  const [lastTap, setLastTap] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });

    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;

    // Check for swipe gestures
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
        return;
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
        return;
      }
    } else {
      if (deltaY > threshold && onSwipeDown) {
        onSwipeDown();
        return;
      } else if (deltaY < -threshold && onSwipeUp) {
        onSwipeUp();
        return;
      }
    }

    // Handle tap gestures
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTap;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0 && onDoubleTap) {
        onDoubleTap();
        setLastTap(0);
      } else {
        if (onTap) {
          setTimeout(() => {
            if (Date.now() - now > 200) return;
            onTap();
          }, 200);
        }
        setLastTap(now);
      }
    }
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
};

// Simplified Pull to Refresh
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  className = '',
  refreshingElement,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && window.scrollY === 0 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 z-10 transition-transform"
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.5, 32) - 64}px)`,
          opacity: Math.min(pullDistance / threshold, 1),
        }}
      >
        {refreshingElement || (
          <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg">
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Refreshing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7-7m0 0l-7 7m7-7v18"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  {pullDistance > threshold
                    ? 'Release to refresh'
                    : 'Pull to refresh'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.3, 20)}px)`,
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Touch-friendly Carousel
export const TouchCarousel: React.FC<CarouselProps> = ({
  children,
  className = '',
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  onSlideChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);

  const totalSlides = children.length;

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      setCurrentTranslate(-index * 100);
      onSlideChange?.(index);
    },
    [onSlideChange],
  );

  const nextSlide = useCallback(() => {
    const newIndex = (currentIndex + 1) % totalSlides;
    goToSlide(newIndex);
  }, [currentIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    const newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    goToSlide(newIndex);
  }, [currentIndex, totalSlides, goToSlide]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isDragging) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, isDragging, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const movePercent = (diff / window.innerWidth) * 100;
    setCurrentTranslate(-currentIndex * 100 + movePercent);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const moved = currentTranslate + currentIndex * 100;

    if (moved > 20) {
      prevSlide();
    } else if (moved < -20) {
      nextSlide();
    } else {
      setCurrentTranslate(-currentIndex * 100);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Slides container */}
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          width: `${totalSlides * 100}%`,
          transform: `translateX(${currentTranslate}%)`,
          touchAction: 'pan-x',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows (hidden on mobile) */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg hidden md:block"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg hidden md:block"
        aria-label="Next slide"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

// Mobile-optimized button
export const TouchButton: React.FC<{
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hapticFeedback?: boolean;
}> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  hapticFeedback = true,
}) => {
  const baseClasses =
    'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px]',
  };

  const handleTap = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onClick();
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onTap={handleTap}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.button>
  );
};
