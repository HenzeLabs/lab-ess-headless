import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import SiteHeader from '@/components/layout/SiteHeader';
import FooterServer from '@/components/FooterServer';
import AnalyticsWrapper from '@/AnalyticsWrapper';
import { ErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
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
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
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
