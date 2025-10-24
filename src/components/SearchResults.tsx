'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Grid3x3, List, Package, FolderOpen, ChevronRight } from 'lucide-react';
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
      router.push('/search?' + params.toString());
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    if (key !== 'q') {
      params.set('page', '1');
    }
    router.push('/search?' + params.toString());
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
    <div className="space-y-8">
      <div className="bg-white dark:bg-card rounded-2xl border-2 border-border/50 p-6 shadow-md">
        <form onSubmit={handleNewSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[hsl(var(--brand))]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, collections..."
              className="pl-12 h-12 text-base border-2 focus:border-[hsl(var(--brand))]"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 px-8 bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand-dark))] text-white font-semibold"
          >
            Search
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-card rounded-xl border border-border/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[hsl(var(--brand))]" />
            <span className="text-sm font-semibold text-[hsl(var(--ink))]">Filters:</span>
          </div>

          <select
            value={type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 border-2 border-border rounded-lg bg-background hover:border-[hsl(var(--brand))] focus:border-[hsl(var(--brand))] outline-none transition-colors text-sm font-medium"
          >
            <option value="all">All Results</option>
            <option value="products">Products</option>
            <option value="collections">Collections</option>
            <option value="pages">Pages</option>
            <option value="articles">Articles</option>
          </select>

          <select
            value={sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-4 py-2 border-2 border-border rounded-lg bg-background hover:border-[hsl(var(--brand))] focus:border-[hsl(var(--brand))] outline-none transition-colors text-sm font-medium"
          >
            <option value="relevance">Relevance</option>
            <option value="price">Price</option>
            <option value="best-selling">Best Selling</option>
            <option value="created">Newest</option>
            <option value="title">A-Z</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-[hsl(var(--brand))] text-white' : ''}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-[hsl(var(--brand))] text-white' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {initialQuery && results && !isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-[hsl(var(--ink))]">
            {getTotalResults()} {getTotalResults() === 1 ? 'result' : 'results'} for "{initialQuery}"
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[hsl(var(--brand))]/20 border-t-[hsl(var(--brand))]"></div>
            <p className="text-[hsl(var(--muted-foreground))] font-medium">Searching...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-20 bg-white dark:bg-card rounded-2xl border-2 border-destructive/20">
          <p className="text-destructive mb-4 font-semibold text-lg">{error}</p>
          <Button onClick={performSearch} className="bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand-dark))]">
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && results && (
        <div className="space-y-10">
          {results.products && results.products.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--brand))]/10">
                  <Package className="h-5 w-5 text-[hsl(var(--brand))]" />
                </div>
                <h2 className="text-2xl font-bold text-[hsl(var(--ink))]">
                  Products ({results.products.length})
                </h2>
              </div>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {results.products.map((product: SearchProduct) => (
                  <Link
                    key={product.id}
                    href={'/products/' + product.handle}
                    className={
                      viewMode === 'grid'
                        ? 'group bg-white dark:bg-card border-2 border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[hsl(var(--brand))]/30 transition-all duration-300'
                        : 'group bg-white dark:bg-card border-2 border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[hsl(var(--brand))]/30 transition-all duration-300 flex flex-row'
                    }
                  >
                    {product.images.edges[0] && (
                      <div className={
                        viewMode === 'grid'
                          ? 'aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center p-4'
                          : 'w-48 flex-shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center p-4'
                      }>
                        <Image
                          src={product.images.edges[0].node.url}
                          alt={product.images.edges[0].node.altText || product.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className={viewMode === 'grid' ? 'p-4 space-y-1.5' : 'p-6 space-y-2 flex-1'}>
                      <h3 className={
                        viewMode === 'grid'
                          ? 'text-sm font-semibold text-[hsl(var(--ink))] group-hover:text-[hsl(var(--brand))] transition-colors line-clamp-2'
                          : 'text-lg font-semibold text-[hsl(var(--ink))] group-hover:text-[hsl(var(--brand))] transition-colors line-clamp-1'
                      }>
                        {product.title}
                      </h3>
                      {product.vendor && (
                        <p className={viewMode === 'grid' ? 'text-xs text-[hsl(var(--muted-foreground))]' : 'text-sm text-[hsl(var(--muted-foreground))]'}>
                          {product.vendor}
                        </p>
                      )}
                      {product.priceRange && (
                        <p className={viewMode === 'grid' ? 'text-base font-bold text-[hsl(var(--brand))]' : 'text-xl font-bold text-[hsl(var(--brand))]'}>
                          ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                          {product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount &&
                            ' - $' + parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.collections && results.collections.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--brand))]/10">
                  <FolderOpen className="h-5 w-5 text-[hsl(var(--brand))]" />
                </div>
                <h2 className="text-2xl font-bold text-[hsl(var(--ink))]">
                  Collections ({results.collections.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={'/collections/' + collection.handle}
                    className="group bg-white dark:bg-card border-2 border-border/50 rounded-2xl p-6 hover:shadow-xl hover:border-[hsl(var(--brand))]/30 transition-all duration-300"
                  >
                    <h3 className="font-bold text-lg text-[hsl(var(--ink))] group-hover:text-[hsl(var(--brand))] transition-colors mb-2">
                      {collection.title}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-3 mb-3">
                        {collection.description.replace(/<[^>]*>/g, '').substring(0, 200)}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[hsl(var(--brand))] font-semibold text-sm">
                      View Collection <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {getTotalResults() === 0 && (
            <div className="text-center py-20 bg-white dark:bg-card rounded-2xl border-2 border-border/50">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(var(--brand))]/10 mx-auto mb-6">
                <Search className="h-10 w-10 text-[hsl(var(--brand))]" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[hsl(var(--ink))]">No results found</h2>
              <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-md mx-auto">
                We could not find any results for "{initialQuery}". Try searching with different keywords or check your spelling.
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="border-2 hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))]"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
