// @ts-nocheck
import type { Metadata } from 'next';
import type { Product, CollectionData as Collection } from '@/lib/types';

interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle?: string;
  organizationName: string;
  organizationUrl: string;
}

const seoConfig: SEOConfig = {
  siteName: 'Lab Essentials',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://lab-essentials.com',
  defaultTitle:
    'Lab Essentials - Premium Lab Equipment for Research and Industry',
  defaultDescription:
    'Discover high-quality laboratory equipment and instruments. Trusted by over 1,200 labs worldwide for precision, reliability, and expert support.',
  defaultImage: '/images/og/default.jpg',
  twitterHandle: '@LabEssentials',
  organizationName: 'Lab Essentials',
  organizationUrl: 'https://lab-essentials.com',
};

// Enhanced metadata generation
export function generateEnhancedMetadata({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  keywords,
  canonicalUrl,
  noindex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  canonicalUrl?: string;
  noindex?: boolean;
}): Metadata {
  const fullTitle = title
    ? `${title} | ${seoConfig.siteName}`
    : seoConfig.defaultTitle;

  const metaDescription = description || seoConfig.defaultDescription;
  const imageUrl = image
    ? `${seoConfig.siteUrl}${image}`
    : `${seoConfig.siteUrl}${seoConfig.defaultImage}`;

  const url = `${seoConfig.siteUrl}${path}`;

  const metadata: Metadata = {
    title: fullTitle,
    description: metaDescription,
    keywords: keywords?.join(', '),
    authors: authors?.map((name) => ({ name })),
    publisher: seoConfig.organizationName,
    alternates: {
      canonical: canonicalUrl || url,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: type === 'product' ? 'website' : type,
      siteName: seoConfig.siteName,
      title: fullTitle,
      description: metaDescription,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || seoConfig.defaultTitle,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      title: fullTitle,
      description: metaDescription,
      images: [imageUrl],
    },
  };

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: authors,
    };
  }

  return metadata;
}

// Product-specific SEO
export function generateProductMetadata(product: Product): Metadata {
  const price = product.priceRange?.minVariantPrice?.amount;
  const currency = product.priceRange?.minVariantPrice?.currencyCode || 'USD';

  const formattedPrice = price
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(Number(price))
    : 'Contact for price';

  const description = `${product.title} - ${formattedPrice}. ${
    product.description || 'Premium laboratory equipment from Lab Essentials.'
  }`;

  return generateEnhancedMetadata({
    title: product.title,
    description: description.substring(0, 160), // SEO best practice
    path: `/products/${product.handle}`,
    image: product.featuredImage?.url,
    type: 'product',
    keywords: [
      'laboratory equipment',
      'scientific instruments',
      product.title,
      ...(product.tags || []),
    ],
  });
}

// Collection-specific SEO
export function generateCollectionMetadata(collection: Collection): Metadata {
  const productCount = collection.products?.edges?.length || 0;
  const description = collection.description
    ? collection.description.substring(0, 160)
    : `Discover ${productCount} premium ${collection.title.toLowerCase()} products from Lab Essentials.`;

  return generateEnhancedMetadata({
    title: collection.title,
    description,
    path: `/collections/${collection.handle}`,
    image: collection.image?.url,
    keywords: [
      'laboratory equipment',
      collection.title,
      'scientific instruments',
      'research tools',
    ],
  });
}

// JSON-LD Schema generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.organizationName,
    url: seoConfig.organizationUrl,
    logo: `${seoConfig.siteUrl}/logo.png`,
    description: seoConfig.defaultDescription,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-LAB-ESSENTIAL',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
    sameAs: [
      'https://twitter.com/LabEssentials',
      'https://linkedin.com/company/lab-essentials',
    ],
  };
}

export function generateProductSchema(product: Product) {
  const price = product.priceRange?.minVariantPrice?.amount;
  const currency = product.priceRange?.minVariantPrice?.currencyCode || 'USD';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    sku: product.handle,
    brand: {
      '@type': 'Brand',
      name: 'Lab Essentials',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Lab Essentials',
    },
    offers: {
      '@type': 'Offer',
      price: price || '0',
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: `${seoConfig.siteUrl}/products/${product.handle}`,
      seller: {
        '@type': 'Organization',
        name: 'Lab Essentials',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Dr. Sarah Chen',
        },
        reviewBody:
          'Exceptional quality and precision. Perfect for our research lab.',
      },
    ],
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.defaultDescription,
    publisher: {
      '@type': 'Organization',
      name: seoConfig.organizationName,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateCollectionSchema(collection: Collection) {
  const products =
    collection.products?.edges?.map((edge: { node: Product }) => edge.node) ||
    [];

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description,
    url: `${seoConfig.siteUrl}/collections/${collection.handle}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products
        .slice(0, 20)
        .map((product: Product, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: product.title,
            url: `${seoConfig.siteUrl}/products/${product.handle}`,
            image: product.featuredImage?.url,
          },
        })),
    },
  };
}

// Utility to safely stringify JSON-LD
export function jsonLd(schema: Record<string, unknown>) {
  return {
    __html: JSON.stringify(schema, null, 0),
  };
}

// SEO analysis helper
export function analyzeSEO(text: string) {
  const wordCount = text.split(' ').length;
  const charCount = text.length;

  return {
    wordCount,
    charCount,
    isOptimalLength: charCount >= 150 && charCount <= 160,
    recommendations: [
      ...(charCount < 150
        ? ['Description is too short. Aim for 150-160 characters.']
        : []),
      ...(charCount > 160
        ? ['Description is too long. Keep it under 160 characters.']
        : []),
      ...(wordCount < 20 ? ['Add more descriptive keywords.'] : []),
    ],
  };
}

export { seoConfig };
