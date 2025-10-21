import './globals.css';
import type { Metadata } from 'next';
import { Montserrat, Roboto, Roboto_Mono } from 'next/font/google';
import SiteHeader from '@/components/layout/SiteHeader';
import FooterServer from '@/components/FooterServer';
import AnalyticsWrapper from '@/AnalyticsWrapper';
import { ErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';

// Montserrat for headings (H1-H3)
const heading = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

// Roboto for body text
const sans = Roboto({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
});

// Roboto Mono for code/specs
const mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
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
        <link
          rel="preconnect"
          href="https://cdn.shopify.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
            `,
          }}
        />
        <script
          async
          src="https://www.googletagmanager.com/gtm.js?id=GTM-WNG6Z9ZD"
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
