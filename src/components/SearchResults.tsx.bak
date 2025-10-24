'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useSearchContext } from '@/components/providers/SearchProvider';
import type {
  SearchResults as SearchResultsType,
  SearchParams,
  SearchProduct,
  SearchSortKey,
} from '@/types/search';

interface SearchResultsProps {
  query: string;
  type: string;
  sort: string;
  page: number;
}

export default function SearchResults({
  query: initialQuery,
  type,
  sort,
  page,
}: SearchResultsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { search } = useSearchContext();

  const performSearch = useCallback(async () => {
    if (!initialQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const sortKeyMap: { [key: string]: SearchSortKey } = {
        relevance: 'RELEVANCE',
        price: 'PRICE',
        'best-selling': 'BEST_SELLING',
        created: 'CREATED',
        title: 'TITLE',
      };

      const searchParams: SearchParams = {
        query: initialQuery.trim(),
        type:
          type === 'all'
            ? undefined
            : (type.toUpperCase() as
                | 'PRODUCT'
                | 'COLLECTION'
                | 'PAGE'
                | 'ARTICLE'),
        first: 20,
        sortKey: sortKeyMap[sort] || 'RELEVANCE',
      };

      const searchResults = await search(searchParams);
      setResults(searchResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [initialQuery, type, sort, search]);

  // Perform search when parameters change
  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, [initialQuery, type, sort, page, performSearch]);

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      params.set('type', type);
      params.set('sort', sort);
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    if (key !== 'q') {
      params.set('page', '1'); // Reset page when changing filters
    }
    router.push(`/search?${params.toString()}`);
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return (
      (results.products?.length || 0) +
      (results.collections?.length || 0) +
      (results.pages?.length || 0) +
      (results.articles?.length || 0)
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <form onSubmit={handleNewSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, collections..."
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>

        {initialQuery && (
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              Search results for &quot;{initialQuery}&quot;
            </h1>
            {results && (
              <p className="text-muted-foreground">
                {getTotalResults()}{' '}
                {getTotalResults() === 1 ? 'result' : 'results'}
              </p>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 py-4 border-y">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          <select
            value={type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All</option>
            <option value="products">Products</option>
            <option value="collections">Collections</option>
            <option value="pages">Pages</option>
            <option value="articles">Articles</option>
          </select>

          <select
            value={sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="relevance">Relevance</option>
            <option value="price">Price</option>
            <option value="best-selling">Best Selling</option>
            <option value="created">Newest</option>
            <option value="title">A-Z</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-20">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={performSearch}>Try Again</Button>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && results && (
        <div className="space-y-8">
          {/* Products */}
          {results.products && results.products.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Products</h2>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {results.products.map((product: SearchProduct) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <Link href={`/products/${product.handle}`}>
                      {product.images.edges[0] && (
                        <div className="aspect-square mb-3 overflow-hidden rounded-md">
                          <Image
                            src={product.images.edges[0].node.url}
                            alt={
                              product.images.edges[0].node.altText ||
                              product.title
                            }
                            width={300}
                            height={300}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <h3 className="font-medium hover:text-primary">
                        {product.title}
                      </h3>
                      {product.priceRange && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ${product.priceRange.minVariantPrice.amount}
                          {product.priceRange.minVariantPrice.amount !==
                            product.priceRange.maxVariantPrice.amount &&
                            ` - $${product.priceRange.maxVariantPrice.amount}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.vendor}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Collections */}
          {results.collections && results.collections.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Collections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {results.collections.map((collection) => (
                  <a
                    key={collection.id}
                    href={`/collections/${collection.handle}`}
                    className="group block p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium group-hover:text-primary">
                      {collection.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {collection.description}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Pages */}
          {results.pages && results.pages.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Pages</h2>
              <div className="space-y-4">
                {results.pages.map((page) => (
                  <a
                    key={page.id}
                    href={`/pages/${page.handle}`}
                    className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium hover:text-primary">
                      {page.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {page.body}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Articles */}
          {results.articles && results.articles.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Articles</h2>
              <div className="space-y-4">
                {results.articles.map((article) => (
                  <a
                    key={article.id}
                    href={`/blogs/${article.handle}`}
                    className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium hover:text-primary">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* No Results */}
          {getTotalResults() === 0 && (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground mb-4">
                Try searching with different keywords or check your spelling.
              </p>
              <Button variant="outline" onClick={() => router.push('/')}>
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
