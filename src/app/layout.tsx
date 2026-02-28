import './globals.css';
import type { Metadata } from 'next';
import { Montserrat, Roboto, Roboto_Mono } from 'next/font/google';
import SiteHeader from '@/components/layout/SiteHeader';
import FooterServer from '@/components/FooterServer';
import AnalyticsWrapper from '@/AnalyticsWrapper';
import { ErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';
import { SearchProvider } from '@/components/providers/SearchProvider';
import { CartProvider } from '@/components/providers/CartContext';
import dynamic from 'next/dynamic';

// Dynamic import for mobile quick actions
const MobileQuickActions = dynamic(
  () => import('@/components/MobileQuickActions'),
);

// Montserrat for headings (H1-H3) - Optimized: 400, 700 only
const heading = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'optional', // Use fallback immediately if font not cached - prevents render blocking
  weight: ['400', '700'],
  preload: true, // Preload critical font
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

// Roboto for body text - Optimized: 400, 700 only
const sans = Roboto({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'optional', // Use fallback immediately if font not cached - prevents render blocking
  weight: ['400', '700'],
  preload: true, // Preload critical font
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

// Roboto Mono for code/specs - Optimized: 400 only (rarely used)
const mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'optional', // Use fallback immediately if font not cached
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
  const headerPromise = SiteHeader()
    .then((node) => node)
    .catch((error) => {
      console.error('RootLayout: SiteHeader failed', error);
      return null;
    });

  const footerPromise = FooterServer()
    .then((node) => node)
    .catch((error) => {
      console.error('RootLayout: FooterServer failed', error);
      return null;
    });

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

        {/* GTM - Inline for immediate execution before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-WNG6Z9ZD');
            `,
          }}
        />
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
          <CartProvider>
            <SearchProvider>
              <AnalyticsWrapper />
              <ErrorBoundary level="component" context="header">
                {headerPromise}
              </ErrorBoundary>
              {children}
              <MobileQuickActions />
              <ErrorBoundary level="component" context="footer">
                {footerPromise}
              </ErrorBoundary>
            </SearchProvider>
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
