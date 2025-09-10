import Link from "next/link";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getSiteUrl } from "../../lib/siteUrl";
import { toAppHref } from "../../lib/links";
import type { MenuItem } from "@/lib/types";
import { shopifyFetch } from "@/lib/shopify";

// GraphQL query for collections
const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
          productsCount {
            count
          }
        }
      }
    }
  }
`;

// Fallback collections data

async function getMenuCollections() {
  const baseUrl = getSiteUrl();
  try {
    const res = await fetch(`${baseUrl}/api/menu`, { cache: "no-store" });
    if (!res.ok) {
      console.error(
        `[getMenuCollections] Error fetching /api/menu (${res.status})`,
      );
      return [];
    }
    const data = await res.json();
    return (data.items || []).map((item: MenuItem) => ({
      handle: item.url
        ? toAppHref(item.url).replace("/collections/", "")
        : item.title.toLowerCase(),
      title: item.title,
      image: item.image || null,
    }));
  } catch (error) {
    console.error("[getMenuCollections] Error:", error);
    return [];
  }
}

async function getShopifyCollections() {
  try {
    const response = await shopifyFetch<{
      collections: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            handle: string;
            description: string;
            image?: { url: string; altText: string };
            productsCount: { count: number };
          };
        }>;
      };
    }>({ query: COLLECTIONS_QUERY, variables: { first: 10 } });

    if (response.success) {
      return response.data.collections.edges.map(({ node }) => ({
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.description || "",
        productCount: node.productsCount?.count || 0,
        image: node.image?.url || null,
        badge: undefined,
      }));
    }
    return [];
  } catch (error) {
    console.error("[getShopifyCollections] Error fetching collections:", error);
    return [];
  }
}

export default async function CollectionsPage() {
  const [menuCollections, shopifyCollections] = await Promise.all([
    getMenuCollections(),
    getShopifyCollections(),
  ]);

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

  return (
    <>
      <Header collections={menuCollections} />
      <main className="bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white py-16 lg:py-24">
          <div className="container-koala text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-koala-green mb-6">
              Shop by Category
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover our complete range of premium furniture and bedding
              designed for modern Australian homes.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <span>8+ Collections</span>
              <span>100+ Products</span>
              <span>Free Shipping Australia-wide</span>
              <span>120-Night Trial</span>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-16">
          <div className="container-koala">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collectionsToDisplay.map(
                (collection: DisplayCollection, index: number) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.handle}`}
                    className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Collection Image */}
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      {collection.image ? (
                        <Image
                          src={collection.image}
                          alt={collection.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-koala-green to-green-600">
                          <span className="text-white text-2xl font-bold">
                            {collection.title.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Badge */}
                      {collection.badge && (
                        <div className="absolute top-4 left-4 bg-koala-green text-white px-3 py-1 rounded-full text-sm font-medium">
                          {collection.badge}
                        </div>
                      )}

                      {/* Product Count */}
                      <div className="absolute bottom-4 right-4 bg-white/90 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {collection.productCount} products
                      </div>
                    </div>

                    {/* Collection Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-koala-green transition-colors">
                        {collection.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {collection.description}
                      </p>

                      {/* CTA */}
                      <div className="flex items-center text-koala-green font-medium text-sm">
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
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>

        {/* Featured Benefits */}
        <section className="bg-gray-50 py-16">
          <div className="container-koala">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Koala
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We&apos;re committed to providing you with the best furniture
                and bedding experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
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
                  title: "Free Shipping",
                  description: "Australia-wide delivery at no extra cost",
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
                  title: "120-Night Trial",
                  description: "Try it at home with our sleep trial",
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
                  title: "Made in Australia",
                  description: "Proudly designed and crafted locally",
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
                  title: "Sustainable",
                  description: "Eco-friendly materials and practices",
                },
              ].map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-koala-green text-white rounded-full mb-4">
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
      <Footer />
    </>
  );
}
