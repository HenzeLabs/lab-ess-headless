/**
 * Refactored Header Component
 *
 * Main header component that orchestrates smaller components.
 * Handles server-side data and passes props to child components.
 * Provides responsive design and accessibility features.
 */
'use client';

import { useState, useEffect } from 'react';
import type { ErrorInfo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { MenuItem } from '@/lib/types';
import AnnouncementBar from '@/components/AnnouncementBar';
import Nav from '@/components/header/Nav';
import Search from '@/components/header/Search';
import CartPreview from '@/components/header/CartPreview';
import HeaderErrorBoundary from '@/components/ErrorBoundary';
import { Button } from './ui/button';
import { User } from 'lucide-react';

/**
 * Props interface for Header component
 */
interface HeaderProps {
  /** Collection menu items from CMS/API */
  collections: MenuItem[];
  /** Logo image URL */
  logoUrl: string;
  /** Shop name for accessibility */
  shopName: string;
  /** Alt text for logo image */
  logoAlt?: string;
  /** Initial cart item count from server */
  cartItemCount: number;
}

/**
 * Navigation item interface for Nav component
 */
interface NavItem {
  name: string;
  href: string;
  children?: NavItem[];
  hasMegaMenu?: boolean;
  description?: string;
  featured?: boolean;
}

/**
 * Utility function to extract handle from URL
 * Converts collection URLs to handles for routing
 *
 * @param url - Collection URL from CMS
 * @returns Handle string for routing
 */
function extractHandle(url: string | undefined): string {
  if (!url) return '';
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/');
    return pathParts[pathParts.length - 1] || '';
  } catch (e) {
    const parts = url.split('/');
    return parts[parts.length - 1] || '';
  }
}

/**
 * Utility function to format titles in proper case
 * Handles uppercase strings and converts to title case
 *
 * @param title - Raw title string
 * @returns Formatted title in proper case
 */
function formatTitleCase(title: string): string {
  const trimmed = title?.trim() ?? '';
  if (!trimmed) return '';

  const upper = trimmed.toUpperCase();
  if (trimmed === upper) {
    return trimmed
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return trimmed;
}

/**
 * Transforms CMS collections into navigation structure
 * Converts MenuItem array to NavItem array for Nav component
 *
 * @param collections - Collections from CMS/API
 * @returns Navigation items for Nav component
 */
function transformCollectionsToNavItems(collections: MenuItem[]): NavItem[] {
  // Process collections into navigation structure
  const navigationItems: NavItem[] = [
    {
      name: 'Products',
      href: '/products',
      children: collections.map((collection) => ({
        name: formatTitleCase(collection.title),
        href: collection.url || `/collections/${extractHandle(collection.url)}`,
        description: `Browse ${formatTitleCase(collection.title)} collection`,
      })),
    },
    {
      name: 'Collections',
      href: '/collections',
    },
    {
      name: 'About',
      href: '/about',
    },
    {
      name: 'Support',
      href: '/support',
    },
  ];

  return navigationItems;
}

/**
 * Header Component
 *
 * Features:
 * - Responsive design with mobile navigation
 * - Announcement bar integration
 * - Logo with proper accessibility
 * - Decomposed navigation components
 * - Search functionality
 * - Live cart count updates
 * - User account access
 * - Scroll state tracking
 * - Error boundary protection
 *
 * @param props - Header component props
 * @returns React component for site header
 *
 * @example
 * ```tsx
 * <Header
 *   collections={collections}
 *   logoUrl="/logo.svg"
 *   shopName="My Shop"
 *   cartItemCount={3}
 * />
 * ```
 */
function HeaderComponent({
  collections,
  logoUrl,
  shopName,
  logoAlt = `${shopName} logo`,
  cartItemCount,
}: HeaderProps) {
  // Scroll state for header styling
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  /**
   * Effect hook for scroll state tracking
   * Updates header appearance based on scroll position
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Effect hook for global keyboard shortcuts
   * Handles escape key to close mobile menu
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Handles mobile menu toggle
   * Updates mobile menu state
   *
   * @param isOpen - Whether mobile menu should be open
   */
  const handleMobileMenuToggle = (isOpen: boolean) => {
    setIsMobileMenuOpen(isOpen);
  };

  // Transform collections for navigation component
  const navigationItems = transformCollectionsToNavItems(collections);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200'
          : 'bg-white'
      }`}
      role="banner"
      data-test-id="site-header"
    >
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Mobile Menu + Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle - Rendered by Nav component */}
            <Nav
              navigationItems={navigationItems}
              isMobileMenuOpen={isMobileMenuOpen}
              onMobileMenuToggle={handleMobileMenuToggle}
              className="lg:hidden"
            />

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#4e2cfb] rounded-lg"
              aria-label={`${shopName} home page`}
              data-test-id="header-logo"
            >
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={120}
                height={40}
                className="h-8 w-auto sm:h-10"
                priority
                sizes="(max-width: 640px) 120px, 150px"
              />
            </Link>
          </div>

          {/* Center Section: Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center">
            <Nav
              navigationItems={navigationItems}
              className="flex-1 max-w-2xl"
            />
          </div>

          {/* Right Section: Search, Account, Cart */}
          <div className="flex items-center space-x-2">
            {/* Search Component */}
            <Search className="hover:scale-105" testId="header-search" />

            {/* User Account Button */}
            <Button
              asChild
              variant="ghost"
              className="h-14 w-14 rounded-full hover:bg-[#4e2cfb] hover:text-white transition-colors duration-200"
            >
              <Link
                href="/account"
                aria-label="My account"
                data-test-id="header-account"
              >
                <User className="h-9 w-9" />
              </Link>
            </Button>

            {/* Cart Preview Component */}
            <CartPreview
              initialCartCount={cartItemCount}
              className="hover:scale-105"
              testId="header-cart"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Header component wrapped with error boundary
 * Provides resilient header that handles component failures gracefully
 */
export default function Header(props: HeaderProps) {
  return (
    <HeaderErrorBoundary
      fallback={
        <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                {props.shopName}
              </Link>
              <nav className="hidden lg:flex space-x-8">
                <Link href="/products" className="hover:text-[#4e2cfb]">
                  Products
                </Link>
                <Link href="/collections" className="hover:text-[#4e2cfb]">
                  Collections
                </Link>
                <Link href="/about" className="hover:text-[#4e2cfb]">
                  About
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                <Link href="/cart" className="hover:text-[#4e2cfb]">
                  Cart
                </Link>
              </div>
            </div>
          </div>
        </header>
      }
      onError={(error: Error, errorInfo: ErrorInfo) => {
        console.error('Header component error:', error, errorInfo);

        // Log to Sentry if available
        if (typeof window !== 'undefined' && window.Sentry) {
          window.Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
                errorBoundary: 'Header',
              },
            },
            tags: {
              component: 'Header',
              section: 'header',
            },
          });
        }
      }}
    >
      <HeaderComponent {...props} />
    </HeaderErrorBoundary>
  );
}

/**
 * Type definitions for window extensions
 * Ensures TypeScript compatibility with global analytics
 */
declare global {
  interface Window {
    Sentry?: {
      captureException: (
        error: Error,
        context?: Record<string, unknown>,
      ) => void;
    };
  }
}
