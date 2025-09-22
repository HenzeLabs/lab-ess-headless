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
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Shop
            </h3>
            <ul className="mt-4 space-y-3">
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
            </ul>
          </div>

          <div className="rounded-3xl border border-white/25 bg-white/90 p-8 shadow-[0_35px_85px_-48px_rgba(10,13,40,0.35)] backdrop-blur">
            <h3 className="text-lg font-semibold text-[hsl(var(--ink))]">
              Stay in the loop
            </h3>
            <p className="mt-2 text-sm text-[hsl(var(--body))]/80">
              Get lab-ready launches, supply drops, and guides—straight to your
              inbox.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                name="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@labessentials.com"
                required
                disabled={status === 'loading'}
                className="w-full rounded-full border border-[hsl(var(--border))] bg-white px-5 py-3 text-sm text-[hsl(var(--ink))] shadow-sm transition focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/40"
                data-test-id="newsletter-email-input"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`${buttonStyles.primary} px-6 py-3 text-sm`}
              >
                {status === 'loading' ? 'Submitting…' : 'Subscribe'}
              </button>
            </form>
            <div className="mt-2 min-h-[1.5rem] text-sm" aria-live="polite">
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
            <div className="mt-6 text-xs text-[hsl(var(--muted-foreground))]">
              We respect your inbox. Unsubscribe anytime.
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[hsl(var(--border))] pt-6 text-sm text-[hsl(var(--muted-foreground))]">
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
