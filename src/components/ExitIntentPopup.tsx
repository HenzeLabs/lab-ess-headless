'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExitIntentPopupProps {
  onClose: () => void;
  onEmailSubmit: (email: string) => void;
}

export default function ExitIntentPopup({
  onClose,
  onEmailSubmit,
}: ExitIntentPopupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onEmailSubmit(email);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Wait! Don&apos;t Miss Out
          </h2>
          <p className="mb-6 text-gray-600">
            Get <strong>15% off</strong> your first order + exclusive lab
            equipment deals
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.lab@university.edu"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="w-full bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Getting Your Discount...' : 'Get 15% Off'}
            </Button>
          </form>

          <p className="mt-4 text-xs text-gray-500">
            Join 1,200+ labs. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
