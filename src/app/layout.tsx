import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { CheckoutOptimizationProvider } from '@/components/AdvancedCheckoutOptimization';
// import PrivacyCompliantAnalytics from '@/components/PrivacyCompliantAnalytics';
import CookieConsent from '@/components/CookieConsent';
import CartAbandonmentRecovery from '@/components/CartAbandonmentRecovery';
import LiveChatWidget from '@/components/LiveChatWidget';
import SiteHeader from '@/components/layout/SiteHeader';
import FooterServer from '@/components/FooterServer';
import {
  ErrorBoundary,
  ComponentErrorBoundary,
} from '@/components/error-boundaries/EnhancedErrorBoundary';

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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'Lab Essentials',
  description: 'Premium Lab Equipment for Research and Industry',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lab Essentials',
  },
  icons: {
    icon: [
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
  },
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

        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lab Essentials" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered: ', registration);
                  })
                  .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                  });
              }
            `,
          }}
        />

        {/* GA/Clarity example: */}
        {/* <script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" strategy="afterInteractive"></script> */}
        {/* <script src="https://www.clarity.ms/tag/CLARITY_ID" strategy="lazyOnload"></script> */}
      </head>
      <body>
        <ErrorBoundary level="critical" context="application">
          <CheckoutOptimizationProvider>
            {/* <PrivacyCompliantAnalytics> */}
            <CartAbandonmentRecovery />
            <LiveChatWidget />
            <ComponentErrorBoundary context="header">
              <SiteHeader />
            </ComponentErrorBoundary>
            {children}
            <ComponentErrorBoundary context="footer">
              <FooterServer />
            </ComponentErrorBoundary>
            {/* </PrivacyCompliantAnalytics> */}
            <CookieConsent />
          </CheckoutOptimizationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
