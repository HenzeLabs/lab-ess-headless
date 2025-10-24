'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type DisplayCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productCount: number;
  image: string | null;
  badge: undefined;
};

type Category = {
  id: string;
  title: string;
  icon: React.ReactNode;
  collections: DisplayCollection[];
};

interface CollectionCategoryTabsProps {
  categories: Category[];
}

export default function CollectionCategoryTabs({ categories }: CollectionCategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');

  const activeCategoryData = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 pb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 border-2 ${
              activeCategory === category.id
                ? 'border-transparent bg-[hsl(var(--brand))] text-white shadow-lg scale-105'
                : 'border-border/60 bg-white/85 text-[hsl(var(--ink))] hover:border-[hsl(var(--brand))]/40 hover:bg-white hover:text-[hsl(var(--brand))] hover:shadow-lg'
            }`}
          >
            <span className="w-5 h-5 flex-shrink-0">{category.icon}</span>
            <span>{category.title}</span>
            <span className="text-xs opacity-80">({category.collections.length})</span>
          </button>
        ))}
      </div>

      {/* Active Category Content */}
      {activeCategoryData && (
        <div className="space-y-6">
          {/* Category Header */}
          <div className="flex items-center gap-4 pb-6 border-b-2 border-border/50">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white rounded-xl flex items-center justify-center shadow-lg">
              {activeCategoryData.icon}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--ink))]">
                {activeCategoryData.title}
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {activeCategoryData.collections.length} {activeCategoryData.collections.length === 1 ? 'collection' : 'collections'}
              </p>
            </div>
          </div>

          {/* Category Collections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCategoryData.collections.map((collection: DisplayCollection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group block bg-white rounded-2xl overflow-hidden border-2 border-border/50 shadow-lg hover:shadow-2xl hover:border-[hsl(var(--brand))]/30 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Collection Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                  {collection.image ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <Image
                          src={collection.image}
                          alt={collection.title}
                          width={300}
                          height={300}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--brand))]/0 via-transparent to-transparent group-hover:from-[hsl(var(--brand))]/5 transition-all duration-500" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[hsl(var(--brand))]/90 to-[hsl(var(--accent))]/90 text-white">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border-2 border-white/30">
                        <span className="text-2xl font-bold">
                          {collection.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-center px-4">
                        {collection.title}
                      </span>
                    </div>
                  )}
                  {/* Product Count Badge */}
                  {collection.productCount > 0 && (
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-[hsl(var(--ink))] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border/50">
                      <span className="text-[hsl(var(--brand))]">{collection.productCount}</span> items
                    </div>
                  )}
                </div>

                {/* Collection Info */}
                <div className="p-5 bg-white">
                  <h3 className="text-lg font-bold text-[hsl(var(--ink))] mb-2 group-hover:text-[hsl(var(--brand))] transition-colors line-clamp-2">
                    {collection.title}
                  </h3>
                  {/* CTA */}
                  <div className="inline-flex items-center gap-2 text-[hsl(var(--brand))] font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>View Collection</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
