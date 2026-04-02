import React from 'react';
import type { Review, ReviewSummary } from '@/lib/reviews';
import StarRating from '@/components/StarRating';
import ReviewCard from './ReviewCard';
import ReviewFormWrapper from './ReviewFormWrapper';
import { textStyles } from '@/lib/ui';

type Props = {
  productHandle: string;
  reviews: Review[];
  summary: ReviewSummary;
};

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-[hsl(var(--muted-foreground))]">{stars}</span>
      <svg className="h-4 w-4 fill-[hsl(var(--brand))]" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
      </svg>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className="h-full rounded-full bg-[hsl(var(--brand))] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-[hsl(var(--muted-foreground))]">{count}</span>
    </div>
  );
}

export default function ProductReviewsSection({ productHandle, reviews, summary }: Props) {
  return (
    <section id="reviews" className="scroll-mt-24">
      <h2 className={textStyles.h2}>Customer Reviews</h2>

      {summary.totalCount > 0 ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Summary sidebar */}
          <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-6 shadow-sm h-fit">
            <div className="text-center">
              <p className="text-4xl font-bold text-[hsl(var(--ink))]">
                {summary.averageRating.toFixed(1)}
              </p>
              <div className="mt-1 flex justify-center">
                <StarRating rating={summary.averageRating} count={summary.totalCount} />
              </div>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Based on {summary.totalCount} review{summary.totalCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <RatingBar
                  key={stars}
                  stars={stars}
                  count={summary.distribution[stars] ?? 0}
                  total={summary.totalCount}
                />
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border/50 bg-card p-8 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            No reviews yet. Be the first to review this product.
          </p>
        </div>
      )}

      {/* Review form */}
      <div className="mt-8">
        <ReviewFormWrapper productHandle={productHandle} />
      </div>
    </section>
  );
}
