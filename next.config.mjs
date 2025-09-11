import createBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.shopify.com', 'shopify.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const csp = isDev
      ? [
          "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
          'object-src *',
          'base-uri *',
          'connect-src *',
          'img-src * data: blob:',
          "style-src 'self' 'unsafe-inline' data: blob:",
          'frame-ancestors *',
        ].join('; ') + ';'
      : [
          "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
          "object-src 'none'",
          "base-uri 'self'",
          "connect-src 'self' https://cdn.shopify.com",
          "img-src 'self' data: https://cdn.shopify.com https://images.pexels.com https://images.ctfassets.net",
          "style-src 'self' 'unsafe-inline'",
          "frame-ancestors 'none'",
        ].join('; ') + ';';
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
