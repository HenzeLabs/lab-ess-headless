'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const quickActions = [
  {
    href: '/collections/microscopes',
    label: 'Microscopes',
    isActive: (pathname: string) => pathname.startsWith('/collections/microscopes'),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    href: '/contact',
    label: 'Contact',
    isActive: (pathname: string) => pathname.startsWith('/contact'),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    href: '/collections/centrifuges',
    label: 'Centrifuges',
    isActive: (pathname: string) => pathname.startsWith('/collections/centrifuges'),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
  },
  {
    href: '/compare',
    label: 'Compare',
    isActive: (pathname: string) => pathname.startsWith('/compare'),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

export default function MobileQuickActions() {
  const pathname = usePathname();

  // Don't show on certain pages
  if (pathname.includes('/checkout') || pathname.includes('/cart')) {
    return null;
  }

  return (
    <div className="mobile-quick-actions fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 shadow-[0_-8px_20px_-12px_rgba(0,0,0,0.25)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-1 px-2 py-1.5">
        {quickActions.map((action) => {
          const active = action.isActive(pathname);
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center justify-center rounded-xl px-1 py-2 transition-colors ${
                active
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="mb-1">{action.icon}</span>
              <span className="text-[11px] font-medium leading-none">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}