'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  metafields: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}

interface ScoredProduct {
  product: Product;
  score: number;
}

interface QuizResultsProps {
  products: ScoredProduct[];
  onRestart: () => void;
}

export default function QuizResults({ products, onRestart }: QuizResultsProps) {
  const topMatch = products[0];
  const otherMatches = products.slice(1, 3);

  const getMatchQuality = (score: number) => {
    if (score >= 0.8) return { text: 'Excellent Match', color: 'text-[hsl(var(--brand))]', bgColor: 'bg-[hsl(var(--surface))]', borderColor: 'border-[hsl(var(--brand))]' };
    if (score >= 0.6) return { text: 'Good Match', color: 'text-[hsl(var(--accent))]', bgColor: 'bg-[hsl(var(--surface))]', borderColor: 'border-[hsl(var(--accent))]' };
    return { text: 'Fair Match', color: 'text-[hsl(var(--muted-foreground))]', bgColor: 'bg-[hsl(var(--surface))]', borderColor: 'border-[hsl(var(--border))]' };
  };

  const getMetafieldValue = (product: Product, key: string) => {
    const field = (product.metafields || []).find((m) => m && m.key === key);
    return field?.value || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-5 py-2 border-2 border-green-200">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-green-900">Quiz Complete!</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">Your Perfect Microscope Match</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Based on your answers, we found the best microscopes for your needs
        </p>
      </div>

      {/* Top Match - Hero Card */}
      {topMatch && (
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-[hsl(var(--brand))]/5 rounded-3xl border-3 border-[hsl(var(--brand))]/30 shadow-2xl p-6">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--brand))]/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[hsl(var(--accent))]/5 rounded-full blur-3xl"></div>

          {/* Best Match Badge */}
          <div className="absolute top-6 right-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white px-5 py-2 shadow-xl">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-bold">Best Match</span>
            </div>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Product Image */}
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border-2 border-border/50 shadow-lg">
                {topMatch.product.featuredImage?.url ? (
                  <Image
                    src={topMatch.product.featuredImage.url}
                    alt={topMatch.product.featuredImage.altText || topMatch.product.title}
                    fill
                    className="object-contain p-6"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--muted))]">
                    <svg className="w-24 h-24 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Match Score */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl border-3 border-[hsl(var(--brand))]/20 p-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[hsl(var(--brand))]">
                    {Math.round(topMatch.score * 100)}%
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">Match</div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{topMatch.product.title}</h3>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-[hsl(var(--brand))]/10 border-2 border-[hsl(var(--brand))]/20 rounded-xl px-4 py-2">
                    <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xl font-bold text-[hsl(var(--brand))]">
                      ${parseFloat(topMatch.product.priceRange.minVariantPrice.amount).toFixed(2)}
                    </span>
                  </div>
                  {(() => {
                    const matchQuality = getMatchQuality(topMatch.score);
                    return (
                      <div className={`inline-flex items-center gap-2 ${matchQuality.bgColor} border-2 ${matchQuality.borderColor} rounded-xl px-4 py-2`}>
                        <span className={`text-sm font-semibold ${matchQuality.color}`}>
                          {matchQuality.text}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Features */}
              {getMetafieldValue(topMatch.product, 'features') && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Key Features</h4>
                  <div className="space-y-2">
                    {getMetafieldValue(topMatch.product, 'features')
                      .split('\n')
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-[hsl(var(--brand))] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm">{feature.replace(/^[•\-\*]\s*/, '')}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Applications */}
              {getMetafieldValue(topMatch.product, 'applications') && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Perfect For</h4>
                  <p className="text-sm">{getMetafieldValue(topMatch.product, 'applications')}</p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={`/products/${topMatch.product.handle}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  View Full Specs
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <button
                  onClick={onRestart}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-foreground border-2 border-border/50 hover:border-[hsl(var(--brand))]/50 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Restart Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Great Matches */}
      {otherMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Other Great Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherMatches.map((scoredProduct) => {
              const matchQuality = getMatchQuality(scoredProduct.score);
              return (
                <div
                  key={scoredProduct.product.id}
                  className="group relative overflow-hidden bg-white rounded-2xl border-2 border-border/50 hover:border-[hsl(var(--brand))]/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="grid grid-cols-[140px_1fr] gap-4 p-5">
                    {/* Image */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-[hsl(var(--muted))] border border-border/50">
                      {scoredProduct.product.featuredImage?.url ? (
                        <Image
                          src={scoredProduct.product.featuredImage.url}
                          alt={scoredProduct.product.featuredImage.altText || scoredProduct.product.title}
                          fill
                          className="object-contain p-3"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-between min-w-0">
                      <div className="space-y-2">
                        <h4 className="font-bold text-base line-clamp-2 group-hover:text-[hsl(var(--brand))] transition-colors">
                          {scoredProduct.product.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[hsl(var(--brand))]">
                            ${parseFloat(scoredProduct.product.priceRange.minVariantPrice.amount).toFixed(2)}
                          </span>
                          <div className={`inline-flex items-center gap-1 ${matchQuality.bgColor} border ${matchQuality.borderColor} rounded-lg px-2 py-1`}>
                            <span className={`text-xs font-semibold ${matchQuality.color}`}>
                              {Math.round(scoredProduct.score * 100)}% match
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/products/${scoredProduct.product.handle}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--brand))] hover:gap-2 transition-all"
                      >
                        View Details
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compare CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))] via-white to-[hsl(var(--muted))] rounded-2xl border-2 border-border/50 p-6 text-center">
        <div className="relative space-y-3">
          <h3 className="text-2xl font-bold">Need Help Deciding?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our team of experts is here to help you find the perfect microscope for your specific needs
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/support/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Our Experts
            </Link>
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-foreground border-2 border-border/50 hover:border-[hsl(var(--brand))]/50 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
