/**
 * Nav Component
 *
 * Handles main navigation with mega menu functionality.
 * Manages navigation state, menu interactions, and dropdown menus.
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Navigation item interface
 */
interface NavItem {
  /** Display name of the navigation item */
  name: string;
  /** URL path for the navigation item */
  href: string;
  /** Optional child items for dropdown menus */
  children?: NavItem[];
  /** Whether this item has a mega menu */
  hasMegaMenu?: boolean;
  /** Optional description for mega menu items */
  description?: string;
  /** Whether this item is featured */
  featured?: boolean;
}

/**
 * Props interface for Nav component
 */
interface NavProps {
  /** Navigation menu items */
  navigationItems: NavItem[];
  /** Optional custom class name for styling */
  className?: string;
  /** Whether mobile menu is currently open */
  isMobileMenuOpen?: boolean;
  /** Callback when mobile menu open state changes */
  onMobileMenuToggle?: (isOpen: boolean) => void;
  /** Optional test id for testing */
  testId?: string;
}

/**
 * Nav Component
 *
 * Features:
 * - Responsive navigation with mobile menu
 * - Mega menu support for complex navigation
 * - Keyboard navigation and accessibility
 * - Hover and focus states
 * - ARIA compliance for screen readers
 * - Click outside to close functionality
 * - Escape key handling
 *
 * @param props - Nav component props
 * @returns React component for main navigation
 *
 * @example
 * ```tsx
 * <Nav
 *   navigationItems={navItems}
 *   className="custom-nav-styles"
 *   isMobileMenuOpen={false}
 *   onMobileMenuToggle={setMobileMenuOpen}
 * />
 * ```
 */
