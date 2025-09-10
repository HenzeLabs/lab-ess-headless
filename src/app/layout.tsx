import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lab Essentials",
  description: "Premium Lab Equipment for Research and Industry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
      <body className={`${inter.variable} font-sans bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
