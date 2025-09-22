import Link from 'next/link';
import Image from 'next/image';
import { shopifyFetch } from '@/lib/shopify';
import { getAllCollectionsQuery } from '@/lib/queries/getAllCollectionsQuery';
import { textStyles, layout, buttonStyles } from '@/lib/ui';

type ShopifyCollectionsResponse = {
  collections: {
    edges: Array<{
      node: {
        id: string;
        handle: string;
        title: string;
        description: string;
        image?: { url: string; altText?: string } | null;
        products?: {
          edges: Array<{
            node: {
              id: string;
              featuredImage?: {
                url: string;
                altText?: string;
              } | null;
            };
          }>;
        };
      };
    }>;
  };
};

async function getShopifyCollections() {
  const res = await shopifyFetch<ShopifyCollectionsResponse>({
    query: getAllCollectionsQuery,
    variables: { first: 250 },
  });

  const edges = res.data?.collections?.edges || [];
  const collections = edges.map(({ node }) => {
    // Use collection image if available, otherwise use first product's featured image
    const collectionImage = node.image?.url;
    const firstProductImage =
      node.products?.edges?.[0]?.node?.featuredImage?.url;
    const imageToUse = collectionImage || firstProductImage || null;

    return {
      id: node.id,
      handle: node.handle,
      title: node.title,
      description: node.description,
      productCount: node.products?.edges?.length || 0,
      image: imageToUse,
      badge: undefined,
    };
  });

  return collections;
}

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function CollectionsPage() {
  const shopifyCollections = await getShopifyCollections();

  // Use Shopify collections if available, otherwise fall back to menu collections
  type DisplayCollection = {
    id: string;
    handle: string;
    title: string;
    description: string;
    productCount: number;
    image: string | null;
    badge: undefined;
  };

  const collectionsToDisplay: DisplayCollection[] = shopifyCollections;

  const benefits = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
          />
        </svg>
      ),
      title: 'Free Shipping',
      description: 'Fast, free delivery at no extra cost',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: '60-Day Trial',
      description: 'Try it at home with our risk-free trial',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      title: 'Trusted by Professionals',
      description: 'Used by leading labs, clinics, and universities',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364"
          />
        </svg>
      ),
      title: 'Sustainable',
      description: 'Eco-friendly materials and practices',
    },
  ];

  return (
    <>
      <main className="bg-[hsl(var(--bg))]">
        {/* Hero Section */}
        <section
          className={`relative bg-gradient-to-b from-[hsl(var(--bg))] to-white ${layout.section}`}
        >
          <div className={layout.container}>
            <div className="text-center">
              <h1 className={textStyles.h1}>Shop by Category</h1>
              <p
                className={`${textStyles.bodyLarge} text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto mb-8`}
              >
                Discover our complete range of premium lab equipment and
                supplies for modern science and healthcare.
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-sm text-[hsl(var(--muted-foreground))]">
                <span>8+ Collections</span>
                <span>100+ Products</span>
                <span>Free Shipping</span>
                <span>60-Day Trial</span>
              </div>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className={layout.section}>
          <div className={layout.container}>
            {collectionsToDisplay.length === 0 ? (
              <div
                className="py-24 text-center text-lg text-[hsl(var(--muted-foreground))]"
                data-test-id="empty-collection-message"
              >
                No products found in this collection.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collectionsToDisplay.map(
                  (collection: DisplayCollection, index: number) => (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.handle}`}
                      className="group block bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-[0_28px_60px_-36px_rgba(15,23,42,0.15)] hover:shadow-[0_35px_85px_-48px_rgba(10,13,40,0.35)] transition-all duration-700 ease-out hover:-translate-y-1"
                      style={{
                        animationDelay: `${index * 80}ms`,
                        transitionDelay: `${index * 80}ms`,
                      }}
                    >
                      {/* Collection Image */}
                      <div className="relative h-64 bg-[hsl(var(--muted))] overflow-hidden">
                        {collection.image ? (
                          <Image
                            src={collection.image}
                            alt={collection.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[hsl(var(--brand))]/90 to-[hsl(var(--accent))]/90 text-white">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
                              <span className="text-2xl font-bold">
                                {collection.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium opacity-90 text-center px-4">
                              {collection.title}
                            </span>
                          </div>
                        )}
                        {/* Badge */}
                        {collection.badge && (
                          <div className="absolute top-4 left-4 bg-[hsl(var(--brand))] text-white px-3 py-1 rounded-full text-sm font-medium">
                            {collection.badge}
                          </div>
                        )}
                        {/* Product Count */}
                        <div className="absolute bottom-4 right-4 bg-[hsl(var(--card))]/90 text-[hsl(var(--muted-foreground))] px-3 py-1 rounded-full text-sm font-medium">
                          {collection.productCount} products
                        </div>
                      </div>

                      {/* Collection Info */}
                      <div className="p-6">
                        <h3
                          className={`${textStyles.h3} text-[hsl(var(--ink))] mb-4 group-hover:text-[hsl(var(--brand))] transition-colors`}
                        >
                          {collection.title}
                        </h3>
                        {/* CTA */}
                        <span className={`${buttonStyles.link} gap-1`}>
                          Shop Collection
                          <svg
                            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        </section>

        {/* Featured Benefits */}
        <section className={`bg-[hsl(var(--surface-muted))] ${layout.section}`}>
          <div className={layout.container}>
            <div className="text-center mb-12">
              <h2 className={`${textStyles.h2} text-[hsl(var(--ink))] mb-4`}>
                Why Choose Us
              </h2>
              <p
                className={`${textStyles.body} text-[hsl(var(--body))] max-w-2xl mx-auto`}
              >
                We are committed to providing you with the best lab equipment
                and service experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(var(--brand))] text-white rounded-full mb-4">
                    {benefit.icon}
                  </div>
                  <h3
                    className={`${textStyles.h5} text-[hsl(var(--ink))] mb-2`}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className={`${textStyles.bodySmall} text-[hsl(var(--body))]`}
                  >
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
