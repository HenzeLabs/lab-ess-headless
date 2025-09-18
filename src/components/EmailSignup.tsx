'use client';

import React, { useState, useEffect, useRef } from 'react';
import { layout, textStyles } from '@/lib/ui';

interface EmailSignupProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
}

const EmailSignup: React.FC<EmailSignupProps> = ({
  title = "Stay Updated with New Equipment",
  subtitle = "Get exclusive deals and be the first to know about new laboratory equipment arrivals",
  buttonText = "Subscribe",
  placeholder = "Enter your email"
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in', 'fade-in', 'scale-95', 'duration-700');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--ink))] via-[hsl(var(--ink))]/90 to-[hsl(var(--brand))]" />

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 h-72 w-72 animate-pulse rounded-full bg-[hsl(var(--bg))] blur-3xl" />
        <div
          className="absolute bottom-0 right-0 h-96 w-96 animate-pulse rounded-full bg-[hsl(var(--brand))] blur-3xl"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div ref={containerRef} className={`relative ${layout.container} max-w-4xl opacity-0 text-center`}>
        <h2 className={`${textStyles.heading} text-[hsl(var(--bg))] md:text-5xl lg:text-6xl`}>
          {title}
        </h2>
        <p className="mx-auto mt-6 mb-12 max-w-2xl text-xl text-[hsl(var(--bg))]/80">
          {subtitle}
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-full border-2 border-[hsl(var(--bg))]/30 bg-[hsl(var(--bg))]/10 px-6 py-4 pr-32 text-lg text-[hsl(var(--bg))] placeholder-[hsl(var(--bg))]/60 backdrop-blur-md transition-all duration-300 focus:border-[hsl(var(--bg))]/50 focus:outline-none"
              required
            />
            <button
              type="submit"
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6 py-2 font-semibold transition-all duration-300 ${
                isSubmitted
                  ? 'bg-[hsl(var(--brand))] text-[hsl(var(--bg))]'
                  : 'bg-[hsl(var(--bg))] text-[hsl(var(--ink))] hover:bg-[hsl(var(--bg))]/90'
              }`}
            >
              {isSubmitted ? '✓' : buttonText}
            </button>
          </div>

          {isSubmitted && (
            <p className="mt-4 animate-in fade-in text-[hsl(var(--bg))]/80 duration-500">
              Thank you for subscribing! Check your email for confirmation.
            </p>
          )}
        </form>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-[hsl(var(--bg))]/70">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            No spam, ever
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure & Private
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Instant Updates
          </span>
        </div>
      </div>
    </section>
  );
};

export default EmailSignup;
