'use client';

import React, { useState, useTransition } from 'react';
import StarRatingInput from './StarRatingInput';
import { buttonStyles } from '@/lib/ui';

type ReviewFormProps = {
  productHandle: string;
  onSuccess?: () => void;
};

export default function ReviewForm({ productHandle, onSuccess }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setFeedback({ type: 'error', message: 'Please select a star rating.' });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productHandle,
            author: name,
            email,
            rating,
            title,
            body,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to submit review');
        }

        setFeedback({ type: 'success', message: 'Thank you! Your review has been submitted.' });
        setRating(0);
        setName('');
        setEmail('');
        setTitle('');
        setBody('');
        onSuccess?.();
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Something went wrong.',
        });
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className={`${buttonStyles.outline} gap-2`}
        onClick={() => setIsOpen(true)}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
        Write a Review
      </button>
    );
  }

  const inputClass =
    'w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm text-foreground transition-all hover:border-[hsl(var(--brand))]/50 focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-4 focus:ring-[hsl(var(--brand))]/10';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[hsl(var(--ink))]">Write a Review</h3>
        <button
          type="button"
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
          onClick={() => setIsOpen(false)}
          aria-label="Close review form"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[hsl(var(--ink))]">Rating *</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="review-name" className="text-sm font-semibold text-[hsl(var(--ink))]">
            Name *
          </label>
          <input
            id="review-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="review-email" className="text-sm font-semibold text-[hsl(var(--ink))]">
            Email *
          </label>
          <input
            id="review-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-title" className="text-sm font-semibold text-[hsl(var(--ink))]">
          Review Title *
        </label>
        <input
          id="review-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Summarize your experience"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-body" className="text-sm font-semibold text-[hsl(var(--ink))]">
          Review *
        </label>
        <textarea
          id="review-body"
          required
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Tell us about your experience with this product..."
        />
      </div>

      {feedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-[hsl(var(--brand))]/30 bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand))]'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <button
        type="submit"
        className={`${buttonStyles.primary} w-full sm:w-auto`}
        disabled={isPending}
      >
        {isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
