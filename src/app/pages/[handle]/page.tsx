import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { shopifyFetch } from '@/lib/shopify';
import { getPageByHandleQuery } from '@/lib/queries';
import { absoluteUrl, jsonLd, stripHtml } from '@/lib/seo';
import { textStyles, layout } from '@/lib/ui';

export const revalidate = 60;

type ShopifyPage = {
  id: string;
  title: string;
  handle: string;
  body?: string | null;
  seo?: { title?: string | null; description?: string | null } | null;
};

async function getPage(handle: string): Promise<ShopifyPage | null> {
  if (typeof handle !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(handle)) {
    return null;
  }

  try {
    const response = await shopifyFetch<{ pageByHandle: ShopifyPage | null }>({
      query: getPageByHandleQuery,
      variables: { handle },
    });
    return response.data.pageByHandle ?? null;
  } catch (error) {
    // swallow and treat as not found to avoid leaking exceptions to end users
    console.error(`Failed to fetch page ${handle}:`, error);
    return null;
  }
}

// Basic sanitizer: remove <script>...</script> blocks
function sanitizeHtml(html?: string | null): string {
  if (!html) return '';
  let s = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  // Remove inline event handlers like onclick, onmouseover, etc.
  s = s.replace(/ on[a-zA-Z]+=\"[^"]*\"/gi, '');
  s = s.replace(/ on[a-zA-Z]+=\'[^']*\'/gi, '');
  // Remove javascript: URIs in href/src
  s = s.replace(/(href|src)=\"javascript:[^\"]*\"/gi, '$1="#"');
  s = s.replace(/(href|src)=\'javascript:[^\']*\'/gi, "$1='#'");
  return s;
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await paramsPromise;
  const page = await getPage(handle);

  if (!page) {
    return {
      title: 'Page Not Found | Lab Essentials',
      robots: { index: false, follow: true },
    };
  }

  const title = page.seo?.title ?? `${page.title} | Lab Essentials`;
  const description = page.seo?.description ?? stripHtml(page.body);
  const url = absoluteUrl(`/pages/${page.handle}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function PageByHandle({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await paramsPromise;
  const page = await getPage(handle);

  if (!page) {
    notFound();
  }

  const contentHtml = sanitizeHtml(page.body ?? '');

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
        name: page.title,
        item: absoluteUrl(`/pages/${page.handle}`),
      },
    ],
  };

  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: stripHtml(page.body),
    url: absoluteUrl(`/pages/${page.handle}`),
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
            <h1 className={`${textStyles.h2} text-foreground`}>{page.title}</h1>
          </header>

          <article
            className="prose prose-lg dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </main>
    </>
  );
}
