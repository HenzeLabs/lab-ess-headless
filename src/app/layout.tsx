import './globals.css';
import type { Metadata } from 'next';
import { Montserrat, Roboto, Roboto_Mono } from 'next/font/google';
import SiteHeader from '@/components/layout/SiteHeader';
import FooterServer from '@/components/FooterServer';
import AnalyticsWrapper from '@/AnalyticsWrapper';
import { ErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';

// Montserrat for headings (H1-H3) - Optimized: 400, 700 only
const heading = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '700'],
  preload: true, // Preload critical font
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

// Roboto for body text - Optimized: 400, 700 only
const sans = Roboto({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '700'],
  preload: true, // Preload critical font
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

// Roboto Mono for code/specs - Optimized: 400 only (rarely used)
const mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400'],
  preload: false, // Don't preload - used sparingly
  fallback: ['ui-monospace', 'monospace'],
});

export const metadata: Metadata = {
  title: 'Lab Essentials',
  description: 'Premium Lab Equipment for Research and Industry',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        {/* HIGHEST priority - Preload hero poster for instant LCP */}
        <link
          rel="preload"
          href="/hero.avif"
          as="image"
          type="image/avif"
          fetchPriority="high"
        />

        {/* CRITICAL preconnects - Essential for LCP and FCP */}
        <link
          rel="preconnect"
          href="https://cdn.shopify.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* MEDIUM priority - GTM loads afterInteractive but preconnect saves ~200ms */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* LOW priority - dns-prefetch for deferred scripts */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://cdn.taboola.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {/* Prefetch hero video for faster playback (low priority) */}
        <link rel="prefetch" href="/hero.mp4" as="video" type="video/mp4" />

        {/* Note: GTM/GA4 scripts moved to AnalyticsWrapper with proper loading strategies */}
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WNG6Z9ZD"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <ErrorBoundary level="app" context="application">
          <AnalyticsWrapper />
          <ErrorBoundary level="component" context="header">
            <SiteHeader />
          </ErrorBoundary>
          {children}
          <ErrorBoundary level="component" context="footer">
            <FooterServer />
          </ErrorBoundary>
        </ErrorBoundary>
      </body>
    </html>
  );
}
