'use client';

import { useState, useEffect } from 'react';
import ExitIntentPopup from './ExitIntentPopup';
import { useExitIntent } from '@/hooks/useExitIntent';

export default function CartAbandonmentRecovery() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownToday, setHasShownToday] = useState(false);
  const { isExiting } = useExitIntent({
    enabled: !hasShownToday,
    sensitivity: 20,
    delay: 500,
  });

  useEffect(() => {
    // Check if popup was shown today
    const lastShown = localStorage.getItem('exitPopupLastShown');
    const today = new Date().toDateString();

    if (lastShown === today) {
      setHasShownToday(true);
    }
  }, []);

  useEffect(() => {
    if (isExiting && !hasShownToday) {
      setShowPopup(true);
      // Mark as shown today
      localStorage.setItem('exitPopupLastShown', new Date().toDateString());
      setHasShownToday(true);
    }
  }, [isExiting, hasShownToday]);

  const handleEmailSubmit = async (email: string) => {
    try {
      // Track the lead capture
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', {
          currency: 'USD',
          value: 0,
          source: 'exit_intent_popup',
        });
      }

      // Submit to newsletter API (you can replace this with your actual endpoint)
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'exit_intent',
          discount_code: 'LABSAVER15',
        }),
      });

      // Show success message (you could enhance this)
      console.log('Email captured:', email);
    } catch (error) {
      console.error('Failed to submit email:', error);
    }
  };

  if (!showPopup) return null;

  return (
    <ExitIntentPopup
      onClose={() => setShowPopup(false)}
      onEmailSubmit={handleEmailSubmit}
    />
  );
}
