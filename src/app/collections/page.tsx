import Link from 'next/link';
import Image from 'next/image';
import { shopifyFetch } from '@/lib/shopify';
import { getAllCollectionsQuery } from '@/lib/queries/getAllCollectionsQuery';
import { textStyles } from '@/lib/ui';
import FooterServer from '@/components/FooterServer';

type ShopifyCollectionsResponse = {
  collections: {
    edges: Array<{
      node: {
        id: string;
        handle: string;
        title: string;
        description: string;
        image?: { url: string } | null;
        products?: { edges: Array<{ node: { id: string } }> };
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
  const collections = edges.map(({ node }) => ({
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    productCount: node.products?.edges?.length || 0,
    image: node.image?.url || null,
    badge: undefined,
  }));

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
      <main className="bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background to-white py-16 lg:py-24">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Shop by Category
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover our complete range of premium lab equipment and supplies
              for modern science and healthcare.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <span>8+ Collections</span>
              <span>100+ Products</span>
              <span>Free Shipping</span>
              <span>60-Day Trial</span>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {collectionsToDisplay.length === 0 ? (
              <div
                className="py-24 text-center text-lg text-muted-foreground"
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
                      className="group block bg-card text-card-foreground rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Collection Image */}
                      <div className="relative h-64 bg-muted overflow-hidden">
                        {collection.image ? (
                          <Image
                            src={collection.image}
                            alt={collection.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary to-accent">
                            <span className="text-white text-2xl font-bold">
                              {collection.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        {/* Badge */}
                        {collection.badge && (
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                            {collection.badge}
                          </div>
                        )}
                        {/* Product Count */}
                        <div className="absolute bottom-4 right-4 bg-card/90 text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {collection.productCount} products
                        </div>
                      </div>

                      {/* Collection Info */}
                      <div className="p-6">
                        <h3
                          className={`${textStyles.h3} text-foreground mb-2 group-hover:text-primary transition-colors`}
                        >
                          {collection.title}
                        </h3>
                        <p className={`${textStyles.bodySmall} mb-4`}>
                          {collection.description ||
                            'Used by leading labs, clinics, and universities'}
                        </p>
                        {/* CTA */}
                        <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:underline">
                          Shop Collection
                          <svg
                            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
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
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Us
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FooterServer />
    </>
  );
}
