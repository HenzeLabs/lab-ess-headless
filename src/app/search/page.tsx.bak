import { Suspense } from 'react';
import { Metadata } from 'next';
import SearchResults from '@/components/SearchResults';
import { SearchProvider } from '@/components/providers/SearchProvider';

export const metadata: Metadata = {
  title: 'Search Results',
  description: 'Search products, collections, and more',
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const type =
    typeof params.type === 'string' ? params.type : 'all';
  const sort =
    typeof params.sort === 'string' ? params.sort : 'relevance';
  const page =
    typeof params.page === 'string'
      ? parseInt(params.page) || 1
      : 1;

  return (
    <SearchProvider>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <SearchResults query={query} type={type} sort={sort} page={page} />
          </Suspense>
        </div>
      </div>
    </SearchProvider>
  );
}
