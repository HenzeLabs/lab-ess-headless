import { shopifyFetch } from '@/lib/shopify';
import { getAllCollectionsQuery } from '@/lib/queries/getAllCollectionsQuery';
import CollectionCategoryTabs from '@/components/CollectionCategoryTabs';

import { layout } from "@/lib/ui";
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

// Organize collections into categories
function organizeCollections(collections: any[]) {
  const categories = [
    {
      id: 'microscopes',
      title: 'Microscopes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      collections: [
        'compound-microscopes',
        'stereo-microscopes',
        'microscope-cameras',
        'digital-microscope-cameras',
        'microscope-camera-monitors',
        'camera-adapters',
        'microscope-accessories',
      ],
    },
    {
      id: 'centrifuges',
      title: 'Centrifuges',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      collections: [
        'clinical-general-lab-centrifuges',
        'microcentrifuges',
        'microhematocrit-centrifuges',
        'portable-centrifuges',
        'centrifuge-accessories',
      ],
    },
    {
      id: 'lab-equipment',
      title: 'Lab Equipment',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      collections: [
        'incubators-slide-preparation',
        'mixing-stirring-equipment',
        'water-baths-dry-baths',
        'measuring-testing-instruments',
        'cleaning-maintenance',
        'lab-supplies-consumables',
      ],
    },
    {
      id: 'featured',
      title: 'Featured Collections',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      collections: ['featured-products', 'best-sellers'],
    },
  ];

  return categories.map(category => ({
    ...category,
    collections: category.collections
      .map(handle => collections.find(c => c.handle === handle))
      .filter(Boolean),
  })).filter(category => category.collections.length > 0);
}

export const dynamic = 'force-dynamic';
export const revalidate = 60;

// Force deployment refresh
export default async function CollectionsPage() {
  const shopifyCollections = await getShopifyCollections();
  const organizedCategories = organizeCollections(shopifyCollections);

  // Use Shopify collections if available, otherwise fall back to menu collections

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
      description: 'On orders over $300',
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: 'Quality Guaranteed',
      description: '1-year warranty on all equipment',
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
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      ),
      title: 'Expert Support',
      description: 'Dedicated team ready to help with your needs',
    },
  ];

  return (
    <>
      <main className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))]/5 via-background to-[hsl(var(--accent))]/5 border-b border-border/50 py-16 md:py-20">
          {/* Animated background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)', backgroundSize: '40px 40px' }}
          />

          {/* Glowing orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--brand))]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(var(--accent))]/10 rounded-full blur-3xl" />

          <div className={`${layout.container} relative z-10`}>
            <div className="text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))]/10 px-5 py-2 border border-[hsl(var(--brand))]/20">
                <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--brand))]">
                  Our Collections
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--ink))] tracking-tight">
                Shop by Category
              </h1>
              <p className="text-lg md:text-xl text-[hsl(var(--body))] max-w-3xl mx-auto leading-relaxed">
                Discover our complete range of premium lab equipment and
                supplies for modern science and healthcare.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-4">
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  <span className="text-sm font-medium">8+ Collections</span>
                </div>
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">100+ Products</span>
                </div>
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span className="text-sm font-medium">Free Shipping $300+</span>
                </div>
                <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">1-Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Collections Grid - Organized by Category with Tabs */}
        <section className={layout.section}>
          <div className={layout.container}>
            {organizedCategories.length === 0 ? (
              <div
                className="py-24 text-center text-lg text-[hsl(var(--muted-foreground))]"
                data-test-id="empty-collection-message"
              >
                No collections found.
              </div>
            ) : (
              <CollectionCategoryTabs categories={organizedCategories} />
            )}
          </div>
        </section>

        {/* Featured Benefits */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))] via-white to-[hsl(var(--muted))] py-20 md:py-24">
          {/* Background decoration */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)', backgroundSize: '30px 30px' }}
          />

          <div className={layout.container}>
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))]/10 px-5 py-2 border border-[hsl(var(--brand))]/20">
                <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--brand))]">
                  Our Promise
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--ink))]">
                Why Choose Us
              </h2>
              <p className="text-lg text-[hsl(var(--body))] max-w-2xl mx-auto">
                We are committed to providing you with the best lab equipment
                and service experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="group text-center bg-white rounded-2xl p-8 border-2 border-border/50 shadow-md hover:shadow-xl hover:border-[hsl(var(--brand))]/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white rounded-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[hsl(var(--ink))] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[hsl(var(--body))] leading-relaxed">
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
