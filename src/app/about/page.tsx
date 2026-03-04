import type { Metadata } from 'next';

import { shopifyFetch } from '@/lib/shopify';
import { getPageByHandleQuery } from '@/lib/queries';
import { absoluteUrl, jsonLd, stripHtml } from '@/lib/seo';
import { layout, textStyles } from '@/lib/ui';

export const revalidate = 60;

type ShopifyPage = {
  id: string;
  title: string;
  handle: string;
  body?: string | null;
  seo?: { title?: string | null; description?: string | null } | null;
};

const ABOUT_PAGE_HANDLES = ['about-lab-essentials', 'about-us', 'about'];

const FALLBACK_TITLE = 'About Us | Lab Essentials';
const FALLBACK_DESCRIPTION =
  'Learn about Lab Essentials - your trusted partner for quality laboratory equipment, microscopes, and scientific products. Reliable products backed by expert U.S. support.';

async function getAboutPage(): Promise<ShopifyPage | null> {
  for (const handle of ABOUT_PAGE_HANDLES) {
    try {
      const response = await shopifyFetch<{ pageByHandle: ShopifyPage | null }>(
        {
          query: getPageByHandleQuery,
          variables: { handle },
        },
      );

      if (response.data.pageByHandle) {
        return response.data.pageByHandle;
      }
    } catch (error) {
      console.error(
        `Failed to fetch Shopify page "${handle}" for /about:`,
        error,
      );
    }
  }

  return null;
}

function sanitizeHtml(html?: string | null): string {
  if (!html) return '';
  let content = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/ on[a-zA-Z]+="[^"]*"/gi, '');
  content = content.replace(/ on[a-zA-Z]+=\'[^']*\'/gi, '');
  content = content.replace(/(href|src)="javascript:[^"]*"/gi, '$1="#"');
  content = content.replace(/(href|src)=\'javascript:[^']*\'/gi, "$1='#'");
  return content;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage();

  const title = page?.seo?.title ?? page?.title ?? FALLBACK_TITLE;
  const description =
    page?.seo?.description ?? stripHtml(page?.body) ?? FALLBACK_DESCRIPTION;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl('/about') },
    openGraph: {
      title,
      description,
      url: absoluteUrl('/about'),
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function AboutPage() {
  const page = await getAboutPage();
  const pageTitle = page?.title ?? 'About Lab Essentials';
  const contentHtml = sanitizeHtml(page?.body);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: absoluteUrl('/about'),
      },
    ],
  };

  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: stripHtml(page?.body) || FALLBACK_DESCRIPTION,
    url: absoluteUrl('/about'),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(pageJsonLd)}
      />

      <main
        id="main-content"
        className="bg-background py-12 lg:py-20"
        role="main"
      >
        <div className={`${layout.container} max-w-4xl mx-auto`}>
          <header className="mb-8">
            <h1 className={`${textStyles.h2} text-foreground`}>{pageTitle}</h1>
          </header>

          {contentHtml ? (
            <article
              className="prose prose-lg dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : (
            <article className="prose prose-lg dark:prose-invert">
              <p>
                We make lab operations simpler by providing reliable, affordable
                equipment that&apos;s easy to use.
              </p>
              <p>
                Whether you&apos;re teaching future scientists or managing a
                clinical lab, Lab Essentials helps you get dependable products
                backed by responsive U.S. support.
              </p>
            </article>
          )}
        </div>
      </main>
    </>
  );
}
