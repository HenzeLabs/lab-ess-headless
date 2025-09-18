const DEFAULT_SITE_URL = 'https://www.labessentials.com';

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl = rawSiteUrl && rawSiteUrl.length > 0
  ? rawSiteUrl.replace(/\/$/, '')
  : DEFAULT_SITE_URL;

export const absoluteUrl = (path: string = ''): string => {
  if (!path) return siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const jsonLd = (data: unknown): { __html: string } => ({
  __html: JSON.stringify(data).replace(/</g, '\\u003c'),
});

export const stripHtml = (value?: string | null): string => {
  if (!value) return '';
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};
