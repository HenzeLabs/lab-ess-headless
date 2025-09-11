import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is not set');
  }

  // TODO: Implement collections and products fetching for sitemap
  // These should be arrays of objects matching MetadataRoute.Sitemap[0]
  const collectionUrls: MetadataRoute.Sitemap = [];
  const productUrls: MetadataRoute.Sitemap = [];

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    ...collectionUrls,
    ...productUrls,
  ];
}
