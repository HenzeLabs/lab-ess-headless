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
  content = content.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<\/?(?:o:p|xml|meta|link|title)[^>]*>/gi, '');
  content = content.replace(/ on[a-zA-Z]+="[^"]*"/gi, '');
  content = content.replace(/ on[a-zA-Z]+=\'[^']*\'/gi, '');
  content = content.replace(/(href|src)="javascript:[^"]*"/gi, '$1="#"');
  content = content.replace(/(href|src)=\'javascript:[^']*\'/gi, "$1='#'");
  content = content.replace(/\sstyle="[^"]*"/gi, '');
  content = content.replace(/\sstyle=\'[^']*\'/gi, '');
  content = content.replace(/\sclass="[^"]*"/gi, '');
  content = content.replace(/\sclass=\'[^']*\'/gi, '');
  content = content.replace(/<span[^>]*>/gi, '');
  content = content.replace(/<\/span>/gi, '');
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
  const pageDescription = page?.seo?.description ?? FALLBACK_DESCRIPTION;

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
        className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16"
        role="main"
      >
        <div className={`${layout.container} max-w-5xl mx-auto`}>
          <header className="text-center mb-10">
            <h1 className={`${textStyles.h2} text-[hsl(var(--ink))] mb-4`}>
              {pageTitle}
            </h1>
            {!contentHtml && (
              <p className="text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto line-clamp-3">
                {pageDescription}
              </p>
            )}
          </header>

          {contentHtml ? (
            <div className="bg-white border-2 border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
              <article
                className="prose prose-lg max-w-none prose-headings:text-[hsl(var(--ink))] prose-p:text-[hsl(var(--muted-foreground))] prose-a:text-[hsl(var(--brand))] dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </div>
          ) : (
            <div className="bg-white border-2 border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
              <article className="prose prose-lg max-w-none prose-p:text-[hsl(var(--muted-foreground))] dark:prose-invert">
                <p>
                  We make lab operations simpler by providing reliable,
                  affordable equipment that&apos;s easy to use.
                </p>
                <p>
                  Whether you&apos;re teaching future scientists or managing a
                  clinical lab, Lab Essentials helps you get dependable products
                  backed by responsive U.S. support.
                </p>
              </article>
            </div>
          )}

          <section className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="bg-white border-2 border-border/50 rounded-xl p-5 shadow-sm text-center">
              <div className="flex items-center justify-center mb-3">
                <svg
                  className="h-6 w-6 text-[hsl(var(--brand))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-bold text-[hsl(var(--ink))] mb-1">
                1-Year Warranty
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Reliable products backed by dependable coverage.
              </p>
            </div>

            <div className="bg-white border-2 border-border/50 rounded-xl p-5 shadow-sm text-center">
              <div className="flex items-center justify-center mb-3">
                <svg
                  className="h-6 w-6 text-[hsl(var(--brand))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <h2 className="text-base font-bold text-[hsl(var(--ink))] mb-1">
                Free Shipping Over $300
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Fast U.S. fulfillment for qualifying orders.
              </p>
            </div>

            <div className="bg-white border-2 border-border/50 rounded-xl p-5 shadow-sm text-center">
              <div className="flex items-center justify-center mb-3">
                <svg
                  className="h-6 w-6 text-[hsl(var(--brand))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-bold text-[hsl(var(--ink))] mb-1">
                U.S.-Based Support
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Friendly help from real experts when you need it.
              </p>
            </div>
          </section>

          <section className="mt-10 bg-gradient-to-br from-[hsl(var(--brand))]/10 via-[hsl(var(--brand))]/5 to-[hsl(var(--accent))]/10 border-2 border-[hsl(var(--brand))]/20 rounded-2xl p-8 md:p-10 text-center shadow-lg">
            <h2 className="text-2xl font-bold text-[hsl(var(--ink))] mb-3">
              Need Help Choosing the Right Equipment?
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-2xl mx-auto">
              Contact our team for product guidance, quote support, and
              technical questions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/support/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-6 py-3 text-sm font-semibold text-white shadow-subtle transition-all duration-200 ease-out-soft hover:-translate-y-[1px] hover:bg-[hsl(var(--brand-dark))] hover:text-white hover:shadow-card"
              >
                Contact Us
              </a>
              <a
                href="/collections"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--brand))]/30 bg-white px-6 py-3 text-sm font-semibold text-[hsl(var(--ink))] transition hover:bg-[hsl(var(--brand))]/5"
              >
                Browse Products
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
