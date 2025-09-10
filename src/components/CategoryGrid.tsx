import Image from "next/image";
import Link from "next/link";

interface Collection {
  handle: string;
  title: string;
  description?: string;
  productCount?: number;
  badge?: string;
  image?: { url: string; altText: string };
}

interface CategoryGridProps {
  collections: Collection[];
  title?: string;
  description?: string;
  showAll?: boolean;
  maxItems?: number;
  className?: string;
}

const placeholderImages = [
  "/placeholders/collection1.jpg",
  "/placeholders/collection2.jpg",
  "/placeholders/product1.jpg",
  "/placeholders/product2.jpg",
];

// Default collection data with descriptions and counts
const collectionDescriptions: Record<
  string,
  { description: string; count: number; badge?: string }
> = {
  mattresses: {
    description: "Award-winning comfort with advanced support",
    count: 15,
    badge: "Most Popular",
  },
  "sofa-beds": {
    description: "Cosy by day, dreamy by night",
    count: 8,
    badge: "Best Seller",
  },
  "sofas-couches": {
    description: "Stylish comfort for your living space",
    count: 12,
  },
  "bed-bases": {
    description: "Strong foundations for better sleep",
    count: 10,
  },
  pillows: { description: "Perfect support for your head and neck", count: 6 },
  bedding: { description: "Complete your sleep sanctuary", count: 18 },
  "bedroom-furniture": {
    description: "Essential pieces for your bedroom",
    count: 14,
  },
  "living-room": {
    description: "Transform your living space",
    count: 22,
    badge: "New",
  },
};

export default function CategoryGrid({
  collections,
  title = "Shop by Category",
  description = "Discover our complete range of premium furniture and bedding",
  showAll = true,
  maxItems,
  className = "",
}: CategoryGridProps) {
  const displayCollections = maxItems
    ? collections.slice(0, maxItems)
    : collections;

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container-koala">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-koala-green mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {displayCollections.map((collection, index) => {
            const collectionData =
              collectionDescriptions[collection.handle] || {};

            return (
              <Link
                key={collection.handle}
                href={`/collections/${collection.handle}`}
                className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Collection Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <Image
                    src={
                      collection.image?.url ||
                      placeholderImages[index % placeholderImages.length]
                    }
                    alt={collection.image?.altText || collection.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Badge */}
                  {collectionData.badge && (
                    <div className="absolute top-3 left-3 bg-koala-green text-white px-2 py-1 rounded-full text-xs font-medium">
                      {collectionData.badge}
                    </div>
                  )}

                  {/* Product Count */}
                  {collectionData.count && (
                    <div className="absolute bottom-3 right-3 bg-white/90 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {collectionData.count} products
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Collection Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-koala-green transition-colors mb-2">
                    {collection.title}
                  </h3>

                  {collectionData.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {collectionData.description}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="flex items-center text-koala-green font-medium text-sm group-hover:text-green-700">
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
            );
          })}
        </div>

        {/* View All Link */}
        {showAll && maxItems && collections.length > maxItems && (
          <div className="text-center mt-12">
            <Link
              href="/collections"
              className="inline-flex items-center bg-koala-green text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 transition-colors"
            >
              View All Categories
              <svg
                className="w-5 h-5 ml-2"
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
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
