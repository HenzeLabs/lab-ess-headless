'use client';

import React, { useEffect, useRef, useState } from 'react';

import { layout, textStyles } from '@/lib/ui';
import { trackNewsletterSignup } from '@/lib/analytics';

interface EmailSignupProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
}

const EmailSignup: React.FC<EmailSignupProps> = ({
  title = 'Stay Updated',
  subtitle = "Get exclusive deals and be the first to know about new laboratory equipment arrivals",
  buttonText = "Subscribe",
  placeholder = 'Enter your email'
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const setAutoReset = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      setStatus('idle');
      setStatusMessage('');
    }, 5000);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || status === 'loading') {
      return;
    }

    setStatus('loading');
    setStatusMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage = data?.error ?? 'We could not complete your signup. Please try again.';
        setStatus('error');
        setStatusMessage(errorMessage);
        setAutoReset();
        return;
      }

      setStatus('success');
      setStatusMessage('Thank you for subscribing! Check your inbox for confirmation.');
      setEmail('');
      trackNewsletterSignup(email);
      setAutoReset();
    } catch (error) {
      console.error('Newsletter signup failed', error);
      setStatus('error');
      setStatusMessage('Something went wrong. Please try again.');
      setAutoReset();
    }
  };

  return (
    <section className="relative isolate overflow-hidden px-4 py-24">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[hsl(var(--ink))] via-[hsl(var(--brand))] to-[hsl(var(--accent))]" />
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[hsl(var(--accent))]/45 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-[hsl(var(--brand))]/25 blur-3xl" />
      </div>

      <div className={`${layout.container} relative mx-auto max-w-5xl`}> 
        <div
          ref={containerRef}
          className="relative isolate overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-10 text-center text-white shadow-[0_35px_85px_-40px_rgba(8,11,34,0.85)] backdrop-blur-xl transition-all duration-700 ease-out opacity-0 translate-y-10 [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 sm:p-14"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="relative space-y-6">
            <h2 className={`${textStyles.heading} text-balance text-3xl font-semibold text-white sm:text-4xl md:text-5xl`}>
              {title}
            </h2>
            <p className="mx-auto max-w-2xl text-base text-white/80 sm:text-lg">
              {subtitle}
            </p>

            <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-full border border-white/30 bg-white/10 px-6 py-3 text-base text-white placeholder:text-white/60 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.75)] transition focus:border-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[rgba(8,13,40,0.45)]"
                required
                disabled={status === 'loading'}
                aria-invalid={status === 'error'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(var(--brand))_0%,hsl(var(--brand-dark))_100%)] px-6 text-base font-semibold text-white shadow-[0_18px_48px_-18px_rgba(8,12,32,0.85)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(8,13,40,0.45)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" role="status" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Sending…
                  </span>
                ) : status === 'success' ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Subscribed
                  </span>
                ) : (
                  buttonText
                )}
              </button>
            </form>

            <div className="min-h-[1.5rem]" aria-live="polite" role="status">
              {statusMessage && (
                <p
                  className={`text-sm ${
                    status === 'error' ? 'text-red-200' : 'text-white/80'
                  }`}
                >
                  {statusMessage}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                No spam, ever
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M5 9V7a5 5 0 0110 0v2" />
                  <path d="M7 12h10" />
                  <path d="M7 16h6" />
                  <path d="M4 11v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Secure & private
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 2l3 7h7l-5.5 4.1L18 21l-6-4-6 4 1.5-7.9L2 9h7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Instant updates
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailSignup;
