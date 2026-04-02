import type { Metadata } from 'next';
import { getAllReviews, getReviewSummary } from '@/lib/reviews';
import StarRating from '@/components/StarRating';
import ReviewCard from '@/components/reviews/ReviewCard';
import { layout, textStyles } from '@/lib/ui';

export const metadata: Metadata = {
  title: 'Customer Reviews | Lab Essentials',
  description:
    'Read verified customer reviews of lab equipment from Lab Essentials. See what researchers and lab professionals say about our centrifuges, microscopes, and more.',
};

export default function ReviewsPage() {
  const reviews = getAllReviews();
  const summary = getReviewSummary(reviews);

  // Group reviews by product
  const byProduct = new Map<string, { title: string; handle: string; reviews: typeof reviews }>();
  for (const review of reviews) {
    const existing = byProduct.get(review.productHandle);
    if (existing) {
      existing.reviews.push(review);
    } else {
      byProduct.set(review.productHandle, {
        title: review.productTitle,
        handle: review.productHandle,
        reviews: [review],
      });
    }
  }

  return (
    <main id="main-content" className="bg-background py-12 md:py-16" role="main">
      <div className={layout.container}>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className={textStyles.h1}>Customer Reviews</h1>
          <p className="mt-4 text-[hsl(var(--muted-foreground))] text-lg leading-relaxed">
            Hear from lab professionals who trust Lab Essentials for their equipment needs.
          </p>
          {summary.totalCount > 0 && (
            <div className="mt-6 inline-flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card px-8 py-5 shadow-sm">
              <p className="text-4xl font-bold text-[hsl(var(--ink))]">
                {summary.averageRating.toFixed(1)}
              </p>
              <StarRating rating={summary.averageRating} count={summary.totalCount} />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Overall rating across {summary.totalCount} reviews
              </p>
            </div>
          )}
        </div>

        {/* Reviews grouped by product */}
        <div className="space-y-12">
          {Array.from(byProduct.entries()).map(([handle, group]) => {
            const groupSummary = getReviewSummary(group.reviews);

            return (
              <section key={handle}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <h2 className={textStyles.h3}>
                      <a
                        href={`/products/${handle}`}
                        className="hover:text-[hsl(var(--brand))] transition-colors"
                      >
                        {group.title}
                      </a>
                    </h2>
                    <div className="mt-1">
                      <StarRating
                        rating={groupSummary.averageRating}
                        count={groupSummary.totalCount}
                        size="sm"
                      />
                    </div>
                  </div>
                  <a
                    href={`/products/${handle}`}
                    className="text-sm font-semibold text-[hsl(var(--brand))] hover:underline"
                  >
                    View Product
                  </a>
                </div>
                <div className="space-y-4">
                  {group.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[hsl(var(--muted-foreground))] text-lg">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
