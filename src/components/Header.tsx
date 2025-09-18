'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';
import type { MenuItem } from '@/lib/types';
import { Search, User, ShoppingCart, X } from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';

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

interface HeaderProps {
  collections: MenuItem[];
  logoUrl: string;
  shopName: string;
  logoAlt?: string;
  cartItemCount: number;
}

function formatTitleCase(title: string) {
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

export default function Header({
  collections,
  logoUrl,
  shopName,
  logoAlt,
  cartItemCount,
}: HeaderProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const menuItems = collections.map((item) => ({
    ...item,
    handle: extractHandle(item.url),
  }));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseEnter = (handle: string) => setActiveMenu(handle);
  const handleMouseLeave = () => setActiveMenu(null);

  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBar />
        <div
          className={`bg-background transition-shadow duration-200 ${
            isScrolled ? 'shadow-md' : ''
          }`}
        >
          <header className="relative bg-[hsl(var(--bg))]">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-3 items-center py-4">
              {/* Left empty for spacing or future elements */}
              <div></div>
              {/* Logo */}
              <div className="flex justify-center">
                <Link href="/" className="flex items-center justify-center gap-3">
                  <Image
                    src={logoUrl}
                    alt={logoAlt || shopName}
                    width={240}
                    height={80}
                    className="h-[72px] w-auto object-contain drop-shadow-sm"
                    priority
                  />
                </Link>
              </div>
              {/* Icons */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Open search"
                  className="h-14 w-14 rounded-full hover:bg-[#4e2cfb] hover:text-white"
                >
                  <Search className="h-8 w-8" />
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-14 w-14 rounded-full hover:bg-[#4e2cfb] hover:text-white"
                >
                  <Link href="/account" aria-label="Account">
                    <User className="h-8 w-8" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="relative h-14 w-14 rounded-full hover:bg-[#4e2cfb] hover:text-white"
                >
                  <Link href="/cart" aria-label="Cart">
                    <ShoppingCart className="h-9 w-9" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium z-10">
                      {cartItemCount}
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
            {/* Main nav */}
            <div className="border-b border-border">
              <nav aria-label="Main" className="hidden lg:flex items-center justify-center py-2">
                {menuItems.length === 0 ? (
                  <div className="text-red-600 font-bold py-2">No navigation items found.</div>
                ) : (
                  <ul className="flex items-center space-x-2">
                    {menuItems.filter(item => item.handle && item.title).map(menuItem => (
                      <li
                        key={menuItem.handle || menuItem.title}
                        className="relative"
                        onMouseEnter={menuItem.hasMegaMenu ? () => handleMouseEnter(menuItem.handle) : undefined}
                        onMouseLeave={menuItem.hasMegaMenu ? handleMouseLeave : undefined}
                      >
                        {menuItem.hasMegaMenu ? (
                          <Button
                            variant="ghost"
                            className="px-4 py-2 text-base font-medium flex items-center gap-1"
                            aria-haspopup="true"
                            aria-expanded={activeMenu === menuItem.handle}
                          >
                            {menuItem.title}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 12 12">
                              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Button>
                        ) : (
                          <Button asChild variant="link" className="px-4 py-2 text-base font-medium">
                            <Link href={menuItem.url || `/collections/${menuItem.handle}`}>{menuItem.title}</Link>
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </nav>
            </div>
          </div>

          {/* Mega Menu Panels */}
          {menuItems.filter(item => item.hasMegaMenu).map(menuItem => (
            <div
              key={menuItem.handle}
              className={`absolute top-full bg-background shadow-2xl border-t border-border transition-all duration-300 ease-in-out left-1/2 -translate-x-1/2 ${
                activeMenu === menuItem.handle
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-4'
              }`}
              onMouseEnter={() => handleMouseEnter(menuItem.handle)}
              onMouseLeave={handleMouseLeave}
              style={{ zIndex: 40, width: '80vw', maxWidth: '1200px' }}
              role="menu"
              tabIndex={-1}
            >
              {/* Full-width background with subtle gradient */}
              <div className="bg-gradient-to-b from-white via-gray-50/30 to-white">
                <div className="max-w-[1440px] mx-auto px-8 py-16">
                  {/* Enhanced Header Section */}
                  <div className="mb-12 text-center lg:text-left">
                    <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4 tracking-tight">
                      {formatTitleCase(menuItem.title)}
                    </h2>
                    <Link
                      href={menuItem.url || `/collections/${menuItem.handle}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-10 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-700 hover:text-white"
                    >
                      <span>Shop All {formatTitleCase(menuItem.title)}</span>
                      <svg
                        className="w-4 h-4"
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
                          <div className="relative aspect-square bg-gradient-to-br from-muted to-background rounded-full mb-5 overflow-hidden shadow-xl transition-all duration-300 border-4 border-white">
                            {subMenuItem.image?.url || subMenuItem.fallbackImageUrl ? (
                              <Image
                                src={subMenuItem.image?.url || subMenuItem.fallbackImageUrl || ''}
                                alt={subMenuItem.title}
                                fill
                                className="w-full h-full object-cover transition-transform duration-300 scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/25 flex items-center justify-center relative">
                                <span className="text-3xl lg:text-4xl font-bold text-primary/70 group-hover:text-primary transition-colors duration-300">
                                  {subMenuItem.title.charAt(0)}
                                </span>
                              </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-primary/20 opacity-100 transition-all duration-300" />
                            {/* Subtle border ring on hover */}
                            <div className="absolute inset-0 rounded-full border-2 border-primary/30 opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Enhanced title styling */}
                          <h3 className="text-sm lg:text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300 leading-snug px-2">
                            {formatTitleCase(subMenuItem.title)}
                          </h3>
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
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full max-w-2xl p-4">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-foreground/70 hover:text-foreground"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <X className="h-8 w-8" />
            </Button>
            <form role="search">
              <Input
                inputSize="lg"
                placeholder="Search for products..."
                className="w-full text-2xl"
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
