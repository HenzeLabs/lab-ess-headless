import React from 'react';

interface AnnouncementBarProps {
  message?: string;
}

export default function AnnouncementBar({ message }: AnnouncementBarProps) {
  // You can make this dynamic via API/config later
  return (
    <div
      className="w-full bg-[hsl(var(--brand))] text-white text-sm font-semibold py-2 px-4 flex items-center justify-center tracking-wide z-[100]"
      aria-live="polite"
      data-test-id="announcement-bar"
    >
      <span>{message || 'Free shipping on orders over $300.'}</span>
    </div>
  );
}
