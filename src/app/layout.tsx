import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

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
        {/* Uncomment and update if using GA4 or Clarity */}
        {/* <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" /> */}
        {/* <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="anonymous" /> */}
      </head>
      <body>{children}</body>
    </html>
  );
}
