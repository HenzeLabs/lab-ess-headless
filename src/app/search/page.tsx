import { Suspense } from 'react';
import { Metadata } from 'next';
import SearchResults from '@/components/SearchResults';
import { SearchProvider } from '@/components/providers/SearchProvider';

export const metadata: Metadata = {
  title: 'Search Results | Lab Essentials',
  description: 'Search lab equipment, microscopes, centrifuges and supplies',
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const type = typeof params.type === 'string' ? params.type : 'all';
  const sort = typeof params.sort === 'string' ? params.sort : 'relevance';
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;

  return (
    <SearchProvider>
      <main className="bg-background min-h-screen">
        {/* Hero Section with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))]/10 via-background to-[hsl(var(--accent))]/5 border-b border-border/50 py-12 md:py-16">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

          <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 relative z-10">
            <div className="max-w-3xl">
              {query ? (
                <>
                  <p className="text-sm md:text-base font-semibold text-[hsl(var(--brand))] uppercase tracking-wider mb-3">
                    Search Results
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--ink))] mb-4">
                    {query}
                  </h1>
                </>
              ) : (
                <>
                  <p className="text-sm md:text-base font-semibold text-[hsl(var(--brand))] uppercase tracking-wider mb-3">
                    Find What You Need
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--ink))] mb-4">
                    Search Lab Equipment
                  </h1>
                  <p className="text-lg text-[hsl(var(--muted-foreground))]">
                    Search our catalog of microscopes, centrifuges, and laboratory supplies
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 py-12 md:py-16">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[hsl(var(--brand))]/20 border-t-[hsl(var(--brand))]"></div>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm">Searching...</p>
                </div>
              </div>
            }
          >
            <SearchResults query={query} type={type} sort={sort} page={page} />
          </Suspense>
        </div>
      </main>
    </SearchProvider>
  );
}
