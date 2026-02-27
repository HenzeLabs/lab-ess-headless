'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileQuickActions() {
  const pathname = usePathname();

  // Don't show on certain pages
  if (pathname.includes('/checkout') || pathname.includes('/cart')) {
    return null;
  }

  return (
    <div className="mobile-quick-actions fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-4 gap-0">
        {/* Shop Microscopes - Most clicked */}
        <Link
          href="/collections/microscopes"
          className="flex flex-col items-center justify-center py-3 px-2 hover:bg-blue-50 transition-colors"
        >
          <svg
            className="w-5 h-5 mb-1 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-xs text-gray-700">Microscopes</span>
        </Link>

        {/* Contact - Second most clicked */}
        <Link
          href="/contact"
          className="flex flex-col items-center justify-center py-3 px-2 hover:bg-green-50 transition-colors"
        >
          <svg
            className="w-5 h-5 mb-1 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs text-gray-700">Contact</span>
        </Link>

        {/* Centrifuges - Popular category */}
        <Link
          href="/collections/centrifuges"
          className="flex flex-col items-center justify-center py-3 px-2 hover:bg-purple-50 transition-colors"
        >
          <svg
            className="w-5 h-5 mb-1 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-xs text-gray-700">Centrifuges</span>
        </Link>

        {/* Compare - New feature */}
        <Link
          href="/compare"
          className="flex flex-col items-center justify-center py-3 px-2 hover:bg-orange-50 transition-colors"
        >
          <svg
            className="w-5 h-5 mb-1 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-xs text-gray-700">Compare</span>
        </Link>
      </div>
    </div>
  );
}