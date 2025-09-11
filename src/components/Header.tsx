'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  Input,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from './ui';
import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  title: string;
  url?: string;
  items?: MenuItem[];
  handle?: string;
  image?: {
    url: string;
    altText?: string;
  } | null;
}

// Extract handle from Shopify URL
function extractHandle(url: string | undefined): string {
  if (!url) return '';
  const matches = url.match(/\/collections\/([^?]+)/);
  return matches ? matches[1] : '';
}

// Determine item type from URL

function getItemType(
  url: string | undefined,
): 'collection' | 'product' | 'page' {
  if (!url) return 'page';
  if (url.includes('/collections/')) return 'collection';
  if (url.includes('/products/')) return 'product';
  return 'page';
}

// Get appropriate action text for item type
function getActionText(url: string | undefined): string {
  const type = getItemType(url);
  switch (type) {
    case 'collection':
      return 'View Collection';
    case 'product':
      return 'View Product';
    case 'page':
      return 'View Page';
    default:
      return 'View';
  }
}

interface HeaderProps {
  collections: MenuItem[];
}

export default function Header({ collections }: HeaderProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Process all menu items while preserving order and adding handles
  const menuItems = collections.map((item) => ({
    ...item,
    handle: extractHandle(item.url),
    hasMegaMenu: item.items && item.items.length > 0,
  }));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (handle: string) => setActiveMenu(handle);
  const handleMouseLeave = () => setActiveMenu(null);

  return (
    <div
      className={`sticky top-0 z-50 bg-background transition-shadow duration-200 ${
        isScrolled ? 'shadow-md' : 'border-b border-border'
      }`}
    >
      <header className="relative">
        {/* Announcement Bar */}
        <div className="w-full bg-primary text-primary-foreground text-sm py-2.5 px-4 text-center font-medium">
          Free Shipping on Orders Over $300 - No Hassle Returns
        </div>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          {/* Logo Row and nav/actions */}
          <div className="w-full flex justify-between items-center pt-5 pb-1">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Lab Essentials"
                width={100}
                height={40}
                className="h-20 w-auto"
              />
            </Link>
            {/* Desktop nav and actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <nav
                aria-label="Main"
                className="flex items-center justify-center flex-1 px-8"
              >
                <ul className="flex items-center space-x-1">
                  {menuItems.map((menuItem) => (
                    <li
                      key={menuItem.handle || menuItem.title}
                      className="relative"
                      onMouseEnter={
                        menuItem.hasMegaMenu
                          ? () => handleMouseEnter(menuItem.handle)
                          : undefined
                      }
                      onMouseLeave={
                        menuItem.hasMegaMenu ? handleMouseLeave : undefined
                      }
                    >
                      {menuItem.hasMegaMenu ? (
                        <Button
                          variant="ghost"
                          className="px-4 py-2 text-sm font-medium flex items-center gap-1"
                        >
                          {menuItem.title}
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 12 12"
                          >
                            <path
                              d="M3 4.5L6 7.5L9 4.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          variant="link"
                          className="px-4 py-2 text-sm font-medium"
                        >
                          <Link
                            href={
                              menuItem.url || `/collections/${menuItem.handle}`
                            }
                          >
                            {menuItem.title}
                          </Link>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
              <form role="search" className="hidden lg:block">
                <Input
                  inputSize="md"
                  placeholder="Search..."
                  className="max-w-xs"
                />
              </form>
              <Button asChild variant="ghost">
                <Link href="/account" aria-label="Account">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/cart" aria-label="Cart" className="relative">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                    />
                  </svg>
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                    0
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Koala-style Mega Menu Panels */}
        {menuItems
          .filter((item) => item.hasMegaMenu)
          .map((menuItem) => (
            <div
              key={menuItem.handle}
              className={`absolute top-full left-0 right-0 bg-background shadow-2xl border-t border-border transition-all duration-500 ease-out ${
                activeMenu === menuItem.handle
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-4'
              }`}
              onMouseEnter={() => handleMouseEnter(menuItem.handle)}
              onMouseLeave={handleMouseLeave}
              style={{ zIndex: 40 }}
            >
              {/* Full-width background with subtle gradient */}
              <div className="bg-gradient-to-b from-white via-gray-50/30 to-white">
                <div className="max-w-[1440px] mx-auto px-8 py-16">
                  {/* Enhanced Header Section */}
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-12 text-center lg:text-left">
                    <div className="mb-6 lg:mb-0">
                      <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-3 tracking-tight">
                        {menuItem.title}
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-md">
                        Discover our premium range of professional{' '}
                        {menuItem.title.toLowerCase()} for research and industry
                      </p>
                    </div>
                    <Link
                      href={menuItem.url || `/collections/${menuItem.handle}`}
                      className="inline-flex items-center bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:scale-105"
                    >
                      <span>SHOP ALL {menuItem.title.toUpperCase()}</span>
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  </div>

                  {/* Enhanced Grid of Sub-Menu Items */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-12">
                    {menuItem.items
                      ?.filter(
                        (item) =>
                          item.title &&
                          item.title.trim() !== '' &&
                          (item.url || item.handle),
                      )
                      .map((subMenuItem, index) => (
                        <Link
                          key={subMenuItem.handle || subMenuItem.title}
                          href={
                            subMenuItem.url ||
                            `/collections/${subMenuItem.handle}`
                          }
                          className="group text-center hover:transform hover:scale-105 transition-all duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Product/Collection Image */}
                          <div className="relative aspect-square bg-gradient-to-br from-muted to-background rounded-full mb-5 overflow-hidden group-hover:shadow-xl transition-all duration-300 border-4 border-white">
                            {subMenuItem.image?.url ? (
                              <Image
                                src={`/placeholders/collection${
                                  (index % 2) + 1
                                }.jpg`}
                                alt={subMenuItem.title}
                                fill
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/25 flex items-center justify-center relative">
                                <span className="text-3xl lg:text-4xl font-bold text-primary/70 group-hover:text-primary transition-colors duration-300">
                                  {subMenuItem.title.charAt(0)}
                                </span>
                              </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            {/* Subtle border ring on hover */}
                            <div className="absolute inset-0 rounded-full border-2 border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Enhanced title styling */}
                          <h3 className="text-sm lg:text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300 leading-snug px-2">
                            {subMenuItem.title}
                          </h3>

                          {/* Dynamic description based on item type */}
                          <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {getActionText(subMenuItem.url)}
                          </p>
                        </Link>
                      ))}
                  </div>

                  {/* Enhanced Bottom Section with Features */}
                  <div className="pt-8 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Trust signals with new content */}
                      <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-3 text-center md:text-left">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          {/* Satisfaction Guaranteed icon */}
                          <svg
                            className="w-5 h-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            Satisfaction Guaranteed
                          </p>
                          <p className="text-xs text-muted-foreground">
                            We stand by our products and aim for your complete
                            satisfaction.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-3 text-center md:text-left">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          {/* Secure Checkout icon */}
                          <svg
                            className="w-5 h-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="8"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                            <path
                              d="M7 11V7a5 5 0 0110 0v4"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            Secure Checkout
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Your transactions are protected with our secure
                            checkout process.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-3 text-center md:text-left">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          {/* Trusted by Labs icon */}
                          <svg
                            className="w-5 h-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75M12 17a4 4 0 004-4V7a4 4 0 10-8 0v6a4 4 0 004 4z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            Trusted by 1,200+ Labs
                          </p>
                          <p className="text-xs text-muted-foreground">
                            We are a trusted partner for leading healthcare
                            suppliers worldwide
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </header>
    </div>
  );
}
