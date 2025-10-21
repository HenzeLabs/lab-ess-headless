'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';

import { layout, buttonStyles } from '@/lib/ui';

export interface FooterLink {
  title: string;
  href: string;
}

interface FooterProps {
  shopLinks: FooterLink[];
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function Footer({ shopLinks }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');

  const normalizedLinks = useMemo(
    () =>
      shopLinks
        .filter((link) => link.title && link.href)
        .map((link) => ({
          title: link.title.trim(),
          href: link.href,
        })),
    [shopLinks],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || status === 'loading') {
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatus('error');
        setMessage(
          data?.error ?? 'We could not add you to the list. Please try again.',
        );
        return;
      }

      setStatus('success');
      setMessage('Thanks! Check your inbox to confirm your subscription.');
      setEmail('');
    } catch (error) {
      console.error('Footer newsletter signup failed', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <footer
      className="border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--body))]"
      data-test-id="footer"
    >
      <div className={`${layout.container} py-12 md:py-16`}>
        {/* Navigation Links */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3 mb-12">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {normalizedLinks.map((link) => (
                <li key={`${link.title}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[hsl(var(--ink))] transition hover:text-[hsl(var(--brand))]"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/collections/incubators-slide-preparation"
                  className="text-sm font-medium text-[hsl(var(--ink))] transition hover:text-[hsl(var(--brand))]"
                >
                  Incubators & Slide Preparation Equipment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/pages/about-lab-essentials"
                  className="text-sm font-medium text-[hsl(var(--ink))] transition hover:text-[hsl(var(--brand))]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/contact-us"
                  className="text-sm font-medium text-[hsl(var(--ink))] transition hover:text-[hsl(var(--brand))]"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@labessentials.com"
                  className="text-sm font-medium text-[hsl(var(--ink))] transition hover:text-[hsl(var(--brand))]"
                >
                  info@labessentials.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/support/shipping"
                  className="text-sm font-medium text-[hsl(var(--ink))] transition hover:text-[hsl(var(--brand))]"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/support/returns"
                  className="text-sm font-medium text-[hsl(var(--ink))] transition hover:text-[hsl(var(--brand))]"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/support/faq"
                  className="text-sm font-medium text-[hsl(var(--ink))] transition hover:text-[hsl(var(--brand))]"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section - Full Width Below */}
        <div className="pt-8 pb-4">
          <div className="bg-white rounded-lg border-2 border-[hsl(var(--border))] p-8 mx-auto max-w-2xl text-center shadow-md">
            <h3 className="text-lg font-bold uppercase tracking-wider text-[hsl(var(--ink))] mb-4 letter-spacing-[0.1em]">
              Stay Informed
            </h3>
            <p className="text-sm text-[hsl(var(--ink))]/80 leading-relaxed mb-6 max-w-md mx-auto font-medium">
              Join 1,200+ labs getting new product updates, how-to guides, and
              exclusive offers—straight to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  name="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={status === 'loading'}
                  className="flex-1 rounded-md border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm text-[hsl(var(--ink))] transition focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20"
                  data-test-id="newsletter-email-input"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`${buttonStyles.primary} px-5 py-2 text-sm font-medium whitespace-nowrap`}
                >
                  {status === 'loading' ? 'Submitting…' : 'Subscribe'}
                </button>
              </div>
              <div className="mt-2 min-h-[1rem] text-xs" aria-live="polite">
                {message ? (
                  <p
                    className={
                      status === 'error'
                        ? 'text-red-500'
                        : 'text-[hsl(var(--brand))]'
                    }
                  >
                    {message}
                  </p>
                ) : null}
              </div>
            </form>
            <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              We respect your inbox. Unsubscribe anytime.
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 border-t border-[hsl(var(--border))] pt-8">
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
              <svg
                className="h-8 w-8 text-[hsl(var(--brand))]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="font-medium">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
              <svg
                className="h-8 w-8 text-[hsl(var(--brand))]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">Trusted by 1,200+ Labs</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
              <svg
                className="h-8 w-8 text-[hsl(var(--brand))]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Fast U.S. Shipping</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] pt-6 text-sm text-[hsl(var(--muted-foreground))]">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p>
              © {new Date().getFullYear()} Lab Essentials. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="transition hover:text-[hsl(var(--brand))]"
              >
                Privacy Policy
              </Link>
              <span aria-hidden="true">•</span>
              <Link
                href="/terms"
                className="transition hover:text-[hsl(var(--brand))]"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
