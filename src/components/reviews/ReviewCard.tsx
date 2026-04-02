import React from 'react';
import type { Review } from '@/lib/reviews';
import StarRating from '@/components/StarRating';

export default function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt);
  const formatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <StarRating rating={review.rating} count={0} hideCount />
          <h4 className="text-base font-bold text-[hsl(var(--ink))]">{review.title}</h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          {review.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
          <span>{formatted}</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
        {review.body}
      </p>
      <p className="mt-3 text-xs font-semibold text-[hsl(var(--ink))]">{review.author}</p>
    </div>
  );
}
