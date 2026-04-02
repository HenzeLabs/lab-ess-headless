import type { Product } from '@/lib/types';

const DEFAULT_SITE_URL = 'https://store.labessentials.com';
const ORGANIZATION_ID = '/#organization';
const WEBSITE_ID = '/#website';
const ORGANIZATION_NAME = 'Lab Essentials';
const ORGANIZATION_DESCRIPTION =
  'Premium lab equipment for research and industry.';
const ORGANIZATION_LOGO_PATH = '/logo.svg';
const ORGANIZATION_FACEBOOK_URL = 'https://www.facebook.com/labessentials';
const ORGANIZATION_INFO_EMAIL = 'info@labessentials.com';
const ORGANIZATION_SUPPORT_EMAIL = 'support@labessentials.com';
const ORGANIZATION_PHONE = '1-800-LAB-HELP';

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

type BreadcrumbItem = {
  name: string;
  item: string;
};

type FAQItem = {
  question: string;
  answer: string;
};

const toSchemaAvailability = (product: Product): string | undefined => {
  const variants = product.variants?.edges ?? [];

  if (variants.length === 0) {
    return undefined;
  }

  return variants.some((edge) => edge.node.availableForSale)
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
};

const getProductBrand = (product: Product): string => {
  const rawBrand = product.metafields?.find(
    (field) => field?.key === 'brand' && field.value?.trim().length,
  )?.value;

  return rawBrand?.trim() || ORGANIZATION_NAME;
};

const getProductImageUrls = (product: Product): string[] | undefined => {
  const urls = [
    product.featuredImage?.url,
    ...(product.images?.edges?.map((edge) => edge.node.url) ?? []),
  ].filter((value): value is string => Boolean(value));

  const uniqueUrls = Array.from(new Set(urls));
  return uniqueUrls.length > 0 ? uniqueUrls : undefined;
};

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': absoluteUrl(ORGANIZATION_ID),
  name: ORGANIZATION_NAME,
  url: absoluteUrl('/'),
  description: ORGANIZATION_DESCRIPTION,
  email: ORGANIZATION_INFO_EMAIL,
  telephone: ORGANIZATION_PHONE,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl(ORGANIZATION_LOGO_PATH),
  },
  sameAs: [ORGANIZATION_FACEBOOK_URL],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: ORGANIZATION_SUPPORT_EMAIL,
      telephone: ORGANIZATION_PHONE,
      url: absoluteUrl('/support/contact'),
      availableLanguage: ['en'],
    },
  ],
});

export const generateWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': absoluteUrl(WEBSITE_ID),
  url: absoluteUrl('/'),
  name: ORGANIZATION_NAME,
  publisher: {
    '@id': absoluteUrl(ORGANIZATION_ID),
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${absoluteUrl('/search')}?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((entry, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: entry.name,
    item: entry.item,
  })),
});

export const generateFAQPageSchema = (items: FAQItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((entry) => ({
    '@type': 'Question',
    name: entry.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: entry.answer,
    },
  })),
});

export const generateProductSchema = (product: Product) => {
  const productUrl = absoluteUrl(`/products/${product.handle}`);
  const description = stripHtml(product.descriptionHtml);
  const availability = toSchemaAvailability(product);
  const category =
    product.collections?.edges?.[0]?.node.title ?? product.tags?.[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    url: productUrl,
    description: description || undefined,
    image: getProductImageUrls(product),
    category,
    brand: {
      '@type': 'Brand',
      name: getProductBrand(product),
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode ?? 'USD',
      price: product.priceRange?.minVariantPrice?.amount,
      url: productUrl,
      availability,
    },
  };
};
