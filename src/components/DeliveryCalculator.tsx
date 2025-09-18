import React from 'react';

import { buttonStyles, layout, textStyles } from '@/lib/ui';

export default function DeliveryCalculator() {
  return (
    <section className={`${layout.section} border-b bg-[hsl(var(--bg))]`}>
      <div className={`${layout.container} max-w-2xl text-center`}>
        <h3 className={`${textStyles.heading} text-[hsl(var(--brand))] mb-2`}>
          Check Delivery
        </h3>
        <form className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Enter your postcode"
            className="w-full rounded-lg border border-[hsl(var(--muted))]/40 px-4 py-2 text-[hsl(var(--ink))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))] sm:w-48"
          />
          <button type="submit" className={buttonStyles.primary}>
            Check
          </button>
        </form>
        <div className="mt-2 text-sm text-[hsl(var(--muted))]">
          Fast &amp; free delivery
        </div>
      </div>
    </section>
  );
}