export default function Nav({
  navigationItems = [],
  className = '',
  isMobileMenuOpen = false,
  onMobileMenuToggle,
  testId = 'main-nav',
}: NavProps) {
  // Active menu state (null means no menu is open)
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState<boolean>(isMobileMenuOpen);

  // Refs for menu elements
  const navRef = useRef<HTMLElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Track focus for accessibility
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  /**
   * Handles opening/closing of mega menu
   * Manages active menu state and focus
   *
   * @param menuName - Name of the menu to toggle
   */
  const handleMenuToggle = useCallback((menuName: string) => {
    setActiveMenu((current) => (current === menuName ? null : menuName));
  }, []);

  /**
   * Closes all open menus
   * Resets active menu state
   */
  const closeAllMenus = useCallback(() => {
    setActiveMenu(null);
  }, []);

  /**
   * Handles mobile menu toggle
   * Updates both internal state and calls parent callback
   *
   * @param isOpen - Whether mobile menu should be open
   */
  const handleMobileMenuToggle = useCallback(
    (isOpen?: boolean) => {
      const newState = isOpen ?? !mobileMenuOpen;
      setMobileMenuOpen(newState);
      onMobileMenuToggle?.(newState);
    },
    [mobileMenuOpen, onMobileMenuToggle],
  );

  /**
   * Handles keyboard navigation
   * Supports arrow keys, escape, enter, and space
   *
   * @param event - Keyboard event
   * @param item - Navigation item being interacted with
   * @param index - Index of the navigation item
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, item: NavItem, index: number) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (item.children) {
            handleMenuToggle(item.name);
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          closeAllMenus();
          break;

        case 'ArrowLeft':
          event.preventDefault();
          setFocusedIndex(Math.max(0, index - 1));
          break;

        case 'ArrowRight':
          event.preventDefault();
          setFocusedIndex(Math.min(navigationItems.length - 1, index + 1));
          break;

        case 'Escape':
          event.preventDefault();
          closeAllMenus();
          setFocusedIndex(-1);
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (item.children) {
            handleMenuToggle(item.name);
          }
          break;
      }
    },
    [navigationItems.length, handleMenuToggle, closeAllMenus],
  );

  /**
   * Effect hook for click outside functionality
   * Closes menus when clicking outside the navigation
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        closeAllMenus();
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu, closeAllMenus]);

  /**
   * Effect hook for escape key handling
   * Closes menus when escape is pressed
   */
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllMenus();
        handleMobileMenuToggle(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [closeAllMenus, handleMobileMenuToggle]);

  /**
   * Sync mobile menu state with prop
   */
  useEffect(() => {
    setMobileMenuOpen(isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  /**
   * Renders mega menu content for navigation items with children
   *
   * @param item - Navigation item with children
   * @returns JSX for mega menu content
   */
  const renderMegaMenu = (item: NavItem) => {
    if (!item.children || activeMenu !== item.name) return null;

    return (
      <div
        ref={megaMenuRef}
        className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 z-50"
        role="menu"
        aria-labelledby={`nav-${item.name}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {item.children.map((child) => (
              <div key={child.name} className="space-y-4">
                <Link
                  href={child.href}
                  className="block text-lg font-semibold text-gray-900 hover:text-[hsl(var(--brand))] transition-colors duration-200"
                  role="menuitem"
                  tabIndex={0}
                  onClick={closeAllMenus}
                >
                  {child.name}
                </Link>

                {child.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {child.description}
                  </p>
                )}

                {child.children && (
                  <ul className="space-y-2">
                    {child.children.map((grandchild) => (
                      <li key={grandchild.name}>
                        <Link
                          href={grandchild.href}
                          className="text-sm text-gray-700 hover:text-[hsl(var(--brand))] transition-colors duration-200"
                          role="menuitem"
                          tabIndex={0}
                          onClick={closeAllMenus}
                        >
                          {grandchild.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renders mobile navigation menu
   *
   * @returns JSX for mobile menu
   */
  const renderMobileMenu = () => {
    if (!mobileMenuOpen) return null;

    return (
      <div className="lg:hidden fixed inset-0 z-50 bg-white">
        {/* Mobile menu header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            onClick={() => handleMobileMenuToggle(false)}
            aria-label="Close mobile menu"
            className="h-10 w-10 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile menu content */}
        <nav
          className="overflow-y-auto max-h-[calc(100vh-80px)]"
          role="navigation"
        >
          <ul className="py-4">
            {navigationItems.map((item) => (
              <li
                key={item.name}
                className="border-b border-gray-100 last:border-b-0"
              >
                <div className="px-4 py-3">
                  <Link
                    href={item.href}
                    className="block text-lg font-medium text-gray-900 hover:text-[hsl(var(--brand))] transition-colors duration-200"
                    onClick={() => handleMobileMenuToggle(false)}
                  >
                    {item.name}
                  </Link>

                  {item.children && (
                    <ul className="mt-3 ml-4 space-y-2">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <Link
                            href={child.href}
                            className="block text-base text-gray-700 hover:text-[hsl(var(--brand))] transition-colors duration-200"
                            onClick={() => handleMobileMenuToggle(false)}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <>
      {/* Main Navigation */}
      <nav
        ref={navRef}
        className={`relative ${className}`}
        role="navigation"
        aria-label="Main navigation"
        data-test-id={testId}
      >
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          className="lg:hidden h-14 w-14 rounded-full hover:bg-[hsl(var(--brand))] hover:text-white transition-colors duration-200"
          onClick={() => handleMobileMenuToggle()}
          aria-label="Open mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex space-x-1" role="menubar">
          {navigationItems.map((item, index) => (
            <li key={item.name} role="none">
              <Button
                variant="ghost"
                className="relative h-14 px-4 rounded-none hover:bg-[hsl(var(--brand))] hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))]"
                onMouseEnter={() => item.children && setActiveMenu(item.name)}
                onMouseLeave={() => item.children && setActiveMenu(null)}
                onClick={() =>
                  item.children ? handleMenuToggle(item.name) : null
                }
                onKeyDown={(e) => handleKeyDown(e, item, index)}
                aria-expanded={
                  item.children ? activeMenu === item.name : undefined
                }
                aria-haspopup={item.children ? 'menu' : undefined}
                id={`nav-${item.name}`}
                role="menuitem"
                tabIndex={focusedIndex === index ? 0 : -1}
              >
                {item.children ? (
                  <span className="flex items-center space-x-1">
                    <span>{item.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        activeMenu === item.name ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="w-full h-full flex items-center"
                  >
                    {item.name}
                  </Link>
                )}
              </Button>

              {/* Mega Menu */}
              {renderMegaMenu(item)}
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Menu Overlay */}
      {renderMobileMenu()}
    </>
  );
}

/**
 * Custom hook for navigation state management
 * Can be used in parent components to manage navigation state
 *
 * @returns Object with navigation state and control functions
 *
 * @example
 * ```tsx
 * const { activeMenu, mobileMenuOpen, toggleMobileMenu, closeAllMenus } = useNavigation();
 * ```
 */
export function useNavigation() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = useCallback((isOpen?: boolean) => {
    setMobileMenuOpen((prev) => isOpen ?? !prev);
  }, []);

  const closeAllMenus = useCallback(() => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
  }, []);

  const toggleMenu = useCallback((menuName: string) => {
    setActiveMenu((current) => (current === menuName ? null : menuName));
  }, []);

  return {
    activeMenu,
    mobileMenuOpen,
    toggleMobileMenu,
    closeAllMenus,
    toggleMenu,
    setActiveMenu,
  };
}

/**
 * Default navigation items for common e-commerce site structure
 * Can be customized based on site requirements
 */
export const defaultNavigationItems: NavItem[] = [
  {
    name: 'Products',
    href: '/products',
    children: [
      {
        name: 'All Products',
        href: '/products',
        description: 'Browse our complete product catalog',
      },
      {
        name: 'New Arrivals',
        href: '/products?filter=new',
        description: 'Latest additions to our collection',
      },
      {
        name: 'Best Sellers',
        href: '/products?filter=bestsellers',
        description: 'Most popular items',
      },
      {
        name: 'Sale',
        href: '/products?filter=sale',
        description: 'Discounted products',
      },
    ],
  },
  {
    name: 'Collections',
    href: '/collections',
    children: [
      {
        name: 'Featured Collections',
        href: '/collections',
        description: 'Curated product collections',
      },
      {
        name: 'Seasonal',
        href: '/collections/seasonal',
        description: 'Season-specific products',
      },
    ],
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
