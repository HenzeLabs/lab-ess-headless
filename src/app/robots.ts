import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Fallback to staging URL for local/CI builds where NEXT_PUBLIC_SITE_URL is not set
  // Production environments (Vercel/Netlify) should always set NEXT_PUBLIC_SITE_URL
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.lab-essentials.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
