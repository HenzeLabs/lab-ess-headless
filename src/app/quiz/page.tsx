import type { Metadata } from 'next';
import MicroscopeQuiz from '@/components/quiz/MicroscopeQuiz';
import type { CollectionData } from '@/lib/types';
import { getCollectionByHandleQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';

export const metadata: Metadata = {
  title: 'Microscope Selector Quiz | Lab Essentials',
  description:
    'Find the perfect microscope for your needs with our interactive quiz. Answer a few simple questions and get personalized product recommendations.',
};

export const revalidate = 300; // Cache for 5 minutes

async function getMicroscopeProducts() {
  try {
    const response = await shopifyFetch<{
      collection: CollectionData | null;
    }>({
      query: getCollectionByHandleQuery,
      variables: { handle: 'microscopes', first: 50 },
    });

    if (!response.data.collection || !response.data.collection.products) {
      console.error('Microscopes collection not found');
      return [];
    }

    return response.data.collection.products.edges.map((edge) => edge.node);
  } catch (error) {
    console.error('Failed to load microscope products', error);
    return [];
  }
}

export default async function QuizPage() {
  const products = await getMicroscopeProducts();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-[hsl(var(--brand))]/5 border-b border-border/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--brand))]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[hsl(var(--accent))]/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[hsl(var(--brand))]/10 border-2 border-[hsl(var(--brand))]/20 rounded-full px-5 py-2 mb-6">
            <svg
              className="w-5 h-5 text-[hsl(var(--brand))]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span className="text-sm font-semibold text-[hsl(var(--brand))]">
              Microscope Selector
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--ink))] mb-4">
            Find Your Perfect Microscope
          </h1>
          <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Answer a few simple questions and we&apos;ll recommend the best
            microscope for your specific needs
          </p>
        </div>
      </div>

      {/* Quiz Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="bg-white rounded-3xl border-2 border-border/50 shadow-xl p-6 md:p-10">
          {products.length > 0 ? (
            <MicroscopeQuiz products={products} />
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--muted))] mb-4">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--ink))] mb-2">
                No Products Available
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] mb-6">
                We couldn&apos;t load the microscope products. Please try again
                later.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--brand))]/10 mb-4">
              <svg
                className="w-6 h-6 text-[hsl(var(--brand))]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-[hsl(var(--ink))] mb-2">
              Quick & Easy
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Just 7 simple questions to find your perfect match
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--brand))]/10 mb-4">
              <svg
                className="w-6 h-6 text-[hsl(var(--brand))]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-[hsl(var(--ink))] mb-2">
              Personalized
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Recommendations tailored to your specific needs
            </p>
          </div>

          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--brand))]/10 mb-4">
              <svg
                className="w-6 h-6 text-[hsl(var(--brand))]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-[hsl(var(--ink))] mb-2">
              Expert-Backed
            </h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Algorithm developed by microscopy experts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
