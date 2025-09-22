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
          <div className="w-full sm:w-48">
            <label
              htmlFor="postcode"
              className="block text-sm font-medium text-[hsl(var(--ink))] mb-1"
            >
              Postcode
            </label>
            <input
              id="postcode"
              type="text"
              placeholder="Enter your postcode"
              className="w-full rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-[hsl(var(--brand))] bg-white text-[hsl(var(--ink))] placeholder:text-gray-500"
              data-test-id="delivery-postcode"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className={buttonStyles.primary}
              data-test-id="delivery-submit-button"
            >
              Check
            </button>
          </div>
        </form>
        <div className="mt-2 text-sm text-[hsl(var(--muted))]">
          Fast &amp; free delivery
        </div>
      </div>
    </section>
  );
}
