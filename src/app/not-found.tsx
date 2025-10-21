import type { Metadata } from 'next';
import Link from 'next/link';
import { textStyles, buttonStyles } from '@/lib/ui';

export const metadata: Metadata = {
  title: 'Page Not Found | Lab Essentials',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const popularLinks = [
    { href: '/collections/microscopes', label: 'Microscopes' },
    { href: '/collections/centrifuges', label: 'Centrifuges' },
    {
      href: '/collections/microscope-camera-monitors',
      label: 'Camera Monitors',
    },
    { href: '/support/contact', label: 'Contact Support' },
  ];

  return (
    <main
      role="main"
      className="flex items-center justify-center min-h-screen bg-background px-4"
    >
      <div className="max-w-2xl w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8 flex justify-center">
          <svg
            className="w-32 h-32 text-[hsl(var(--brand))]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* 404 Heading */}
        <h1
          className={`${textStyles.h1} text-7xl font-bold text-foreground mb-4`}
        >
          404
        </h1>

        {/* Error Message */}
        <p
          className={`${textStyles.h3} text-foreground mb-4`}
          data-test-id="error-message"
        >
          Page Not Found
        </p>

        <p
          className={`${textStyles.bodyLarge} text-muted-foreground mb-12 max-w-md mx-auto`}
        >
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The
          page may have been moved, deleted, or the URL might be incorrect.
        </p>

        {/* Primary CTA */}
        <div className="mb-12">
          <Link
            href="/"
            className={`${buttonStyles.primary} text-lg px-8 py-4 inline-flex items-center gap-2`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Return to Homepage
          </Link>
        </div>

        {/* Popular Links */}
        <div>
          <p
            className={`${textStyles.bodySmall} text-muted-foreground uppercase tracking-wide mb-4 font-semibold`}
          >
            Popular Pages
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[hsl(var(--brand))] bg-[hsl(var(--brand))]/10 rounded-lg hover:bg-[hsl(var(--brand))]/20 transition-colors border border-[hsl(var(--brand))]/20"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className={`${textStyles.body} text-muted-foreground`}>
            Need help finding something?{' '}
            <Link
              href="/support/contact"
              className="text-[hsl(var(--brand))] hover:underline font-medium"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
