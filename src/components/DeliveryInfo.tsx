import React from 'react';

import { layout, textStyles } from '@/lib/ui';

export default function DeliveryInfo() {
  return (
    <section className={`${layout.section} border-b bg-[hsl(var(--bg))]`}>
      <div className={`${layout.container} max-w-4xl text-center`}>
        <h2 className={`${textStyles.heading} mb-4 text-[hsl(var(--brand))]`}>
          Delivery & Returns
        </h2>
        <ul className="space-y-2 text-lg text-[hsl(var(--muted))]">
          <li>Fast &amp; Free Delivery</li>
          <li>Dispatched within 1-2 business days</li>
          <li>60-day trial on all products</li>
          <li>Easy, no-hassle returns</li>
        </ul>
      </div>
    </section>
  );
}
