import React from 'react';

export default function DeliveryInfo() {
  return (
    <section className="py-10 bg-muted border-b">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">
          Delivery & Returns
        </h2>
        <ul className="text-lg text-muted-foreground space-y-2">
          <li>Fast & Free Delivery</li>
          <li>Dispatched within 1-2 business days</li>
          <li>60-day trial on all products</li>
          <li>Easy, no-hassle returns</li>
        </ul>
      </div>
    </section>
  );
}
