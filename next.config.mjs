/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["cdn.shopify.com", "shopify.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; object-src 'none'; base-uri 'self'; connect-src 'self' https://cdn.shopify.com; img-src 'self' data: https://cdn.shopify.com https://images.pexels.com https://images.ctfassets.net; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
