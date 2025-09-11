import type { MenuItem } from '@/lib/types';
import { shopifyFetch } from '@/lib/shopify';

import Header from '../components/Header';
import Footer from '../components/Footer';
import HomeClient from './HomeClient';

import { getSiteUrl } from '@/lib/siteUrl';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    title: 'Lab Essentials',
    description: 'Premium Lab Equipment for Research and Industry',
    openGraph: {
      title: 'Lab Essentials',
      description: 'Premium Lab Equipment for Research and Industry',
      url: siteUrl,
      type: 'website',
      images: [
        {
          url: siteUrl + '/logo.svg',
          alt: 'Lab Essentials Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Lab Essentials',
      description: 'Premium Lab Equipment for Research and Industry',
      images: [siteUrl + '/logo.svg'],
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export default async function HomePage() {
  const collections = await getCollections();
  // TODO: Fetch real products for Collections/Bestsellers if needed
  return (
    <>
      <Header collections={collections} />
      <main
        id="main-content"
        className="container mx-auto px-4 lg:px-8 space-y-8 lg:space-y-12 bg-background"
        role="main"
      >
        <div className="bg-primary text-primary-foreground p-3 rounded-md">
          Tokens/Tailwind OK
        </div>
        <HomeClient collections={collections} />
      </main>
      <Footer />
    </>
  );
}

// GraphQL query for the menu with collection images
const MENU_QUERY = /* GraphQL */ `
  query Menu {
    menu(handle: "main-menu") {
      items {
        id
        title
        url
        items {
          id
                        const msg = err instanceof Error ? err.message : String(err);
          title
          url
          items {
            id
            title
            url
          }
        }
      }
    }
  }
`;

async function getCollections() {
  try {
    const response = await shopifyFetch<{
      data: { menu: { items: MenuItem[] } };
    }>({ query: MENU_QUERY });

    if (response.success) {
      return response.data.data.menu.items.map((item) => ({
        ...item,
        handle: item.url?.includes('/collections/')
          ? item.url.split('/collections/')[1]?.split('?')[0] ?? ''
          : item.title.toLowerCase(),
      }));
    }

    return [];
  } catch (err: unknown) {
    console.error(
      '[getCollections] Error fetching menu from Shopify Storefront API',
      err,
    );
    return [];
  }
}
