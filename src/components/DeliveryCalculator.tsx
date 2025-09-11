import React from 'react';

export default function DeliveryCalculator() {
  return (
    <section className="py-8 bg-background border-b">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h3 className="text-xl font-bold text-primary mb-2">Check Delivery</h3>
        <form className="flex flex-col sm:flex-row gap-2 justify-center items-center">
          <input
            type="text"
            placeholder="Enter your postcode"
            className="border border-border rounded-lg px-4 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Check
          </button>
        </form>
        <div className="text-sm text-muted-foreground mt-2">
          Fast & free delivery
        </div>
      </div>
    </section>
  );
}
