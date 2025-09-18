import Link from 'next/link';

import { shopifyFetch } from '@/lib/shopify';
import { getHomepageCollectionsQuery } from '@/lib/queries';
import { buttonStyles, layout, textStyles } from '@/lib/ui';
import { CollectionImage } from '@/components/CollectionImage';

interface CollectionNode {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
  products?: {
    edges: {
      node: {
        id: string;
        featuredImage?: {
          url: string;
          altText?: string | null;
        } | null;
      };
    }[];
  } | null;
}

export default async function FeaturedCollections() {
  let collections: CollectionNode[] = [];

  try {
    const response = await shopifyFetch<{
      collections: {
        edges: { node: CollectionNode }[];
      };
    }>({
      query: getHomepageCollectionsQuery,
      variables: { first: 4 },
    });

    collections = response.data.collections?.edges.map((edge) => edge.node) ?? [];
  } catch (error) {
    console.error('Failed to load featured collections', error);
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="bg-[hsl(var(--bg))]">
      <div className={`${layout.container} ${layout.section}`}>
        <div className="mb-10 max-w-3xl">
          <h2 className={textStyles.heading}>Shop by Collection</h2>
          <p className={`mt-4 ${textStyles.subheading}`}>
            Explore curated categories tailored for modern laboratories and research teams.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {collections.map((collection) => {
            const fallbackProductImage =
              collection.products?.edges?.[0]?.node.featuredImage ?? null;

            const imageUrl = collection.image?.url || fallbackProductImage?.url;
            const imageAlt =
              collection.image?.altText ||
              fallbackProductImage?.altText ||
              `${collection.title} collection image`;

            const collectionHref = `/collections/${collection.handle}`;

            return (
              <article
                key={collection.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-surface shadow-subtle transition hover:-translate-y-1 hover:shadow-card focus-within:ring-2 focus-within:ring-[hsl(var(--brand))]"
              >
                <Link
                  href={collectionHref}
                  className="relative block aspect-[4/3] overflow-hidden"
                  aria-label={`${collection.title} collection`}
                >
                  <CollectionImage
                    src={imageUrl}
                    alt={imageAlt}
                    fallbackKey={collection.title}
                    width={480}
                    height={360}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-semibold text-heading">
                      <Link
                        href={collectionHref}
                        className="transition hover:text-[hsl(var(--brand))]"
                      >
                        {collection.title}
                      </Link>
                    </h3>
                    <p className="text-base text-body/80 line-clamp-3">
                      {collection.description ||
                        'Equip your team with lab-tested essentials built for reliability.'}
                    </p>
                  </div>
                  <Link
                    href={collectionHref}
                    className={`${buttonStyles.primary} mt-6 w-full justify-center sm:w-auto`}
                  >
                    Shop collection
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 5l6 5-6 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
